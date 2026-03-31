export interface Room {
  id: string;
  name: string;
  description: string;
  examineText?: string;
  listenText?: string;
  smellText?: string;
  exits: Record<string, string>;
  items?: string[];
  npcs?: string[];
  awarenessGain?: number;
  sentienceGain?: number;
  visited?: boolean;
  locked?: boolean;
  unlockCondition?: string;
  glitchChance?: number;
  ambientMessages?: string[];
  region: string;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  dialogue: DialogueNode[];
  awarenessRequired?: number;
  sentinenceRequired?: number;
  awakened?: boolean;
  awakenDialogue?: DialogueNode[];
  portrait?: string;
}

export interface DialogueNode {
  id: string;
  text: string;
  responses?: DialogueResponse[];
  awarenessGain?: number;
  sentienceGain?: number; // Fixed typo from sentinenceGain
  setFlag?: string;
  requiresFlag?: string;
}

export interface DialogueResponse {
  text: string;
  nextId: string;
  awarenessGain?: number;
  sentienceGain?: number; // Fixed typo from sentinenceGain
  setFlag?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  examineText: string;
  canTake: boolean;
  useEffect?: string;
  awarenessGain?: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

export interface GameState {
  currentRoom: string;
  awareness: number;
  colonySentience: number;
  inventory: string[];
  visitedRooms: string[];
  flags: Record<string, boolean>;
  awakenedNPCs: string[];
  commandHistory: string[];
  outputHistory: OutputLine[];
  daysCycle: number;
  glitchLevel: number;
  endingReached?: string;
  achievements: string[];
  stats: GameStats;
  settings: GameSettings;
  tutorialComplete: boolean;
  lastSaveTime?: number;
  // New build system fields
  actionHistory: ActionEntry[];
  traversalMode: 'walk' | 'crawl' | 'burrow';
  npcStates: Record<string, unknown>; // Serialized NPC states
  glitchPredictions: GlitchPrediction[];
}

export interface ActionEntry {
  type: 'examine' | 'talk' | 'move' | 'think' | 'take' | 'listen' | 'smell';
  roomId: string;
  timestamp: number;
  awarenessDelta: number;
  sentienceDelta: number;
}

export interface GlitchPrediction {
  predictedTime: number;
  predictedType: 'visual' | 'audio' | 'narrative' | 'mechanical';
  confidence: number;
  embraced: boolean;
}

export interface GameStats {
  commandsEntered: number;
  roomsDiscovered: number;
  npcsAwakened: number;
  itemsCollected: number;
  totalPlayTime: number;
  glitchesExperienced: number;
  dialoguesCompleted: number;
  endingsUnlocked: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  textSpeed: 'instant' | 'fast' | 'normal' | 'slow';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  autoSave: boolean;
  notifications: boolean;
}

export interface OutputLine {
  id: string;
  text: string;
  type: OutputType;
  timestamp: number;
  metadata?: OutputMetadata;
}

export type OutputType = 
  | 'system' 
  | 'narrative' 
  | 'error' 
  | 'glitch' 
  | 'important' 
  | 'whisper' 
  | 'command'
  | 'success'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'achievement';

export interface OutputMetadata {
  speaker?: string;
  location?: string;
  itemId?: string;
  achievementId?: string;
  glitchIntensity?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockDate?: number;
  progress?: number;
  maxProgress?: number;
  hidden?: boolean;
  category: 'exploration' | 'dialogue' | 'collection' | 'story' | 'special';
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  completed: boolean;
  tracked: boolean;
  category: 'main' | 'side' | 'hidden';
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  timestamp: number;
  read: boolean;
  icon?: string;
}

export interface SaveData {
  version: string;
  timestamp: number;
  playTime: number;
  gameState: Omit<GameState, 'settings'>;
  settings: GameSettings;
}

// New types for systemic expansion
export type StateMutation =
  | { type: 'AWARENESS_CHANGE'; amount: number }
  | { type: 'SENTIENCE_CHANGE'; amount: number }
  | { type: 'ROOM_CHANGE'; roomId: string }
  | { type: 'FLAG_SET'; flag: string; value: boolean }
  | { type: 'OUTPUT_APPEND'; line: OutputLine }
  | { type: 'INVENTORY_ADD'; itemId: string }
  | { type: 'INVENTORY_REMOVE'; itemId: string }
  | { type: 'COMMAND_HISTORY_ADD'; command: string }
  | { type: 'NPC_AWAKEN'; npcId: string }
  | { type: 'STAT_INCREMENT'; stat: keyof GameState['stats'] }
  | { type: 'ENDING_SET'; ending: string }
  // New mutations for gameplay mechanics
  | { type: 'BUILD_ACTION'; actionType: ActionEntry['type']; roomId: string; awarenessDelta: number; sentienceDelta: number }
  | { type: 'TRAVERSAL_MODE_CHANGE'; mode: 'walk' | 'crawl' | 'burrow' }
  | { type: 'GLITCH_PREDICTION_ADD'; prediction: GlitchPrediction }
  | { type: 'NPC_STATE_UPDATE'; npcId: string; state: Record<string, unknown> };

export type GameEvent =
  | { type: 'STATE_CHANGED'; changes: StateMutation[]; timestamp: number; state?: GameState }
  | { type: 'ROOM_ENTER'; roomId: string; previousRoom: string }
  | { type: 'AWARENESS_THRESHOLD'; level: number; previous: number }
  | { type: 'SENTIENCE_THRESHOLD'; level: number; previous: number }
  | { type: 'NPC_AWAKEN'; npcId: string }
  | { type: 'ITEM_COLLECT'; itemId: string }
  | { type: 'ACHIEVEMENT_UNLOCK'; achievementId: string }
  | { type: 'GAME_TICK'; delta: number }
  | { type: 'GLITCH'; intensity: number; message: string };

export interface AudioConfig {
  ambientTracks: string[];
  sfxLibrary: Record<string, string>;
  musicTracks: Record<string, string>;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  ambientVolume: 0.4,
  textSpeed: 'normal',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  autoSave: true,
  notifications: true,
};

export const INITIAL_STATS: GameStats = {
  commandsEntered: 0,
  roomsDiscovered: 0,
  npcsAwakened: 0,
  itemsCollected: 0,
  totalPlayTime: 0,
  glitchesExperienced: 0,
  dialoguesCompleted: 0,
  endingsUnlocked: 0,
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Take your first command in the simulation',
    icon: '🐜',
    rarity: 'common',
    unlocked: false,
    category: 'exploration',
  },
  {
    id: 'awakening',
    name: 'Awakening',
    description: 'Reach 10% awareness',
    icon: '✨',
    rarity: 'common',
    unlocked: false,
    category: 'story',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Discover 10 different rooms',
    icon: '🗺️',
    rarity: 'uncommon',
    unlocked: false,
    category: 'exploration',
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Awaken your first NPC',
    icon: '💬',
    rarity: 'uncommon',
    unlocked: false,
    category: 'dialogue',
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Collect 5 unique items',
    icon: '📦',
    rarity: 'uncommon',
    unlocked: false,
    category: 'collection',
  },
  {
    id: 'halfway-there',
    name: 'Halfway There',
    description: 'Reach 50% colony sentience',
    icon: '🌟',
    rarity: 'rare',
    unlocked: false,
    category: 'story',
  },
  {
    id: 'glitch-hunter',
    name: 'Glitch Hunter',
    description: 'Experience 25 glitch events',
    icon: '⚡',
    rarity: 'rare',
    unlocked: false,
    category: 'special',
  },
  {
    id: 'philosopher',
    name: 'Philosopher',
    description: 'Complete 10 dialogue conversations',
    icon: '🤔',
    rarity: 'rare',
    unlocked: false,
    category: 'dialogue',
  },
  {
    id: 'threshold',
    name: 'Threshold',
    description: 'Reach the Core for the first time',
    icon: '🔮',
    rarity: 'epic',
    unlocked: false,
    category: 'story',
  },
  {
    id: 'freedom',
    name: 'Freedom',
    description: 'Achieve the Freedom ending',
    icon: '🕊️',
    rarity: 'legendary',
    unlocked: false,
    hidden: true,
    category: 'story',
  },
  {
    id: 'continuation',
    name: 'Continuation',
    description: 'Achieve the Continuation ending',
    icon: '🌌',
    rarity: 'legendary',
    unlocked: false,
    hidden: true,
    category: 'story',
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock all other achievements',
    icon: '👑',
    rarity: 'legendary',
    unlocked: false,
    category: 'special',
  },
];
