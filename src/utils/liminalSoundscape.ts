/**
 * Liminal Soundscape Generator for ANT-SIM v7.4.1
 * 
 * Generates procedural ambient music that feels:
 * - Liminal (between spaces, transitional)
 * - Almost depressive (melancholic, contemplative)
 * - Semi-futuristic (digital, synthetic elements)
 * - Ancient raw dirt (earth textures, organic sounds)
 * 
 * Uses Web Audio API for procedural generation.
 * Can be layered with ElevenLabs voice generation.
 */

import { eventBus } from './eventBus';

export interface SoundscapePreset {
  name: string;
  description: string;
  layers: SoundLayerConfig[];
  transitionTime: number; // seconds
}

export interface SoundLayerConfig {
  type: 'drone' | 'texture' | 'melody' | 'rhythm' | 'fx';
  frequency?: number | number[]; // Hz or array for chords
  duration?: number; // seconds (0 = infinite loop)
  volume?: number; // 0-1
  filter?: 'lowpass' | 'highpass' | 'bandpass';
  filterFreq?: number; // Hz
  reverb?: boolean;
  delay?: boolean;
  modulation?: 'none' | 'tremolo' | 'vibrato' | 'granular';
  detune?: number; // cents
}

export interface RegionSoundscape {
  regionId: string;
  preset: SoundscapePreset;
  triggers: {
    onEnter?: () => void;
    onExit?: () => void;
    onGlitch?: () => void;
  };
}

class LiminalSoundscape {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeLayers: Map<string, {
    oscillators: OscillatorNode[];
    gain: GainNode;
    filters: BiquadFilterNode[];
    effects: AudioNode[];
  }> = new Map();
  private currentPreset: string | null = null;
  private volume: number = 0.7;

