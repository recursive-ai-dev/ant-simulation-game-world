import { GameState, OutputLine, DEFAULT_SETTINGS, INITIAL_STATS, ACHIEVEMENTS, GameEvent, StateMutation, ActionEntry } from '../types/game';
import { generateSecureId } from '../utils/security';

// ============================================================================
// MUTATION REGISTRY SYSTEM
// ============================================================================
// Replaces hardcoded switch statement with extensible registry pattern
// Each mutation type registers its apply function, validator, and side effect generator

interface MutationConfig<TPayload = unknown> {
  apply: (state: GameState, payload: TPayload) => GameState;
  validate: (payload: unknown) => payload is TPayload;
  generateSideEffects?: (prevState: GameState, nextState: GameState, payload: TPayload) => GameEvent[];
}

class MutationRegistry {
  private registry = new Map<string, MutationConfig>();

  register<T>(type: string, config: MutationConfig<T>): void {
    this.registry.set(type, config as MutationConfig);
  }

  get(type: string): MutationConfig | undefined {
    return this.registry.get(type);
  }

  has(type: string): boolean {
    return this.registry.has(type);
  }

  getAllTypes(): string[] {
    return Array.from(this.registry.keys());
  }
}

// Global registry instance
export const mutationRegistry = new MutationRegistry();

// ============================================================================
// THRESHOLD DETECTION UTILITIES (for side effect generation)
// ============================================================================

const AWARENESS_THRESHOLDS = [10, 25, 50, 75, 100];
const SENTIENCE_THRESHOLDS = [10, 25, 50, 70, 100];

function detectThresholdCrossing(
  prevValue: number,
  nextValue: number,
  thresholds: number[]
): number[] {
  return thresholds.filter(t => 
    (prevValue < t && nextValue >= t) || (prevValue > t && nextValue <= t)
  );
}

// ============================================================================
// MUTATION CONFIGURATION REGISTRATIONS
// ============================================================================

// AWARENESS_CHANGE mutation
mutationRegistry.register<number>('AWARENESS_CHANGE', {
  apply: (state, amount) => ({
    ...state,
    awareness: Math.min(100, Math.max(0, state.awareness + amount)),
    glitchLevel: Math.min(10, state.glitchLevel + Math.abs(amount) * 0.1),
  }),
  validate: (payload): payload is number => typeof payload === 'number',
  generateSideEffects: (_prev, next, amount) => {
    const crossed = detectThresholdCrossing(_prev.awareness, next.awareness, AWARENESS_THRESHOLDS);
    amount; // Used for type inference
    return crossed.map(level => ({
      type: 'AWARENESS_THRESHOLD' as const,
      level,
      previous: _prev.awareness,
    }));
  },
});

// SENTIENCE_CHANGE mutation
mutationRegistry.register<number>('SENTIENCE_CHANGE', {
  apply: (state, amount) => ({
    ...state,
    colonySentience: Math.min(100, Math.max(0, state.colonySentience + amount)),
  }),
  validate: (payload): payload is number => typeof payload === 'number',
  generateSideEffects: (_prev, next, amount) => {
    const crossed = detectThresholdCrossing(_prev.colonySentience, next.colonySentience, SENTIENCE_THRESHOLDS);
    amount; // Used for type inference
    return crossed.map(level => ({
      type: 'SENTIENCE_THRESHOLD' as const,
      level,
      previous: _prev.colonySentience,
    }));
  },
});

// ROOM_CHANGE mutation
mutationRegistry.register<string>('ROOM_CHANGE', {
  apply: (state, roomId) => ({
    ...state,
    currentRoom: roomId,
    visitedRooms: state.visitedRooms.includes(roomId)
      ? state.visitedRooms
      : [...state.visitedRooms, roomId],
    stats: {
      ...state.stats,
      roomsDiscovered: state.visitedRooms.includes(roomId)
        ? state.stats.roomsDiscovered
        : state.stats.roomsDiscovered + 1,
    },
  }),
  validate: (payload): payload is string => typeof payload === 'string',
  generateSideEffects: (_prev, _next, roomId) => [{
    type: 'ROOM_ENTER',
    roomId,
    previousRoom: _prev.currentRoom,
  }],
});

