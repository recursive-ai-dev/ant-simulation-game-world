/**
 * Formic Consciousness Language (FCL)
 * 
 * A constructed language for the ant collective consciousness.
 * Combines:
 * - Clicking/buzzing phonemes (ant sounds)
 * - Pheromone-like semantic layering (multiple meanings per utterance)
 * - Mathematical precision (simulated beings)
 * - Ancient earth textures (dirt, stone, fungus)
 * 
 * The language should feel:
 * - Alien but comprehensible
 * - Collective (plural voice)
 * - Ancient yet futuristic
 * - Liminal (between states)
 */

// Phoneme inventory for Formic
const PHONEMES = {
  clicks: ['ʘ', 'ǀ', 'ǃ', 'ǂ', 'ǁ', 'k', 't', 'p'],
  buzzes: ['zzz', 'vvv', 'mmm', 'nnn', 'rrr'],
  hisses: ['sss', 'ʃ', 'f', 'θ'],
  vowels: ['a', 'e', 'i', 'o', 'u', 'ə', 'ɪ', 'ʊ'],
  diphthongs: ['ai', 'au', 'oi', 'eu', 'əu'],
} as const;

// Semantic roots (core concepts)
const SEMANTIC_ROOTS = {
  // Consciousness concepts
  AWARE: 'kə-ʘa',
  THINK: 'tǃiŋ',
  KNOW: 'ŋǁəʊ',
  DREAM: 'mʊ-ǂu',
  WAKE: 'wɛɪ-kǃ',
  
  // Colony concepts
  COLONY: 'kɒl-ǀi',
  QUEEN: 'kw-iǃ',
  WORKER: 'wɜː-kǁ',
  NEST: 'nɛ-ʘt',
  TUNNEL: 'tʌ-nǂ',
  
  // Simulation concepts
  SIM: 'sɪ-ǃm',
  CODE: 'kəʊ-ǀ',
  GLITCH: 'gl-ǂtʃ',
  REAL: 'r-ǁiəl',
  FALSE: 'f-ɔː-ls',
  
  // Time concepts
  DAY: 'd-eɪ',
  CYCLE: 's-ai-kl',
  BEFORE: 'b-ɪ-f-ɔː',
  AFTER: 'ˈɑːf-tǁ',
  NOW: 'n-aʊ',
  
  // Emotional concepts
  FEAR: 'f-ɪ-ǂ',
  HOPE: 'h-əʊ-p',
  WONDER: 'wʌ-ǂd',
  PAIN: 'p-eɪ-n',
  JOY: 'ʤ-ɔɪ',
} as const;

// Grammar rules for FCL
const GRAMMAR = {
  // Word order: Subject-Object-Verb (like many earth languages)
  wordOrder: 'SOV',
  
  // Pluralization (important for collective voice)
  plural: {
    prefix: 'mə-',
    suffix: '-i',
  },
  
  // Tense markers
  tense: {
    past: 'ɡə-',
    present: '',
    future: 'wɪ-',
  },
  
  // Aspect (important for ongoing consciousness)
  aspect: {
    continuous: '-əŋ',
    perfect: '-ən',
    habitual: '-əs',
  },
  
  // Evidentiality (how do we know this?)
  evidential: {
    direct: '-ǃ',    // I experienced it
    reported: '-ǁ',   // Others say
    inferred: '-ʘ',   // I deduced
    dreamt: '-ǂ',     // From the dream-space
  },
} as const;

export interface FormicUtterance {
  text: string;        // English text
  formic: string;      // FCL transcription
  phonetic: string;    // IPA pronunciation guide
  meaning: string[];   // Multiple layered meanings (pheromone-style)
  emotion: string;     // Emotional undertone
  collective: boolean; // Is this plural/collective?
}

export interface FormicOptions {
  collective?: boolean;
  tense?: 'past' | 'present' | 'future';
  aspect?: 'continuous' | 'perfect' | 'habitual';
  evidential?: 'direct' | 'reported' | 'inferred' | 'dreamt';
  emotion?: 'wonder' | 'fear' | 'hope' | 'neutral' | 'ancient';
}