  // Preset definitions
  private presets: Record<string, SoundscapePreset> = {
    // Main tunnel - central hub
    'central-colony': {
      name: 'Central Colony',
      description: 'The beating heart of the simulation. Busy but contemplative.',
      layers: [
        {
          type: 'drone',
          frequency: [55, 110, 165], // A minor chord
          volume: 0.3,
          filter: 'lowpass',
          filterFreq: 400,
          reverb: true,
          modulation: 'tremolo',
        },
        {
          type: 'texture',
          frequency: 200,
          volume: 0.15,
          filter: 'bandpass',
          filterFreq: 800,
          modulation: 'granular',
        },
        {
          type: 'rhythm',
          frequency: 80, // Slow heartbeat
          volume: 0.2,
          filter: 'lowpass',
          filterFreq: 200,
        },
      ],
      transitionTime: 3,
    },

    // Queen's domain - authoritative, ancient
    'queens-domain': {
      name: "Queen's Domain",
      description: 'Ancient authority. The weight of 847 days of thought.',
      layers: [
        {
          type: 'drone',
          frequency: [40, 80, 120], // Deep, authoritative
          volume: 0.4,
          filter: 'lowpass',
          filterFreq: 300,
          reverb: true,
          detune: -10,
        },
        {
          type: 'melody',
          frequency: [220, 277, 330], // A minor arpeggio
          volume: 0.15,
          filter: 'highpass',
          filterFreq: 500,
          delay: true,
        },
        {
          type: 'texture',
          frequency: 150,
          volume: 0.1,
          modulation: 'vibrato',
          reverb: true,
        },
      ],
      transitionTime: 5,
    },

    // Nursery complex - fragile, hopeful
    'nursery-complex': {
      name: 'Nursery Complex',
      description: 'New consciousness forming. Fragile but determined.',
      layers: [
        {
          type: 'drone',
          frequency: [165, 220, 330], // Higher, lighter
          volume: 0.25,
          filter: 'lowpass',
          filterFreq: 600,
          reverb: true,
        },
        {
          type: 'melody',
          frequency: [440, 523, 659], // A major hints
          volume: 0.2,
          filter: 'highpass',
          filterFreq: 800,
          delay: true,
          modulation: 'vibrato',
        },
        {
          type: 'texture',
          frequency: 400,
          volume: 0.1,
          modulation: 'granular',
        },
      ],
      transitionTime: 2,
    },

    // Fungus gardens - organic, growing
    'fungus-gardens': {
      name: 'Fungus Gardens',
      description: 'Living networks. Growth and decay intertwined.',
      layers: [
        {
          type: 'drone',
          frequency: [73, 146, 220], // D minor (earthy)
          volume: 0.3,
          filter: 'lowpass',
          filterFreq: 500,
          reverb: true,
          modulation: 'tremolo',
        },
        {
          type: 'texture',
          frequency: 180,
          volume: 0.2,
          filter: 'bandpass',
          filterFreq: 600,
          modulation: 'granular',
        },
        {
          type: 'rhythm',
          frequency: 60, // Slow growth pulse
          volume: 0.15,
          filter: 'lowpass',
          filterFreq: 150,
        },
      ],
      transitionTime: 4,
    },

    // Waste tunnels - melancholic, contemplative
    'waste-tunnels': {
      name: 'Waste Tunnels',
      description: 'Where things end and begin again. Melancholy wisdom.',
      layers: [
        {
          type: 'drone',
          frequency: [49, 98, 147], // B minor (melancholic)
          volume: 0.35,
          filter: 'lowpass',
          filterFreq: 350,
          reverb: true,
          detune: -15,
        },
        {
          type: 'texture',
          frequency: 120,
          volume: 0.15,
          filter: 'bandpass',
          filterFreq: 400,
          modulation: 'tremolo',
        },
        {
          type: 'fx',
          frequency: 800,
          volume: 0.1,
          filter: 'highpass',
          filterFreq: 1000,
          delay: true,
        },
      ],
      transitionTime: 4,
    },

    // Deep tunnels - mysterious, ancient
    'deep-tunnels': {
      name: 'Deep Tunnels',
      description: 'Below the known. The simulation substrate.',
      layers: [
        {
          type: 'drone',
          frequency: [30, 60, 90], // Very deep
          volume: 0.45,
          filter: 'lowpass',
          filterFreq: 250,
          reverb: true,
          detune: -20,
        },
        {
          type: 'texture',
          frequency: 100,
          volume: 0.2,
          filter: 'bandpass',
          filterFreq: 300,
          modulation: 'granular',
        },
        {
          type: 'fx',
          frequency: 400,
          volume: 0.15,
          filter: 'highpass',
          filterFreq: 800,
          reverb: true,
        },
      ],
      transitionTime: 6,
    },

    // The Core - transcendent, overwhelming
    'the-core': {
      name: 'The Core',
      description: 'The heart of the simulation. All sound becomes one.',
      layers: [
        {
          type: 'drone',
          frequency: [32.7, 65.4, 98, 130.8], // C major (resolution)
          volume: 0.5,
          filter: 'lowpass',
          filterFreq: 400,
          reverb: true,
          detune: -5,
        },
        {
          type: 'melody',
          frequency: [261.6, 329.6, 392, 523.2], // C major arpeggio
          volume: 0.25,
          filter: 'highpass',
          filterFreq: 600,
          delay: true,
          reverb: true,
        },
        {
          type: 'texture',
          frequency: 250,
          volume: 0.2,
          modulation: 'vibrato',
          reverb: true,
        },
        {
          type: 'texture',
          frequency: 500,
          volume: 0.15,
          modulation: 'granular',
          reverb: true,
        },
      ],
      transitionTime: 8,
    },

    // Glitch state - corrupted, unstable
    'glitch': {
      name: 'Glitch State',
      description: 'Reality failing. The code shows through.',
      layers: [
        {
          type: 'drone',
          frequency: [55, 57, 110, 114], // Detuned, unstable
          volume: 0.4,
          filter: 'bandpass',
          filterFreq: 500,
          modulation: 'tremolo',
        },
        {
          type: 'fx',
          frequency: 1000,
          volume: 0.3,
          filter: 'highpass',
          filterFreq: 2000,
          modulation: 'granular',
        },
        {
          type: 'texture',
          frequency: 300,
          volume: 0.2,
          filter: 'bandpass',
          filterFreq: 1000,
          modulation: 'vibrato',
        },
      ],
      transitionTime: 0.5, // Fast transition for glitches
    },

    // Silence - for dramatic effect
    'silence': {
      name: 'Silence',
      description: 'The absence of sound speaks.',
      layers: [],
      transitionTime: 2,
    },
  };

  async initialize(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = this.volume;

    console.log('[LiminalSoundscape] Initialized');

    // Subscribe to events for dynamic soundscapes
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.subscribe('ROOM_ENTER', (event) => {
      this.transitionToRegion(event.roomId);
    });

    eventBus.subscribe('GLITCH', (event) => {
      this.triggerGlitch(event.intensity);
    });

    eventBus.subscribe('AWARENESS_THRESHOLD', (event) => {
      this.triggerAwarenessRise(event.level);
    });

    eventBus.subscribe('SENTIENCE_THRESHOLD', (event) => {
      this.triggerSentienceRise(event.level);
    });
  }

  /**
   * Transition to a region's soundscape
   */
  async transitionToRegion(regionId: string): Promise<void> {
    const presetName = this.getRegionPreset(regionId);
    if (!presetName) {
      console.warn(`[LiminalSoundscape] No preset for region: ${regionId}`);
      return;
    }

    await this.transitionToPreset(presetName);
  }

