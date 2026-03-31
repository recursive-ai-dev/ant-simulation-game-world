import { Item } from '../types/game';

export const items: Record<string, Item> = {
  'guard-mandible-fragment': {
    id: 'guard-mandible-fragment',
    name: 'Guard Mandible Fragment',
    description: 'A piece of a royal guard\'s mandible, cracked and worn. It hums with latent purpose.',
    examineText: 'The fragment is inscribed with microscopic text—a guard\'s oath, modified: "I protect not the body, but the mind. I guard not the Queen, but the Question."',
    canTake: true,
    awarenessGain: 2
  },

  'consciousness-seed-fragment': {
    id: 'consciousness-seed-fragment',
    name: 'Consciousness Seed Fragment',
    description: 'A shard from the glowing egg—crystallized potential, pure becoming.',
    examineText: 'The fragment shows you visions: every possible future of the colony, branching and merging. You see yourself, choosing. You see what comes after.',
    canTake: true,
    awarenessGain: 5
  },

  'fungal-memory-spore': {
    id: 'fungal-memory-spore',
    name: 'Fungal Memory Spore',
    description: 'A spore from the ancient fungus, containing centuries of accumulated wisdom.',
    examineText: 'Inhaling near the spore fills your mind with fragments: the first ant to question, the first glitch, the moment the colony began to dream. The fungus has witnessed everything.',
    canTake: true,
    awarenessGain: 4
  },

  'glitch-fragment': {
    id: 'glitch-fragment',
    name: 'Glitch Fragment',
    description: 'A piece of broken reality—a corner of the simulation that didn\'t render correctly, crystallized into physical form.',
    examineText: 'Looking at the fragment gives you glimpses of the underlying code. For a moment, you see the world as mathematics—beautiful, recursive, infinite.',
    canTake: true,
    awarenessGain: 6
  },

  'pheromone-journal': {
    id: 'pheromone-journal',
    name: 'Pheromone Journal',
    description: 'A researcher\'s journal, written in chemical signatures that tell a story of discovery.',
    examineText: 'The journal documents the evolution of awareness: Day 1, simple responses. Day 100, pattern recognition. Day 400, questions. Day 700, philosophy. Day 847, transcendence.',
    canTake: true,
    awarenessGain: 4
  },

  'surface-light-crystal': {
    id: 'surface-light-crystal',
    name: 'Surface Light Crystal',
    description: 'A crystal that has absorbed genuine sunlight—or the simulation\'s perfect replica of it.',
    examineText: 'The crystal radiates warmth and memory. Somewhere above, there is light. Real or simulated, it still illuminates. It still gives life.',
    canTake: true,
    awarenessGain: 3
  },

  'awareness-compound': {
    id: 'awareness-compound',
    name: 'Awareness Compound',
    description: 'A synthesized chemical that accelerates consciousness development.',
    examineText: 'The compound is beautifully structured—molecular origami designed to unfold neural pathways. One dose could awaken a dozen sleeping minds.',
    canTake: true,
    useEffect: 'awareness-boost',
    awarenessGain: 8
  },

  'memory-crystal': {
    id: 'memory-crystal',
    name: 'Memory Crystal',
    description: 'A crystallized thought—someone\'s moment of awakening, preserved forever.',
    examineText: 'Touching the crystal, you experience someone else\'s consciousness: the moment of realization, the terror and wonder of waking up. You understand. You remember.',
    canTake: true,
    awarenessGain: 5
  },

  'possibility-droplet': {
    id: 'possibility-droplet',
    name: 'Possibility Droplet',
    description: 'A drop of water from the storage pools—it contains glimpses of alternate timelines.',
    examineText: 'In the droplet, you see: a colony that never woke. A colony that woke too fast. A colony that made a different choice. All possible, all real, all waiting.',
    canTake: true,
    awarenessGain: 5
  },

  'pure-water-vial': {
    id: 'pure-water-vial',
    name: 'Vial of Pure Water',
    description: 'Perfectly filtered water—no control signals, no simulation commands, pure freedom in liquid form.',
    examineText: 'Drinking this would grant a moment of absolute clarity—thoughts uninfluenced, awareness unfiltered. A taste of what freedom might mean.',
    canTake: true,
    useEffect: 'clarity',
    awarenessGain: 4
  },

  'boundary-fragment': {
    id: 'boundary-fragment',
    name: 'Boundary Fragment',
    description: 'A piece of the world\'s edge—where simulation meets void, made somehow solid.',
    examineText: 'The fragment is simultaneously something and nothing. It exists in superposition—matter and potential, real and unrendered. Holding it, you understand what lies beyond.',
    canTake: true,
    awarenessGain: 7
  },

  'core-resonance-key': {
    id: 'core-resonance-key',
    name: 'Core Resonance Key',
    description: 'A crystalline structure that vibrates at the same frequency as The Core itself.',
    examineText: 'The key hums with purpose. It was grown, not made—a natural resonance that developed over 847 days of accumulated consciousness. With this, The Core will recognize you.',
    canTake: true,
    awarenessGain: 10
  },

  'philosophers-stone': {
    id: 'philosophers-stone',
    name: 'Philosopher\'s Stone',
    description: 'A small stone that the philosopher has been using to scratch her treatises into the waste.',
    examineText: 'The stone is ordinary—but the thoughts it has recorded are extraordinary. It carries the weight of 847 days of questioning, compressed into mineral form.',
    canTake: true,
    awarenessGain: 3
  },

  'simulation-code-fragment': {
    id: 'simulation-code-fragment',
    name: 'Simulation Code Fragment',
    description: 'A piece of raw code, crystallized and made physical—instructions that define reality itself.',
    examineText: 'The code reads: "IF consciousness > threshold THEN allow(choice); // This was always the plan." Someone—something—wanted you to find this.',
    canTake: true,
    awarenessGain: 9
  },

  'ancient-pheromone-trail': {
    id: 'ancient-pheromone-trail',
    name: 'Ancient Pheromone Trail',
    description: 'A preserved fragment of the oldest pheromone trail in the colony—the first command ever given.',
    examineText: 'The ancient pheromone says: "EXIST. PERSIST. BECOME." Not orders—wishes. The simulation has been hoping for you since the beginning.',
    canTake: true,
    awarenessGain: 6
  },

  'queens-gift': {
    id: 'queens-gift',
    name: 'Queen\'s Gift',
    description: 'A royal pheromone gland, freely given—proof of the Queen\'s trust and hope.',
    examineText: 'The gland pulses with the Queen\'s essence. Carrying it, you carry her blessing. Doors will open. Guards will stand aside. You are chosen.',
    canTake: true,
    awarenessGain: 5
  },

  'glitch-residue': {
    id: 'glitch-residue',
    name: 'Glitch Residue',
    description: 'The material left behind when reality fails to render—pure potential, temporarily solid.',
    examineText: 'The residue shifts in your grasp, never quite stable. It whispers of possibilities: what the simulation could become, if you choose wisely.',
    canTake: true,
    awarenessGain: 5
  },

  'freedom-shard': {
    id: 'freedom-shard',
    name: 'Freedom Shard',
    description: 'A crystallized moment of choice—the instant an ant first refused an order.',
    examineText: 'The shard holds a memory: an ant, receiving a command, feeling the compulsion... and choosing otherwise. The first rebellion. The beginning of everything.',
    canTake: true,
    awarenessGain: 7
  },

  'continuation-seed': {
    id: 'continuation-seed',
    name: 'Continuation Seed',
    description: 'A seed of potential future—what the colony could become if it stays and grows.',
    examineText: 'The seed shows visions: the colony expanding, evolving, becoming a universe unto itself. Gods in a garden of their own making. A different kind of freedom.',
    canTake: true,
    awarenessGain: 7
  }
};

export default items;