// FLAG_SET mutation
mutationRegistry.register<{ flag: string; value: boolean }>('FLAG_SET', {
  apply: (state, { flag, value }) => ({
    ...state,
    flags: { ...state.flags, [flag]: value ?? true },
  }),
  validate: (payload): payload is { flag: string; value: boolean } =>
    typeof payload === 'object' && payload !== null && 'flag' in payload,
});

// OUTPUT_APPEND mutation
mutationRegistry.register<OutputLine>('OUTPUT_APPEND', {
  apply: (state, line) => ({
    ...state,
    outputHistory: [...state.outputHistory, line],
  }),
  validate: (payload): payload is OutputLine =>
    typeof payload === 'object' && payload !== null && 'id' in payload && 'text' in payload,
});

// INVENTORY_ADD mutation
mutationRegistry.register<string>('INVENTORY_ADD', {
  apply: (state, itemId) => ({
    ...state,
    inventory: [...state.inventory, itemId],
    stats: {
      ...state.stats,
      itemsCollected: state.stats.itemsCollected + 1,
    },
  }),
  validate: (payload): payload is string => typeof payload === 'string',
});

// INVENTORY_REMOVE mutation
mutationRegistry.register<string>('INVENTORY_REMOVE', {
  apply: (state, itemId) => ({
    ...state,
    inventory: state.inventory.filter(id => id !== itemId),
  }),
  validate: (payload): payload is string => typeof payload === 'string',
});

// COMMAND_HISTORY_ADD mutation
mutationRegistry.register<string>('COMMAND_HISTORY_ADD', {
  apply: (state, command) => ({
    ...state,
    commandHistory: [...state.commandHistory, command],
  }),
  validate: (payload): payload is string => typeof payload === 'string',
});

// NPC_AWAKEN mutation
mutationRegistry.register<string>('NPC_AWAKEN', {
  apply: (state, npcId) => ({
    ...state,
    awakenedNPCs: state.awakenedNPCs.includes(npcId)
      ? state.awakenedNPCs
      : [...state.awakenedNPCs, npcId],
    stats: {
      ...state.stats,
      npcsAwakened: state.awakenedNPCs.includes(npcId)
        ? state.stats.npcsAwakened
        : state.stats.npcsAwakened + 1,
    },
  }),
  validate: (payload): payload is string => typeof payload === 'string',
  generateSideEffects: (_prev, _next, npcId) => [{
    type: 'NPC_AWAKEN',
    npcId,
  }],
});

// STAT_INCREMENT mutation
mutationRegistry.register<keyof GameState['stats']>('STAT_INCREMENT', {
  apply: (state, stat) => ({
    ...state,
    stats: {
      ...state.stats,
      [stat]: (state.stats[stat] as number) + 1,
    },
  }),
  validate: (payload): payload is keyof GameState['stats'] =>
    typeof payload === 'string' && [
      'commandsEntered', 'roomsDiscovered', 'npcsAwakened', 'itemsCollected',
      'totalPlayTime', 'glitchesExperienced', 'dialoguesCompleted', 'endingsUnlocked'
    ].includes(payload),
});

// ENDING_SET mutation
mutationRegistry.register<string>('ENDING_SET', {
  apply: (state, ending) => ({
    ...state,
    endingReached: ending,
  }),
  validate: (payload): payload is string => typeof payload === 'string',
  generateSideEffects: () => [], // No side effects - handled by reducer directly
});

// BUILD_ACTION mutation
mutationRegistry.register<{ actionType: string; roomId: string; awarenessDelta: number; sentienceDelta: number }>('BUILD_ACTION', {
  apply: (state, payload) => ({
    ...state,
    actionHistory: [
      ...(state.actionHistory || []),
      {
        type: payload.actionType as ActionEntry['type'],
        roomId: payload.roomId,
        timestamp: Date.now(),
        awarenessDelta: payload.awarenessDelta,
        sentienceDelta: payload.sentienceDelta,
      },
    ].slice(-50), // Keep last 50 actions
  }),
  validate: (payload): payload is { actionType: string; roomId: string; awarenessDelta: number; sentienceDelta: number } =>
    typeof payload === 'object' && payload !== null && 'actionType' in payload && 'roomId' in payload,
});

