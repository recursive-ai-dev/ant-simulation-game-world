import { GameEvent } from '../types/game';

// Type-safe event bus for decoupled game systems
type EventHandler<T extends GameEvent['type']> = (
  event: Extract<GameEvent, { type: T }>
) => void;

type Unsubscribe = () => void;

interface EventSubscription {
  eventType: string;
  handler: EventHandler<any>;
}

export class EventBus {
  private subscribers: Map<string, Set<EventHandler<any>>> = new Map();
  private eventHistory: GameEvent[] = [];
  private maxHistory = 100;

  /**
   * Subscribe to an event type
   */
  subscribe<T extends GameEvent['type']>(
    eventType: T,
    handler: EventHandler<T>
  ): Unsubscribe {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    const handlers = this.subscribers.get(eventType)!;
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscribers.delete(eventType);
      }
    };
  }

  /**
   * Publish an event to all subscribers
   */
  publish<T extends GameEvent['type']>(event: Extract<GameEvent, { type: T }>): void {
    const handlers = this.subscribers.get(event.type);
    
    if (handlers) {
      // Copy to array to prevent issues if handler modifies subscriptions
      const handlersArray = Array.from(handlers);
      for (const handler of handlersArray) {
        try {
          handler(event);
        } catch (error) {
          console.error(`[EventBus] Error in ${event.type} handler:`, error);
        }
      }
    }

    // Store in history for debugging
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventBus] Published: ${event.type}`, event);
    }
  }

  /**
   * Get recent event history (for debugging)
   */
  getHistory(limit = 10): GameEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get subscriber count for an event type
   */
  getSubscriberCount(eventType: string): number {
    return this.subscribers.get(eventType)?.size ?? 0;
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribeAll(): void {
    this.subscribers.clear();
  }

  /**
   * Subscribe to multiple event types at once
   */
  subscribeMany(
    subscriptions: Array<{
      eventType: GameEvent['type'];
      handler: EventHandler<any>;
    }>
  ): Unsubscribe {
    const unsubscribers: Unsubscribe[] = [];

    for (const sub of subscriptions) {
      unsubscribers.push(this.subscribe(sub.eventType, sub.handler));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Publish multiple events atomically (all subscribers called once)
   */
  publishBatch(events: GameEvent[]): void {
    const allHandlers = new Map<string, Set<EventHandler<any>>>();

    // Collect all handlers first
    for (const event of events) {
      const handlers = this.subscribers.get(event.type);
      if (handlers) {
        allHandlers.set(event.type, handlers);
      }
    }

    // Then publish all events
    for (const event of events) {
      this.eventHistory.push(event);
      
      const handlers = allHandlers.get(event.type);
      if (handlers) {
        const handlersArray = Array.from(handlers);
        for (const handler of handlersArray) {
          try {
            handler(event);
          } catch (error) {
            console.error(`[EventBus] Error in batch ${event.type} handler:`, error);
          }
        }
      }
    }

    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistory);
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Event type guards
export const isStateChangeEvent = (
  event: GameEvent
): event is Extract<GameEvent, { type: 'STATE_CHANGED' }> => {
  return event.type === 'STATE_CHANGED';
};

export const isThresholdEvent = (
  event: GameEvent
): event is Extract<GameEvent, { type: 'AWARENESS_THRESHOLD' | 'SENTIENCE_THRESHOLD' }> => {
  return event.type === 'AWARENESS_THRESHOLD' || event.type === 'SENTIENCE_THRESHOLD';
};

export const isAchievementEvent = (
  event: GameEvent
): event is Extract<GameEvent, { type: 'ACHIEVEMENT_UNLOCK' }> => {
  return event.type === 'ACHIEVEMENT_UNLOCK';
};
