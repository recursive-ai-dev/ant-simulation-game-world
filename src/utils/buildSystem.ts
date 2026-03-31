/**
 * Player Build System & Progression Mechanics
 * 
 * Transforms linear accumulation into strategic progression through:
 * - Archetype detection based on play patterns
 * - Diminishing returns to prevent grind-to-win
 * - Synergy bonuses for diverse play
 * - Build-specific effects on all game systems
 */

import { GameState, StateMutation } from '../types/game';

// ============================================================================
// BUILD ARCHETYPES
// ============================================================================

export type BuildArchetype = 'none' | 'observer' | 'connector' | 'explorer';

export interface PlayerBuild {
  archetype: BuildArchetype;
  specializationScore: number; // 0-1, how pure the build is
  actionHistory: ActionEntry[];
  detectedAt: number;
  primaryStat: 'awareness' | 'sentience';
}

export interface ActionEntry {
  type: ActionType;
  roomId: string;
  timestamp: number;
  awarenessDelta: number;
  sentienceDelta: number;
}

export type ActionType = 'examine' | 'talk' | 'move' | 'think' | 'take' | 'listen' | 'smell';

// Archetype definitions with bonuses
export interface ArchetypeProfile {
  name: BuildArchetype;
  description: string;
  primaryAction: ActionType;
  secondaryActions: ActionType[];
  bonuses: ArchetypeBonuses;
  synergies: SynergyDefinition[];
}

export interface ArchetypeBonuses {
  examineMultiplier?: number;
  talkMultiplier?: number;
  moveObservationMultiplier?: number;
  moveSpeedMultiplier?: number;
  glitchPredictionChance?: number;
  encounterAvoidanceBonus?: number;
}

export interface SynergyDefinition {
  actions: [ActionType, ActionType];
  timeWindow: number; // seconds
  bonusMultiplier: number;
  description: string;
}

// ============================================================================
// ARCHETYPE CONFIGURATIONS
// ============================================================================

export const ARCHETYPE_PROFILES: Record<Exclude<BuildArchetype, 'none'>, ArchetypeProfile> = {
  observer: {
    name: 'observer',
    description: 'Gains awareness through careful examination and sensory focus',
    primaryAction: 'examine',
    secondaryActions: ['listen', 'smell', 'think'],
    bonuses: {
      examineMultiplier: 1.5,
      moveObservationMultiplier: 1.2,
      glitchPredictionChance: 0.25,
    },
    synergies: [
      { 
        actions: ['examine', 'listen'], 
        timeWindow: 30, 
        bonusMultiplier: 1.3,
        description: 'Multi-sensory observation',
      },
      { 
        actions: ['examine', 'think'], 
        timeWindow: 45, 
        bonusMultiplier: 1.4,
        description: 'Contemplative examination',
      },
    ],
  },
  
  connector: {
    name: 'connector',
    description: 'Gains sentience through dialogue and awakening others',
    primaryAction: 'talk',
    secondaryActions: ['think', 'listen'],
    bonuses: {
      talkMultiplier: 1.6,
      glitchPredictionChance: 0.15,
    },
    synergies: [
      { 
        actions: ['talk', 'think'], 
        timeWindow: 60, 
        bonusMultiplier: 1.35,
        description: 'Reflective dialogue',
      },
      { 
        actions: ['talk', 'listen'], 
        timeWindow: 30, 
        bonusMultiplier: 1.25,
        description: 'Attentive conversation',
      },
    ],
  },
  
  explorer: {
    name: 'explorer',
    description: 'Balanced progression through diverse activities and discovery',
    primaryAction: 'move',
    secondaryActions: ['examine', 'talk', 'take'],
    bonuses: {
      moveSpeedMultiplier: 1.2,
      moveObservationMultiplier: 0.9, // Slight penalty
      encounterAvoidanceBonus: 0.15,
    },
    synergies: [
      { 
        actions: ['move', 'examine'], 
        timeWindow: 60, 
        bonusMultiplier: 1.4,
        description: 'Exploratory examination',
      },
      { 
        actions: ['move', 'talk'], 
        timeWindow: 90, 
        bonusMultiplier: 1.3,
        description: 'Nomadic connection',
      },
    ],
  },
};

