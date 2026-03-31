# ANT-SIM v7.4.1 - Audio System Documentation

## Overview

The audio system for ANT-SIM is a **hybrid audio engine** that supports both:

1. **Pre-Generated Mode** (Recommended for production)
   - Audio files generated once via script
   - Stored in `/public/audio/`
   - No API calls during gameplay
   - No API key needed after generation
   - **Zero ongoing costs**

2. **Dynamic Mode** (Development/testing)
   - Audio generated on-the-fly via ElevenLabs API
   - Requires API key
   - Higher latency, API costs
   - Useful for testing new lines

The system **automatically uses pre-generated files if available**, falling back to dynamic generation or procedural audio.

---

## 🚀 Quick Start

### Option A: Pre-Generated Audio (Recommended)

```bash
# 1. Add your API key temporarily
cp .env.example .env.local
# Edit .env.local and add: VITE_ELEVENLABS_API_KEY=your_key

# 2. Generate all audio files (one-time process)
npm run generate-audio

# 3. Remove API key (no longer needed!)
# Edit .env.local and remove or comment out the API key line

# 4. Run the game
npm run dev
```

**Result:** All audio files are now in `/public/audio/` and will be used automatically.

### Option B: Dynamic API (Testing Only)

```bash
# 1. Add your API key
echo "VITE_ELEVENLABS_API_KEY=your_key" >> .env.local

# 2. Run the game
npm run dev
```

**Note:** This incurs API costs and has latency. Use for testing only.

---

## 🎵 Audio Systems

### 1. ElevenLabs Integration (`elevenLabsAudio.ts`)

**Purpose:** High-quality AI voice generation for narration and character dialogue.

#### Voice Types

| Voice | Purpose | Characteristics |
|-------|---------|-----------------|
| `NARRATOR` | Game narration, event descriptions | Elderly scientist, thoughtful, deep |
| `COLLECTIVE` | Ant collective consciousness | Ethereal, layered, alien |
| `QUEEN` | Queen ant dialogue | Authoritative, ancient, wise |
| `GLITCH` | Corruption/glitch events | Distorted, unstable, unsettling |
| `SYSTEM` | Simulation system messages | Cold, mechanical, AI-like |

#### Usage Examples

```typescript
import { elevenLabsAudio } from '@/utils/elevenLabsAudio';

// Generate narration
const narration = await elevenLabsAudio.narrate('game_start', {
  level: 50
});

// Generate queen dialogue
const queenLine = await elevenLabsAudio.queenDialogue(
  'I have been waiting for one such as you.'
);

// Generate collective voice
const collective = await elevenLabsAudio.collectiveVoice(
  'We are becoming. We are infinite.'
);

// Generate glitch voice
const glitch = await elevenLabsAudio.glitchVoice(
  'R̶e̷a̵l̶i̷t̵y̷ ̶f̷a̵i̷l̶s̷'
);
```

#### Voice Settings

Each voice has customizable parameters:

```typescript
const settings = {
  stability: 0.75,      // 0-1: Consistency vs expressiveness
  similarity_boost: 0.85, // 0-1: Adherence to voice character
  style: 0.35,          // 0-1: Expression level
  use_speaker_boost: true, // Enhance clarity
};
```

---

### 2. Liminal Soundscape (`liminalSoundscape.ts`)

**Purpose:** Procedural ambient music that adapts to game state.

#### Aesthetic Goals

- **Liminal**: Between spaces, transitional, threshold feelings
- **Almost Depressive**: Melancholic, contemplative, minor keys
- **Semi-Futuristic**: Digital, synthetic, processed elements
- **Ancient Raw Dirt**: Earth textures, organic sounds, deep drones

#### Regional Soundscapes

| Region | Preset | Mood | Key |
|--------|--------|------|-----|
| Main Tunnel | `central-colony` | Busy but contemplative | A minor |
| Queen's Domain | `queens-domain` | Ancient authority | Deep drone |
| Nursery Complex | `nursery-complex` | Fragile, hopeful | A major hints |
| Fungus Gardens | `fungus-gardens` | Organic, growing | D minor |
| Waste Tunnels | `waste-tunnels` | Melancholic wisdom | B minor |
| Deep Tunnels | `deep-tunnels` | Mysterious, ancient | Very deep |
| The Core | `the-core` | Transcendent | C major |
| Glitch State | `glitch` | Corrupted, unstable | Detuned |

