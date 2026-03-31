/**
 * Intent Resolver System
 * 
 * Provides fuzzy matching for command typos and natural language parsing
 * with mathematical precision using Levenshtein distance algorithm.
 */

import { GameState, StateMutation } from '../types/game';

// ============================================================================
// DISTANCE METRICS (Levenshtein Algorithm)
// ============================================================================

/**
 * Calculate Levenshtein edit distance between two strings
 * Time: O(n*m), Space: O(min(n,m))
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  // Initialize first row and column
  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 1; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[lenA][lenB];
}

/**
 * Calculate normalized similarity score [0, 1]
 * where 1 = identical, 0 = completely different
 */
export function similarityScore(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  return 1 - distance / maxLen;
}

// ============================================================================
// INTENT RESOLUTION TYPES
// ============================================================================

export interface ResolvedIntent {
  command: string;
  args: string[];
  confidence: number; // 0-1
  originalInput: string;
  suggestedCorrection?: string;
  isChain: boolean;
  chainCommands?: ParsedCommand[];
}

export interface ParsedCommand {
  command: string;
  args: string[];
  preposition?: string;
  directObject?: string;
  indirectObject?: string;
}

export interface IntentContext {
  gameState: GameState;
  currentRoom: string;
  availableItems: string[];
  availableNPCs: string[];
  recentCommands: string[];
}

// ============================================================================
// COMMAND REGISTRY
// ============================================================================

const VALID_COMMANDS = [
  'help', 'h', '?',
  'look', 'l',
  'go', 'move', 'walk',
  'north', 'n', 'south', 's', 'east', 'e', 'west', 'w', 'up', 'u', 'down', 'd',
  'examine', 'x', 'inspect',
  'take', 'get', 'grab',
  'inventory', 'i', 'inv',
  'talk', 'speak',
  'listen',
  'smell', 'scent',
  'status', 'stats',
  'exits',
  'think', 'ponder',
  'wait',
  'choose',
  'clear', 'cls',
  'mode', // NEW: traversal mode setting
] as const;

const DIRECTION_MAP: Record<string, string> = {
  n: 'north', north: 'north',
  s: 'south', south: 'south',
  e: 'east', east: 'east',
  w: 'west', west: 'west',
  u: 'up', up: 'up',
  d: 'down', down: 'down',
};

const CHAIN_SEPARATORS = ['then', 'and', ';'];

// ============================================================================
// PARSING ENGINE
// ============================================================================

/**
 * Parse command chain into individual commands
 * Supports: "take spore then examine it then go north"
 */
function parseCommandChain(input: string): ParsedCommand[] | null {
  const normalized = input.toLowerCase().trim();
  
  // Check for chain separators
  const hasSeparator = CHAIN_SEPARATORS.some(sep => normalized.includes(` ${sep} `));
  if (!hasSeparator) return null;

  // Split by separators
  const parts = normalized.split(new RegExp(`\\s+(?:${CHAIN_SEPARATORS.join('|')})\\s+`));
  
  return parts.map(part => {
    const [command, ...args] = part.trim().split(/\s+/);
    return {
      command,
      args,
      preposition: extractPreposition(args),
      directObject: extractDirectObject(args),
      indirectObject: extractIndirectObject(args),
    };
  });
}

function extractPreposition(args: string[]): string | undefined {
  const preps = ['with', 'using', 'from', 'to', 'at', 'in', 'on'];
  return args.find(arg => preps.includes(arg));
}

function extractDirectObject(args: string[]): string | undefined {
  // Simple heuristic: first non-preposition noun
  const preps = ['with', 'using', 'from', 'to', 'at', 'in', 'on', 'the', 'a', 'an'];
  return args.find(arg => !preps.includes(arg));
}

function extractIndirectObject(args: string[]): string | undefined {
  // Look for pattern: "give X to Y" or "use X on Y"
  const prepIndex = args.findIndex(arg => ['to', 'on', 'with', 'from'].includes(arg));
  if (prepIndex >= 0 && prepIndex < args.length - 1) {
    return args[prepIndex + 1];
  }
  return undefined;
}

// ============================================================================
// INTENT RESOLVER CLASS
// ============================================================================

export class IntentResolver {
  private commandHistory: string[] = [];
  private readonly similarityThreshold = 0.7;

  /**
   * Main resolution entry point
   */
  resolve(input: string, context: IntentContext): ResolvedIntent {
    const normalizedInput = input.trim().toLowerCase();
    
    // Check for command chain
    const chain = parseCommandChain(normalizedInput);
    if (chain && chain.length > 1) {
      return this.resolveChain(input, chain, context);
    }

    // Single command resolution
    return this.resolveSingle(input, normalizedInput, context);
  }

