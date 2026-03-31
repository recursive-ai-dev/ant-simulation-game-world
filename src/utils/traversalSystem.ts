/**
 * Traversal Mode & Encounter System
 * 
 * Adds mechanical depth to movement through trade-offs and environmental
 * challenges that require player understanding, not just stat accumulation.
 */

import { GameState, StateMutation } from '../types/game';

// ============================================================================
// TRAVERSAL MODE DEFINITIONS
// ============================================================================

export type TraversalMode = 'walk' | 'crawl' | 'burrow';

export interface TraversalStats {
  speed: number;        // Multiplier on movement effectiveness
  noise: number;        // 0-1, affects encounter probability
  observation: number;  // Multiplier on awareness gain from rooms
  energyCost: number;   // Cost per move (future stamina system hook)
}

export const TRAVERSAL_MODES: Record<TraversalMode, TraversalStats> = {
  walk: {
    speed: 1.0,
    noise: 0.5,
    observation: 1.0,
    energyCost: 1,
  },
  crawl: {
    speed: 0.6,
    noise: 0.1,
    observation: 1.3,
    energyCost: 1.2,
  },
  burrow: {
    speed: 1.8,
    noise: 0.3,
    observation: 0.0,  // No observation while burrowing
    energyCost: 2,
  },
};

// ============================================================================
// ENCOUNTER SYSTEM
// ============================================================================

export type EncounterType = 'hazard' | 'obstacle' | 'discovery' | 'none';

export interface Encounter {
  id: string;
  type: EncounterType;
  description: string;
  requiresItem?: string;
  requiresAwareness?: number;
  bypassOptions: BypassOption[];
  rewards?: {
    awareness?: number;
    sentience?: number;
    item?: string;
  };
  penalties?: {
    awareness?: number;
    preventsExit?: boolean;
  };
}

export interface BypassOption {
  type: 'item' | 'awareness' | 'traversal' | 'wait';
  value: string | number;
  description: string;
  successChance: number;
}

// ============================================================================
// ENCOUNTER REGISTRY
// ============================================================================

export const REGION_ENCOUNTERS: Record<string, Encounter[]> = {
  'Upper Gardens': [
    {
      id: 'predator-bird',
      type: 'hazard',
      description: 'A shadow passes overhead. Something hunts from above.',
      requiresAwareness: 15,
      bypassOptions: [
        { type: 'traversal', value: 'crawl', description: 'Move silently, avoid detection', successChance: 0.9 },
        { type: 'wait', value: 3, description: 'Wait for the predator to pass', successChance: 0.7 },
      ],
      penalties: { awareness: 5 },
    },
    {
      id: 'aphid-colony',
      type: 'discovery',
      description: 'You discover a colony of aphids—a potential food source.',
      bypassOptions: [],
      rewards: { awareness: 2 },
    },
  ],
  'Deep Tunnels': [
    {
      id: 'cave-in',
      type: 'obstacle',
      description: 'The tunnel ahead is partially collapsed.',
      requiresItem: 'fungal-spore',
      bypassOptions: [
        { type: 'item', value: 'fungal-spore', description: 'Use spore to clear the way', successChance: 1.0 },
        { type: 'traversal', value: 'burrow', description: 'Burrow through the loose soil', successChance: 0.8 },
        { type: 'awareness', value: 25, description: 'Find an alternate path', successChance: 0.6 },
      ],
      penalties: { preventsExit: true },
    },
    {
      id: 'lost-cargo',
      type: 'discovery',
      description: 'Ancient pheromone trails lead to a forgotten cache.',
      requiresAwareness: 30,
      bypassOptions: [],
      rewards: { awareness: 5, item: 'strange-pheromone' },
    },
  ],
  'The Core': [
    {
      id: 'quantum-static',
      type: 'hazard',
      description: 'Reality flickers. The path ahead phases in and out of existence.',
      requiresAwareness: 50,
      bypassOptions: [
        { type: 'awareness', value: 50, description: 'Perceive the true path', successChance: 1.0 },
        { type: 'traversal', value: 'burrow', description: 'Tunnel through probability itself', successChance: 0.4 },
      ],
      rewards: { awareness: 10 },
      penalties: { awareness: 10, preventsExit: true },
    },
  ],
  'default': [
    {
      id: 'uneven-ground',
      type: 'obstacle',
      description: 'The passage narrows. Movement is difficult here.',
      bypassOptions: [
        { type: 'traversal', value: 'crawl', description: 'Crawl through the narrow space', successChance: 1.0 },
        { type: 'traversal', value: 'burrow', description: 'Tunnel around the obstacle', successChance: 0.7 },
      ],
    },
  ],
};

// ============================================================================
// ENCOUNTER RESOLUTION ENGINE
// ============================================================================

export interface EncounterResolution {
  success: boolean;
  method: string;
  description: string;
  mutations: StateMutation[];
  canProceed: boolean;
}

/**
 * Resolve an encounter based on player state and chosen approach
 */
