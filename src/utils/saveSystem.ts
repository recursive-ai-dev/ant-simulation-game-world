import { GameState, SaveData, GameSettings, Achievement, ACHIEVEMENTS } from '../types/game';
import { validateState } from '../reducers/gameReducer';
import { 
  generateHMAC, 
  verifyHMAC, 
  validateSaveSchema, 
  securityAudit,
  RateLimiter 
} from './security';

const SAVE_KEY = 'ant-sim-save-v2'; // Version bump for new format
const SETTINGS_KEY = 'ant-sim-settings-v2';
const ACHIEVEMENTS_KEY = 'ant-sim-achievements-v2';
const VERSION = '2.0.0'; // Major version bump for security upgrade

// Rate limiters for security
const saveRateLimiter = new RateLimiter(1, 1000); // 1 save per second
const loadRateLimiter = new RateLimiter(5, 1000); // 5 loads per second
const importRateLimiter = new RateLimiter(2, 60000); // 2 imports per minute

// Secure hash function using HMAC-SHA256
async function hashSave(data: unknown): Promise<string> {
  return generateHMAC(JSON.stringify(data));
}

// Legacy hash function for migration (deprecated)
function hashSaveLegacy(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Save queue for debouncing
let saveQueue: Array<{
  data: SaveData;
  resolve: (success: boolean) => void;
  timestamp: number;
}> = [];

let saveTimeout: number | null = null;
const SAVE_DEBOUNCE_MS = 1000;

// Process save queue with debouncing
function processSaveQueue(): void {
  if (saveQueue.length === 0) return;

  // Get most recent save
  const latestSave = saveQueue[saveQueue.length - 1];
  
  // Clear pending saves
  for (const pending of saveQueue.slice(0, -1)) {
    pending.resolve(false); // Cancelled
  }
  saveQueue = [latestSave];

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = window.setTimeout(async () => {
    const save = saveQueue.shift();
    if (save) {
      const success = await performSave(save.data);
      save.resolve(success);
    }
    processSaveQueue();
  }, SAVE_DEBOUNCE_MS);
}

async function performSave(saveData: SaveData): Promise<boolean> {
  try {
    // Rate limiting check
    if (!saveRateLimiter.canProceed()) {
      securityAudit.log({
        action: 'SAVE_RATE_LIMITED',
        action_result: 'blocked',
        risk_score: 30,
        metadata: { reason: 'Rate limit exceeded' }
      });
      console.warn('[SaveSystem] Save rate limited');
      return false;
    }

    // Schema validation before saving
    const schemaValidation = validateSaveSchema(saveData);
    if (!schemaValidation.valid) {
      securityAudit.log({
        action: 'SAVE_SCHEMA_INVALID',
        action_result: 'blocked',
        risk_score: 70,
        metadata: { errors: schemaValidation.errors }
      });
      console.error('[SaveSystem] Schema validation failed:', schemaValidation.errors);
      return false;
    }

    // Validate before saving
    const validation = validateState(saveData.gameState as any);
    if (!validation.valid) {
      securityAudit.log({
        action: 'SAVE_STATE_INVALID',
        action_result: 'blocked',
        risk_score: 60,
        metadata: { errors: validation.errors }
      });
      console.error('[SaveSystem] State validation failed:', validation.errors);
      return false;
    }

    // Add integrity hash using HMAC-SHA256
    const stateHash = await hashSave(saveData.gameState);
    const dataWithHash = {
      ...saveData,
      stateHash,
      savedAt: Date.now(),
      securityVersion: '2.0.0'
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(dataWithHash));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(saveData.settings));
    
    // Save achievements separately
    const achievements = getAchievements();
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    
    securityAudit.log({
      action: 'SAVE_SUCCESS',
      action_result: 'success',
      risk_score: 0,
      metadata: { hash: stateHash.slice(0, 16) + '...' }
    });
    
    console.log('[SaveSystem] Game saved successfully with HMAC');
    return true;
  } catch (error) {
    securityAudit.log({
      action: 'SAVE_ERROR',
      action_result: 'error',
      risk_score: 50,
      metadata: { error: String(error) }
    });
    console.error('[SaveSystem] Failed to save game:', error);
    return false;
  }
}

export function createSaveData(gameState: GameState, settings: GameSettings): SaveData {
  return {
    version: VERSION,
    timestamp: Date.now(),
    playTime: gameState.stats.totalPlayTime,
    gameState: {
      ...gameState,
      outputHistory: gameState.outputHistory.slice(-100), // Keep last 100 lines
      commandHistory: gameState.commandHistory.slice(-50), // Keep last 50 commands
    },
    settings,
  };
}

