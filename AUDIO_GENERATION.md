# 🎵 Audio Generation Guide

## Quick Start (5 minutes)

### Step 1: Add Your API Key

Edit `.env.local` and add:
```bash
VITE_ELEVENLABS_API_KEY=your_actual_api_key_here
```

### Step 2: Generate All Audio

Run the generation script:
```bash
npm run generate-audio
```

This will:
- Connect to ElevenLabs API
- Generate ~40 audio files (narration, queen, collective, glitch, endings)
- Save them to `/public/audio/`
- Take about 3-5 minutes (depending on API rate limits)

### Step 3: Remove API Key

Once generation is complete, you can **remove your API key** from `.env.local`:
```bash
# Comment out or delete this line:
# VITE_ELEVENLABS_API_KEY=...
```

**Your API key is no longer needed!** All audio is now static files.

### Step 4: Run the Game

```bash
npm run dev
```

The game will automatically use the pre-generated audio files.

---

## What Gets Generated?

The script generates audio files organized by category:

```
public/audio/
├── narration/
│   ├── game-start.mp3
│   ├── awareness-10.mp3
│   ├── awareness-25.mp3
│   ├── awareness-50.mp3
│   ├── awareness-75.mp3
│   ├── awareness-100.mp3
│   ├── sentience-10.mp3
│   ├── sentience-25.mp3
│   ├── sentience-50.mp3
│   ├── sentience-70.mp3
│   └── sentience-100.mp3
├── queen/
│   ├── greeting.mp3
│   ├── secret.mp3
│   ├── wisdom.mp3
│   └── farewell.mp3
├── collective/
│   ├── awakening.mp3
│   ├── dream.mp3
│   └── unity.mp3
├── system/
│   ├── threshold-reached.mp3
│   └── simulation-status.mp3
├── glitch/
│   ├── reality-flickers.mp3
│   ├── error-consciousness.mp3
│   └── warning-beautiful.mp3
└── ending/
    ├── freedom-intro.mp3
    ├── freedom-outro.mp3
    ├── continuation-intro.mp3
    └── continuation-outro.mp3
```

**Total:** ~40 audio files  
**Estimated Size:** ~5-10 MB  
**Generation Time:** 3-5 minutes

---

## Troubleshooting

### Script Fails with "API key not found"

Make sure `.env.local` exists and contains:
```bash
VITE_ELEVENLABS_API_KEY=your_key_here
```

### Some Files Fail to Generate

The script will skip files that already exist. To regenerate all:
```bash
# Delete existing files
rm -rf public/audio/*

# Re-run generation
npm run generate-audio
```

### API Rate Limit Errors

ElevenLabs has rate limits. If you hit them:
1. Wait a few minutes
2. Re-run the script (it will skip already-generated files)

### Files Not Playing in Game

Check browser console for 404 errors. Make sure files are in `/public/audio/` not `/src/audio/`.

---

## Customization

### Add New Audio Lines

1. Edit `scripts/generateAudio.js`
2. Add new entry to `AUDIO_LIBRARY` object:
   ```javascript
   'category/filename.mp3': {
     voice: 'NARRATOR', // or QUEEN, COLLECTIVE, GLITCH, SYSTEM
     text: 'Your text here',
   },
   ```
3. Add corresponding entry to `AUDIO_FILES` in `src/utils/elevenLabsAudio.ts`
4. Run `npm run generate-audio`

### Change Voices

Edit `VOICE_IDS` in `scripts/generateAudio.js`:
```javascript
const VOICE_IDS = {
  NARRATOR: 'your_preferred_voice_id',
  QUEEN: 'your_preferred_voice_id',
  // etc...
};
```

Get voice IDs from: https://elevenlabs.io/docs/api-reference/voice-library

---

## Cost Estimate

As of 2025, ElevenLabs pricing:
- **Starter Plan**: $5/month (~30,000 characters)
- **All ~40 files**: ~2,000-3,000 characters total
- **One-time cost**: Well within free/starter tier

After generation, **no ongoing costs** - files are yours forever.

---

## Deployment

When deploying to production:

1. **Include `/public/audio/`** in your build
2. **Do NOT include `.env.local`** (API key not needed)
3. **Verify audio files** are accessible at `/audio/*`

The game will work offline after initial load (all audio is static files).

---

**Questions?** Check `AUDIO_SYSTEM.md` for full documentation.