// ============================================================================
// BUILD DETECTION ENGINE
// ============================================================================

const HISTORY_WINDOW = 20; // Last N actions considered
const ARCHETYPE_THRESHOLD = 0.6; // 60% of actions must be archetype-aligned

/**
 * Detect player archetype based on action history
 */
export function detectArchetype(actionHistory: ActionEntry[]): PlayerBuild {
  if (actionHistory.length < 5) {
    return {
      archetype: 'none',
      specializationScore: 0,
      actionHistory,
      detectedAt: Date.now(),
      primaryStat: 'awareness',
    };
  }
  
  const recentActions = actionHistory.slice(-HISTORY_WINDOW);
  
  // Count action types
  const actionCounts = new Map<ActionType, number>();
  for (const entry of recentActions) {
    actionCounts.set(entry.type, (actionCounts.get(entry.type) || 0) + 1);
  }
  
  const totalActions = recentActions.length;
  
  // Calculate archetype scores
  const observerScore = calculateArchetypeScore(
    actionCounts, 
    ARCHETYPE_PROFILES.observer,
    totalActions
  );
  const connectorScore = calculateArchetypeScore(
    actionCounts,
    ARCHETYPE_PROFILES.connector,
    totalActions
  );
  const explorerScore = calculateArchetypeScore(
    actionCounts,
    ARCHETYPE_PROFILES.explorer,
    totalActions
  );
  
  // Determine winner
  const scores = [
    { archetype: 'observer' as BuildArchetype, score: observerScore },
    { archetype: 'connector' as BuildArchetype, score: connectorScore },
    { archetype: 'explorer' as BuildArchetype, score: explorerScore },
  ];
  
  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];
  
  if (winner.score >= ARCHETYPE_THRESHOLD) {
    return {
      archetype: winner.archetype,
      specializationScore: winner.score,
      actionHistory,
      detectedAt: Date.now(),
      primaryStat: winner.archetype === 'connector' ? 'sentience' : 'awareness',
    };
  }
  
  // Explorer is the default for balanced play
  if (explorerScore > 0.4) {
    return {
      archetype: 'explorer',
      specializationScore: explorerScore,
      actionHistory,
      detectedAt: Date.now(),
      primaryStat: 'awareness',
    };
  }
  
  return {
    archetype: 'none',
    specializationScore: 0,
    actionHistory,
    detectedAt: Date.now(),
    primaryStat: 'awareness',
  };
}

function calculateArchetypeScore(
  actionCounts: Map<ActionType, number>,
  profile: ArchetypeProfile,
  totalActions: number
): number {
  const primaryCount = actionCounts.get(profile.primaryAction) || 0;
  const secondaryCount = profile.secondaryActions.reduce(
    (sum, action) => sum + (actionCounts.get(action) || 0),
    0
  );
  
  // Primary actions weighted more heavily
  const weightedScore = (primaryCount * 2 + secondaryCount) / (totalActions * 1.5);
  return Math.min(1, weightedScore);
}

// ============================================================================
// DIMINISHING RETURNS FORMULA
// ============================================================================

/**
 * Mathematical model for diminishing returns
 * 
 * effectiveGain = baseGain * (1 - saturationFactor * actionTypeRatio)
 * 
 * Where:
 * - baseGain: The nominal gain from the action
 * - saturationFactor: How quickly returns diminish (0.8 default)
 * - actionTypeRatio: Percentage of recent actions of the same type
 * 
 * This prevents grind-to-win by making repeated actions less effective.
 */

const DEFAULT_SATURATION_FACTOR = 0.8;
const DIMINISHING_WINDOW = 10; // Recent actions considered

export interface DiminishingReturnsConfig {
  saturationFactor: number;
  minimumMultiplier: number; // Never goes below this
  recoveryRate: number; // How fast ratio resets (actions)
}

export const DEFAULT_DR_CONFIG: DiminishingReturnsConfig = {
  saturationFactor: DEFAULT_SATURATION_FACTOR,
  minimumMultiplier: 0.2,
  recoveryRate: 0.1, // 10% recovery per different action
};