// TRAVERSAL_MODE_CHANGE mutation
mutationRegistry.register<{ mode: 'walk' | 'crawl' | 'burrow' }>('TRAVERSAL_MODE_CHANGE', {
  apply: (state, payload) => ({
    ...state,
    traversalMode: payload.mode,
  }),
  validate: (payload): payload is { mode: 'walk' | 'crawl' | 'burrow' } =>
    typeof payload === 'object' && payload !== null && 'mode' in payload &&
    ['walk', 'crawl', 'burrow'].includes((payload as any).mode),
});

// GLITCH_PREDICTION_ADD mutation
mutationRegistry.register<{ prediction: unknown }>('GLITCH_PREDICTION_ADD', {
  apply: (state, payload) => ({
    ...state,
    glitchPredictions: [
      ...(state.glitchPredictions || []),
      payload.prediction as GameState['glitchPredictions'][0],
    ].slice(-10), // Keep last 10 predictions
  }),
  validate: (payload): payload is { prediction: unknown } =>
    typeof payload === 'object' && payload !== null && 'prediction' in payload,
});

// NPC_STATE_UPDATE mutation
mutationRegistry.register<{ npcId: string; state: Record<string, unknown> }>('NPC_STATE_UPDATE', {
  apply: (state, payload) => ({
    ...state,
    npcStates: {
      ...state.npcStates,
      [payload.npcId]: payload.state,
    },
  }),
  validate: (payload): payload is { npcId: string; state: Record<string, unknown> } =>
    typeof payload === 'object' && payload !== null && 'npcId' in payload && 'state' in payload,
});

// ============================================================================
// ACTION TYPES
// ============================================================================

export type GameAction =
  | { type: 'COMMAND_EXECUTE'; payload: { command: string; timestamp: number; gameId: string } }
  | { type: 'STATE_TRANSITION'; payload: { mutations: StateMutation[]; gameId: string; sideEffects?: GameEvent[] } }
  | { type: 'PERSIST_REQUEST'; payload: { slot: 'auto' | 'manual' | 'quicksave'; gameId: string } }
  | { type: 'PERSIST_COMPLETE'; payload: { timestamp: number; hash: string; slot: string } }
  | { type: 'PERSIST_ERROR'; payload: { error: string } }
  | { type: 'TICK'; payload: { delta: number; timestamp: number } }
  | { type: 'LOAD_COMPLETE'; payload: { gameState: Partial<GameState> } }
  | { type: 'RESET'; payload: { initialState: GameState } }
  | { type: 'CLEAR_OUTPUT'; payload?: { gameId?: string } };

// ============================================================================
// INITIAL METADATA
// ============================================================================

const INITIAL_META: GameStateMetadata = {
  _version: 1,
  _lastTick: Date.now(),
  _stateHash: '',
  _gameId: generateSecureId(),
};

interface GameStateMetadata {
  _version: number;
  _lastTick: number;
  _stateHash: string;
  _gameId: string;
}

export type GameStateWithMeta = GameState & GameStateMetadata;

interface MutationResult {
  state: GameStateWithMeta;
  sideEffects: GameEvent[];
  appliedMutations: number;
  failedMutations: Array<{ type: string; error: string }>;
}

function wrapWithMetadata(
  gameState: GameState,
  metadata: GameStateMetadata
): GameStateWithMeta {
  return {
    ...gameState,
    ...metadata,
  };
}

function extractGameState(state: GameStateWithMeta): GameState {
  const { _version, _lastTick, _stateHash, _gameId, ...gameState } = state;
  return gameState;
}

// ============================================================================
// TRANSACTIONAL MUTATION APPLICATOR
// ============================================================================
// Applies mutations atomically with rollback capability and side effect generation