export function saveGame(gameState: GameState, settings: GameSettings): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const saveData = createSaveData(gameState, settings);
      saveQueue.push({
        data: saveData,
        resolve,
        timestamp: Date.now(),
      });
      processSaveQueue();
    } catch (error) {
      console.error('[SaveSystem] Failed to queue save:', error);
      resolve(false);
    }
  });
}

export async function loadGame(): Promise<{ gameState: Partial<GameState>; settings: GameSettings } | null> {
  try {
    // Rate limiting check
    if (!loadRateLimiter.canProceed()) {
      securityAudit.log({
        action: 'LOAD_RATE_LIMITED',
        action_result: 'blocked',
        risk_score: 30,
        metadata: { reason: 'Rate limit exceeded' }
      });
      console.warn('[SaveSystem] Load rate limited');
      return null;
    }

    const saveDataStr = localStorage.getItem(SAVE_KEY);
    const settingsStr = localStorage.getItem(SETTINGS_KEY);
    
    if (!saveDataStr || !settingsStr) {
      return null;
    }

    let saveData: SaveData & { stateHash?: string; securityVersion?: string };
    try {
      saveData = JSON.parse(saveDataStr);
    } catch {
      securityAudit.log({
        action: 'LOAD_PARSE_ERROR',
        action_result: 'error',
        risk_score: 60,
        metadata: { reason: 'JSON parse failed' }
      });
      return null;
    }

    // Schema validation
    const schemaValidation = validateSaveSchema(saveData);
    if (!schemaValidation.valid) {
      securityAudit.log({
        action: 'LOAD_SCHEMA_INVALID',
        action_result: 'blocked',
        risk_score: 80,
        metadata: { errors: schemaValidation.errors }
      });
      console.error('[SaveSystem] Schema validation failed:', schemaValidation.errors);
      return null;
    }

    let settings: GameSettings;
    try {
      settings = JSON.parse(settingsStr);
    } catch {
      return null;
    }

    // Validate version
    if (saveData.version !== VERSION) {
      console.warn('[SaveSystem] Save version mismatch:', saveData.version, 'vs', VERSION);
    }

    // Validate integrity hash if present (HMAC-SHA256)
    if (saveData.stateHash && saveData.securityVersion === '2.0.0') {
      const isValid = await verifyHMAC(JSON.stringify(saveData.gameState), saveData.stateHash);
      if (!isValid) {
        securityAudit.log({
          action: 'LOAD_INTEGRITY_FAILED',
          action_result: 'blocked',
          risk_score: 90,
          metadata: { reason: 'HMAC verification failed' }
        });
        console.error('[SaveSystem] Save data integrity check failed! Possible tampering detected.');
        return null;
      }
    } else if (saveData.stateHash) {
      // Legacy hash verification (weak, but allows migration)
      const computedHash = hashSaveLegacy(saveData.gameState);
      if (saveData.stateHash !== computedHash) {
        securityAudit.log({
          action: 'LOAD_LEGACY_INTEGRITY_FAILED',
          action_result: 'blocked',
          risk_score: 70,
          metadata: { reason: 'Legacy hash verification failed' }
        });
        console.error('[SaveSystem] Legacy save data integrity check failed!');
        return null;
      }
      console.warn('[SaveSystem] Loading legacy save format. Re-save to upgrade security.');
    }

    securityAudit.log({
      action: 'LOAD_SUCCESS',
      action_result: 'success',
      risk_score: 0,
      metadata: { version: saveData.securityVersion || 'legacy' }
    });

    console.log('[SaveSystem] Game loaded successfully with integrity verified');
    return {
      gameState: saveData.gameState,
      settings,
    };
  } catch (error) {
    securityAudit.log({
      action: 'LOAD_ERROR',
      action_result: 'error',
      risk_score: 50,
      metadata: { error: String(error) }
    });
    console.error('[SaveSystem] Failed to load game:', error);
    return null;
  }
}

export function deleteSave(): boolean {
  try {
    localStorage.removeItem(SAVE_KEY);
    console.log('[SaveSystem] Save deleted');
    return true;
  } catch (error) {
    console.error('[SaveSystem] Failed to delete save:', error);
    return false;
  }
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

// Settings management
export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('[SaveSystem] Failed to save settings:', error);
  }
}

export function loadSettings(): GameSettings | null {
  try {
    const settingsStr = localStorage.getItem(SETTINGS_KEY);
    if (!settingsStr) return null;
    return JSON.parse(settingsStr);
  } catch (error) {
    console.error('[SaveSystem] Failed to load settings:', error);
    return null;
  }
}