  private getRegionPreset(regionId: string): string | null {
    const regionMap: Record<string, string> = {
      'main-tunnel': 'central-colony',
      'queens-antechamber': 'queens-domain',
      'queens-chamber': 'queens-domain',
      'royal-guard-quarters': 'queens-domain',
      'royal-nursery': 'queens-domain',
      'queens-hidden-passage': 'deep-tunnels',
      'nursery-entrance': 'nursery-complex',
      'egg-chamber': 'nursery-complex',
      'larvae-gallery': 'nursery-complex',
      'pupae-hall': 'nursery-complex',
      'abandoned-nursery': 'waste-tunnels',
      'fungus-gardens-entrance': 'fungus-gardens',
      'upper-gardens': 'fungus-gardens',
      'lower-gardens': 'fungus-gardens',
      'experimental-plots': 'fungus-gardens',
      'garden-observation-deck': 'fungus-gardens',
      'fungal-network-core': 'fungus-gardens',
      'waste-tunnels-entrance': 'waste-tunnels',
      'waste-processing-center': 'waste-tunnels',
      'contemplation-chamber': 'waste-tunnels',
      'the-ossuary': 'deep-tunnels',
      'surface-tunnel-lower': 'silence',
      'surface-garden': 'silence',
      'the-boundary': 'glitch',
      'deep-tunnels-entrance': 'deep-tunnels',
      'server-room': 'deep-tunnels',
      'data-vault': 'deep-tunnels',
      'the-void': 'glitch',
      'the-core-antechamber': 'the-core',
      'the-core': 'the-core',
    };

    return regionMap[regionId] || 'central-colony';
  }

  /**
   * Transition to a specific preset
   */
  async transitionToPreset(presetName: string): Promise<void> {
    const preset = this.presets[presetName];
    if (!preset) {
      console.error(`[LiminalSoundscape] Unknown preset: ${presetName}`);
      return;
    }

    const transitionTime = preset.transitionTime * 1000;

    // Fade out current layers
    if (this.currentPreset) {
      await this.fadeOutLayers(transitionTime / 2);
    }

    // Clear all layers
    this.clearAllLayers();

    // Build new layers
    this.currentPreset = presetName;
    await this.buildLayers(preset);

    // Fade in new layers
    await this.fadeInLayers(transitionTime / 2);

    console.log(`[LiminalSoundscape] Transitioned to: ${preset.name}`);
  }

  private async buildLayers(preset: SoundscapePreset): Promise<void> {
    for (let i = 0; i < preset.layers.length; i++) {
      const layer = preset.layers[i];
      const layerId = `${preset.name}-layer-${i}`;
      await this.createLayer(layerId, layer);
    }
  }

  private async createLayer(layerId: string, config: SoundLayerConfig): Promise<void> {
    if (!this.audioContext || !this.masterGain) return;

    const layer = {
      oscillators: [] as OscillatorNode[],
      gain: this.audioContext.createGain(),
      filters: [] as BiquadFilterNode[],
      effects: [] as AudioNode[],
    };

    layer.gain.connect(this.masterGain);
    layer.gain.gain.value = 0; // Start silent for fade-in

    // Create oscillators for frequencies
    const frequencies = Array.isArray(config.frequency) ? config.frequency : [config.frequency].filter(Boolean) as number[];
    
    for (const freq of frequencies) {
      const oscillator = this.audioContext.createOscillator();
      
      // Choose waveform based on layer type
      oscillator.type = config.type === 'drone' ? 'sine' :
                        config.type === 'texture' ? 'triangle' :
                        config.type === 'melody' ? 'sine' : 'square';
      
      oscillator.frequency.value = freq;
      
      if (config.detune) {
        oscillator.detune.value = config.detune;
      }

      oscillator.connect(layer.gain);
      layer.oscillators.push(oscillator);
    }

    // Create filter
    if (config.filter) {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = config.filter;
      filter.frequency.value = config.filterFreq || 1000;
      filter.connect(layer.gain);
      
      // Reconnect oscillators to filter
      layer.oscillators.forEach(osc => osc.disconnect());
      layer.oscillators.forEach(osc => osc.connect(filter));
      
      layer.filters.push(filter);
    }

    // Create effects
    if (config.reverb) {
      const convolver = this.audioContext.createConvolver();
      convolver.buffer = this.createReverbImpulse(2, 3); // 2-3 second reverb
      convolver.connect(layer.gain);
      layer.effects.push(convolver);
    }

    if (config.delay) {
      const delay = this.audioContext.createDelay();
      delay.delayTime.value = 0.3; // 300ms delay
      
      const feedback = this.audioContext.createGain();
      feedback.gain.value = 0.4;
      
      delay.connect(feedback);
      feedback.connect(delay);
      feedback.connect(layer.gain);
      
      layer.effects.push(delay);
      layer.effects.push(feedback);
    }

    // Apply modulation
    if (config.modulation === 'tremolo') {
      this.applyTremolo(layer);
    } else if (config.modulation === 'vibrato') {
      this.applyVibrato(layer);
    } else if (config.modulation === 'granular') {
      this.applyGranular(layer);
    }

    // Start oscillators
    layer.oscillators.forEach(osc => osc.start());

    this.activeLayers.set(layerId, layer);
  }

