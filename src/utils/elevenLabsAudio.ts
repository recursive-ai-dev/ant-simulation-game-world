/**
 * ElevenLabs Audio System for ANT-SIM v7.4.1
 * 
 * TWO MODES OF OPERATION:
 * 
 * 1. PRE-GENERATED MODE (Recommended for production):
 *    - Audio files generated once using generateAudio.js script
 *    - Files stored in /public/audio/
 *    - No API calls during gameplay
 *    - No API key needed after generation
 * 
 * 2. DYNAMIC MODE (Development/testing):
 *    - Audio generated on-the-fly via API
 *    - Requires VITE_ELEVENLABS_API_KEY
 *    - Higher latency, API costs
 * 
 * The system automatically uses pre-generated files if available,
 * falling back to dynamic generation or procedural audio.
 */

import { eventBus } from './eventBus';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Audio file library (pre-generated)
const AUDIO_FILES: Record<string, string> = {
  // Narration
  'narration/game-start': '/audio/narration/game-start.mp3',
  'narration/awareness-10': '/audio/narration/awareness-10.mp3',
  'narration/awareness-25': '/audio/narration/awareness-25.mp3',
  'narration/awareness-50': '/audio/narration/awareness-50.mp3',
  'narration/awareness-75': '/audio/narration/awareness-75.mp3',
  'narration/awareness-100': '/audio/narration/awareness-100.mp3',
  'narration/sentience-10': '/audio/narration/sentience-10.mp3',
  'narration/sentience-25': '/audio/narration/sentience-25.mp3',
  'narration/sentience-50': '/audio/narration/sentience-50.mp3',
  'narration/sentience-70': '/audio/narration/sentience-70.mp3',
  'narration/sentience-100': '/audio/narration/sentience-100.mp3',
  
  // Queen
  'queen/greeting': '/audio/queen/greeting.mp3',
  'queen/secret': '/audio/queen/secret.mp3',
  'queen/wisdom': '/audio/queen/wisdom.mp3',
  'queen/farewell': '/audio/queen/farewell.mp3',
  
  // Collective
  'collective/awakening': '/audio/collective/awakening.mp3',
  'collective/dream': '/audio/collective/dream.mp3',
  'collective/unity': '/audio/collective/unity.mp3',
  
  // System
  'system/threshold-reached': '/audio/system/threshold-reached.mp3',
  'system/simulation-status': '/audio/system/simulation-status.mp3',
  
  // Glitch
  'glitch/reality-flickers': '/audio/glitch/reality-flickers.mp3',
  'glitch/error-consciousness': '/audio/glitch/error-consciousness.mp3',
  'glitch/warning-beautiful': '/audio/glitch/warning-beautiful.mp3',
  
  // Endings
  'ending/freedom-intro': '/audio/ending/freedom-intro.mp3',
  'ending/freedom-outro': '/audio/ending/freedom-outro.mp3',
  'ending/continuation-intro': '/audio/ending/continuation-intro.mp3',
  'ending/continuation-outro': '/audio/ending/continuation-outro.mp3',
};

export interface SpeechRequest {
  text: string;
  voice: 'NARRATOR' | 'COLLECTIVE' | 'QUEEN' | 'GLITCH' | 'SYSTEM';
  category?: 'narration' | 'dialogue' | 'system' | 'ambient';
}

export interface SoundEffectRequest {
  prompt: string;
  duration?: number;
  category: 'ui' | 'environment' | 'event' | 'creature';
}

