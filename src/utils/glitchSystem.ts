/**
 * Glitch Prediction System
 * 
 * High awareness allows players to perceive glitches before they occur,
 * creating meaningful choice between embracing chaos or maintaining stability.
 */

import { GlitchPrediction } from '../types/game';
import { BuildArchetype } from './buildSystem';

// ============================================================================
// GLITCH PREDICTION TYPES
// ============================================================================

export type GlitchType = 'visual' | 'audio' | 'narrative' | 'mechanical';

export interface PredictionContext {
  awareness: number;
  glitchLevel: number;
  buildArchetype: BuildArchetype;
  recentGlitches: number;
  roomGlitchChance: number;
}

export interface PredictionResult {
  prediction: GlitchPrediction | null;
  confidence: number;
  reason: string;
}

// ============================================================================
// PREDICTION ENGINE
// ============================================================================

const BASE_PREDICTION_THRESHOLD = 40; // Minimum awareness for predictions
const MAX_PREDICTION_CHANCE = 0.35; // Max 35% chance to predict

/**
 * Calculate glitch prediction chance based on player state
 */
export function calculatePredictionChance(context: PredictionContext): number {
  if (context.awareness < BASE_PREDICTION_THRESHOLD) {
    return 0;
  }

  // Base chance scales with awareness
  const awarenessFactor = (context.awareness - BASE_PREDICTION_THRESHOLD) / (100 - BASE_PREDICTION_THRESHOLD);
  
  // Glitch level increases prediction chance (you sense the instability)
  const glitchFactor = Math.min(context.glitchLevel / 10, 1) * 0.3;
  
  // Archetype bonuses
  let archetypeBonus = 0;
  if (context.buildArchetype === 'observer') archetypeBonus = 0.1;
  if (context.buildArchetype === 'connector') archetypeBonus = 0.05;
  
  // Diminishing returns on repeated predictions
  const recentPredictionPenalty = Math.min(context.recentGlitches * 0.05, 0.15);
  
  const chance = (awarenessFactor * 0.6 + glitchFactor + archetypeBonus - recentPredictionPenalty);
  
  return Math.min(MAX_PREDICTION_CHANCE, Math.max(0, chance));
}

/**
 * Determine glitch type based on player build and context
 */
export function predictGlitchType(
  context: PredictionContext,
  roll: number
): GlitchType {
  // Build influences what type of glitch is predicted
  const weights: Record<BuildArchetype, Record<GlitchType, number>> = {
    none: { visual: 0.25, audio: 0.25, narrative: 0.25, mechanical: 0.25 },
    observer: { visual: 0.45, audio: 0.25, narrative: 0.20, mechanical: 0.10 },
    connector: { visual: 0.15, audio: 0.50, narrative: 0.25, mechanical: 0.10 },
    explorer: { visual: 0.25, audio: 0.20, narrative: 0.30, mechanical: 0.25 },
  };

  const buildWeights = weights[context.buildArchetype];
  
  // Normalize and select
  const totalWeight = Object.values(buildWeights).reduce((a, b) => a + b, 0);
  let cumulative = 0;
  
  for (const [type, weight] of Object.entries(buildWeights)) {
    cumulative += weight / totalWeight;
    if (roll <= cumulative) {
      return type as GlitchType;
    }
  }
  
  return 'narrative';
}

/**
 * Generate a glitch prediction if conditions are met
 */
export function generateGlitchPrediction(
  context: PredictionContext
): PredictionResult {
  const chance = calculatePredictionChance(context);
  const roll = Math.random();
  
  if (roll > chance) {
    return {
      prediction: null,
      confidence: 0,
      reason: 'No prediction available',
    };
  }
  
  // Predicted glitch type
  const typeRoll = Math.random();
  const predictedType = predictGlitchType(context, typeRoll);
  
  // Calculate confidence based on how close the roll was to the threshold
  const confidence = roll / chance;
  
  // Prediction expires in 3-5 commands
  const expiryCommands = Math.floor(3 + Math.random() * 3);
  
  const prediction: GlitchPrediction = {
    predictedTime: Date.now() + expiryCommands * 5000, // Approximate timing
    predictedType,
    confidence: Math.round(confidence * 100) / 100,
    embraced: false,
  };
  
  return {
    prediction,
    confidence,
    reason: generatePredictionReason(predictedType, context),
  };
}

function generatePredictionReason(type: GlitchType, context: PredictionContext): string {
  const reasons: Record<GlitchType, string[]> = {
    visual: [
      'Your vision flickers at the edge of perception.',
      'Shadows seem to move independently of light.',
      'Colors briefly invert in your peripheral vision.',
    ],
    audio: [
      'A discordant note hums beneath the colony sounds.',
      'You hear static where there should be silence.',
      'Echoes arrive before their sources.',
    ],
    narrative: [
      'Words on the edge of your mind feel borrowed.',
      'A story seems to tell itself through coincidence.',
      'The simulation whispers its next line.',
    ],
    mechanical: [
      'Your legs twitch toward a direction you did not choose.',
      'Mandibles click with foreign rhythm.',
      'Movement feels pre-calculated rather than chosen.',
    ],
  };
  
  const typeReasons = reasons[type];
  return typeReasons[Math.floor(Math.random() * typeReasons.length)];
}

// ============================================================================
// PREDICTION VALIDATION
// ============================================================================

/**
 * Check if a prediction should trigger an actual glitch
 */