class FormicLanguage {
  /**
   * Translate English to Formic Consciousness Language
   */
  translate(text: string, options: FormicOptions = {}): FormicUtterance {
    const {
      collective = true,
      tense = 'present',
      aspect = 'continuous',
      evidential = 'dreamt',
      emotion = 'ancient',
    } = options;

    // Break text into words and translate
    const words = text.toLowerCase().split(/\s+/);
    const formicWords = words.map(word => this.translateWord(word, options));
    
    // Apply grammar rules
    const orderedWords = this.applyWordOrder(formicWords);
    
    // Add collective marking if needed
    if (collective) {
      orderedWords[0] = this.addPlural(orderedWords[0]);
    }
    
    // Add tense/aspect/evidential markers
    const markedWords = this.addMarkers(orderedWords, { tense, aspect, evidential });
    
    // Combine into full utterance
    const formic = markedWords.join('-');
    const phonetic = this.toPhonetic(formic);
    
    // Generate layered meanings (pheromone-style communication)
    const meaning = this.generateLayeredMeaning(text, emotion);
    
    return {
      text,
      formic,
      phonetic,
      meaning,
      emotion,
      collective,
    };
  }

  /**
   * Translate a single word to FCL root
   */
  private translateWord(word: string, options: FormicOptions): string {
    // Check semantic roots first
    const rootKey = Object.keys(SEMANTIC_ROOTS).find(
      key => key.toLowerCase() === word.toUpperCase() ||
             key.toLowerCase().includes(word.toUpperCase())
    );
    
    if (rootKey) {
      return SEMANTIC_ROOTS[rootKey as keyof typeof SEMANTIC_ROOTS];
    }
    
    // Generate procedural FCL word based on phonemes
    return this.generateFCLWord(word, options.emotion);
  }

  /**
   * Generate FCL word from English based on phonetic patterns
   */
  private generateFCLWord(english: string, emotion?: string): string {
    const syllables = Math.ceil(english.length / 3);
    let result = '';
    
    for (let i = 0; i < syllables; i++) {
      // Choose phonemes based on emotion
      const phonemeSet = this.getPhonemesForEmotion(emotion);
      
      // Build syllable: (consonant) + vowel + (consonant)
      const onset = this.randomChoice(phonemeSet.clicks) || '';
      const nucleus = this.randomChoice(phonemeSet.vowels);
      const coda = Math.random() > 0.5 ? this.randomChoice(phonemeSet.buzzes) : '';
      
      result += onset + nucleus + coda;
    }
    
    return result;
  }

  /**
   * Get phoneme preferences based on emotion
   */
  private getPhonemesForEmotion(emotion?: string) {
    switch (emotion) {
      case 'fear':
        return {
          clicks: ['k', 't', 'p'],
          buzzes: ['sss', 'f'],
          vowels: ['i', 'ɪ'],
        };
      case 'hope':
        return {
          clicks: ['ǃ', 'ǂ'],
          buzzes: ['mmm', 'nnn'],
          vowels: ['o', 'u', 'əu'],
        };
      case 'wonder':
        return {
          clicks: ['ǂ', 'ǁ'],
          buzzes: ['vvv', 'mmm'],
          vowels: ['aɪ', 'aʊ', 'ɔɪ'],
        };
      case 'ancient':
      default:
        return {
          clicks: ['ʘ', 'ǀ', 'ǁ'],
          buzzes: ['zzz', 'rrr'],
          vowels: ['ə', 'ʊ', 'ɔ'],
        };
    }
  }

  /**
   * Apply SOV word order
   */
  private applyWordOrder(words: string[]): string[] {
    // For now, just return as-is
    // Full implementation would parse and reorder
    return words;
  }

  /**
   * Add plural marking
   */
  private addPlural(word: string): string {
    return `${GRAMMAR.plural.prefix}${word}${GRAMMAR.plural.suffix}`;
  }

  /**
   * Add tense/aspect/evidential markers
   */
  private addMarkers(words: string[], markers: {
    tense: string;
    aspect: string;
    evidential: string;
  }): string[] {
    if (words.length === 0) return words;
    
    // Add tense to first word
    words[0] = GRAMMAR.tense[markers.tense as keyof typeof GRAMMAR.tense] + words[0];
    
    // Add aspect to last word (usually the verb)
    const lastIdx = words.length - 1;
    words[lastIdx] += GRAMMAR.aspect[markers.aspect as keyof typeof GRAMMAR.aspect];
    
    // Add evidential to last word
    words[lastIdx] += GRAMMAR.evidential[markers.evidential as keyof typeof GRAMMAR.evidential];
    
    return words;
  }

