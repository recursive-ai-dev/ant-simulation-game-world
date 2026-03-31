import { GameSettings, GameEvent } from '../types/game';
import { eventBus, EventBus } from './eventBus';
import { elevenLabsAudio } from './elevenLabsAudio';
import { liminalSoundscape } from './liminalSoundscape';
import { formicLanguage } from './formicLanguage';

export type SoundType = 'ambient' | 'music' | 'sfx' | 'voice';

export interface SoundConfig {
  volume: number;
  loop: boolean;
  fadeDuration: number;
}

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNodes: Record<SoundType, GainNode | null> = {
    ambient: null,
    music: null,
    sfx: null,
    voice: null,
  };
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private loadedBuffers: Map<string, AudioBuffer> = new Map();
  private settings: GameSettings | null = null;
  private initialized: boolean = false;
  private muted: boolean = false;
  private eventBus: EventBus | null = null;
  private unsubscribe: (() => void) | null = null;
  private loadingQueue: Map<string, Promise<AudioBuffer>> = new Map();

  async initialize(settings: GameSettings, eventBusInstance?: EventBus): Promise<void> {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.settings = settings;
      this.eventBus = eventBusInstance || eventBus;

      // Create gain nodes for each sound type
      Object.keys(this.gainNodes).forEach((type) => {
        const gainNode = this.audioContext!.createGain();
        gainNode.connect(this.audioContext!.destination);
        this.gainNodes[type as SoundType] = gainNode;
        this.updateVolume(type as SoundType);
      });

      // Initialize ElevenLabs
      await elevenLabsAudio.initialize();
      
      // Initialize liminal soundscape
      await liminalSoundscape.initialize();
      
      // Subscribe to game events
      this.setupEventListeners();

      this.initialized = true;
      console.log('[AudioEngine] Initialized successfully (ElevenLabs + Liminal Soundscape)');
    } catch (error) {
      console.warn('[AudioEngine] Failed to initialize:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.eventBus) return;

    // Clear any existing subscriptions first to prevent memory leaks
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.unsubscribe = this.eventBus.subscribeMany([
      {
        eventType: 'ACHIEVEMENT_UNLOCK',
        handler: () => {
          console.log(`[AudioEngine][game_tick=${Date.now()}] Achievement unlock sound triggered`);
          this.playUnlockSound();
        },
      },
      {
        eventType: 'GLITCH',
        handler: (event) => {
          console.log(`[AudioEngine][game_tick=${Date.now()}] Glitch sound triggered, intensity=${event.intensity}`);
          if (event.intensity > 0.5) {
            this.playGlitchSound();
          }
        },
      },
      {
        eventType: 'ROOM_ENTER',
        handler: (event) => {
          console.log(`[AudioEngine][game_tick=${Date.now()}] Room transition: ${event.previousRoom} -> ${event.roomId}`);
          this.playRoomTransitionSound();
        },
      },
      {
        eventType: 'GAME_TICK',
        handler: (event) => {
          // Log audio engine state periodically for debugging
          if (process.env.NODE_ENV === 'development' && 'delta' in event && event.delta > 0) {
            console.log(`[AudioEngine][game_tick=${Date.now()}] Active sources: ${this.activeSources.size}, Muted: ${this.muted}`);
          }
        },
      },
    ]);
  }

  private cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Load an audio file from URL
   */
  async loadSound(id: string, url: string, type: SoundType = 'sfx'): Promise<AudioBuffer> {
    // Return cached buffer if available
    const cached = this.loadedBuffers.get(id);
    if (cached) return cached;

    // Return existing loading promise if already loading
    const existingLoad = this.loadingQueue.get(id);
    if (existingLoad) return existingLoad;

    if (!this.audioContext) {
      throw new Error('AudioEngine not initialized');
    }

    // Start loading
    const loadPromise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${url}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        
        this.loadedBuffers.set(id, audioBuffer);
        console.log(`[AudioEngine] Loaded: ${id}`);
        return audioBuffer;
      } catch (error) {
        console.error(`[AudioEngine] Failed to load ${id}:`, error);
        throw error;
      } finally {
        this.loadingQueue.delete(id);
      }
    })();

    this.loadingQueue.set(id, loadPromise);
    return loadPromise;
  }

  /**
   * Preload multiple sounds
   */
  async preloadSounds(
    sounds: Array<{ id: string; url: string; type?: SoundType }>
  ): Promise<void> {
    console.log(`[AudioEngine] Preloading ${sounds.length} sounds...`);
    await Promise.all(sounds.map(s => this.loadSound(s.id, s.url, s.type)));
    console.log('[AudioEngine] Preloading complete');
  }

  /**
   * Play a loaded sound
   */
  async playLoadedSound(
    id: string,
    config: Partial<SoundConfig> = {}
  ): Promise<void> {
    if (!this.initialized || !this.audioContext) return;

    const buffer = this.loadedBuffers.get(id);
    if (!buffer) {
      console.warn(`[AudioEngine] Sound not loaded: ${id}`);
      return;
    }

    await this.playSound(id, 'sfx', buffer, config);
  }

  /**
   * Play ambient sound layer
   */
  async playAmbient(
    id: string,
    url: string,
    volume: number = 1
  ): Promise<void> {
    const buffer = await this.loadSound(id, url, 'ambient');
    
    // Stop existing ambient with same ID
    this.stopSound(id);

    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.gainNodes.ambient!);
    source.start(0);

    this.activeSources.set(id, source);
    
    // Set volume
    const gainNode = this.gainNodes.ambient!;
    gainNode.gain.setTargetAtTime(
      volume * this.settings!.ambientVolume * this.settings!.masterVolume,
      this.audioContext!.currentTime,
      0.1
    );
  }

  /**
   * Stop ambient sound
   */
  stopAmbient(id: string): void {
    this.stopSound(id);
  }

  /**
   * Get loaded sound status
   */
  isSoundLoaded(id: string): boolean {
    return this.loadedBuffers.has(id);
  }

  /**
   * Get all loaded sound IDs
   */
  getLoadedSounds(): string[] {
    return Array.from(this.loadedBuffers.keys());
  }

  /**
   * Clear loaded sounds from memory
   */
  clearLoadedSounds(): void {
    this.loadedBuffers.clear();
    this.loadingQueue.clear();
  }

  updateSettings(settings: GameSettings): void {
    this.settings = settings;
    Object.keys(this.gainNodes).forEach((type) => {
      this.updateVolume(type as SoundType);
    });
  }

  private updateVolume(type: SoundType): void {
    if (!this.gainNodes[type] || !this.settings) return;

    const masterVolume = this.settings.masterVolume;
    let typeVolume: number;

    switch (type) {
      case 'ambient':
        typeVolume = this.settings.ambientVolume;
        break;
      case 'music':
        typeVolume = this.settings.musicVolume;
        break;
      case 'sfx':
        typeVolume = this.settings.sfxVolume;
        break;
      default:
        typeVolume = 1;
    }

    const targetVolume = this.muted ? 0 : masterVolume * typeVolume;
    this.gainNodes[type]!.gain.setTargetAtTime(targetVolume, this.audioContext!.currentTime, 0.1);
  }

  async playSound(
    id: string,
    type: SoundType,
    buffer: AudioBuffer,
    config: Partial<SoundConfig> = {}
  ): Promise<void> {
    if (!this.initialized || !this.audioContext) return;

    // Stop existing sound with same ID
    this.stopSound(id);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = config.loop ?? false;
    source.connect(this.gainNodes[type]!);
    source.start(0);

    this.activeSources.set(id, source);

    source.onended = () => {
      this.activeSources.delete(id);
    };
  }

  stopSound(id: string): void {
    const source = this.activeSources.get(id);
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
      this.activeSources.delete(id);
    }
  }

  stopAll(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.activeSources.clear();
  }

  async playSFX(soundData: Float32Array | AudioBuffer, id?: string): Promise<void> {
    if (!this.initialized || !this.audioContext) return;

    const buffer = soundData instanceof Float32Array
      ? this.createBufferFromData(soundData)
      : soundData;

    await this.playSound(id ?? `sfx-${Date.now()}`, 'sfx', buffer, { loop: false });
  }

  private createBufferFromData(data: Float32Array): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, data.length, sampleRate);
    buffer.getChannelData(0).set(data);
    return buffer;
  }

  // Procedural sound effects
  playGlitchSound(): void {
    if (!this.initialized || !this.audioContext) return;

    const duration = 0.3;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(500, this.audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.gainNodes.sfx!);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playNotificationSound(): void {
    if (!this.initialized || !this.audioContext) return;

    const duration = 0.15;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1100, this.audioContext.currentTime + duration / 2);

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.gainNodes.sfx!);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playTypingSound(): void {
    if (!this.initialized || !this.audioContext) return;

    const duration = 0.05;
    const noise = this.createNoiseBuffer(duration);
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    source.buffer = noise;
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.gainNodes.sfx!);

    source.start();
    source.stop(this.audioContext.currentTime + duration);
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext!.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  playSuccessSound(): void {
    if (!this.initialized || !this.audioContext) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    const duration = 0.15;

    notes.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = this.audioContext!.currentTime + index * 0.08;
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.gainNodes.sfx!);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  playUnlockSound(): void {
    if (!this.initialized || !this.audioContext) return;

    const duration = 0.5;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.gainNodes.sfx!);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playRoomTransitionSound(): void {
    if (!this.initialized || !this.audioContext) return;

    const duration = 0.3;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Ethereal transition sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(2000, this.audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.gainNodes.sfx!);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  toggleMute(): void {
    this.muted = !this.muted;
    Object.keys(this.gainNodes).forEach((type) => {
      this.updateVolume(type as SoundType);
    });
  }

  isMuted(): boolean {
    return this.muted;
  }

  private async resumeAudioContext(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log(`[AudioEngine][game_tick=${Date.now()}] AudioContext resumed successfully`);
      } catch (error) {
        console.warn('[AudioEngine] Failed to resume AudioContext:', error);
      }
    }
  }

  resume(): void {
    this.resumeAudioContext();
  }

  /**
   * Retry audio initialization after failure
   * Can be called by user to attempt recovery
   */
  async retryInitialize(settings?: GameSettings, eventBusInstance?: EventBus): Promise<boolean> {
    if (this.initialized) {
      console.log('[AudioEngine] Already initialized, skipping retry');
      return true;
    }

    try {
      await this.initialize(settings || this.settings!, eventBusInstance || this.eventBus!);
      return this.initialized;
    } catch (error) {
      console.warn('[AudioEngine] Retry initialization failed:', error);
      return false;
    }
  }

  /**
   * Test audio output to verify functionality
   * Plays a subtle test tone
   */
  async testAudio(): Promise<boolean> {
    if (!this.initialized || !this.audioContext) {
      return false;
    }

    try {
      // Play a brief test tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(this.gainNodes.sfx!);

      oscillator.start(now);
      oscillator.stop(now + 0.3);

      return true;
    } catch (error) {
      console.warn('[AudioEngine] Test audio failed:', error);
      return false;
    }
  }

  /**
   * Get current audio engine status
   */
  getStatus(): {
    initialized: boolean;
    muted: boolean;
    contextState: string;
    activeSources: number;
  } {
    return {
      initialized: this.initialized,
      muted: this.muted,
      contextState: this.audioContext?.state || 'unavailable',
      activeSources: this.activeSources.size,
    };
  }
}

export const audioEngine = new AudioEngine();