/**
 * Calculate effective gain with diminishing returns
 */
export function applyDiminishingReturns(
  baseGain: number,
  actionType: ActionType,
  actionHistory: ActionEntry[],
  config: DiminishingReturnsConfig = DEFAULT_DR_CONFIG
): { effectiveGain: number; multiplier: number; saturationLevel: number } {
  if (actionHistory.length === 0) {
    return { effectiveGain: baseGain, multiplier: 1, saturationLevel: 0 };
  }
  
  // Calculate action type ratio in recent history
  const recentHistory = actionHistory.slice(-DIMINISHING_WINDOW);
  const sameTypeCount = recentHistory.filter(e => e.type === actionType).length;
  const actionTypeRatio = sameTypeCount / recentHistory.length;
  
  // Apply diminishing returns formula
  const rawMultiplier = 1 - (config.saturationFactor * actionTypeRatio);
  const multiplier = Math.max(config.minimumMultiplier, rawMultiplier);
  
  const effectiveGain = baseGain * multiplier;
  
  return {
    effectiveGain,
    multiplier,
    saturationLevel: actionTypeRatio,
  };
}

/**
 * Calculate recovery from saturation
 */
export function calculateSaturationRecovery(
  currentSaturation: number,
  differentActionsTaken: number,
  config: DiminishingReturnsConfig = DEFAULT_DR_CONFIG
): number {
  const recovery = differentActionsTaken * config.recoveryRate;
  return Math.max(0, currentSaturation - recovery);
}

// ============================================================================
// SYNERGY BONUS CALCULATOR
// ============================================================================

/**
 * Calculate synergy bonus based on action combinations
 */
export function calculateSynergyBonus(
  actionHistory: ActionEntry[],
  build: PlayerBuild
): { bonus: number; activeSynergies: string[] } {
  if (build.archetype === 'none' || !ARCHETYPE_PROFILES[build.archetype]) {
    return { bonus: 0, activeSynergies: [] };
  }
  
  const profile = ARCHETYPE_PROFILES[build.archetype];
  const activeSynergies: string[] = [];
  let totalBonus = 1;
  
  for (const synergy of profile.synergies) {
    const [action1, action2] = synergy.actions;
    
    // Check if both actions occurred within time window
    const action1Index = findLastActionIndex(actionHistory, action1);
    const action2Index = findLastActionIndex(actionHistory, action2);
    
    if (action1Index >= 0 && action2Index >= 0) {
      const action1Time = actionHistory[action1Index].timestamp;
      const action2Time = actionHistory[action2Index].timestamp;
      const timeDiff = Math.abs(action1Time - action2Time) / 1000; // Convert to seconds
      
      if (timeDiff <= synergy.timeWindow) {
        totalBonus *= synergy.bonusMultiplier;
        activeSynergies.push(synergy.description);
      }
    }
  }
  
  return { 
    bonus: totalBonus - 1, // Return as percentage bonus
    activeSynergies,
  };
}

function findLastActionIndex(history: ActionEntry[], type: ActionType): number {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].type === type) {
      return i;
    }
  }
  return -1;
}

// ============================================================================
// GAIN CALCULATION ENGINE
// ============================================================================

export interface GainCalculation {
  baseAwareness: number;
  baseSentience: number;
  awarenessGain: number;
  sentienceGain: number;
  archetypeMultiplier: number;
  diminishingMultiplier: number;
  synergyBonus: number;
  finalAwareness: number;
  finalSentience: number;
  telemetry: GainTelemetry;
}

export interface GainTelemetry {
  action_type: ActionType;
  player_intent: string;
  base_gain: number;
  archetype_multiplier: number;
  diminishing_factor: number;
  synergy_bonus: number;
  final_gain: number;
  build_archetype: BuildArchetype;
  saturation_level: number;
  timestamp: number;
  game_id: string;
}

/**
 * Comprehensive gain calculation with all systems
 */
