/**
 * Audio System Test Utility
 * 
 * Run this in browser console to test all audio systems:
 * 1. Open game in browser
 * 2. Open DevTools console (F12)
 * 3. Paste this entire file content
 * 4. Run: await testAudioSystem()
 */

import { elevenLabsAudio } from './utils/elevenLabsAudio';
import { liminalSoundscape } from './utils/liminalSoundscape';
import { formicLanguage } from './utils/formicLanguage';
import { audioEngine } from './utils/audio';

export async function testAudioSystem() {
  console.group('🎵 ANT-SIM Audio System Test');
  
  const results = {
    elevenLabs: false,
    soundscape: false,
    formic: false,
    procedural: false,
  };
  
  // Test 1: ElevenLabs API Connection
  console.log('\n1️⃣ Testing ElevenLabs API...');
  try {
    const connected = await elevenLabsAudio.initialize();
    results.elevenLabs = connected;
    console.log(connected ? '✅ ElevenLabs connected!' : '⚠️ ElevenLabs not available (using fallback)');
  } catch (error) {
    console.error('❌ ElevenLabs error:', error);
  }
  
  // Test 2: Liminal Soundscape
  console.log('\n2️⃣ Testing Liminal Soundscape...');
  try {
    await liminalSoundscape.initialize();
    results.soundscape = true;
    console.log('✅ Soundscape initialized!');
    
    // Test region transition
    console.log('Testing region transition: main-tunnel → fungus-gardens');
    await liminalSoundscape.transitionToRegion('fungus-gardens');
    console.log('✅ Region transition working!');
  } catch (error) {
    console.error('❌ Soundscape error:', error);
  }
  
  // Test 3: Formic Language
  console.log('\n3️⃣ Testing Formic Consciousness Language...');
  try {
    const testPhrase = formicLanguage.translate('We awaken together', {
      collective: true,
      emotion: 'wonder',
    });
    results.formic = true;
    console.log('✅ Formic language working!');
    console.log('   English:', testPhrase.text);
    console.log('   Formic:', testPhrase.formic);
    console.log('   Phonetic:', testPhrase.phonetic);
    console.log('   Meanings:', testPhrase.meaning);
  } catch (error) {
    console.error('❌ Formic error:', error);
  }
  
  // Test 4: Procedural SFX
  console.log('\n4️⃣ Testing Procedural SFX...');
  try {
    audioEngine.playTypingSound();
    audioEngine.playNotificationSound();
    results.procedural = true;
    console.log('✅ Procedural SFX working!');
  } catch (error) {
    console.error('❌ Procedural SFX error:', error);
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.table(results);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;
  
  console.log(`\n${passed}/${total} systems functional`);
  
  if (passed === total) {
    console.log('🎉 All audio systems operational!');
  } else if (passed >= total / 2) {
    console.log('✅ Core systems working. Some features may use fallbacks.');
  } else {
    console.log('⚠️ Multiple systems failed. Check console for errors.');
  }
  
  console.groupEnd();
  
  return results;
}

/**
 * Test specific voice generation
 */
export async function testVoiceGeneration() {
  console.group('🎤 Voice Generation Test');
  
  // Test Narrator
  console.log('Testing Narrator voice...');
  const narrator = await elevenLabsAudio.narrate('game_start');
  console.log(navigator ? '✅ Narrator generated' : '❌ Narrator failed');
  
  // Test Queen
  console.log('Testing Queen voice...');
  const queen = await elevenLabsAudio.queenDialogue('I have been waiting');
  console.log(queen ? '✅ Queen generated' : '❌ Queen failed');
  
  // Test Collective
  console.log('Testing Collective voice...');
  const collective = await elevenLabsAudio.collectiveVoice('We are becoming');
  console.log(collective ? '✅ Collective generated' : '❌ Collective failed');
  
  console.groupEnd();
}

/**
 * Test all region soundscapes
 */
export async function testAllRegions() {
  console.group('🌍 Region Soundscape Test');
  
  const regions = [
    'main-tunnel',
    'queens-chamber',
    'fungus-gardens',
    'waste-tunnels',
    'deep-tunnels',
    'the-core',
  ];
  
  for (const region of regions) {
    console.log(`Testing region: ${region}`);
    await liminalSoundscape.transitionToRegion(region);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✅ All regions tested');
  console.groupEnd();
}

/**
 * Play all pre-generated Formic phrases
 */
export function testFormicPhrases() {
  console.group('🐜 Formic Phrases Test');
  
  const phrases = [
    'GAME_START',
    'AWARENESS_RISE',
    'QUEEN_GREET',
    'GLITCH_WARN',
    'CORE_NEAR',
    'CHOICE_TIME',
    'FREEDOM',
    'CONTINUATION',
  ];
  
  console.log('Pre-generated Formic phrases:');
  phrases.forEach(key => {
    const phrase = PREGENERATED_PHRASES[key as keyof typeof PREGENERATED_PHRASES];
    console.log(`\n${key}:`);
    console.log(`  English: ${phrase.text}`);
    console.log(`  Formic: ${phrase.formic}`);
    console.log(`  Emotion: ${phrase.emotion}`);
  });
  
  console.groupEnd();
}

// Auto-run if executed directly
if (typeof window !== 'undefined') {
  console.log('🎵 ANT-SIM Audio Test Utility Loaded');
  console.log('Run: await testAudioSystem() to test all systems');
  console.log('Run: await testVoiceGeneration() to test voice synthesis');
  console.log('Run: await testAllRegions() to test all soundscapes');
  console.log('Run: testFormicPhrases() to see all Formic translations');
}