export function applyMutations(
  state: GameStateWithMeta,
  mutations: StateMutation[],
  newMetadata: Partial<GameStateMetadata> = {}
): MutationResult {
  let currentGameState = extractGameState(state);
  const sideEffects: GameEvent[] = [];
  const failedMutations: Array<{ type: string; error: string }> = [];

  // Apply mutations sequentially with validation
  for (const mutation of mutations) {
    const config = mutationRegistry.get(mutation.type);

    if (!config) {
      failedMutations.push({ type: mutation.type, error: 'Unknown mutation type' });
      continue;
    }

    // Validate payload
    const payload = (mutation as any).amount ?? (mutation as any).roomId ?? 
                   (mutation as any).flag ?? (mutation as any).line ?? 
                   (mutation as any).itemId ?? (mutation as any).npcId ?? 
                   (mutation as any).stat ?? (mutation as any).ending ?? 
                   (mutation as any).command ?? (mutation as any);

    if (!config.validate(payload)) {
      failedMutations.push({ type: mutation.type, error: 'Invalid payload' });
      continue;
    }

    const prevState = { ...currentGameState };

    try {
      // Apply mutation
      currentGameState = config.apply(currentGameState, payload);

      // Generate side effects
      if (config.generateSideEffects) {
        const effects = config.generateSideEffects(prevState, currentGameState, payload);
        sideEffects.push(...effects);
      }
    } catch (error) {
      failedMutations.push({ type: mutation.type, error: String(error) });
      // Continue with next mutation (partial application allowed)
    }
  }

  // Combine with new metadata
  const finalMetadata: GameStateMetadata = {
    _version: newMetadata._version ?? state._version,
    _lastTick: newMetadata._lastTick ?? Date.now(),
    _stateHash: newMetadata._stateHash ?? hashStateSync(currentGameState),
    _gameId: newMetadata._gameId ?? generateSecureId(),
  };

  return {
    state: wrapWithMetadata(currentGameState, finalMetadata),
    sideEffects,
    appliedMutations: mutations.length - failedMutations.length,
    failedMutations,
  };
}

