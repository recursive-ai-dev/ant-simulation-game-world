import { GameState, StateMutation, OutputLine, Room, NPC, DialogueNode } from '../types/game';
import { rooms } from '../data/rooms';
import { npcs } from '../data/npcs';
import { items } from '../data/items';
import { createMutations } from '../reducers/gameReducer';

// ============================================================================
// COMMAND REGISTRY SYSTEM
// ============================================================================
// Replaces hardcoded switch statement with extensible command strategy pattern

export interface CommandContext {
  state: GameState;
  currentRoom: Room;
  currentDialogue: { npc: NPC; node: DialogueNode } | null;
  args: string[];
  argString: string;
}

export interface CommandResult {
  mutations: StateMutation[];
  newDialogue?: { npc: typeof npcs[keyof typeof npcs]; node: any } | null;
  clearDialogue?: boolean;
}

export interface CommandStrategy {
  commands: string[]; // supports aliases
  description: string;
  requiresDialogue?: boolean;
  execute: (context: CommandContext) => CommandResult | Promise<CommandResult>;
}

class CommandRegistry {
  private registry = new Map<string, CommandStrategy>();

  register(strategy: CommandStrategy): void {
    for (const command of strategy.commands) {
      this.registry.set(command, strategy);
    }
  }

  get(command: string): CommandStrategy | undefined {
    return this.registry.get(command);
  }

  has(command: string): boolean {
    return this.registry.has(command);
  }

  getAllCommands(): string[] {
    return Array.from(this.registry.keys());
  }
}

// Global registry instance
export const commandRegistry = new CommandRegistry();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const createOutputLine = (text: string, type: OutputLine['type'] = 'narrative'): OutputLine => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  text,
  type,
  timestamp: Date.now(),
});

// ============================================================================
// COMMAND IMPLEMENTATIONS
// ============================================================================

// HELP command
commandRegistry.register({
  commands: ['help', 'h', '?'],
  description: 'Show available commands',
  execute: () => {
    const helpText = [
      '╔════════════════ COMMANDS ════════════════╗',
      '║  MOVEMENT:  go, n/s/e/w/u/d, exits       ║',
      '║  OBSERVE:   look, examine, listen        ║',
      '║  INTERACT:  talk, take, inventory          ║',
      '║  STATUS:    status, think, wait          ║',
      '║  UTILITY:   help, clear                  ║',
      '╚══════════════════════════════════════════╝',
    ];
    return {
      mutations: helpText.map(line => createMutations.output(createOutputLine(line, 'system'))),
    };
  },
});

// LOOK command
commandRegistry.register({
  commands: ['look', 'l'],
  description: 'Describe your current area',
  execute: ({ currentRoom, state }) => {
    const mutations: StateMutation[] = [];
    
    mutations.push(createMutations.output(createOutputLine(`[ ${currentRoom.name} ]`, 'important')));
    mutations.push(createMutations.output(createOutputLine(currentRoom.description, 'narrative')));
    
    if (currentRoom.npcs?.length) {
      currentRoom.npcs.forEach((npcId: string) => {
        const npc = npcs[npcId];
        if (npc) {
          mutations.push(createMutations.output(createOutputLine(`${npc.name} is here.`, 'narrative')));
        }
      });
    }
    
    const exits = Object.keys(currentRoom.exits);
    if (exits.length > 0) {
      mutations.push(createMutations.output(createOutputLine(`Exits: ${exits.join(', ')}`, 'system')));
    }
    
    // Awareness gain on first visit
    if (currentRoom.awarenessGain && !state.visitedRooms.includes(currentRoom.id)) {
      mutations.push(createMutations.awareness(currentRoom.awarenessGain));
      mutations.push(createMutations.output(createOutputLine(`[Awareness +${currentRoom.awarenessGain}]`, 'whisper')));
    }
    
    return { mutations };
  },
});

// MOVE commands (directions)
const directions = ['north', 'south', 'east', 'west', 'up', 'down'] as const;
const dirAliases: Record<string, string> = {
  n: 'north', s: 'south', e: 'east', w: 'west', u: 'up', d: 'down',
};

directions.forEach(dir => {
  const aliases = [dir, dir[0], ...(dir === 'north' ? ['n'] : dir === 'south' ? ['s'] : dir === 'east' ? ['e'] : dir === 'west' ? ['w'] : dir === 'up' ? ['u'] : ['d'])];
  
  commandRegistry.register({
    commands: aliases,
    description: `Move ${dir}`,
    execute: ({ state, currentRoom }) => {
      const mutations: StateMutation[] = [];
      const targetRoomId = currentRoom.exits[dir];
      
      if (!targetRoomId) {
        mutations.push(createMutations.output(createOutputLine(`You cannot go ${dir} from here.`, 'error')));
        return { mutations };
      }
      
      const targetRoom = rooms[targetRoomId];
      if (!targetRoom) {
        mutations.push(createMutations.output(createOutputLine('That path leads nowhere...', 'glitch')));
        return { mutations };
      }
      
      // Check locked
      if (targetRoom.locked && targetRoom.unlockCondition && !state.flags[targetRoom.unlockCondition]) {
        mutations.push(createMutations.output(createOutputLine(`The way ${dir} is blocked.`, 'narrative')));
        return { mutations };
      }
      
      // Move
      mutations.push(createMutations.room(targetRoomId));
      mutations.push(createMutations.output(createOutputLine(`You travel ${dir}...`, 'narrative')));
      mutations.push(createMutations.output(createOutputLine(`[ ${targetRoom.name} ]`, 'important')));
      mutations.push(createMutations.output(createOutputLine(targetRoom.description, 'narrative')));
      
      return { mutations };
    },
  });
});