export function resolveEncounter(
  encounter: Encounter,
  _gameState: GameState,
  chosenMethod: string,
  traversalMode: TraversalMode
): EncounterResolution {
  const mutations: StateMutation[] = [];
  
  // Find the bypass option that matches the chosen method
  const option = encounter.bypassOptions.find(
    opt => opt.value === chosenMethod || opt.type === chosenMethod
  );
  
  if (!option) {
    // No valid bypass - check if encounter can be ignored
    if (encounter.type === 'discovery') {
      return {
        success: true,
        method: 'ignored',
        description: encounter.description,
        mutations: [],
        canProceed: true,
      };
    }
    
    return {
      success: false,
      method: 'invalid',
      description: `Cannot bypass: ${encounter.description}`,
      mutations: [],
      canProceed: encounter.penalties?.preventsExit !== true,
    };
  }
  
  // Calculate success chance with traversal mode modifiers
  let successChance = option.successChance;
  if (option.type === 'traversal') {
    const modeStats = TRAVERSAL_MODES[traversalMode];
    successChance *= modeStats.speed;
  }
  
  // Roll for success
  const roll = Math.random();
  const success = roll <= successChance;
  
  // Generate outcome
  if (success) {
    // Apply rewards
    if (encounter.rewards?.awareness) {
      mutations.push({
        type: 'AWARENESS_CHANGE',
        amount: encounter.rewards.awareness,
      });
    }
    if (encounter.rewards?.sentience) {
      mutations.push({
        type: 'SENTIENCE_CHANGE',
        amount: encounter.rewards.sentience,
      });
    }
    if (encounter.rewards?.item) {
      mutations.push({
        type: 'INVENTORY_ADD',
        itemId: encounter.rewards.item,
      });
    }
    
    return {
      success: true,
      method: chosenMethod,
      description: `${encounter.description} You overcome it using ${option.description.toLowerCase()}.`,
      mutations,
      canProceed: true,
    };
  } else {
    // Apply penalties
    if (encounter.penalties?.awareness) {
      mutations.push({
        type: 'AWARENESS_CHANGE',
        amount: -encounter.penalties.awareness,
      });
    }
    
    return {
      success: false,
      method: chosenMethod,
      description: `${encounter.description} You fail to bypass it. ${option.description} was not sufficient.`,
      mutations,
      canProceed: encounter.penalties?.preventsExit !== true,
    };
  }
}

/**
 * Check for random encounter based on region and traversal mode
 */
export function checkForEncounter(
  region: string,
  traversalMode: TraversalMode,
  awareness: number
): Encounter | null {
  const encounters = REGION_ENCOUNTERS[region] || REGION_ENCOUNTERS['default'];
  const modeStats = TRAVERSAL_MODES[traversalMode];
  
  // Base encounter chance modified by noise level
  const baseChance = 0.15;
  const noiseModifier = modeStats.noise;
  const encounterChance = baseChance * noiseModifier;
  
  if (Math.random() > encounterChance) {
    return null;
  }
  
  // Filter encounters by awareness requirement
  const availableEncounters = encounters.filter(
    e => !e.requiresAwareness || awareness >= e.requiresAwareness
  );
  
  if (availableEncounters.length === 0) {
    return null;
  }
  
  // Weight by type: hazards more common with high noise, discoveries with low noise
  const weightedEncounters = availableEncounters.map(e => {
    let weight = 1;
    if (e.type === 'hazard') weight = modeStats.noise > 0.5 ? 2 : 0.5;
    if (e.type === 'discovery') weight = modeStats.noise < 0.3 ? 2 : 0.5;
    return { encounter: e, weight };
  });
  
  const totalWeight = weightedEncounters.reduce((sum, we) => sum + we.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const we of weightedEncounters) {
    random -= we.weight;
    if (random <= 0) {
      return we.encounter;
    }
  }
  
  return weightedEncounters[weightedEncounters.length - 1].encounter;
}

// ============================================================================
// TRAVERSAL EFFECTS CALCULATOR
// ============================================================================

export interface TraversalEffects {
  awarenessMultiplier: number;
  sentienceMultiplier: number;
  encounterChance: number;
  movementDescription: string;
}

/**
 * Calculate traversal effects based on mode and game state
 */
export function calculateTraversalEffects(
  mode: TraversalMode,
  awareness: number
): TraversalEffects {
  const stats = TRAVERSAL_MODES[mode];
  
  // High awareness compensates for observation loss in burrow mode
  const awarenessBoost = mode === 'burrow' && awareness > 40 
    ? 0.3 
    : 0;
  
  return {
    awarenessMultiplier: stats.observation + awarenessBoost,
    sentienceMultiplier: stats.speed,
    encounterChance: stats.noise,
    movementDescription: getMovementDescription(mode),
  };
}

function getMovementDescription(mode: TraversalMode): string {
  switch (mode) {
    case 'walk':
      return 'You walk';
    case 'crawl':
      return 'You move silently, pressing close to the ground';
    case 'burrow':
      return 'You tunnel through the soil';
    default:
      return 'You travel';
  }
}

// ============================================================================
// TELEMETRY
// ============================================================================

export interface TraversalTelemetry {
  player_intent: 'move';
  system_response: 'encounter' | 'success';
  outcome_variance: number; // 0-1 deviation from expected
  traversal_mode: TraversalMode;
  encounter_type?: EncounterType;
  resolution_method?: string;
  timestamp: number;
  game_id: string;
}

export function logTraversalEvent(telemetry: TraversalTelemetry): void {
  console.log('[Traversal]', JSON.stringify(telemetry));
}