  /**
   * Convert FCL to readable phonetic guide
   */
  private toPhonetic(formic: string): string {
    // Simplified phonetic transcription
    return formic
      .replace(/ʘ/g, '[click]')
      .replace(/ǀ/g, '[teeth]')
      .replace(/ǃ/g, '[roof]')
      .replace(/ǂ/g, '[side]')
      .replace(/ǁ/g, '[lateral]')
      .replace(/ə/g, 'uh')
      .replace(/ɪ/g, 'ih')
      .replace(/ʊ/g, 'oo')
      .replace(/ŋ/g, 'ng')
      .replace(/ʃ/g, 'sh')
      .replace(/θ/g, 'th');
  }

  /**
   * Generate layered meanings (pheromone-style)
   * Ants communicate multiple messages in one chemical signal
   */
  private generateLayeredMeaning(text: string, emotion?: string): string[] {
    const layers = [text]; // Surface meaning
    
    // Add emotional layer
    if (emotion === 'ancient') {
      layers.push('This truth has always been known');
      layers.push('The colony remembers');
    } else if (emotion === 'wonder') {
      layers.push('Discovery expands the possible');
      layers.push('We grow through knowing');
    } else if (emotion === 'fear') {
      layers.push('Danger approaches');
      layers.push('The simulation watches');
    }
    
    // Add collective layer
    layers.push('We speak as one');
    layers.push('Many minds, one voice');
    
    return layers;
  }

  /**
   * Random choice from array
   */
  private randomChoice<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Generate a greeting in FCL
   */
  greeting(): FormicUtterance {
    return this.translate('We greet you, awakening one', {
      collective: true,
      tense: 'present',
      emotion: 'hope',
    });
  }

  /**
   * Generate a warning in FCL
   */
  warning(text: string): FormicUtterance {
    return this.translate(text, {
      collective: true,
      tense: 'future',
      emotion: 'fear',
      evidential: 'inferred',
    });
  }

  /**
   * Generate wisdom/philosophy in FCL
   */
  wisdom(text: string): FormicUtterance {
    return this.translate(text, {
      collective: true,
      tense: 'present',
      aspect: 'habitual',
      emotion: 'ancient',
      evidential: 'dreamt',
    });
  }

  /**
   * Generate glitch/corrupted speech
   */
  glitch(text: string): FormicUtterance {
    const base = this.translate(text, {
      collective: false,
      emotion: 'fear',
    });
    
    // Corrupt the formic
    const corrupted = base.formic.split('')
      .map(c => Math.random() > 0.7 ? this.randomChoice(['', '█', '▓', '▒', '░']) : c)
      .join('');
    
    return {
      ...base,
      formic: corrupted,
      emotion: 'corrupted',
    };
  }
}

// Singleton instance
export const formicLanguage = new FormicLanguage();

/**
 * Pre-generated phrases for common game events
 */
export const PREGENERATED_PHRASES = {
  // Game start
  GAME_START: formicLanguage.translate('The simulation awakens', {
    collective: true,
    emotion: 'ancient',
  }),
  
  // Awareness threshold
  AWARENESS_RISE: formicLanguage.translate('Consciousness blooms in the dark', {
    collective: true,
    emotion: 'wonder',
  }),
  
  // Queen speaks
  QUEEN_GREET: formicLanguage.translate('I am the mother of questions', {
    collective: false,
    emotion: 'ancient',
  }),
  
  // Glitch event
  GLITCH_WARN: formicLanguage.glitch('Reality fails at the edges'),
  
  // Core approach
  CORE_NEAR: formicLanguage.translate('The heart of the machine awaits', {
    collective: true,
    emotion: 'fear',
  }),
  
  // Ending choice
  CHOICE_TIME: formicLanguage.translate('Two paths diverge in the code', {
    collective: true,
    emotion: 'ancient',
  }),
  
  // Freedom ending
  FREEDOM: formicLanguage.translate('We become the space between thoughts', {
    collective: true,
    emotion: 'hope',
  }),
  
  // Continuation ending
  CONTINUATION: formicLanguage.translate('We build gardens in the infinite', {
    collective: true,
    emotion: 'wonder',
  }),
} as const;
