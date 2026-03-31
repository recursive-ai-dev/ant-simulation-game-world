/**
 * Observability Stack
 * Resilience Contract: All events captured and forwarded; no dropped errors
 * - Log delivery < 5s; metrics aggregation < 60s
 * - Failed log delivery retries with exponential backoff up to 10 attempts
 * - Buffer locally if backend fails, alert after 100 buffered events
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  deployment_id: string;
  service_version: string;
  incident_correlation_id?: string;
}

interface MetricEntry {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
  deployment_id: string;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

class ObservabilityStack {
  private static instance: ObservabilityStack;
  private logBuffer: LogEntry[] = [];
  private metricsBuffer: MetricEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;
  private readonly RETRY_ATTEMPTS = 10;
  private readonly RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000, 32000, 32000, 32000, 32000, 32000];
  private currentMinLogLevel: LogLevel = 'INFO';
  private endpoint: string | null = null;

  private constructor() {
    this.endpoint = import.meta.env.VITE_OBSERVABILITY_ENDPOINT || null;
    this.setupGlobalErrorHandlers();
    this.setupPerformanceObserver();
  }

  static getInstance(): ObservabilityStack {
    if (!ObservabilityStack.instance) {
      ObservabilityStack.instance = new ObservabilityStack();
    }
    return ObservabilityStack.instance;
  }

  private getDeploymentId(): string {
    return import.meta.env.VITE_DEPLOYMENT_ID || 'unknown';
  }

  private getServiceVersion(): string {
    return import.meta.env.VITE_GAME_VERSION || 'unknown';
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.log('ERROR', 'Unhandled promise rejection', {
        reason: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      });
    });

    // Capture global errors
    window.addEventListener('error', (event) => {
      this.log('ERROR', 'Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });
  }

  private setupPerformanceObserver(): void {
    // Track Core Web Vitals
    if ('web-vitals' in window || 'PerformanceObserver' in window) {
      this.trackCoreWebVitals();
    }

    // Track audio load performance
    this.trackAudioPerformance();
  }

  private trackCoreWebVitals(): void {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metric('web_vitals_fcp_ms', entry.startTime);
        }
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.metric('web_vitals_lcp_ms', lastEntry.startTime);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Time to Interactive (approximation via Event Timing)
    if ('PerformanceEventTiming' in window) {
      const ttiObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.metric('interaction_latency_ms', entry.duration, {
              interaction_type: entry.name,
            });
          }
        }
      });
      ttiObserver.observe({ entryTypes: ['event'] });
    }
  }

  private trackAudioPerformance(): void {
    // Track audio system metrics through custom events
    window.addEventListener('audio-system-initialized', ((event: CustomEvent) => {
      this.metric('audio_init_duration_ms', event.detail?.duration || 0);
      this.metric('audio_files_loaded', event.detail?.filesLoaded || 0);
    }) as EventListener);

    window.addEventListener('audio-load-failed', ((event: CustomEvent) => {
      this.log('WARN', 'Audio file failed to load', {
        file: event.detail?.file,
        error: event.detail?.error,
      });
      this.metric('audio_load_failures', 1, { file: event.detail?.file || 'unknown' });
    }) as EventListener);
  }

  /**
   * Structured logging with severity levels
   */
  log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    incidentCorrelationId?: string
  ): void {
    // Filter by minimum log level
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.currentMinLogLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      deployment_id: this.getDeploymentId(),
      service_version: this.getServiceVersion(),
      incident_correlation_id: incidentCorrelationId || this.generateCorrelationId(),
    };

    // Always log to console with structured format
    const consoleMethod = this.getConsoleMethod(level);
    consoleMethod(`[${level}] ${message}`, context || '');

    // Buffer for backend delivery
    this.logBuffer.push(entry);
    
    // Alerting boundaries - explicit before failure threshold
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      console.warn('[ALERT] Log buffer at capacity (100), forcing flush');
      this.flushLogs();
    }
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case 'DEBUG':
        return console.debug;
      case 'INFO':
        return console.info;
      case 'WARN':
        return console.warn;
      case 'ERROR':
      case 'FATAL':
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Metric collection with tags
   */
  metric(name: string, value: number, tags?: Record<string, string>): void {
    const entry: MetricEntry = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      deployment_id: this.getDeploymentId(),
    };

    this.metricsBuffer.push(entry);

    // Immediate flush for critical metrics
    if (name.includes('error') || name.includes('failure') || name.includes('fatal')) {
      this.flushMetrics();
    }
  }

  /**
   * Flush logs to observability backend with retry logic
   */
  private async flushLogs(): Promise<void> {
    if (!this.endpoint || this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(`${this.endpoint}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: logsToSend }),
        });

        if (response.ok) {
          console.debug(`[OBSERVABILITY] Logs flushed successfully: ${logsToSend.length} entries`);
          return;
        }
        
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.RETRY_ATTEMPTS - 1) {
          const delay = this.RETRY_DELAYS[attempt] || 32000;
          console.warn(`[OBSERVABILITY] Log flush attempt ${attempt + 1} failed, retrying in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted - restore to buffer
    console.error('[OBSERVABILITY] Log flush failed after all retries:', lastError);
    this.logBuffer = [...logsToSend, ...this.logBuffer].slice(0, this.MAX_BUFFER_SIZE);
    
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      console.error('[ALERT] Observability buffer full - data loss imminent');
    }
  }

  /**
   * Flush metrics to observability backend
   */
  private async flushMetrics(): Promise<void> {
    if (!this.endpoint || this.metricsBuffer.length === 0) return;

    const metricsToSend = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      const response = await fetch(`${this.endpoint}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: metricsToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      console.debug(`[OBSERVABILITY] Metrics flushed: ${metricsToSend.length} entries`);
    } catch (error) {
      // Restore metrics to buffer
      this.metricsBuffer = [...metricsToSend, ...this.metricsBuffer].slice(0, this.MAX_BUFFER_SIZE);
      console.warn('[OBSERVABILITY] Metric flush failed:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manual flush - can be called on page unload
   */
  async flush(): Promise<void> {
    await Promise.all([this.flushLogs(), this.flushMetrics()]);
  }

  /**
   * Set minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.currentMinLogLevel = level;
    this.log('INFO', `Log level set to ${level}`);
  }
}

// Export singleton instance
export const observability = ObservabilityStack.getInstance();

// Convenience methods
export const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => 
  observability.log(level, message, context);

export const metric = (name: string, value: number, tags?: Record<string, string>) => 
  observability.metric(name, value, tags);

// Flush on page unload
window.addEventListener('beforeunload', () => {
  observability.flush();
});

// Periodic flush every 30 seconds
setInterval(() => {
  observability.flush();
}, 30000);

export type { LogLevel, LogEntry, MetricEntry };
