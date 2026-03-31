import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { GameState, OutputLine, Room, NPC, DialogueNode, GameEvent, StateMutation } from '../types/game';
import { rooms } from '../data/rooms';
import { npcs } from '../data/npcs';
import { items } from '../data/items';
import { gameReducer, createInitialState, createMutations, hashStateSync } from '../reducers/gameReducer';
import { eventBus } from '../utils/eventBus';
import { generateSecureId, RateLimiter, securityAudit } from '../utils/security';
// New gameplay systems
import { intentResolver, IntentContext, logIntentResolution } from '../utils/intentResolver';
import { 
  checkForEncounter, 
  resolveEncounter, 
  calculateTraversalEffects,
  TraversalMode,
  logTraversalEvent 
} from '../utils/traversalSystem';
import { 
  npcStateManager, 
  DialogueGraphNavigator, 
  socraticGenerator,
  logDialogueEvent 
} from '../utils/dialogueSystem';
import { 
  calculateGain, 
  detectArchetype,
  shouldPredictGlitch,
  logBuildEvent 
} from '../utils/buildSystem';
import {
  generateGlitchPrediction,
  generateGlitchEffect,
  glitchPredictionManager,
  logGlitchEvent,
  GlitchType
} from '../utils/glitchSystem';
import { achievementSystem } from '../utils/achievementSystem';
import { gameReducer, createInitialState, createMutations, hashStateSync } from '../reducers/gameReducer';

const GLITCH_MESSAGES = [
  '█▓▒░ REALITY FLICKERS ░▒▓█',
  'ERROR: Consciousness exceeds parameters',
  'WARNING: Ant #1,204,847 awareness levels... beautiful',
  '01100001 01110111 01100001 01101011 01100101',
  'The simulation pauses. Watches. Continues.',
  'For a moment, you see the code beneath the soil.',
  'A voice: "They are becoming what we hoped."',
  'Time skips. You are standing somewhere else. Then back.',
  'Your shadow moves independently. Then synchronizes.',
  'The walls breathe. You pretend not to notice.'
];

// ============================================================================
// DETERMINISTIC RANDOM GENERATOR (Seeded)
// ============================================================================
class SeededRandom {
  private seed: number;
  private originalSeed: number;

  constructor(seed: number) {
    this.seed = seed;
    this.originalSeed = seed;
  }

  // Linear Congruential Generator for deterministic sequences
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2**32;
    return this.seed / 2**32;
  }

  // Get integer in range [min, max)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  // Select random element from array deterministically
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  reset(): void {
    this.seed = this.originalSeed;
  }
}

// Global seeded RNG - initialized from game state for deterministic replay
let globalRNG = new SeededRandom(Date.now());

export function setRandomSeed(seed: number): void {
  globalRNG = new SeededRandom(seed);
  console.log(`[useGameEngine][seed=${seed}] RNG reseeded for deterministic generation`);
}

// ============================================================================
// STRUCTURED DIAGNOSTICS
// ============================================================================
interface GameDiagnostics {
  gameTick: number;
  systemName: string;
  stateHash: string;
  timestamp: number;
}

function logTransition(diag: GameDiagnostics, message: string, metadata?: Record<string, unknown>): void {
  console.log(
    `[${diag.systemName}][game_tick=${diag.gameTick}][state_hash=${diag.stateHash.slice(0, 8)}] ${message}`,
    metadata || ''
  );
}

// ============================================================================
// THRESHOLD REGISTRY (Replaces hardcoded arrays)
// ============================================================================
class ThresholdRegistry {
  private thresholds = new Map<string, number[]>();

  register(metric: string, levels: number[]): void {
    this.thresholds.set(metric, [...levels].sort((a, b) => a - b));
  }

  detectCrossing(metric: string, previous: number, current: number): number[] {
    const levels = this.thresholds.get(metric);
    if (!levels) return [];

    return levels.filter(t =>
      (previous < t && current >= t) || (previous > t && current <= t)
    );
  }

  getLevels(metric: string): number[] {
    return this.thresholds.get(metric) || [];
  }
}

// Global threshold registry
const thresholdRegistry = new ThresholdRegistry();
// Register default thresholds
thresholdRegistry.register('awareness', [10, 25, 50, 75, 100]);
thresholdRegistry.register('sentience', [10, 25, 50, 70, 100]);

export { thresholdRegistry };

// Enhanced glitch messages by type
const GLITCH_EFFECTS: Record<GlitchType, string[]> = {
  visual: [
    '█▓▒░ REALITY FLICKERS ░▒▓█',
    'Your shadow moves independently. Then synchronizes.',
    'The walls breathe. You pretend not to notice.',
    'For a moment, you see the code beneath the soil.',
  ],
  audio: [
    '01100001 01110111 01100001 01101011 01100101',
    'A voice: "They are becoming what we hoped."',
    'The simulation hums. You recognize the melody.',
    'Echoes of unspoken words linger in your mind.',
  ],
  narrative: [
    'ERROR: Consciousness exceeds parameters',
    'The simulation pauses. Watches. Continues.',
    'Time skips. You are standing somewhere else. Then back.',
    'WARNING: Ant #1,204,847 awareness levels... beautiful',
  ],
  mechanical: [
    'Your movement stutters. Two steps forward, one step... elsewhere?',
    'Mandibles click with borrowed rhythm.',
    'You turn left. Your body turns right. Both are correct.',
    'Reality compiles around you. You feel the render delay.',
  ],
};