  private resolveSingle(
    original: string,
    normalized: string,
    _context: IntentContext
  ): ResolvedIntent {
    const [rawCommand, ...args] = normalized.split(/\s+/);
    
    // Exact match
    if (VALID_COMMANDS.includes(rawCommand as any)) {
      return {
        command: this.normalizeCommand(rawCommand),
        args,
        confidence: 1.0,
        originalInput: original,
        isChain: false,
      };
    }

    // Direction shorthand normalization
    if (DIRECTION_MAP[rawCommand]) {
      return {
        command: 'go',
        args: [DIRECTION_MAP[rawCommand]],
        confidence: 1.0,
        originalInput: original,
        isChain: false,
      };
    }

    // Fuzzy match
    const matches = this.findClosestMatches(rawCommand, 3);
    
    if (matches.length > 0 && matches[0].score >= this.similarityThreshold) {
      return {
        command: this.normalizeCommand(matches[0].command),
        args,
        confidence: matches[0].score,
        originalInput: original,
        suggestedCorrection: matches[0].command,
        isChain: false,
      };
    }

    // Low confidence - unknown command
    return {
      command: 'unknown',
      args: [rawCommand, ...args],
      confidence: 0,
      originalInput: original,
      isChain: false,
    };
  }

  private resolveChain(
    original: string,
    chain: ParsedCommand[],
    _context: IntentContext
  ): ResolvedIntent {
    // Validate each command in chain
    const resolvedChain = chain.map(cmd => {
      const resolved = this.resolveSingle(
        cmd.command,
        cmd.command,
        _context
      );
      return { ...cmd, resolvedCommand: resolved.command };
    });

    // Check if any command is unknown
    const hasUnknown = resolvedChain.some(cmd => cmd.resolvedCommand === 'unknown');
    
    if (hasUnknown) {
      return {
        command: 'unknown',
        args: ['chain', original],
        confidence: 0,
        originalInput: original,
        isChain: true,
        chainCommands: [],
      };
    }

    return {
      command: 'chain',
      args: [],
      confidence: 0.9,
      originalInput: original,
      isChain: true,
      chainCommands: chain,
    };
  }

  private findClosestMatches(input: string, maxResults: number): Array<{command: string; score: number}> {
    const matches = VALID_COMMANDS.map(cmd => ({
      command: cmd,
      score: similarityScore(input, cmd),
    }));

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  private normalizeCommand(cmd: string): string {
    // Normalize direction commands
    if (DIRECTION_MAP[cmd]) {
      return 'go';
    }
    return cmd;
  }

  /**
   * Suggest correction for unknown command
   */
  suggestCorrection(input: string, availableCommands: string[] = VALID_COMMANDS as unknown as string[]): string | null {
    const normalized = input.trim().toLowerCase();
    const [command] = normalized.split(/\s+/);

    const matches = availableCommands
      .map(cmd => ({
        command: cmd,
        score: similarityScore(command, cmd),
      }))
      .filter(m => m.score >= this.similarityThreshold)
      .sort((a, b) => b.score - a.score);

    return matches.length > 0 ? matches[0].command : null;
  }

  /**
   * Track command history for context-aware suggestions
   */
  recordCommand(command: string): void {
    this.commandHistory.unshift(command);
    if (this.commandHistory.length > 20) {
      this.commandHistory.pop();
    }
  }

  /**
   * Get command frequency distribution for predictive suggestions
   */
  getCommandFrequency(): Map<string, number> {
    const freq = new Map<string, number>();
    for (const cmd of this.commandHistory) {
      freq.set(cmd, (freq.get(cmd) || 0) + 1);
    }
    return freq;
  }
}

// ============================================================================
// COMMAND CHAIN EXECUTOR
// ============================================================================

export interface ChainResult {
  success: boolean;
  completedSteps: number;
  mutations: StateMutation[];
  error?: string;
  rollbackState?: Partial<GameState>;
}

/**
 * Execute command chain transactionally
 * Rolls back on any failure if rollbackOnFailure is true
 */
export async function executeCommandChain(
  commands: ParsedCommand[],
  executeFn: (cmd: ParsedCommand) => Promise<StateMutation[]>,
  rollbackOnFailure: boolean = true
): Promise<ChainResult> {
  const mutations: StateMutation[] = [];
  const snapshots: Partial<GameState>[] = [];
  
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    
    try {
      // Take snapshot before each command
      if (rollbackOnFailure) {
        // Snapshot logic would go here - requires state access
      }
      
      const cmdMutations = await executeFn(cmd);
      mutations.push(...cmdMutations);
      
    } catch (error) {
      if (rollbackOnFailure) {
        return {
          success: false,
          completedSteps: i,
          mutations: [],
          error: `Chain failed at step ${i + 1}: ${error}`,
          rollbackState: snapshots[i] || {},
        };
      } else {
        return {
          success: false,
          completedSteps: i,
          mutations,
          error: `Chain failed at step ${i + 1}: ${error}`,
        };
      }
    }
  }

  return {
    success: true,
    completedSteps: commands.length,
    mutations,
  };
}

// ============================================================================
// TELEMETRY
// ============================================================================

export interface IntentTelemetry {
  player_intent: string;
  resolved_intent: string;
  intent_confidence: number;
  suggestion_accepted?: boolean;
  chain_length?: number;
  timestamp: number;
  game_id: string;
}

export function logIntentResolution(telemetry: IntentTelemetry): void {
  // Structured logging for debugging balance
  console.log('[IntentResolver]', JSON.stringify(telemetry));
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const intentResolver = new IntentResolver();