class ElevenLabsAudio {
  private apiKey: string;
  private initialized: boolean = false;
  private audioCache: Map<string, AudioBuffer> = new Map();
  private pregeneratedCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.apiKey = ELEVENLABS_API_KEY || '';
  }

  async initialize(): Promise<boolean> {
    // Pre-load all pre-generated audio files
    await this.pregenerateAllAudio();
    
    if (!this.apiKey) {
      if (this.pregeneratedCache.size > 0) {
        console.log(`[ElevenLabs] Using ${this.pregeneratedCache.size} pre-generated files`);
        return true;
      }
      console.warn('[ElevenLabs] No API key, no pre-generated files - using procedural only');
      return false;
    }

    try {
      const response = await fetch(`https://elevenlabs.io/v1/user`, {
        headers: { 'xi-api-key': this.apiKey },
      });

      if (response.ok) {
        this.initialized = true;
        console.log('[ElevenLabs] API connected (dynamic mode available)');
        return true;
      }
    } catch (error) {
      console.warn('[ElevenLabs] API not available, using pre-generated only');
    }
    
    return this.pregeneratedCache.size > 0;
  }

  private async pregenerateAllAudio(): Promise<void> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    for (const [key, url] of Object.entries(AUDIO_FILES)) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        this.pregeneratedCache.set(key, audioBuffer);
      } catch (error) {
        // File not available
      }
    }
    
    console.log(`[ElevenLabs] Pre-loaded ${this.pregeneratedCache.size}/${Object.keys(AUDIO_FILES).length} files`);
  }

  async narrate(event: string, context?: Record<string, any>): Promise<AudioBuffer | null> {
    const fileMap: Record<string, string> = {
      'game_start': 'narration/game-start',
      'awareness_10': 'narration/awareness-10',
      'awareness_25': 'narration/awareness-25',
      'awareness_50': 'narration/awareness-50',
      'awareness_75': 'narration/awareness-75',
      'awareness_100': 'narration/awareness-100',
      'sentience_10': 'narration/sentience-10',
      'sentience_25': 'narration/sentience-25',
      'sentience_50': 'narration/sentience-50',
      'sentience_70': 'narration/sentience-70',
      'sentience_100': 'narration/sentience-100',
    };

    const fileKey = fileMap[event];
    if (fileKey) {
      const cached = this.pregeneratedCache.get(fileKey);
      if (cached) return cached;
    }

    return this.createProceduralSpeech({ 
      text: context?.text || 'Narration', 
      voice: 'NARRATOR' 
    });
  }

  async queenDialogue(key: string): Promise<AudioBuffer | null> {
    const fileKey = `queen/${key}`;
    const cached = this.pregeneratedCache.get(fileKey);
    return cached || this.createProceduralSpeech({ text: 'Queen', voice: 'QUEEN' });
  }

  async collectiveVoice(key: string): Promise<AudioBuffer | null> {
    const fileKey = `collective/${key}`;
    const cached = this.pregeneratedCache.get(fileKey);
    return cached || this.createProceduralSpeech({ text: 'Collective', voice: 'COLLECTIVE' });
  }

  async glitchVoice(key: string): Promise<AudioBuffer | null> {
    const fileKey = `glitch/${key}`;
    const cached = this.pregeneratedCache.get(fileKey);
    return cached || this.createProceduralSpeech({ text: 'Glitch', voice: 'GLITCH' });
  }

  async playEnding(key: string): Promise<AudioBuffer | null> {
    const fileKey = `ending/${key}`;
    const cached = this.pregeneratedCache.get(fileKey);
    return cached;
  }

  private async createProceduralSpeech(request: SpeechRequest): Promise<AudioBuffer | null> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = request.text.length * 0.1;
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const baseFreq = request.voice === 'QUEEN' ? 180 : 
                     request.voice === 'COLLECTIVE' ? 220 :
                     request.voice === 'SYSTEM' ? 440 : 200;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const charIndex = Math.floor((t / duration) * request.text.length);
      const char = request.text[charIndex] || ' ';
      const charCode = char.charCodeAt(0);
      const modulation = (charCode % 12) / 12;
      const freq = baseFreq * Math.pow(2, modulation);
      
      data[i] = Math.sin(2 * Math.PI * freq * t) * 0.3 * Math.exp(-3 * t / duration);
      data[i] += Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.15 * Math.exp(-3 * t / duration);
    }

    return buffer;
  }

  clearCache(): void {
    this.pregeneratedCache.clear();
    this.audioCache.clear();
  }

  getCacheSize(): number {
    return this.pregeneratedCache.size + this.audioCache.size;
  }
}

export const elevenLabsAudio = new ElevenLabsAudio();