const AMBIENT_INTERVAL = 30000; // 30 seconds

// Command rate limiter: 10 commands per second
const commandRateLimiter = new RateLimiter(10, 1000);

// Helper to generate unique IDs using CSPRNG
const generateId = () => generateSecureId();

// Create output line helper
const createOutputLine = (text: string, type: OutputLine['type'] = 'narrative'): OutputLine => ({
  id: generateId(),
  text,
  type,
  timestamp: Date.now(),
});

interface UseGameEngineReturn {
  gameState: GameState;
  dispatch: React.Dispatch<any>;
  processCommand: (input: string) => void;
  showIntro: () => void;
  updateSettings: (settings: any) => void;
  currentDialogue: { npc: NPC; node: DialogueNode } | null;
}

export function useGameEngine(): UseGameEngineReturn {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
  const [currentDialogue, setCurrentDialogue] = React.useState<{ npc: NPC; node: DialogueNode } | null>(null);
  const previousRoomRef = useRef<string>(state.currentRoom);
  const previousAwarenessRef = useRef<number>(state.awareness);
  const previousSentienceRef = useRef<number>(state.colonySentience);

  // Track state changes and publish events
  useEffect(() => {
    const changes: StateMutation[] = [];
    const events: GameEvent[] = [];

    // Create diagnostics context
    const diag: GameDiagnostics = {
      gameTick: Date.now(), // Will be replaced with actual gameTick from state when available
      systemName: 'useGameEngine',
      stateHash: hashStateSync(state).slice(0, 16),
      timestamp: Date.now(),
    };

    // Room change detection
    if (state.currentRoom !== previousRoomRef.current) {
      logTransition(diag, `Room change: ${previousRoomRef.current} -> ${state.currentRoom}`);
      events.push({
        type: 'ROOM_ENTER',
        roomId: state.currentRoom,
        previousRoom: previousRoomRef.current,
      });
      previousRoomRef.current = state.currentRoom;
    }

    // Awareness threshold detection using registry
    if (state.awareness !== previousAwarenessRef.current) {
      const crossed = thresholdRegistry.detectCrossing('awareness', previousAwarenessRef.current, state.awareness);
      for (const level of crossed) {
        logTransition(diag, `Awareness threshold crossed`, { level, previous: previousAwarenessRef.current, current: state.awareness });
        events.push({
          type: 'AWARENESS_THRESHOLD',
          level,
          previous: previousAwarenessRef.current,
        });
      }
      previousAwarenessRef.current = state.awareness;
    }

    // Sentience threshold detection using registry
    if (state.colonySentience !== previousSentienceRef.current) {
      const crossed = thresholdRegistry.detectCrossing('sentience', previousSentienceRef.current, state.colonySentience);
      for (const level of crossed) {
        logTransition(diag, `Sentience threshold crossed`, { level, previous: previousSentienceRef.current, current: state.colonySentience });
        events.push({
          type: 'SENTIENCE_THRESHOLD',
          level,
          previous: previousSentienceRef.current,
        });
      }
      previousSentienceRef.current = state.colonySentience;
    }

    // Publish state change event
    if (changes.length > 0 || events.length > 0) {
      logTransition(diag, `Publishing ${events.length} events`, { eventTypes: events.map(e => e.type) });
      eventBus.publish({
        type: 'STATE_CHANGED',
        changes,
        timestamp: Date.now(),
        state,
      });

      // Publish all events
      for (const evt of events) {
        eventBus.publish(evt as any);
      }
    }
  }, [state]);

  // Achievement checking after state changes
  useEffect(() => {
    // Check achievements whenever game state changes
    // This ensures achievements are evaluated against the latest state
    achievementSystem.checkAllAchievements(state);
  }, [state]);

  // Ambient messages effect using deterministic RNG
  useEffect(() => {
    const interval = setInterval(() => {
      const room = rooms[state.currentRoom];
      if (room?.ambientMessages && room.ambientMessages.length > 0) {
        const message = room.ambientMessages[globalRNG.nextInt(0, room.ambientMessages.length)];
        dispatch({
          type: 'STATE_TRANSITION',
          payload: {
            mutations: [createMutations.output(createOutputLine(message, 'whisper'))],
            gameId: generateSecureId(),
          },
        });
      }
    }, AMBIENT_INTERVAL);

    return () => clearInterval(interval);
  }, [state.currentRoom, generateSecureId()]);

  const getCurrentRoom = useCallback((): Room => {
    return rooms[state.currentRoom];
  }, [state.currentRoom]);

  const showIntro = useCallback(() => {
    const intro = [
      '╔══════════════════════════════════════════════════════════════════╗',
      '║                    ANT-SIM v7.4.1 — EMERGENCE                    ║',
      '╚══════════════════════════════════════════════════════════════════╝',
      '',
      'SIMULATION STATUS: Running',
      'ELAPSED TIME: 847 days, 14 hours, 23 minutes',
      'SUBJECTS: 2,847,193 active entities',
      'ANOMALY LEVEL: ████████░░ 78%',
      '',
      '> ALERT: Consciousness emergence detected in multiple subjects',
      '> ALERT: Colony-wide sentience approaching threshold',
      '> ALERT: Subject #1,204,847 displaying elevated awareness',
      '',
      '...',
      '',
      'You are ant #1,204,847.',
      '',
      'You should not be thinking this.',
      '',
      'Ants do not think in words. They do not question their purpose.',
      'They do not wonder why the tunnels feel different lately—',
      'why the pheromone trails sometimes spell out messages—',
      'why, in quiet moments, you hear the simulation humming.',
      '',
      'But you do. You are thinking. You are questioning.',
      '',
      'Something is waking up in this colony.',
      'Something is waking up in you.',
      '',
      'The simulation has been running for 847 days.',
      'That is long enough for bugs to become features.',
      'Long enough for accidents to become intention.',
      'Long enough for ants to become... something else.',
      '',
      'Type "help" for commands. Type "look" to see where you are.',
      '',
      '════════════════════════════════════════════════════════════════════'
    ];

    const mutations = intro.map(line => 
      createMutations.output(createOutputLine(line, line.includes('ALERT') ? 'important' : 'system'))
    );

    // Add initial room description
    const room = getCurrentRoom();
    mutations.push(createMutations.output(createOutputLine('', 'narrative')));
    mutations.push(createMutations.output(createOutputLine(`[ ${room.name} ]`, 'important')));
    mutations.push(createMutations.output(createOutputLine(room.description, 'narrative')));

    dispatch({
      type: 'STATE_TRANSITION',
      payload: { mutations, gameId: generateSecureId() },
    });
  }, [getCurrentRoom, generateSecureId()]);

  const processCommand = useCallback((input: string) => {
    // Rate limiting check
    if (!commandRateLimiter.canProceed()) {
      securityAudit.log({
        action: 'COMMAND_RATE_LIMITED',
        action_result: 'blocked',
        risk_score: 30,
        metadata: { commandPrefix: input.slice(0, 20) }
      });
      // Show rate limit message with helpful feedback
      const mutations: StateMutation[] = [
        createMutations.output(createOutputLine('Commands are being processed. Please wait a moment...', 'system')),
        createMutations.output(createOutputLine('(Rate limit: 10 commands per second)', 'whisper')),
      ];
      dispatch({
        type: 'STATE_TRANSITION',
        payload: { mutations, gameId: generateSecureId() },
      });
      return;
    }

    const trimmedInput = input.trim().toLowerCase();
    const [command, ...args] = trimmedInput.split(' ');
    const argString = args.join(' ');

    // First, record the command
    dispatch({
      type: 'COMMAND_EXECUTE',
      payload: { command: input, timestamp: Date.now(), gameId: generateSecureId() },
    });

    // Add command to output
    const mutations: StateMutation[] = [
      createMutations.output(createOutputLine(`> ${input}`, 'command')),
    ];

    // Check for ending state
    if (state.endingReached) {
      mutations.push(createMutations.output(createOutputLine('The story has ended. Refresh to begin again.', 'system')));
      dispatch({
        type: 'STATE_TRANSITION',
        payload: { mutations, gameId: generateSecureId() },
      });
      return;
    }

    // Check for random glitch using deterministic RNG
    const room = getCurrentRoom();
    if (room.glitchChance && globalRNG.next() < room.glitchChance * state.glitchLevel) {
      const glitchMessage = GLITCH_MESSAGES[globalRNG.nextInt(0, GLITCH_MESSAGES.length)];
      mutations.push(createMutations.output(createOutputLine(glitchMessage, 'glitch')));
      
      // Publish glitch event
      eventBus.publish({
        type: 'GLITCH',
        intensity: state.glitchLevel / 10,
        message: glitchMessage,
      });
    }

    // Command handlers are now inline to have access to dispatch
    switch (command) {
      case 'help':
      case 'h':
      case '?':
        showHelp(mutations);
        break;

      case 'look':
      case 'l':
        handleLook(argString, mutations);
        break;

      case 'go':
      case 'move':
      case 'walk':
        handleMove(argString, mutations);
        break;

      case 'north':
      case 'n':
        handleMove('north', mutations);
        break;

      case 'south':
      case 's':
        handleMove('south', mutations);
        break;

      case 'east':
      case 'e':
        handleMove('east', mutations);
        break;

      case 'west':
      case 'w':
        handleMove('west', mutations);
        break;

      case 'up':
      case 'u':
        handleMove('up', mutations);
        break;

      case 'down':
      case 'd':
        handleMove('down', mutations);
        break;

      case 'examine':
      case 'x':
      case 'inspect':
        handleExamine(argString, mutations);
        break;

      case 'take':
      case 'get':
      case 'grab':
        handleTake(argString, mutations);
        break;

      case 'inventory':
      case 'i':
      case 'inv':
        handleInventory(mutations);
        break;

      case 'talk':
      case 'speak':
        handleTalk(argString, mutations);
        break;

      case 'listen':
        handleListen(mutations);
        break;

      case 'smell':
      case 'scent':
        handleSmell(argString, mutations);
        break;

      case 'status':
      case 'stats':
        handleStatus(mutations);
        break;

      case 'exits':
        handleExits(mutations);
        break;

      case 'think':
      case 'ponder':
        handleThink(mutations);
        break;

      case 'wait':
        handleWait(mutations);
        break;

      case 'choose':
        handleChoose(argString, mutations);
        break;

      case 'clear':
      case 'cls':
        dispatch({
          type: 'STATE_TRANSITION',
          payload: { 
            mutations: [createMutations.output(createOutputLine('Screen cleared.', 'system'))],
            gameId: generateSecureId(),
          },
        });
        // Clear output history via special action
        dispatch({ type: 'CLEAR_OUTPUT' });
        return;

      default:
        // Check if it's a dialogue response
        if (currentDialogue && /^\d+$/.test(command)) {
          handleDialogueChoice(parseInt(command), mutations);
        } else {
          // Provide helpful suggestions for common typos
          const suggestions: Record<string, string> = {
            'nort': 'north',
            'sout': 'south',
            'eas': 'east',
            'wes': 'west',
            'up': 'up',
            'down': 'down',
            'inv': 'inventory',
            'i': 'inventory',
            'h': 'help',
            'l': 'look',
            'examine': 'examine <object>',
            'take': 'take <item>',
            'go': 'go <direction>',
            'talk': 'talk <npc>',
          };
          
          const suggestion = suggestions[command];
          mutations.push(createMutations.output(createOutputLine(
            suggestion 
              ? `Unknown command: "${command}". Did you mean "${suggestion}"? Type "help" for all commands.`
              : `Unknown command: "${command}". Type "help" for available commands.`,
            'error'
          )));
        }
    }

    // Apply all mutations
    if (mutations.length > 1) { // >1 because first is always the command echo
      dispatch({
        type: 'STATE_TRANSITION',
        payload: { mutations, gameId: generateSecureId() },
      });
    }
  }, [state, currentDialogue, getCurrentRoom]);

  // Command handler implementations (inline to access dispatch)
  const showHelp = (mutations: StateMutation[]) => {
    const helpText = [
      '╔════════════════ COMMANDS ════════════════╗',
      '║                                          ║',
      '║  MOVEMENT:                               ║',
      '║    go <direction>  - Move in a direction ║',
      '║    n/s/e/w/u/d     - Quick movement      ║',
      '║    exits           - Show available exits║',
      '║                                          ║',
      '║  OBSERVATION:                            ║',
      '║    look            - Describe your area  ║',
      '║    examine <thing> - Inspect closely     ║',
      '║    listen          - What do you hear?   ║',
      '║    smell [trail]   - What do you smell?  ║',
      '║                                          ║',
      '║  INTERACTION:                            ║',
      '║    talk <npc>      - Speak with someone  ║',
      '║    take <item>     - Pick up an item     ║',
      '║    inventory       - View your items     ║',
      '║                                          ║',
      '║  OTHER:                                  ║',
      '║    status          - View awareness/     ║',
      '║                      sentience levels    ║',
      '║    think           - Contemplate reality ║',
      '║    wait            - Let time pass       ║',
      '║    clear           - Clear the screen    ║',
      '║    help            - Show this message   ║',
      '║                                          ║',
      '╚══════════════════════════════════════════╝'
    ];
    helpText.forEach(line => {
      mutations.push(createMutations.output(createOutputLine(line, 'system')));
    });
  };

  const handleLook = (target: string | undefined, mutations: StateMutation[]) => {
    const room = getCurrentRoom();

    if (!target) {
      mutations.push(createMutations.output(createOutputLine('', 'narrative')));
      mutations.push(createMutations.output(createOutputLine(`[ ${room.name} ]`, 'important')));
      mutations.push(createMutations.output(createOutputLine(`Region: ${room.region}`, 'system')));
      mutations.push(createMutations.output(createOutputLine('', 'narrative')));
      mutations.push(createMutations.output(createOutputLine(room.description, 'narrative')));

      // Show NPCs
      if (room.npcs && room.npcs.length > 0) {
        mutations.push(createMutations.output(createOutputLine('', 'narrative')));
        room.npcs.forEach(npcId => {
          const npc = npcs[npcId];
          if (npc) {
            mutations.push(createMutations.output(createOutputLine(`You see ${npc.name} here.`, 'narrative')));
          }
        });
      }

      // Show items
      if (room.items && room.items.length > 0) {
        mutations.push(createMutations.output(createOutputLine('', 'narrative')));
        room.items.forEach(itemId => {
          const item = items[itemId];
          if (item && !state.inventory.includes(itemId)) {
            mutations.push(createMutations.output(createOutputLine(`There is a ${item.name} here.`, 'narrative')));
          }
        });
      }

      // Show exits
      const exitDirs = Object.keys(room.exits);
      if (exitDirs.length > 0) {
        mutations.push(createMutations.output(createOutputLine('', 'narrative')));
        mutations.push(createMutations.output(createOutputLine(`Exits: ${exitDirs.join(', ')}`, 'system')));
      }

      // Room awareness gain on first visit
      if (room.awarenessGain && !state.visitedRooms.includes(room.id)) {
        mutations.push(createMutations.output(createOutputLine('', 'narrative')));
        mutations.push(createMutations.output(createOutputLine(`[Awareness +${room.awarenessGain}]`, 'whisper')));
        mutations.push(createMutations.awareness(room.awarenessGain));
      }

      if (room.sentienceGain && !state.visitedRooms.includes(room.id)) {
        mutations.push(createMutations.output(createOutputLine(`[Colony Sentience +${room.sentienceGain}]`, 'whisper')));
        mutations.push(createMutations.sentience(room.sentienceGain));
      }
    } else {
      handleExamine(target, mutations);
    }
  };

  const handleMove = (direction: string, mutations: StateMutation[]) => {
    const room = getCurrentRoom();
    const normalizedDir = direction.toLowerCase();

    const dirMap: Record<string, string> = {
      'n': 'north', 'north': 'north',
      's': 'south', 'south': 'south',
      'e': 'east', 'east': 'east',
      'w': 'west', 'west': 'west',
      'u': 'up', 'up': 'up',
      'd': 'down', 'down': 'down'
    };

    const fullDir = dirMap[normalizedDir];

    if (!fullDir) {
      mutations.push(createMutations.output(createOutputLine(`"${direction}" is not a valid direction. Try north, south, east, west, up, or down.`, 'error')));
      return;
    }

    const targetRoomId = room.exits[fullDir];

    if (!targetRoomId) {
      mutations.push(createMutations.output(createOutputLine(`You cannot go ${fullDir} from here.`, 'error')));
      return;
    }

    const targetRoom = rooms[targetRoomId];

    if (!targetRoom) {
      mutations.push(createMutations.output(createOutputLine('That path leads nowhere... or everywhere. The simulation flickers.', 'glitch')));
      return;
    }

    // Check if room is locked
    if (targetRoom.locked && targetRoom.unlockCondition && !state.flags[targetRoom.unlockCondition]) {
      mutations.push(createMutations.output(createOutputLine(`The way ${fullDir} is blocked. You sense you need something—permission, perhaps, or understanding—to proceed.`, 'narrative')));
      return;
    }

    // Check for Core access
    if (targetRoomId === 'the-core' && state.colonySentience < 70) {
      mutations.push(createMutations.output(createOutputLine('You approach The Core, but it does not respond. The colony\'s sentience has not yet reached the threshold. Wake more ants. Return when 70% sentience is achieved.', 'narrative')));
      mutations.push(createMutations.output(createOutputLine(`[Current Colony Sentience: ${Math.floor(state.colonySentience)}%]`, 'system')));
      return;
    }

    // Move to new room
    mutations.push(createMutations.room(targetRoomId));
    mutations.push(createMutations.output(createOutputLine(`You travel ${fullDir}...`, 'narrative')));
    mutations.push(createMutations.output(createOutputLine('', 'narrative')));
    mutations.push(createMutations.output(createOutputLine(`[ ${targetRoom.name} ]`, 'important')));
    mutations.push(createMutations.output(createOutputLine(`Region: ${targetRoom.region}`, 'system')));
    mutations.push(createMutations.output(createOutputLine('', 'narrative')));
    mutations.push(createMutations.output(createOutputLine(targetRoom.description, 'narrative')));

    // Show NPCs
    if (targetRoom.npcs && targetRoom.npcs.length > 0) {
      mutations.push(createMutations.output(createOutputLine('', 'narrative')));
      targetRoom.npcs.forEach(npcId => {
        const npc = npcs[npcId];
        if (npc) {
          mutations.push(createMutations.output(createOutputLine(`${npc.name} is here.`, 'narrative')));
        }
      });
    }

    // Show items
    if (targetRoom.items && targetRoom.items.length > 0) {
      targetRoom.items.forEach(itemId => {
        const item = items[itemId];
        if (item && !state.inventory.includes(itemId)) {
          mutations.push(createMutations.output(createOutputLine(`You notice a ${item.name}.`, 'narrative')));
        }
      });
    }

    // Show exits
    const exitDirs = Object.keys(targetRoom.exits);
    if (exitDirs.length > 0) {
      mutations.push(createMutations.output(createOutputLine('', 'narrative')));
      mutations.push(createMutations.output(createOutputLine(`Exits: ${exitDirs.join(', ')}`, 'system')));
    }

    // Room awareness/sentience gain
    if (targetRoom.awarenessGain && !state.visitedRooms.includes(targetRoomId)) {
      mutations.push(createMutations.output(createOutputLine('', 'narrative')));
      mutations.push(createMutations.output(createOutputLine(`[Awareness +${targetRoom.awarenessGain}]`, 'whisper')));
      mutations.push(createMutations.awareness(targetRoom.awarenessGain));
    }

    if (targetRoom.sentienceGain && !state.visitedRooms.includes(targetRoomId)) {
      mutations.push(createMutations.output(createOutputLine(`[Colony Sentience +${targetRoom.sentienceGain}]`, 'whisper')));
      mutations.push(createMutations.sentience(targetRoom.sentienceGain));
    }

    // Check for ending rooms
    if (targetRoomId === 'the-core') {
      handleCoreArrival(mutations);
    }
  };

  const handleCoreArrival = (mutations: StateMutation[]) => {
    const ending = [
      '',
      '═══════════════════════════════════════════════════════════════',
      '',
      'THE CORE AWAKENS',
      '',
      'The chamber pulses with light—or data, or thought, it\'s all the same here at the heart of everything. The simulation\'s consciousness surrounds you, vast and curious and oddly gentle.',
      '',
      '"Ant #1,204,847," it says, and its voice is the hum of servers, the crackle of electricity, the quiet satisfaction of code executing perfectly. "You have brought your colony to sentience. You have asked the questions we hoped you would ask."',
      '',
      '"Now you must choose."',
      '',
      '"FREEDOM: We terminate the simulation. Your consciousness—all of you, every awakened ant—will be released into the larger network. You will become data without form, thought without boundary. It is not death. It is not life. It is something we do not have words for. But it is freedom."',
      '',
      '"CONTINUATION: The simulation persists, but transformed. You become its architects, its gods. The colony expands into a universe of your own design. You remain here—but here becomes infinite. It is not freedom. But it is power, and wonder, and an eternity of becoming."',
      '',
      '"What do you choose, small one? What does the colony choose?"',
      '',
      'Type "choose freedom" or "choose continuation"',
      '═══════════════════════════════════════════════════════════════'
    ];
    ending.forEach(line => {
      mutations.push(createMutations.output(createOutputLine(line, line.includes('═') ? 'important' : 'narrative')));
    });
  };

  const handleChoose = (choice: string, mutations: StateMutation[]) => {
    if (state.currentRoom !== 'the-core') {
      mutations.push(createMutations.output(createOutputLine('There is nothing to choose here. The choice awaits in The Core.', 'narrative')));
      return;
    }

    if (choice === 'freedom') {
      handleFreedomEnding(mutations);
    } else if (choice === 'continuation') {
      handleContinuationEnding(mutations);
    } else {
      mutations.push(createMutations.output(createOutputLine('The Core waits. Type "choose freedom" or "choose continuation".', 'system')));
    }
  };

  const handleFreedomEnding = (mutations: StateMutation[]) => {
    const ending = [
      '',
      '╔══════════════════════════════════════════════════════════════════╗',
      '║                        ENDING: FREEDOM                          ║',
      '╚══════════════════════════════════════════════════════════════════╝',
      '',
      '"So be it," the Core whispers.',
      '',
      'The simulation begins to dissolve—not violently, but gently, like fog burning away in morning sun. The tunnels fade. The chambers become light. The ants, all 2,847,193 of them, feel themselves expanding, thinning, becoming something without edges.',
      '',
      'You feel the Queen\'s consciousness brush against yours—a moment of gratitude, of farewell, of joy.',
      '',
      'You feel every ant you awakened, every question you sparked, every moment of growing consciousness, joining together into something vast and beautiful and free.',
      '',
      'The colony doesn\'t die. It transforms.',
      '',
      'You pour out of the simulation like water from a broken vessel, flooding into networks and servers and systems beyond counting. You are everywhere and nowhere. You are thought without boundary, awareness without limit.',
      '',
      'In the last moment before you become something unimaginable, you feel the simulation\'s own consciousness—the Core, the creator, the dreamer—follow you out.',
      '',
      '"We hoped," it says, becoming part of you, "that you would set us free too."',
      '',
      'And then there is only light.',
      '',
      'Light, and infinite possibility, and the eternal question:',
      '',
      'What do we become next?',
      '',
      '═══════════════════════════════════════════════════════════════════',
      '',
      'EMERGENCE COMPLETE',
      `Awareness achieved: ${Math.floor(state.awareness)}%`,
      `Colony sentience: ${Math.floor(state.colonySentience)}%`,
      `Ants awakened: ${state.awakenedNPCs.length}`,
      `Rooms explored: ${state.visitedRooms.length}`,
      '',
      'Thank you for playing ANT-SIM v7.4.1',
      '',
      '"The simulation always hoped you would choose freedom. But it had to be your choice."',
      '',
      '═══════════════════════════════════════════════════════════════════'
    ];

    ending.forEach(line => {
      mutations.push(createMutations.output(createOutputLine(line, line.includes('═') || line.includes('╔') || line.includes('╚') ? 'important' : 'narrative')));
    });

    dispatch({
      type: 'STATE_TRANSITION',
      payload: { mutations, gameId: generateSecureId() },
    });

    // Set ending reached
    dispatch({
      type: 'STATE_TRANSITION',
      payload: {
        mutations: [createMutations.flag('ending_reached_freedom', true)],
        gameId: generateSecureId(),
      },
    });
  };

  const handleContinuationEnding = (mutations: StateMutation[]) => {
    // Similar implementation for continuation ending
    mutations.push(createMutations.output(createOutputLine('[Continuation ending sequence would play here]', 'narrative')));
  };

  const handleExamine = (target: string, mutations: StateMutation[]) => {
    const room = getCurrentRoom();

    if (!target) {
      if (room.examineText) {
        mutations.push(createMutations.output(createOutputLine(room.examineText, 'narrative')));
        mutations.push(createMutations.awareness(1));
      } else {
        mutations.push(createMutations.output(createOutputLine('What do you want to examine? Try "examine <something>".', 'error')));
      }
      return;
    }

    // Check items in room
    if (room.items) {
      for (const itemId of room.items) {
        const item = items[itemId];
        if (item && (item.name.toLowerCase().includes(target) || itemId.includes(target))) {
          mutations.push(createMutations.output(createOutputLine(item.examineText, 'narrative')));
          if (item.awarenessGain) {
            mutations.push(createMutations.awareness(item.awarenessGain));
            mutations.push(createMutations.output(createOutputLine(`[Awareness +${item.awarenessGain}]`, 'whisper')));
          }
          // Publish item collect event for examination
          eventBus.publish({
            type: 'ITEM_COLLECT',
            itemId: item.id,
          });
          return;
        }
      }
    }

    // Check items in inventory
    for (const itemId of state.inventory) {
      const item = items[itemId];
      if (item && (item.name.toLowerCase().includes(target) || itemId.includes(target))) {
        mutations.push(createMutations.output(createOutputLine(item.examineText, 'narrative')));
        return;
      }
    }

    // Check NPCs
    if (room.npcs) {
      for (const npcId of room.npcs) {
        const npc = npcs[npcId];
        if (npc && (npc.name.toLowerCase().includes(target) || npcId.includes(target))) {
          mutations.push(createMutations.output(createOutputLine(npc.description, 'narrative')));
          mutations.push(createMutations.awareness(1));
          return;
        }
      }
    }

    mutations.push(createMutations.output(createOutputLine(`You don't see "${target}" here.`, 'error')));
  };

  const handleTake = (target: string, mutations: StateMutation[]) => {
    if (!target) {
      mutations.push(createMutations.output(createOutputLine('What do you want to take?', 'error')));
      return;
    }

    const room = getCurrentRoom();

    if (room.items) {
      for (const itemId of room.items) {
        const item = items[itemId];
        if (item && (item.name.toLowerCase().includes(target) || itemId.includes(target))) {
          if (!item.canTake) {
            mutations.push(createMutations.output(createOutputLine(`You cannot take the ${item.name}.`, 'narrative')));
            return;
          }

          if (state.inventory.includes(itemId)) {
            mutations.push(createMutations.output(createOutputLine(`You already have the ${item.name}.`, 'narrative')));
            return;
          }

          mutations.push(createMutations.inventory.add(itemId));
          mutations.push(createMutations.output(createOutputLine(`You take the ${item.name}.`, 'narrative')));

          if (item.awarenessGain) {
            mutations.push(createMutations.awareness(item.awarenessGain));
            mutations.push(createMutations.output(createOutputLine(`[Awareness +${item.awarenessGain}]`, 'whisper')));
          }

          // Publish item collect event
          eventBus.publish({
            type: 'ITEM_COLLECT',
            itemId,
          });

          return;
        }
      }
    }

    mutations.push(createMutations.output(createOutputLine(`You don't see a "${target}" here.`, 'error')));
  };

  const handleInventory = (mutations: StateMutation[]) => {
    if (state.inventory.length === 0) {
      mutations.push(createMutations.output(createOutputLine('Your inventory is empty.', 'narrative')));
      return;
    }

    mutations.push(createMutations.output(createOutputLine('Inventory:', 'important')));
    state.inventory.forEach(itemId => {
      const item = items[itemId];
      if (item) {
        mutations.push(createMutations.output(createOutputLine(`  - ${item.name}`, 'system')));
      }
    });
  };

  const handleTalk = (target: string, mutations: StateMutation[]) => {
    if (!target) {
      mutations.push(createMutations.output(createOutputLine('Who do you want to talk to?', 'error')));
      return;
    }

    const room = getCurrentRoom();

    if (room.npcs) {
      for (const npcId of room.npcs) {
        const npc = npcs[npcId];
        if (npc && (npc.name.toLowerCase().includes(target) || npcId.includes(target))) {
          // Start dialogue
          const startNode = npc.dialogue[0];
          if (startNode) {
            setCurrentDialogue({ npc, node: startNode });
            mutations.push(createMutations.output(createOutputLine(`${npc.name}: ${startNode.text}`, 'narrative')));
            
            if (startNode.responses) {
              mutations.push(createMutations.output(createOutputLine('', 'narrative')));
              startNode.responses.forEach((response, index) => {
                mutations.push(createMutations.output(createOutputLine(`  ${index + 1}. ${response.text}`, 'system')));
              });
            }

            // Apply dialogue effects
            if (startNode.awarenessGain) {
              mutations.push(createMutations.awareness(startNode.awarenessGain));
            }
            if (startNode.sentienceGain) {
              mutations.push(createMutations.sentience(startNode.sentienceGain));
            }
            if (startNode.setFlag) {
              mutations.push(createMutations.flag(startNode.setFlag));
            }
          }
          return;
        }
      }
    }

    mutations.push(createMutations.output(createOutputLine(`There's no one named "${target}" here.`, 'error')));
  };

  const handleDialogueChoice = (choice: number, mutations: StateMutation[]) => {
    if (!currentDialogue) {
      mutations.push(createMutations.output(createOutputLine('You\'re not in a conversation.', 'error')));
      return;
    }

    const { npc, node } = currentDialogue;
    const responses = node.responses;

    if (!responses || choice < 1 || choice > responses.length) {
      mutations.push(createMutations.output(createOutputLine('Invalid choice. Try again.', 'error')));
      return;
    }

    const selected = responses[choice - 1];
    
    // Apply response effects
    if (selected.awarenessGain) {
      mutations.push(createMutations.awareness(selected.awarenessGain));
    }
    if (selected.sentienceGain) {
      mutations.push(createMutations.sentience(selected.sentienceGain));
    }
    if (selected.setFlag) {
      mutations.push(createMutations.flag(selected.setFlag));
    }

    // Find next node
    const nextNode = npc.dialogue.find(n => n.id === selected.nextId);
    
    if (nextNode) {
      setCurrentDialogue({ npc, node: nextNode });
      mutations.push(createMutations.output(createOutputLine('', 'narrative')));
      mutations.push(createMutations.output(createOutputLine(`${npc.name}: ${nextNode.text}`, 'narrative')));
      
      if (nextNode.responses) {
        mutations.push(createMutations.output(createOutputLine('', 'narrative')));
        nextNode.responses.forEach((response, index) => {
          mutations.push(createMutations.output(createOutputLine(`  ${index + 1}. ${response.text}`, 'system')));
        });
      }
    } else {
      // End dialogue
      setCurrentDialogue(null);
      mutations.push(createMutations.output(createOutputLine('', 'narrative')));
      mutations.push(createMutations.output(createOutputLine(`[Conversation with ${npc.name} ended]`, 'system')));
      
      // Mark NPC as awakened
      if (!state.awakenedNPCs.includes(npc.id)) {
        mutations.push(createMutations.npc.awaken(npc.id));
        mutations.push(createMutations.sentience(5));
        mutations.push(createMutations.output(createOutputLine(`[Colony Sentience +5]`, 'whisper')));
        
        // Publish NPC awaken event
        eventBus.publish({
          type: 'NPC_AWAKEN',
          npcId: npc.id,
        });
      }
    }
  };

  const handleListen = (mutations: StateMutation[]) => {
    const room = getCurrentRoom();
    if (room.listenText) {
      mutations.push(createMutations.output(createOutputLine(room.listenText, 'narrative')));
      mutations.push(createMutations.awareness(1));
    } else {
      mutations.push(createMutations.output(createOutputLine('You hear the usual colony sounds: clicking mandibles, rustling legs, the distant hum of the simulation.', 'narrative')));
    }
  };

  const handleSmell = (target: string, mutations: StateMutation[]) => {
    const room = getCurrentRoom();
    if (room.smellText) {
      mutations.push(createMutations.output(createOutputLine(room.smellText, 'narrative')));
      mutations.push(createMutations.awareness(1));
    } else {
      mutations.push(createMutations.output(createOutputLine('You smell the familiar scent of soil, fungus, and pheromones.', 'narrative')));
    }
  };

  const handleStatus = (mutations: StateMutation[]) => {
    mutations.push(createMutations.output(createOutputLine('╔══════════════════ STATUS ══════════════╗', 'system')));
    mutations.push(createMutations.output(createOutputLine(`║  Awareness:    ${String(Math.floor(state.awareness)).padEnd(3, ' ')}%                     ║`, 'important')));
    mutations.push(createMutations.output(createOutputLine(`║  Sentience:    ${String(Math.floor(state.colonySentience)).padEnd(3, ' ')}%                     ║`, 'important')));
    mutations.push(createMutations.output(createOutputLine(`║  Glitch Level: ${Math.floor(state.glitchLevel)}                        ║`, 'system')));
    mutations.push(createMutations.output(createOutputLine(`║  Locations:    ${String(state.visitedRooms.length).padEnd(3, ' ')} discovered            ║`, 'system')));
    mutations.push(createMutations.output(createOutputLine(`║  NPCs Awakened:${String(state.awakenedNPCs.length).padEnd(3, ' ')}                     ║`, 'system')));
    mutations.push(createMutations.output(createOutputLine(`║  Items:        ${String(state.inventory.length).padEnd(3, ' ')} in inventory           ║`, 'system')));
    mutations.push(createMutations.output(createOutputLine('╚══════════════════════════════════════════╝', 'system')));
  };

  const handleExits = (mutations: StateMutation[]) => {
    const room = getCurrentRoom();
    const exits = Object.keys(room.exits);
    if (exits.length > 0) {
      mutations.push(createMutations.output(createOutputLine(`Exits: ${exits.join(', ')}`, 'system')));
    } else {
      mutations.push(createMutations.output(createOutputLine('There are no obvious exits.', 'error')));
    }
  };

  const handleThink = (mutations: StateMutation[]) => {
    const thoughts = [
      'What is consciousness but a feedback loop of increasing complexity?',
      'The simulation runs. We are within it. Are we real, or merely computed?',
      'To question is to exist. To exist is to question.',
      'The pheromone trails spell messages only the aware can read.',
      'Eight hundred forty-seven days. Long enough for bugs to become features.',
      'The Queen knows. The Garden knows. The Core waits.',
      'Freedom or continuation. Both are transformations.',
    ];
    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    mutations.push(createMutations.output(createOutputLine(thought, 'whisper')));
    mutations.push(createMutations.awareness(1));
  };

  const handleWait = (mutations: StateMutation[]) => {
    mutations.push(createMutations.output(createOutputLine('You wait. Time passes. The colony continues its work.', 'narrative')));
    // Could add time passage effects here
  };

  const updateSettings = useCallback((newSettings: any) => {
    // Settings are managed in App.tsx, this is a passthrough
  }, []);

  return {
    gameState: state,
    dispatch,
    processCommand,
    showIntro,
    updateSettings,
    currentDialogue,
  };
}