// Achievements management
export function getAchievements(): Achievement[] {
  try {
    const achievementsStr = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!achievementsStr) return ACHIEVEMENTS.map(a => ({ ...a }));
    return JSON.parse(achievementsStr);
  } catch (error) {
    console.error('[SaveSystem] Failed to load achievements:', error);
    return ACHIEVEMENTS.map(a => ({ ...a }));
  }
}

export function unlockAchievement(achievementId: string): Achievement | null {
  try {
    const achievements = getAchievements();
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement || achievement.unlocked) {
      return null;
    }

    achievement.unlocked = true;
    achievement.unlockDate = Date.now();
    
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    console.log('[SaveSystem] Achievement unlocked:', achievementId);
    
    return achievement;
  } catch (error) {
    console.error('[SaveSystem] Failed to unlock achievement:', error);
    return null;
  }
}

export function updateAchievementProgress(
  achievementId: string,
  progress: number,
  maxProgress: number
): Achievement | null {
  try {
    const achievements = getAchievements();
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement) return null;

    achievement.progress = progress;
    achievement.maxProgress = maxProgress;

    // Auto-unlock if progress is complete
    if (progress >= maxProgress && !achievement.unlocked) {
      return unlockAchievement(achievementId);
    }

    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    return achievement;
  } catch (error) {
    console.error('[SaveSystem] Failed to update achievement progress:', error);
    return null;
  }
}

export function getUnlockedAchievements(): Achievement[] {
  return getAchievements().filter(a => a.unlocked);
}

export function getAchievementProgress(): { total: number; unlocked: number } {
  const achievements = getAchievements();
  return {
    total: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
  };
}

// Stats helpers
export function getSaveTimestamp(): number | null {
  try {
    const saveDataStr = localStorage.getItem(SAVE_KEY);
    if (!saveDataStr) return null;
    const saveData: SaveData = JSON.parse(saveDataStr);
    return saveData.timestamp;
  } catch (error) {
    return null;
  }
}

export function getPlayTime(): number {
  try {
    const saveDataStr = localStorage.getItem(SAVE_KEY);
    if (!saveDataStr) return 0;
    const saveData: SaveData = JSON.parse(saveDataStr);
    return saveData.playTime;
  } catch (error) {
    return 0;
  }
}

// Storage quota management
export function getStorageQuota(): {
  used: number;
  total: number;
  percentage: number;
  available: number;
} {
  try {
    // Estimate localStorage usage (most browsers have ~5-10MB)
    const TOTAL_STORAGE = 5 * 1024 * 1024; // 5MB conservative estimate

    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        used += key.length + value.length;
      }
    }
    // Convert to bytes (approximate)
    used = used * 2; // UTF-16 encoding

    return {
      used,
      total: TOTAL_STORAGE,
      percentage: (used / TOTAL_STORAGE) * 100,
      available: TOTAL_STORAGE - used,
    };
  } catch (error) {
    console.error('[SaveSystem] Failed to calculate storage quota:', error);
    return { used: 0, total: 0, percentage: 0, available: 0 };
  }
}

export function isStorageLow(): boolean {
  const quota = getStorageQuota();
  return quota.percentage > 80;
}

export function isStorageFull(): boolean {
  const quota = getStorageQuota();
  return quota.percentage > 95;
}