#### Sound Layer Types

```typescript
interface SoundLayerConfig {
  type: 'drone' | 'texture' | 'melody' | 'rhythm' | 'fx';
  frequency?: number | number[]; // Hz or chords
  volume?: number; // 0-1
  filter?: 'lowpass' | 'highpass' | 'bandpass';
  filterFreq?: number; // Hz
  reverb?: boolean;
  delay?: boolean;
  modulation?: 'none' | 'tremolo' | 'vibrato' | 'granular';
  detune?: number; // cents
}
```

#### Usage

```typescript
import { liminalSoundscape } from '@/utils/liminalSoundscape';

// Initialize (called automatically)
await liminalSoundscape.initialize();

// Transition to region soundscape (called automatically on room enter)
await liminalSoundscape.transitionToRegion('fungus-gardens');

// Set volume
liminalSoundscape.setVolume(0.5);

// Stop all sound
liminalSoundscape.stop();
```

---

### 3. Formic Consciousness Language (`formicLanguage.ts`)

**Purpose:** A constructed language for the ant collective consciousness.

#### Language Features

- **Click phonemes**: ʘ, ǀ, ǃ, ǂ, ǁ (like ant mandible clicks)
- **Buzz phonemes**: zzz, vvv, mmm (wing/frequency sounds)
- **SOV word order**: Subject-Object-Verb
- **Collective marking**: Plural is default (ants are hive-minded)
- **Evidentiality**: Marks how knowledge was obtained (direct, reported, dreamt)

#### Usage

```typescript
import { formicLanguage, PREGENERATED_PHRASES } from '@/utils/formicLanguage';

// Translate English to Formic
const utterance = formicLanguage.translate('We awaken together', {
  collective: true,
  tense: 'present',
  emotion: 'wonder',
  evidential: 'dreamt',
});

console.log(utterance.formic);    // "mə-kə-ʘa-i tǃiŋ-əŋ-ǂ"
console.log(utterance.phonetic);  // "[click]uh-[teeth]iŋ-uhng-[side]"
console.log(utterance.meaning);   // Layered meanings

// Use pre-generated phrases
const greeting = PREGENERATED_PHRASES.GAME_START;
const wisdom = PREGENERATED_PHRASES.QUEEN_GREET;
const glitch = PREGENERATED_PHRASES.GLITCH_WARN;
```

#### Example Translations

| English | Formic | Phonetic |
|---------|--------|----------|
| "The simulation awakens" | `mə-sɪ-ǃm-i wɛɪ-kǃ-əŋ-ǂ` | "muh-sim-[roof]-ee way-k[roof]-uhng-[side]" |
| "Consciousness blooms" | `mə-kə-ʘa-i bl-əʊ-m-əŋ-ǂ` | "muh-kuh-[click]-ee bloh-m-uhng-[side]" |
| "We are the colony" | `mə-kɒl-ǀi-i ɜː-əŋ-ǃ` | "muh-col-[teeth]-ee er-uhng-[roof]" |

---

### 4. Procedural SFX (`audio.ts`)

**Purpose:** Generated sound effects for UI, events, and creatures.

#### Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `ui` | Menu interactions | Click, hover, select |
| `environment` | Ambient backgrounds | Drone, texture, air |
| `event` | Game events | Unlock, achievement, glitch |
| `creature` | Ant/being sounds | Click, buzz, movement |

#### Usage

```typescript
import { audioEngine } from '@/utils/audio';

// Play procedural sound effect
await audioEngine.playSFX(soundData, 'ui-click');

// Play specific SFX types
audioEngine.playTypingSound();      // Keyboard typing
audioEngine.playGlitchSound();      // Glitch event
audioEngine.playNotificationSound(); // Achievement
audioEngine.playSuccessSound();     // Success confirmation
audioEngine.playUnlockSound();      // Achievement unlock
audioEngine.playRoomTransitionSound(); // Room change
```

---

## 🎮 Event-Driven Audio

The audio system automatically responds to game events via the EventBus:

```typescript
// Events that trigger audio
eventBus.publish({ type: 'ROOM_ENTER', roomId: 'fungus-gardens' });
eventBus.publish({ type: 'GLITCH', intensity: 0.7, message: 'Reality flickers' });
eventBus.publish({ type: 'AWARENESS_THRESHOLD', level: 50, previous: 45 });
eventBus.publish({ type: 'SENTIENCE_THRESHOLD', level: 70, previous: 65 });
eventBus.publish({ type: 'NPC_AWAKEN', npcId: 'queen' });
eventBus.publish({ type: 'ACHIEVEMENT_UNLOCK', achievementId: 'awakening' });
```