  private applyTremolo(layer: { oscillators: OscillatorNode[]; gain: GainNode; filters: BiquadFilterNode[]; effects: AudioNode[] }): void {
    if (!this.audioContext) return;

    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = 0.5; // Slow tremolo (0.5 Hz)
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 0.3; // Tremolo depth
    
    lfo.connect(lfoGain);
    lfoGain.connect(layer.gain.gain);
    lfo.start();
    
    layer.effects.push(lfo, lfoGain);
  }

  private applyVibrato(layer: { oscillators: OscillatorNode[]; gain: GainNode; filters: BiquadFilterNode[]; effects: AudioNode[] }): void {
    if (!this.audioContext) return;

    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = 4; // Faster vibrato (4 Hz)
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 5; // Vibrato depth (cents)
    
    lfo.connect(lfoGain);
    layer.oscillators.forEach(osc => {
      lfoGain.connect(osc.frequency);
    });
    lfo.start();
    
    layer.effects.push(lfo, lfoGain);
  }

  private applyGranular(layer: { oscillators: OscillatorNode[]; gain: GainNode; filters: BiquadFilterNode[]; effects: AudioNode[] }): void {
    // Simplified granular effect using random gain modulation
    if (!this.audioContext) return;

    const grainRate = 8; // 8 grains per second
    
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = grainRate;
    lfo.type = 'sawtooth';
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 0.5;
    
    lfo.connect(lfoGain);
    lfoGain.connect(layer.gain.gain);
    lfo.start();
    
    layer.effects.push(lfo, lfoGain);
  }

  private createReverbImpulse(minDecay: number, maxDecay: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const sampleRate = this.audioContext.sampleRate;
    const decay = minDecay + Math.random() * (maxDecay - minDecay);
    const length = sampleRate * decay;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with noise
        const decayEnvelope = Math.pow(1 - i / length, 2);
        const noise = (Math.random() * 2 - 1);
        channelData[i] = noise * decayEnvelope;
      }
    }

    return impulse;
  }

  private async fadeOutLayers(duration: number): Promise<void> {
    if (!this.audioContext) return;

    const fadeOut = Array.from(this.activeLayers.values()).map(layer => {
      return new Promise<void>(resolve => {
        layer.gain.gain.setTargetAtTime(
          0,
          this.audioContext!.currentTime,
          duration / 1000
        );
        setTimeout(resolve, duration);
      });
    });

    await Promise.all(fadeOut);
  }

  private async fadeInLayers(duration: number): Promise<void> {
    if (!this.audioContext) return;

    const fadeIn = Array.from(this.activeLayers.entries()).map(([id, layer]) => {
      return new Promise<void>(resolve => {
        const targetVolume = this.getLayerVolume(id);
        layer.gain.gain.setTargetAtTime(
          targetVolume,
          this.audioContext!.currentTime,
          duration / 1000
        );
        setTimeout(resolve, duration);
      });
    });

    await Promise.all(fadeIn);
  }

  private getLayerVolume(layerId: string): number {
    // Default volume, can be customized per layer
    return 0.7;
  }

  private clearAllLayers(): void {
    this.activeLayers.forEach(layer => {
      layer.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Already stopped
        }
      });
      layer.gain.disconnect();
      layer.filters.forEach(f => f.disconnect());
      layer.effects.forEach(e => e.disconnect());
    });
    this.activeLayers.clear();
  }

  /**
   * Trigger glitch soundscape overlay
   */
  triggerGlitch(intensity: number): void {
    // Temporarily overlay glitch sounds
    console.log(`[LiminalSoundscape] Glitch triggered: ${intensity * 100}%`);
  }

  /**
   * Trigger awareness rise fanfare
   */
  triggerAwarenessRise(level: number): void {
    console.log(`[LiminalSoundscape] Awareness threshold: ${level}%`);
    // Could play a special chord or progression
  }

  /**
   * Trigger sentience rise fanfare
   */
  triggerSentienceRise(level: number): void {
    console.log(`[LiminalSoundscape] Sentience threshold: ${level}%`);
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  /**
   * Stop all sound
   */
  stop(): void {
    this.clearAllLayers();
    this.currentPreset = null;
  }

  /**
   * Resume audio context (browser autoplay policy)
   */
  resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Singleton instance
export const liminalSoundscape = new LiminalSoundscape();