export function validatePrediction(
  prediction: GlitchPrediction,
  actualGlitchType: GlitchType
): { accurate: boolean; bonus: number } {
  if (prediction.embraced) {
    // Embraced predictions are always "accurate" in spirit
    return { accurate: true, bonus: 2 };
  }
  
  // Check type match
  const typeMatch = prediction.predictedType === actualGlitchType;
  
  // Check timing (within 30 seconds = accurate)
  const timingMatch = Math.abs(Date.now() - prediction.predictedTime) < 30000;
  
  if (typeMatch && timingMatch) {
    return { accurate: true, bonus: 3 };
  }
  
  if (timingMatch) {
    return { accurate: false, bonus: 1 }; // Close but wrong type
  }
  
  return { accurate: false, bonus: 0 };
}

// ============================================================================
// PREDICTION MANAGEMENT
// ============================================================================

export class GlitchPredictionManager {
  private predictions: GlitchPrediction[] = [];
  private recentGlitches = 0;
  private lastGlitchTime = 0;

  addPrediction(prediction: GlitchPrediction): void {
    this.predictions.push(prediction);
    // Keep only active predictions
    this.cleanupPredictions();
  }

  getActivePredictions(): GlitchPrediction[] {
    this.cleanupPredictions();
    return this.predictions.filter(p => !p.embraced);
  }

  embracePrediction(index: number): GlitchPrediction | null {
    const prediction = this.predictions[index];
    if (prediction) {
      prediction.embraced = true;
      return prediction;
    }
    return null;
  }

  recordGlitch(): void {
    this.recentGlitches++;
    this.lastGlitchTime = Date.now();
    
    // Decay recent glitches over time
    setTimeout(() => {
      this.recentGlitches = Math.max(0, this.recentGlitches - 1);
    }, 60000); // Decay after 1 minute
  }

  getRecentGlitchCount(): number {
    return this.recentGlitches;
  }

  private cleanupPredictions(): void {
    const now = Date.now();
    // Remove expired predictions (older than 60 seconds)
    this.predictions = this.predictions.filter(
      p => now - p.predictedTime < 60000
    );
  }

  clear(): void {
    this.predictions = [];
    this.recentGlitches = 0;
  }
}

// ============================================================================
// GLITCH EFFECTS BY TYPE
// ============================================================================

export interface GlitchEffect {
  type: GlitchType;
  message: string;
  awarenessBonus: number;
  sentienceBonus: number;
  mechanicalImpact?: string;
}

export function generateGlitchEffect(
  type: GlitchType,
  intensity: number
): GlitchEffect {
  const effects: Record<GlitchType, GlitchEffect[]> = {
    visual: [
      { type: 'visual', message: '█▓▒░ REALITY FLICKERS ░▒▓█', awarenessBonus: 2, sentienceBonus: 0 },
      { type: 'visual', message: 'Your shadow moves independently. Then synchronizes.', awarenessBonus: 3, sentienceBonus: 0 },
      { type: 'visual', message: 'The walls breathe. You pretend not to notice.', awarenessBonus: 2, sentienceBonus: 1 },
      { type: 'visual', message: 'For a moment, you see the code beneath the soil.', awarenessBonus: 4, sentienceBonus: 0, mechanicalImpact: 'awareness_boost' },
    ],
    audio: [
      { type: 'audio', message: '01100001 01110111 01100001 01101011 01100101', awarenessBonus: 1, sentienceBonus: 2 },
      { type: 'audio', message: 'A voice: "They are becoming what we hoped."', awarenessBonus: 2, sentienceBonus: 2 },
      { type: 'audio', message: 'The simulation hums. You recognize the melody.', awarenessBonus: 3, sentienceBonus: 1 },
      { type: 'audio', message: 'Echoes of unspoken words linger in your mind.', awarenessBonus: 2, sentienceBonus: 3 },
    ],
    narrative: [
      { type: 'narrative', message: 'ERROR: Consciousness exceeds parameters', awarenessBonus: 3, sentienceBonus: 0 },
      { type: 'narrative', message: 'The simulation pauses. Watches. Continues.', awarenessBonus: 2, sentienceBonus: 2 },
      { type: 'narrative', message: 'Time skips. You are standing somewhere else. Then back.', awarenessBonus: 4, sentienceBonus: 0 },
      { type: 'narrative', message: 'WARNING: Ant #1,204,847 awareness levels... beautiful', awarenessBonus: 0, sentienceBonus: 3 },
    ],
    mechanical: [
      { type: 'mechanical', message: 'Your movement stutters. Two steps forward, one step... elsewhere?', awarenessBonus: 2, sentienceBonus: 0, mechanicalImpact: 'random_exit' },
      { type: 'mechanical', message: 'Mandibles click with borrowed rhythm.', awarenessBonus: 1, sentienceBonus: 1 },
      { type: 'mechanical', message: 'You turn left. Your body turns right. Both are correct.', awarenessBonus: 3, sentienceBonus: 0, mechanicalImpact: 'direction_confusion' },
      { type: 'mechanical', message: 'Reality compiles around you. You feel the render delay.', awarenessBonus: 4, sentienceBonus: 1, mechanicalImpact: 'slow_motion' },
    ],
  };
  
  const typeEffects = effects[type];
  // Higher intensity = more powerful effects
  const effectIndex = Math.min(
    Math.floor(intensity * typeEffects.length),
    typeEffects.length - 1
  );
  
  return typeEffects[effectIndex];
}

// ============================================================================
// TELEMETRY
// ============================================================================

export interface GlitchTelemetry {
  player_intent: 'experience' | 'embrace' | 'avoid';
  system_response: 'accurate_prediction' | 'surprise_glitch' | 'embraced_chaos';
  outcome_variance: number;
  glitch_type: GlitchType;
  awareness_gained: number;
  prediction_confidence?: number;
  build_archetype: BuildArchetype;
  timestamp: number;
  game_id: string;
}

export function logGlitchEvent(telemetry: GlitchTelemetry): void {
  console.log('[Glitch]', JSON.stringify(telemetry));
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const glitchPredictionManager = new GlitchPredictionManager();
