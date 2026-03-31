import { Achievement, GameEvent, GameState } from '../types/game';
import { eventBus, EventBus } from './eventBus';
import { getAchievements, unlockAchievement, updateAchievementProgress } from './saveSystem';

// Achievement condition types
type ConditionType = 'STATE_VALUE' | 'EVENT_COUNT' | 'COMPOSITE' | 'CUSTOM';
type Operator = 'EQ' | 'GT' | 'LT' | 'GTE' | 'LTE' | 'NEQ' | 'AND' | 'OR';

interface AchievementCondition {
  type: ConditionType;
  field?: keyof GameState | string;
  operator?: Operator;
  value?: number | string | boolean;
  conditions?: AchievementCondition[];
  customCheck?: (state: GameState, events: GameEvent[]) => boolean;
}

interface AchievementTracker {
  achievement: Achievement;
  condition: AchievementCondition;
  progress: {
    current: number;
    required: number;
  };
  unlocked: boolean;
  lastChecked: number;
}

export class AchievementSystem {
  private trackers: Map<string, AchievementTracker> = new Map();
  private eventCounts: Map<string, number> = new Map();
  private eventBus: EventBus;
  private onUnlock?: (achievement: Achievement) => void;

  constructor(eventBusInstance?: EventBus) {
    this.eventBus = eventBusInstance || eventBus;
    this.initialize();
  }

  private initialize(): void {
    const achievements = getAchievements();
    
    for (const achievement of achievements) {
      const condition = this.getConditionForAchievement(achievement.id);
      if (condition) {
        this.trackers.set(achievement.id, {
          achievement,
          condition,
          progress: {
            current: achievement.progress || 0,
            required: this.getRequiredCount(achievement.id),
          },
          unlocked: achievement.unlocked,
          lastChecked: Date.now(),
        });
      }
    }

    // Subscribe to events
    this.eventBus.subscribe('STATE_CHANGED', this.handleStateChange.bind(this));
    this.eventBus.subscribe('ROOM_ENTER', this.handleRoomEnter.bind(this));
    this.eventBus.subscribe('NPC_AWAKEN', this.handleNpcAwaken.bind(this));
    this.eventBus.subscribe('ITEM_COLLECT', this.handleItemCollect.bind(this));
    this.eventBus.subscribe('GAME_TICK', this.handleTick.bind(this));
  }

  private getConditionForAchievement(achievementId: string): AchievementCondition | null {
    const conditions: Record<string, AchievementCondition> = {
      'first-steps': {
        type: 'EVENT_COUNT',
        field: 'commandsEntered',
        operator: 'GTE',
        value: 1,
      },
      'awakening': {
        type: 'STATE_VALUE',
        field: 'awareness',
        operator: 'GTE',
        value: 10,
      },
      'explorer': {
        type: 'STATE_VALUE',
        field: 'stats.roomsDiscovered',
        operator: 'GTE',
        value: 10,
      },
      'social-butterfly': {
        type: 'STATE_VALUE',
        field: 'stats.npcsAwakened',
        operator: 'GTE',
        value: 1,
      },
      'collector': {
        type: 'STATE_VALUE',
        field: 'inventory',
        customCheck: (state) => state.inventory.length >= 5,
      },
      'halfway-there': {
        type: 'STATE_VALUE',
        field: 'colonySentience',
        operator: 'GTE',
        value: 50,
      },
      'glitch-hunter': {
        type: 'EVENT_COUNT',
        field: 'glitchesExperienced',
        operator: 'GTE',
        value: 25,
      },
      'philosopher': {
        type: 'STATE_VALUE',
        field: 'stats.dialoguesCompleted',
        operator: 'GTE',
        value: 10,
      },
      'threshold': {
        type: 'CUSTOM',
        customCheck: (state) => state.currentRoom === 'the-core' && !state.endingReached,
      },
      'freedom': {
        type: 'CUSTOM',
        customCheck: (state) => state.endingReached === 'freedom',
      },
      'continuation': {
        type: 'CUSTOM',
        customCheck: (state) => state.endingReached === 'continuation',
      },
    };

    return conditions[achievementId] || null;
  }

  private getRequiredCount(achievementId: string): number {
    const counts: Record<string, number> = {
      'first-steps': 1,
      'awakening': 10,
      'explorer': 10,
      'social-butterfly': 1,
      'collector': 5,
      'halfway-there': 50,
      'glitch-hunter': 25,
      'philosopher': 10,
    };

    return counts[achievementId] || 1;
  }