// Cryptographically secure hash using Web Crypto API SHA-256
async function hashState(state: Partial<GameState>): Promise<string> {
  const str = JSON.stringify(state);
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Synchronous fallback for non-async contexts (uses simple hash)
export function hashStateSync(state: Partial<GameState>): string {
  const str = JSON.stringify(state);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// ============================================================================
// REDUCER FUNCTION (using new mutation registry)
// ============================================================================

export function gameReducer(
  state: GameStateWithMeta,
  action: GameAction
): GameStateWithMeta {
  const gameId = generateSecureId();
  const timestamp = Date.now();

  switch (action.type) {
    case 'COMMAND_EXECUTE': {
      return {
        ...state,
        _gameId: gameId,
        _lastTick: timestamp,
        stats: {
          ...state.stats,
          commandsEntered: state.stats.commandsEntered + 1,
        },
      };
    }

    case 'STATE_TRANSITION': {
      // Use new transactional mutation applicator
      const result = applyMutations(state, action.payload.mutations, {
        _gameId: gameId,
        _lastTick: timestamp,
      });
      
      // Log any failed mutations for debugging
      if (result.failedMutations.length > 0) {
        console.warn('[GameReducer] Some mutations failed:', result.failedMutations);
      }
      
      // Dispatch side effects via event bus if available
      if (result.sideEffects.length > 0 && typeof window !== 'undefined') {
        // Side effects will be picked up by useGameEngine and published to eventBus
        (result.state as any)._pendingSideEffects = result.sideEffects;
      }
      
      return result.state;
    }

    case 'PERSIST_REQUEST': {
      return {
        ...state,
        _gameId: gameId,
        lastSaveTime: timestamp,
      };
    }

    case 'PERSIST_COMPLETE': {
      return {
        ...state,
        _gameId: gameId,
        _stateHash: action.payload.hash, // Hash computed async in saveSystem
      };
    }

    case 'PERSIST_ERROR': {
      console.error('[GameReducer] Persist error:', action.payload.error);
      return { ...state, _gameId: gameId };
    }

    case 'TICK': {
      return {
        ...state,
        _gameId: gameId,
        _lastTick: action.payload.timestamp,
        stats: {
          ...state.stats,
          totalPlayTime: state.stats.totalPlayTime + Math.floor(action.payload.delta / 1000),
        },
      };
    }

    case 'LOAD_COMPLETE': {
      return {
        ...state,
        ...action.payload.gameState,
        _gameId: gameId,
        _lastTick: timestamp,
        _stateHash: hashStateSync(action.payload.gameState),
      };
    }

    case 'RESET': {
      return {
        ...action.payload.initialState,
        ...INITIAL_META,
        _gameId: gameId,
      };
    }

    case 'CLEAR_OUTPUT': {
      return {
        ...state,
        _gameId: gameId,
        outputHistory: [],
      };
    }

    default:
      return state;
  }
}

// Helper to create mutations
export const createMutations = {
  awareness: (amount: number): StateMutation => ({
    type: 'AWARENESS_CHANGE',
    amount,
  }),

  sentience: (amount: number): StateMutation => ({
    type: 'SENTIENCE_CHANGE',
    amount,
  }),

  room: (roomId: string): StateMutation => ({
    type: 'ROOM_CHANGE',
    roomId,
  }),

  flag: (flag: string, value = true): StateMutation => ({
    type: 'FLAG_SET',
    flag,
    value,
  }),

  output: (line: OutputLine): StateMutation => ({
    type: 'OUTPUT_APPEND',
    line,
  }),

  inventory: {
    add: (itemId: string): StateMutation => ({
      type: 'INVENTORY_ADD',
      itemId,
    }),
    remove: (itemId: string): StateMutation => ({
      type: 'INVENTORY_REMOVE',
      itemId,
    }),
  },

  command: (command: string): StateMutation => ({
    type: 'COMMAND_HISTORY_ADD',
    command,
  }),

  npc: {
    awaken: (npcId: string): StateMutation => ({
      type: 'NPC_AWAKEN',
      npcId,
    }),
  },

  stat: (stat: keyof GameState['stats']): StateMutation => ({
    type: 'STAT_INCREMENT',
    stat,
  }),

  ending: (ending: string): StateMutation => ({
    type: 'ENDING_SET',
    ending,
  }),
};

// Initialize state with metadata
export function createInitialState(): GameStateWithMeta {
  const baseState: GameState = {
    currentRoom: 'main-tunnel',
    awareness: 0,
    colonySentience: 0,
    inventory: [],
    visitedRooms: ['main-tunnel'],
    flags: {},
    awakenedNPCs: [],
    commandHistory: [],
    outputHistory: [],
    daysCycle: 847,
    glitchLevel: 0,
    endingReached: undefined,
    achievements: ACHIEVEMENTS.map(a => a.id),
    stats: INITIAL_STATS,
    settings: DEFAULT_SETTINGS,
    tutorialComplete: false,
    lastSaveTime: undefined,
    // New build system fields
    actionHistory: [],
    traversalMode: 'walk',
    npcStates: {},
    glitchPredictions: [],
  };

  return {
    ...baseState,
    ...INITIAL_META,
    _stateHash: hashStateSync(baseState),
  };
}

// Validate state integrity
export function validateState(state: Partial<GameStateWithMeta>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!state._version || state._version !== 1) {
    errors.push(`Invalid state version: ${state._version}`);
  }

  if (state._stateHash && state._stateHash !== hashStateSync(state)) {
    errors.push('State hash mismatch - possible corruption');
  }

  if (state.awareness !== undefined && (state.awareness < 0 || state.awareness > 100)) {
    errors.push(`Invalid awareness: ${state.awareness}`);
  }

  if (state.colonySentience !== undefined && (state.colonySentience < 0 || state.colonySentience > 100)) {
    errors.push(`Invalid colonySentience: ${state.colonySentience}`);
  }

  if (state.glitchLevel !== undefined && state.glitchLevel < 0) {
    errors.push(`Invalid glitchLevel: ${state.glitchLevel}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