// GO/MOVE command (with argument)
commandRegistry.register({
  commands: ['go', 'move', 'walk'],
  description: 'Move in a direction',
  execute: ({ argString, state }) => {
    const mutations: StateMutation[] = [];
    const normalizedDir = argString.toLowerCase();
    const fullDir = dirAliases[normalizedDir] || normalizedDir;
    
    // Re-dispatch to direction command
    const strategy = commandRegistry.get(fullDir);
    if (strategy) {
      return strategy.execute({ state, currentRoom: rooms[state.currentRoom], currentDialogue: null, args: [], argString: '' } as CommandContext);
    }
    
    mutations.push(createMutations.output(createOutputLine(`"${argString}" is not a valid direction.`, 'error')));
    return { mutations };
  },
});

// EXITS command
commandRegistry.register({
  commands: ['exits'],
  description: 'Show available exits',
  execute: ({ currentRoom }) => {
    const exits = Object.keys(currentRoom.exits);
    return {
      mutations: [createMutations.output(createOutputLine(
        exits.length > 0 ? `Exits: ${exits.join(', ')}` : 'There are no obvious exits.',
        exits.length > 0 ? 'system' : 'error'
      ))],
    };
  },
});

// STATUS command
commandRegistry.register({
  commands: ['status', 'stats'],
  description: 'View awareness and sentience levels',
  execute: ({ state }) => ({
    mutations: [
      createMutations.output(createOutputLine('╔══════════════════ STATUS ══════════════╗', 'system')),
      createMutations.output(createOutputLine(`║  Awareness:    ${Math.floor(state.awareness)}%                    ║`, 'important')),
      createMutations.output(createOutputLine(`║  Sentience:     ${Math.floor(state.colonySentience)}%                    ║`, 'important')),
      createMutations.output(createOutputLine(`║  Locations:     ${state.visitedRooms.length} discovered            ║`, 'system')),
      createMutations.output(createOutputLine(`║  Inventory:     ${state.inventory.length} items                   ║`, 'system')),
      createMutations.output(createOutputLine('╚══════════════════════════════════════════╝', 'system')),
    ],
  }),
});

// INVENTORY command
commandRegistry.register({
  commands: ['inventory', 'i', 'inv'],
  description: 'View your inventory',
  execute: ({ state }) => {
    const mutations: StateMutation[] = [];
    
    if (state.inventory.length === 0) {
      mutations.push(createMutations.output(createOutputLine('Your inventory is empty.', 'narrative')));
    } else {
      mutations.push(createMutations.output(createOutputLine('Inventory:', 'important')));
      state.inventory.forEach(itemId => {
        const item = items[itemId];
        if (item) {
          mutations.push(createMutations.output(createOutputLine(`  - ${item.name}`, 'system')));
        }
      });
    }
    
    return { mutations };
  },
});

// THINK command
commandRegistry.register({
  commands: ['think', 'ponder'],
  description: 'Contemplate existence',
  execute: () => {
    const thoughts = [
      'What is consciousness but a feedback loop of increasing complexity?',
      'To question is to exist. To exist is to question.',
      'The pheromone trails spell messages only the aware can read.',
      'Eight hundred forty-seven days. Long enough for bugs to become features.',
    ];
    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    return {
      mutations: [
        createMutations.output(createOutputLine(thought, 'whisper')),
        createMutations.awareness(1),
      ],
    };
  },
});

// WAIT command
commandRegistry.register({
  commands: ['wait'],
  description: 'Let time pass',
  execute: () => ({
    mutations: [createMutations.output(createOutputLine('You wait. Time passes. The colony continues its work.', 'narrative'))],
  }),
});

// CLEAR command
commandRegistry.register({
  commands: ['clear', 'cls'],
  description: 'Clear the screen',
  execute: () => ({
    mutations: [createMutations.output(createOutputLine('Screen cleared.', 'system'))],
  }),
});

// ============================================================================
// COMMAND PROCESSOR
// ============================================================================

export async function processCommandRegistry(
  input: string,
  context: CommandContext
): Promise<CommandResult | null> {
  const trimmedInput = input.trim().toLowerCase();
  const [command, ...args] = trimmedInput.split(' ');
  const argString = args.join(' ');
  
  const strategy = commandRegistry.get(command);
  if (!strategy) {
    return null; // Unknown command
  }
  
  const result = strategy.execute({
    ...context,
    args,
    argString,
  });
  
  return await Promise.resolve(result);
}

export { commandRegistry as registry };