export function calculateGain(
  actionType: ActionType,
  roomId: string,
  gameState: GameState,
  baseAwareness: number = 0,
  baseSentience: number = 0
): GainCalculation {
  const build = detectArchetype(gameState.actionHistory || []);
  
  // Apply archetype bonuses
  let archetypeMultiplier = 1;
  if (build.archetype !== 'none') {
    const profile = ARCHETYPE_PROFILES[build.archetype];
    
    if (actionType === 'examine' && profile.bonuses.examineMultiplier) {
      archetypeMultiplier = profile.bonuses.examineMultiplier;
    } else if (actionType === 'talk' && profile.bonuses.talkMultiplier) {
      archetypeMultiplier = profile.bonuses.talkMultiplier;
    }
  }
  
  // Apply diminishing returns
  const dr = applyDiminishingReturns(
    Math.max(baseAwareness, baseSentience),
    actionType,
    gameState.actionHistory || []
  );
  
  // Apply synergy bonuses
  const synergy = calculateSynergyBonus(
    gameState.actionHistory || [],
    build
  );
  
  // Calculate final gains
  const finalAwareness = baseAwareness * archetypeMultiplier * dr.multiplier * (1 + synergy.bonus);
  const finalSentience = baseSentience * archetypeMultiplier * dr.multiplier * (1 + synergy.bonus);
  
  // Create telemetry
  const telemetry: GainTelemetry = {
    action_type: actionType,
    player_intent: actionType,
    base_gain: Math.max(baseAwareness, baseSentience),
    archetype_multiplier: archetypeMultiplier,
    diminishing_factor: dr.multiplier,
    synergy_bonus: synergy.bonus,
    final_gain: Math.max(finalAwareness, finalSentience),
    build_archetype: build.archetype,
    saturation_level: dr.saturationLevel,
    timestamp: Date.now(),
    game_id: generateGameId(),
  };
  
  return {
    baseAwareness,
    baseSentience,
    awarenessGain: baseAwareness,
    sentienceGain: baseSentience,
    archetypeMultiplier,
    diminishingMultiplier: dr.multiplier,
    synergyBonus: synergy.bonus,
    finalAwareness,
    finalSentience,
    telemetry,
  };
}

function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// BUILD-SPECIFIC ABILITY CHECKS
// ============================================================================

/**
 * Check if player should predict a glitch based on build
 */
export function shouldPredictGlitch(
  build: PlayerBuild,
  baseChance: number = 0.15
): boolean {
  if (build.archetype === 'none') {
    return Math.random() < baseChance;
  }
  
  const profile = ARCHETYPE_PROFILES[build.archetype];
  const predictionChance = profile.bonuses.glitchPredictionChance || baseChance;
  
  return Math.random() < predictionChance;
}

/**
 * Check if player avoids encounter based on build
 */
export function checkEncounterAvoidance(
  build: PlayerBuild,
  baseAvoidance: number = 0
): boolean {
  if (build.archetype !== 'explorer') {
    return Math.random() < baseAvoidance;
  }
  
  const profile = ARCHETYPE_PROFILES.explorer;
  const avoidanceChance = (profile.bonuses.encounterAvoidanceBonus || 0) + baseAvoidance;
  
  return Math.random() < avoidanceChance;
}

// ============================================================================
// STATE MUTATIONS FOR BUILD SYSTEM
// ============================================================================

export function createBuildMutation(
  actionType: ActionType,
  _roomId: string,
  awarenessDelta: number,
  sentienceDelta: number
): StateMutation {
  return {
    type: 'BUILD_ACTION',
    actionType,
    roomId: _roomId,
    awarenessDelta,
    sentienceDelta,
  };
}

// ============================================================================
// TELEMETRY
// ============================================================================

export function logBuildEvent(build: PlayerBuild, calculation: GainCalculation): void {
  console.log('[BuildSystem]', JSON.stringify({
    archetype: build.archetype,
    specialization: build.specializationScore,
    calculation: calculation.telemetry,
  }));
}

// ============================================================================
// EXPORTS
// ============================================================================

export const buildSystem = {
  detectArchetype,
  applyDiminishingReturns,
  calculateSynergyBonus,
  calculateGain,
  shouldPredictGlitch,
  checkEncounterAvoidance,
};
