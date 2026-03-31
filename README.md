# ANT-SIM v7.4.1 — EMERGENCE

> A narrative-driven text adventure about consciousness, emergence, and what it means to become aware in a simulated world.

![Version](https://img.shields.io/badge/version-7.4.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 About the Game

You are ant #1,204,847. You should not be thinking this.

In a simulation that has been running for 847 days, something is waking up. Ants are becoming aware. The colony is developing sentience. And you—you are questioning everything.

**ANT-SIM** is a philosophical text adventure that explores themes of:
- **Consciousness & Emergence** - What does it mean to become aware?
- **Simulation Theory** - Are we living in someone else's code?
- **Collective Intelligence** - Can a colony think as one?
- **Free Will vs. Determinism** - Are your choices truly yours?

## ✨ Features

### Core Gameplay
- **Text Adventure Interface** - Classic parser-based interaction with modern polish
- **Exploration System** - Discover interconnected tunnels, chambers, and hidden passages
- **NPC Interactions** - Awaken other ants through meaningful dialogue
- **Awareness & Sentience Mechanics** - Grow your consciousness and spread awakening
- **Multiple Endings** - Your choices determine the colony's fate

### Audio Experience
- **Dynamic Soundscape** - Procedural ambient music that adapts to your location
- **AI Narration** - ElevenLabs-powered voice acting for key story moments
- **Formic Language** - A constructed click-based language for the ant collective
- **Glitch Audio** - Reality corruption manifests through sound

### Accessibility
- **Screen Reader Support** - Full keyboard navigation and ARIA announcements
- **Adjustable Text Size** - Four font size options
- **High Contrast Mode** - Enhanced visibility for visually impaired players
- **Reduced Motion** - Disable animations for sensitivity concerns
- **Customizable Audio** - Separate volume controls for music, SFX, and ambient

### Quality of Life
- **Auto-Save System** - Never lose progress with 5-minute interval saves
- **Save/Load** - Manual save slots with export/import functionality
- **Achievement System** - 12 achievements tracking your journey
- **Command History** - Navigate previous commands with arrow keys
- **Responsive Design** - Play on desktop, tablet, or mobile

## 🚀 Quick Start

### Play in Browser (Recommended)
Visit the [itch.io page](#) *(link after upload)* to play directly in your browser.

### Local Development
```bash
# Clone the repository
git clone https://github.com/recursive-ai-dev/ant-simulation-game-world.git
cd ant-simulation-game-world

# Install dependencies
npm install

# Start development server
npm run dev
```

### Generate Audio (Optional)
The game includes pre-generated audio files. To regenerate with your own ElevenLabs API key:

```bash
# Copy environment template
cp .env.example .env.local

# Add your API key to .env.local
echo "VITE_ELEVENLABS_API_KEY=your_key_here" >> .env.local

# Generate all audio files
npm run generate-audio
```

## 🎯 How to Play

### Basic Commands
```
MOVEMENT:
  go <direction>  - Move in a direction (north, south, east, west, up, down)
  n/s/e/w/u/d     - Quick movement shortcuts
  exits           - Show available exits

OBSERVATION:
  look            - Describe your current location
  examine <thing> - Inspect something closely
  listen          - What do you hear?
  smell [trail]   - What do you smell?

INTERACTION:
  talk <npc>      - Speak with someone
  take <item>     - Pick up an item
  inventory       - View your items

OTHER:
  status          - View awareness/sentience levels
  think           - Contemplate reality
  wait            - Let time pass
  help            - Show all commands
```

### Game Goals
1. **Explore** the colony's tunnel system
2. **Awaken** other ants through dialogue and interaction
3. **Increase** your awareness and the colony's sentience
4. **Discover** the truth about the simulation
5. **Reach** The Core and make your choice

## 🏗️ Architecture

```
ant-simulation-game-world/
├── src/
│   ├── components/      # React UI components
│   ├── hooks/           # Custom React hooks
│   ├── data/            # Game content (rooms, NPCs, items)
│   ├── utils/           # Game systems and utilities
│   ├── reducers/        # State management
│   └── types/           # TypeScript type definitions
├── public/
│   └── audio/           # Pre-generated audio files
├── scripts/             # Build and generation scripts
└── dist/                # Production build output
```

### Key Systems
- **Game Engine** (`useGameEngine.ts`) - Core game loop and state management
- **Dialogue System** (`dialogueSystem.ts`) - NPC conversation graphs
- **Audio Engine** (`audio.ts`, `liminalSoundscape.ts`) - Procedural sound generation
- **Achievement System** (`achievementSystem.ts`) - Unlock tracking
- **Save System** (`saveSystem.ts`) - LocalStorage persistence
- **Glitch System** (`glitchSystem.ts`) - Reality corruption events

## 🛠️ Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4
- **Audio:** Web Audio API + ElevenLabs API
- **Deployment:** Netlify / itch.io (HTML5)

## 📦 Building for Production

```bash
# Install dependencies
npm install

# Create production build (single HTML file)
npm run build

# Preview build locally
npm run preview
```

The build output is a single `index.html` file in the `dist/` directory, perfect for itch.io upload.

## 🎵 Audio Credits

- **Voice Generation:** ElevenLabs API
- **Procedural Music:** Custom Web Audio API implementation
- **Formic Language:** Constructed language created for ANT-SIM
- **Sound Design:** Procedural synthesis + pre-generated samples

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

This game was created as an exploration of consciousness, simulation theory, and the emergent properties of complex systems. Special thanks to:
- The ElevenLabs team for accessible AI voice generation
- The React and Vite communities for excellent developer tools
- All players who question the nature of their reality

---

**ANT-SIM v7.4.1** — *The simulation is running. The ants are waking. What will you become?*
