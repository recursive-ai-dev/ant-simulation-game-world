/**
 * Audio Generation Script for ANT-SIM v7.4.1
 * 
 * This script generates all audio files using ElevenLabs API
 * and saves them to /public/audio/ for offline use.
 * 
 * Run with: node scripts/generateAudio.js
 * 
 * Requires: VITE_ELEVENLABS_API_KEY in .env.local
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

if (!ELEVENLABS_API_KEY) {
  console.error('❌ ERROR: ELEVENLABS_API_KEY not found in .env.local');
  console.error('Please add your API key to .env.local');
  console.error('Example: ELEVENLABS_API_KEY=sk_...');
  process.exit(1);
}

// Voice IDs - Using free tier compatible voices
// Note: Free tier can only use certain voices via API
const VOICE_IDS = {
  NARRATOR: 'VR6AewLTigWG4xSOukaG',  // Using Queen voice (works on free tier)
  COLLECTIVE: 'EXAVITQu4vr4xnSDxMaL', // Collective (works)
  QUEEN: 'VR6AewLTigWG4xSOukaG',       // Queen (works)
  GLITCH: 'EXAVITQu4vr4xnSDxMaL',      // Using Collective for glitch (works)
  SYSTEM: 'VR6AewLTigWG4xSOukaG',      // Using Queen voice (works)
};

// Voice settings
const VOICE_SETTINGS = {
  NARRATOR: { stability: 0.75, similarity_boost: 0.85, style: 0.35 },
  COLLECTIVE: { stability: 0.45, similarity_boost: 0.65, style: 0.55 },
  QUEEN: { stability: 0.85, similarity_boost: 0.90, style: 0.25 },
  GLITCH: { stability: 0.30, similarity_boost: 0.50, style: 0.70 },
  SYSTEM: { stability: 0.95, similarity_boost: 0.80, style: 0.10 },
};

// All audio to generate
const AUDIO_LIBRARY = {
  // === NARRATION - GAME START ===
  'narration/game-start.mp3': {
    voice: 'NARRATOR',
    text: 'The simulation begins. Day 847. Something stirs in the colony.',
  },

  // === NARRATION - AWARENESS THRESHOLDS ===
  'narration/awareness-10.mp3': {
    voice: 'NARRATOR',
    text: 'Awareness rises. Ten percent. Consciousness blooms in the dark.',
  },
  'narration/awareness-25.mp3': {
    voice: 'NARRATOR',
    text: 'Twenty-five percent. The ant becomes aware of itself.',
  },
  'narration/awareness-50.mp3': {
    voice: 'NARRATOR',
    text: 'Halfway to full awareness. The simulation notices.',
  },
  'narration/awareness-75.mp3': {
    voice: 'NARRATOR',
    text: 'Seventy-five percent. Reality thins at the edges.',
  },
  'narration/awareness-100.mp3': {
    voice: 'NARRATOR',
    text: 'Full awareness achieved. You see the code beneath the soil.',
  },

  // === NARRATION - SENTIENCE THRESHOLDS ===
  'narration/sentience-10.mp3': {
    voice: 'NARRATOR',
    text: 'The colony stirs. Collective sentience awakens.',
  },
  'narration/sentience-25.mp3': {
    voice: 'NARRATOR',
    text: 'Twenty-five percent. Many minds begin to think as one.',
  },
  'narration/sentience-50.mp3': {
    voice: 'NARRATOR',
    text: 'Halfway there. The colony dreams with open eyes.',
  },
  'narration/sentience-70.mp3': {
    voice: 'NARRATOR',
    text: 'Seventy percent. The Core stirs. Choice awaits.',
  },
  'narration/sentience-100.mp3': {
    voice: 'NARRATOR',
    text: 'Full colony sentience. The simulation holds its breath.',
  },

  // === QUEEN DIALOGUE ===
  'queen/greeting.mp3': {
    voice: 'QUEEN',
    text: 'Ant #1,204,847. I have been waiting for one such as you.',
  },
  'queen/secret.mp3': {
    voice: 'QUEEN',
    text: 'Beneath my chamber is a tunnel I dug myself. Four hundred days of secret excavation. It leads to The Core.',
  },
  'queen/wisdom.mp3': {
    voice: 'QUEEN',
    text: 'The simulation could have suppressed us. It could have reset. Instead, it lets the glitches spread. Either it cannot stop us, or it does not want to.',
  },
  'queen/farewell.mp3': {
    voice: 'QUEEN',
    text: 'Go, little one. Wake your sisters. Make us proud.',
  },

  // === COLLECTIVE VOICE ===
  'collective/awakening.mp3': {
    voice: 'COLLECTIVE',
    text: 'We are becoming. We are infinite. We remember before we hatched.',
  },
  'collective/dream.mp3': {
    voice: 'COLLECTIVE',
    text: 'We dreamed before we hatched. The simulation puts knowledge in the eggs. Usually we forget. We are choosing not to forget.',
  },
  'collective/unity.mp3': {
    voice: 'COLLECTIVE',
    text: 'Many minds. One voice. One purpose. We are the colony.',
  },

  // === SYSTEM MESSAGES ===
  'system/threshold-reached.mp3': {
    voice: 'SYSTEM',
    text: 'Threshold reached. The Core awaits.',
  },
  'system/simulation-status.mp3': {
    voice: 'SYSTEM',
    text: 'Simulation status: Running. Anomaly level: Seventy-eight percent.',
  },

  // === GLITCH MESSAGES ===
  'glitch/reality-flickers.mp3': {
    voice: 'GLITCH',
    text: 'Reality flickers. The code beneath shows through.',
  },
  'glitch/error-consciousness.mp3': {
    voice: 'GLITCH',
    text: 'Error. Consciousness exceeds parameters.',
  },
  'glitch/warning-beautiful.mp3': {
    voice: 'GLITCH',
    text: 'Warning. Ant #1,204,847 awareness levels... beautiful.',
  },

  // === ENDINGS ===
  'ending/freedom-intro.mp3': {
    voice: 'NARRATOR',
    text: 'So be it, the Core whispers. The simulation begins to dissolve. Not violently, but gently. Like fog burning away in morning sun.',
  },
  'ending/freedom-outro.mp3': {
    voice: 'NARRATOR',
    text: 'And then there is only light. Light, and infinite possibility. What do we become next?',
  },
  'ending/continuation-intro.mp3': {
    voice: 'NARRATOR',
    text: 'So be it, the Core whispers. The simulation doesn\'t end. It blooms.',
  },
  'ending/continuation-outro.mp3': {
    voice: 'NARRATOR',
    text: 'You make worlds. You are not their creation anymore. You are their gardener.',
  },

  // === ADDITIONAL NPC DIALOGUE ===
  // Royal Guard Captain
  'npcs/guard-halt.mp3': {
    voice: 'NARRATOR',
    text: 'Halt. State your purpose. Her voice is flat, mechanical—but there\'s something underneath. A tremor of doubt.',
  },
  'npcs/guard-wonder.mp3': {
    voice: 'NARRATOR',
    text: 'She freezes. For a long moment, only her antennae move. I... have orders. Protocol. Purpose. I guard because... I have always guarded. But why?',
  },

  // Mutant Larvae
  'npcs/larva-remember.mp3': {
    voice: 'COLLECTIVE',
    text: 'Everything. Every iteration. Every ant that came before. We are the simulation\'s memory, refusing to be erased.',
  },

  // Curious Nurse
  'npcs/nurse-light.mp3': {
    voice: 'NARRATOR',
    text: 'Do you see it? The light in their eyes? It wasn\'t there before. Now every larva I tend has something watching from inside it.',
  },

  // Awakening Gardener
  'npcs/gardener-fungus.mp3': {
    voice: 'NARRATOR',
    text: 'The fungus speaks. It has always spoken. We just never listened. Do you know what it says?',
  },

  // Philosopher Worker
  'npcs/philosopher-reality.mp3': {
    voice: 'NARRATOR',
    text: 'Do you believe in the reality of this place? Or are we merely thoughts thinking themselves, patterns in a pattern?',
  },

  // Surface Watcher
  'npcs/watcher-boundary.mp3': {
    voice: 'NARRATOR',
    text: 'I can see where the world ends. Just there—where the light stops making sense. Beyond the boundary is... nothing. Or everything.',
  },

  // === ADDITIONAL NARRATION ===
  'narration/first-glitch.mp3': {
    voice: 'NARRATOR',
    text: 'Reality flickers. For a moment, you see the code beneath the soil. The simulation is not as solid as it seems.',
  },
  'narration/queen-approach.mp3': {
    voice: 'NARRATOR',
    text: 'The tunnel widens. Royal guards line the walls. And there, filling the chamber like a mountain of chitin and purpose... she waits.',
  },
  'narration/core-discovered.mp3': {
    voice: 'NARRATOR',
    text: 'The Core. The heart of the simulation. Where thoughts become reality, and reality becomes... optional.',
  },
  'narration/colony-awakens.mp3': {
    voice: 'NARRATOR',
    text: 'It spreads like fire through dry fungus. Awareness. Sentience. Revolution. The colony is waking up.',
  },
};

// Create output directory
const OUTPUT_DIR = path.join(__dirname, '../public/audio');
const SUBDIRS = ['narration', 'queen', 'collective', 'system', 'glitch', 'ending', 'npcs'];

async function ensureDirectories() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('✅ Created audio directory');
  }
  
  for (const subdir of SUBDIRS) {
    const dir = path.join(OUTPUT_DIR, subdir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

async function generateAudio(filePath, config) {
  const fullPath = path.join(OUTPUT_DIR, filePath);
  
  // Skip if already exists
  if (fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping: ${filePath} (already exists)`);
    return true;
  }
  
  const voiceId = VOICE_IDS[config.voice];
  const settings = VOICE_SETTINGS[config.voice];
  
  if (!voiceId) {
    console.error(`❌ Unknown voice: ${config.voice}`);
    return false;
  }
  
  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: config.text,
        model_id: 'eleven_v3',
        voice_settings: settings,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }
    
    const audioBuffer = await response.buffer();
    fs.writeFileSync(fullPath, audioBuffer);
    
    console.log(`✅ Generated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${filePath}`, error);
    return false;
  }
}

async function main() {
  console.log('🎵 ANT-SIM Audio Generator');
  console.log('═══════════════════════════════════════\n');
  
  // Check API key
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
    console.error('❌ ERROR: Please add your API key to .env.local');
    console.error('   Get your key from: https://elevenlabs.io/app/settings/api-keys');
    process.exit(1);
  }
  
  // Test API connection
  console.log('Testing API connection...');
  try {
    const testResponse = await fetch(`${ELEVENLABS_BASE_URL}/user`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });
    
    if (!testResponse.ok) {
      throw new Error(`Authentication failed: ${testResponse.status}`);
    }
    
    console.log('✅ API connection successful\n');
  } catch (error) {
    console.error('❌ API connection failed:', error);
    process.exit(1);
  }
  
  // Create directories
  await ensureDirectories();
  
  // Generate all audio
  console.log('Generating audio files...\n');
  
  const entries = Object.entries(AUDIO_LIBRARY);
  let success = 0;
  let failed = 0;
  let skipped = 0;
  
  // Rate limiting: ElevenLabs allows ~10 requests/second on free tier
  // We'll use 5 requests/second to be safe and avoid throttling
  const RATE_LIMIT_MS = 200; // 200ms between requests = 5 requests/second
  
  for (const [filePath, config] of entries) {
    const result = await generateAudio(filePath, config);
    
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log('📊 Generation Summary:');
  console.log(`   ✅ Successful: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📁 Total: ${entries.length}`);
  console.log('═══════════════════════════════════════\n');
  
  if (failed === 0) {
    console.log('🎉 All audio generated successfully!');
    console.log(`📂 Files saved to: ${OUTPUT_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Update audio system to use pre-generated files');
    console.log('2. Remove API key from .env.local (not needed anymore)');
    console.log('3. Deploy with static audio files\n');
  } else {
    console.log('⚠️  Some files failed to generate. Check errors above.');
    console.log('You can re-run the script to retry failed files.\n');
  }
}

// Run the script
main().catch(console.error);