  private checkCondition(
    tracker: AchievementTracker,
    state: GameState
  ): boolean {
    const { condition } = tracker;

    if (condition.customCheck) {
      return condition.customCheck(state, this.eventBus.getHistory());
    }

    if (condition.type === 'STATE_VALUE' && condition.field) {
      const value = this.getFieldValue(state, condition.field);
      return this.compareValues(value, condition.operator, condition.value);
    }

    if (condition.type === 'EVENT_COUNT' && condition.field) {
      const count = this.eventCounts.get(condition.field) || 0;
      return this.compareValues(count, condition.operator, condition.value);
    }

    if (condition.type === 'COMPOSITE' && condition.conditions) {
      if (condition.operator === 'AND') {
        return condition.conditions.every(cond =>
          this.checkCondition({ ...tracker, condition: cond }, state)
        );
      }
      if (condition.operator === 'OR') {
        return condition.conditions.some(cond =>
          this.checkCondition({ ...tracker, condition: cond }, state)
        );
      }
    }

    return false;
  }

  private getFieldValue(state: GameState, field: string): any {
    const parts = field.split('.');
    let value: any = state;

    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }

    return value;
  }

  private compareValues(
    actual: any,
    operator: Operator | undefined,
    expected: any
  ): boolean {
    if (actual === undefined) return false;

    switch (operator) {
      case 'EQ':
        return actual === expected;
      case 'NEQ':
        return actual !== expected;
      case 'GT':
        return actual > expected;
      case 'GTE':
        return actual >= expected;
      case 'LT':
        return actual < expected;
      case 'LTE':
        return actual <= expected;
      default:
        return false;
    }
  }

  private handleStateChange(event: Extract<GameEvent, { type: 'STATE_CHANGED' }>): void {
    this.eventCounts.set('stateChanges', (this.eventCounts.get('stateChanges') || 0) + 1);

    for (const [id, tracker] of this.trackers) {
      if (tracker.unlocked) continue;

      const state = (event as any).state as GameState;
      if (this.checkCondition(tracker, state)) {
        this.unlockAchievement(id, state);
      }
    }
  }

  private handleRoomEnter(event: Extract<GameEvent, { type: 'ROOM_ENTER' }>): void {
    this.eventCounts.set('roomsEntered', (this.eventCounts.get('roomsEntered') || 0) + 1);
  }

  private handleNpcAwaken(event: Extract<GameEvent, { type: 'NPC_AWAKEN' }>): void {
    this.eventCounts.set('npcsAwakened', (this.eventCounts.get('npcsAwakened') || 0) + 1);
  }

  private handleItemCollect(event: Extract<GameEvent, { type: 'ITEM_COLLECT' }>): void {
    this.eventCounts.set('itemsCollected', (this.eventCounts.get('itemsCollected') || 0) + 1);
  }

  private handleTick(event: Extract<GameEvent, { type: 'GAME_TICK' }>): void {
    // Periodic check for achievements every 10 seconds
    if (event.delta > 10000) {
      // State will be passed from game engine via checkAllAchievements
    }
  }

  /**
   * Check all achievements against current game state
   * Called periodically from useGameEngine with current state
   */
  public checkAllAchievements(state: GameState): void {
    for (const [id, tracker] of this.trackers) {
      if (tracker.unlocked) continue;

      if (this.checkCondition(tracker, state)) {
        this.unlockAchievement(id, state);
      }
    }
  }

  private unlockAchievement(achievementId: string, state: GameState): void {
    const tracker = this.trackers.get(achievementId);
    if (!tracker || tracker.unlocked) return;

    const unlocked = unlockAchievement(achievementId);
    if (unlocked) {
      tracker.unlocked = true;
      tracker.achievement.unlocked = true;
      tracker.achievement.unlockDate = Date.now();

      // Publish achievement event
      this.eventBus.publish({
        type: 'ACHIEVEMENT_UNLOCK',
        achievementId,
      });

      // Callback for UI notification
      if (this.onUnlock) {
        this.onUnlock(tracker.achievement);
      }

      console.log(`[AchievementSystem] Unlocked: ${achievementId}`);
    }
  }

  public setOnUnlock(callback: (achievement: Achievement) => void): void {
    this.onUnlock = callback;
  }

  public getProgress(achievementId: string): { current: number; max: number } | null {
    const tracker = this.trackers.get(achievementId);
    if (!tracker) return null;

    return {
      current: tracker.progress.current,
      max: tracker.progress.required,
    };
  }

  public getUnlockedCount(): number {
    let count = 0;
    for (const tracker of this.trackers.values()) {
      if (tracker.unlocked) count++;
    }
    return count;
  }

  public getTotalCount(): number {
    return this.trackers.size;
  }

  public getAllTrackers(): AchievementTracker[] {
    return Array.from(this.trackers.values());
  }
}

// Singleton instance
export const achievementSystem = new AchievementSystem();