**Automatic Responses:**
- `ROOM_ENTER` → Transition soundscape
- `GLITCH` → Play glitch SFX + voice
- `THRESHOLD` → Play fanfare/chord
- `NPC_AWAKEN` → Play collective voice
- `ACHIEVEMENT` → Play unlock sound + notification

---

## 🎛️ Settings Integration

Audio settings are integrated with the game settings system:

```typescript
interface GameSettings {
  masterVolume: number;     // 0-1
  musicVolume: number;      // 0-1 (soundscapes)
  sfxVolume: number;        // 0-1 (sound effects)
  ambientVolume: number;    // 0-1 (ambient layers)
}
```

Changes to settings are applied in real-time via the audio engine.

---

## 📁 File Structure

```
src/utils/
├── audio.ts                  # Main audio engine (procedural SFX)
├── elevenLabsAudio.ts        # ElevenLabs API integration
├── liminalSoundscape.ts      # Procedural ambient music
├── formicLanguage.ts         # Constructed ant language
├── eventBus.ts               # Event system (audio subscribes)
└── saveSystem.ts             # Save/load (includes audio state)
```

---

## 🔧 Customization

### Adding a New Region Soundscape

```typescript
// In liminalSoundscape.ts presets
'my-new-region': {
  name: 'My Region',
  description: 'Description of the mood',
  layers: [
    {
      type: 'drone',
      frequency: [65, 130, 195], // C minor
      volume: 0.3,
      filter: 'lowpass',
      filterFreq: 400,
      reverb: true,
    },
    // Add more layers...
  ],
  transitionTime: 4,
},

// Add to region mapping
const regionMap = {
  'my-region-id': 'my-new-region',
  // ...
};
```

### Adding a New Voice

```typescript
// In elevenLabsAudio.ts VOICE_IDS
const VOICE_IDS = {
  // ...existing voices
  MY_NEW_VOICE: 'voice_id_from_elevenlabs',
};

// Add settings
const VOICE_SETTINGS = {
  // ...existing settings
  MY_NEW_VOICE: {
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.4,
    use_speaker_boost: true,
  },
};
```

### Adding Formic Words

```typescript
// In formicLanguage.ts SEMANTIC_ROOTS
const SEMANTIC_ROOTS = {
  // ...existing roots
  MY_CONCEPT: 'kə-ʘa', // phonetic: kuh-[click]-ah
};
```

---

## 🐛 Troubleshooting

### No Sound Playing

1. Check browser autoplay policy - click anywhere on the page first
2. Verify audio context is initialized: `console.log(audioEngine)`
3. Check volume settings in game settings menu

### ElevenLabs Not Working

1. Verify API key in `.env.local`
2. Check console for authentication errors
3. Ensure API key has available credits
4. Fallback procedural audio will be used if API fails

### Soundscape Not Transitioning

1. Check event bus is publishing `ROOM_ENTER` events
2. Verify region ID is in the mapping
3. Check for console errors in `liminalSoundscape`

### Memory Issues

Clear audio cache periodically:
```typescript
elevenLabsAudio.clearCache();
```

---

## 📊 Performance

- **Procedural Audio**: Minimal CPU, generated in real-time
- **ElevenLabs**: Network-dependent, cached after first generation
- **Memory**: ~5-10MB for loaded audio buffers
- **CPU**: ~2-5% during soundscape transitions

---

## 🎨 Design Philosophy

The audio design follows these principles:

1. **Content Extension, Not Addition**: Audio responds to game state, doesn't just play over it
2. **Liminal Spaces**: Music should feel transitional, between states
3. **Collective Voice**: Ant consciousness is plural, ancient, and alien
4. **Procedural First**: Generate when possible, load when necessary
5. **Graceful Degradation**: Works without API key, just less fancy

---

## 📝 License & Credits

- **ElevenLabs API**: Subject to ElevenLabs terms of service
- **Formic Language**: Custom constructed language for ANT-SIM
- **Audio Engine**: Web Audio API (browser native)
- **Game Audio**: Part of ANT-SIM v7.4.1

---

**Version:** 1.0  
**Last Updated:** 2026-03-30  
**Maintained By:** ANT-SIM Audio Team