// Get detailed save info for display
export function getSaveSummary(): {
  day: number;
  awareness: number;
  sentience: number;
  rooms: number;
  timestamp: string;
  size: string;
} | null {
  try {
    const saveDataStr = localStorage.getItem(SAVE_KEY);
    if (!saveDataStr) return null;

    const saveData: SaveData = JSON.parse(saveDataStr);
    const gameState = saveData.gameState;

    return {
      day: gameState.daysCycle,
      awareness: Math.floor(gameState.awareness),
      sentience: Math.floor(gameState.colonySentience),
      rooms: gameState.visitedRooms.length,
      timestamp: new Date(saveData.timestamp).toLocaleString(),
      size: formatBytes(JSON.stringify(saveData).length * 2),
    };
  } catch (error) {
    console.error('[SaveSystem] Failed to get save summary:', error);
    return null;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Export/Import for backup
export function exportSave(): string | null {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    const settings = localStorage.getItem(SETTINGS_KEY);
    const achievements = localStorage.getItem(ACHIEVEMENTS_KEY);
    
    if (!saveData) return null;
    
    return JSON.stringify({
      saveData,
      settings,
      achievements,
      exportDate: Date.now(),
    });
  } catch (error) {
    console.error('[SaveSystem] Failed to export save:', error);
    return null;
  }
}

export async function importSave(data: string): Promise<boolean> {
  try {
    // Rate limiting check
    if (!importRateLimiter.canProceed()) {
      securityAudit.log({
        action: 'IMPORT_RATE_LIMITED',
        action_result: 'blocked',
        risk_score: 40,
        metadata: { reason: 'Rate limit exceeded' }
      });
      console.warn('[SaveSystem] Import rate limited');
      return false;
    }

    // Validate input is string
    if (typeof data !== 'string') {
      securityAudit.log({
        action: 'IMPORT_INVALID_TYPE',
        action_result: 'blocked',
        risk_score: 60,
        metadata: { type: typeof data }
      });
      return false;
    }

    // Length check to prevent memory issues
    if (data.length > 10 * 1024 * 1024) { // 10MB limit
      securityAudit.log({
        action: 'IMPORT_SIZE_EXCEEDED',
        action_result: 'blocked',
        risk_score: 50,
        metadata: { size: data.length }
      });
      console.error('[SaveSystem] Import data too large');
      return false;
    }

    let imported: unknown;
    try {
      imported = JSON.parse(data);
    } catch {
      securityAudit.log({
        action: 'IMPORT_PARSE_ERROR',
        action_result: 'blocked',
        risk_score: 50,
        metadata: { reason: 'JSON parse failed' }
      });
      return false;
    }

    // Validate imported data structure
    if (typeof imported !== 'object' || imported === null) {
      securityAudit.log({
        action: 'IMPORT_INVALID_STRUCTURE',
        action_result: 'blocked',
        risk_score: 70,
        metadata: { type: typeof imported }
      });
      return false;
    }

    const importedObj = imported as Record<string, unknown>;

    // Check for required fields
    if (!importedObj.saveData || typeof importedObj.saveData !== 'string') {
      securityAudit.log({
        action: 'IMPORT_MISSING_DATA',
        action_result: 'blocked',
        risk_score: 60,
        metadata: { hasSaveData: !!importedObj.saveData }
      });
      return false;
    }

    // Schema validation on the embedded save data
    let saveData: unknown;
    try {
      saveData = JSON.parse(importedObj.saveData as string);
    } catch {
      securityAudit.log({
        action: 'IMPORT_SAVE_PARSE_ERROR',
        action_result: 'blocked',
        risk_score: 60,
        metadata: { reason: 'Embedded save data JSON parse failed' }
      });
      return false;
    }

    const schemaValidation = validateSaveSchema(saveData);
    if (!schemaValidation.valid) {
      securityAudit.log({
        action: 'IMPORT_SCHEMA_INVALID',
        action_result: 'blocked',
        risk_score: 80,
        metadata: { errors: schemaValidation.errors }
      });
      console.error('[SaveSystem] Import schema validation failed:', schemaValidation.errors);
      return false;
    }

    // Security delay to prevent brute force
    // This adds a small processing cost to slow down any automated attempts
    await new Promise(resolve => setTimeout(resolve, 100));
    
    localStorage.setItem(SAVE_KEY, importedObj.saveData as string);
    if (importedObj.settings && typeof importedObj.settings === 'string') {
      localStorage.setItem(SETTINGS_KEY, importedObj.settings);
    }
    if (importedObj.achievements && typeof importedObj.achievements === 'string') {
      localStorage.setItem(ACHIEVEMENTS_KEY, importedObj.achievements as string);
    }
    
    securityAudit.log({
      action: 'IMPORT_SUCCESS',
      action_result: 'success',
      risk_score: 10,
      metadata: { timestamp: Date.now() }
    });
    
    console.log('[SaveSystem] Save imported successfully with security validation');
    return true;
  } catch (error) {
    securityAudit.log({
      action: 'IMPORT_ERROR',
      action_result: 'error',
      risk_score: 50,
      metadata: { error: String(error) }
    });
    console.error('[SaveSystem] Failed to import save:', error);
    return false;
  }
}

// Auto-save management
let autoSaveInterval: number | null = null;
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function startAutoSave(
  gameState: GameState,
  settings: GameSettings
): void {
  stopAutoSave();
  
  if (settings.autoSave) {
    autoSaveInterval = window.setInterval(() => {
      saveGame(gameState, settings);
    }, AUTO_SAVE_INTERVAL);
  }
}

export function stopAutoSave(): void {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}
