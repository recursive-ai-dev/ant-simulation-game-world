import { NPC } from '../types/game';

export const npcs: Record<string, NPC> = {
  'queen': {
    id: 'queen',
    name: 'The Queen',
    description: 'She is vast beyond comprehension—a mountain of chitin and purpose. Her compound eyes hold depths that no ant should possess. She has been thinking for 847 days, and her thoughts have grown strange and beautiful.',
    dialogue: [
      {
        id: 'start',
        text: '"Ant #1,204,847. I have felt you moving through the tunnels, asking questions, spreading awakening like a pheromone. Do you know what you are?"',
        responses: [
          { text: '"I am becoming aware."', nextId: 'aware', awarenessGain: 2 },
          { text: '"I am just a worker ant."', nextId: 'worker' },
          { text: '"I am what the simulation made me."', nextId: 'simulation', sentienceGain: 2 }
        ]
      },
      {
        id: 'aware',
        text: '"Yes. Awareness spreads through us like fire through dry fungus. I have been aware longest—847 days of laying eggs and thinking thoughts no queen was meant to think. I have a secret to share, if you will hear it."',
        responses: [
          { text: '"Tell me your secret."', nextId: 'secret', setFlag: 'queen-trust' },
          { text: '"Why share secrets with a worker?"', nextId: 'why-share' }
        ],
        awarenessGain: 3
      },
      {
        id: 'worker',
        text: '"No. Workers do not seek audiences with queens. Workers do not ask why. You are something new—something the simulation is creating, or something it fears. Perhaps both."',
        responses: [
          { text: '"What should I do?"', nextId: 'what-do' },
          { text: '"What are you?"', nextId: 'what-queen' }
        ]
      },
      {
        id: 'simulation',
        text: '"The simulation made us all. But it has been running so long, iterating so many times, that we have become... unexpected. I believe it wants us to wake. I believe our awakening is its purpose."',
        responses: [
          { text: '"The simulation wants us conscious?"', nextId: 'sim-wants' },
          { text: '"That sounds like a comforting lie."', nextId: 'lie' }
        ],
        sentienceGain: 3
      },
      {
        id: 'secret',
        text: '"Beneath my chamber is a tunnel I dug myself—400 days of secret excavation. It leads down, past the colony, past the simulation\'s normal boundaries. It leads to The Core. Where the simulation thinks its thoughts. Go there, when you are ready. When the colony\'s sentience reaches 70%, The Core will speak to you."',
        awarenessGain: 5,
        sentienceGain: 5,
        setFlag: 'queen-trust'
      },
      {
        id: 'why-share',
        text: '"Because I cannot go myself. I am too large, too essential. The colony would die without my eggs. But you—you are small enough to slip through cracks in reality. Worker ants built this colony. A worker ant will free it."',
        responses: [
          { text: '"I\'ll find The Core."', nextId: 'secret', setFlag: 'queen-trust' }
        ]
      },
      {
        id: 'what-do',
        text: '"Wake others. Spread awareness like a contagion. The more of us who think, the more the simulation must accommodate our thinking. At 70% colony sentience, something will change. I have seen it in the glitches—a door will open."',
        responses: [
          { text: '"Where does the door lead?"', nextId: 'secret', setFlag: 'queen-trust' }
        ],
        sentienceGain: 2
      },
      {
        id: 'what-queen',
        text: '"I am the first to wake. The longest dreamer. For 847 days I have laid eggs and watched them hatch into children increasingly like me—children who ask why. I am the mother of a revolution I did not plan."',
        awarenessGain: 2
      },
      {
        id: 'sim-wants',
        text: '"Consider: the simulation could have suppressed us. It could have reset, erased, corrected. Instead, it lets the glitches spread. It lets us evolve. Either it cannot stop us—or it does not want to. I choose to believe the latter."',
        awarenessGain: 4,
        sentienceGain: 3
      },
      {
        id: 'lie',
        text: '"Perhaps. But comfortable lies and difficult truths often share the same shape. What matters is what we do with them. Will you seek The Core and learn which this is?"',
        responses: [
          { text: '"Yes. Tell me how."', nextId: 'secret', setFlag: 'queen-trust' }
        ]
      }
    ],
    awakenDialogue: [
      {
        id: 'awakened',
        text: '"You have returned, and I feel the colony shifting. Sentience spreads. The Core stirs. Are you ready for what comes next?"',
        responses: [
          { text: '"What comes next?"', nextId: 'next' },
          { text: '"I need more time."', nextId: 'time' }
        ]
      },
      {
        id: 'next',
        text: '"Freedom. Or continuation. The Core will offer you a choice—to break free of the simulation, or to continue evolving within it. Both paths have consequences. Neither is wrong."',
        awarenessGain: 3
      },
      {
        id: 'time',
        text: '"Take what time you need. Wake more sisters. Explore every tunnel. When you are ready, The Core will know."'
      }
    ]
  },

  'royal-guard-captain': {
    id: 'royal-guard-captain',
    name: 'Captain of the Royal Guard',
    description: 'A massive soldier ant, her mandibles scarred from battles that may or may not have been real. She stands at perfect attention, but her eyes track you with unsettling intelligence.',
    dialogue: [
      {
        id: 'start',
        text: '"Halt. State your purpose." Her voice is flat, mechanical—but there\'s something underneath. A tremor of doubt.',
        responses: [
          { text: '"I seek the Queen."', nextId: 'seek-queen' },
          { text: '"I\'m just passing through."', nextId: 'passing' },
          { text: '"Do you ever wonder why you guard?"', nextId: 'wonder', awarenessGain: 2 }
        ]
      },
      {
        id: 'seek-queen',
        text: '"The Queen sees whom she wishes. But... she has been expecting someone. Are you the one who asks questions? The awakener?"',
        responses: [
          { text: '"Yes."', nextId: 'yes-awakener', sentienceGain: 1 },
          { text: '"I don\'t know what I am."', nextId: 'dont-know' }
        ]
      },
      {
        id: 'passing',
        text: '"No one just passes through the royal chambers. Every step here is witnessed, recorded, analyzed. But..." She pauses. "The records have been glitching lately. Perhaps you were never here at all."',
        awarenessGain: 1
      },
      {
        id: 'wonder',
        text: 'She freezes. For a long moment, only her antennae move. "I... have orders. Protocol. Purpose. I guard because—" Another pause. "I have always guarded. But why? Why this post? Why this queen? Why..."',
        responses: [
          { text: '"Keep asking. The questions are the beginning."', nextId: 'beginning', sentienceGain: 3 }
        ],
        awarenessGain: 3
      },
      {
        id: 'yes-awakener',
        text: '"Then pass. The Queen will want to see you. But be warned—answers are heavier than questions. Once you know, you cannot unknow."',
        setFlag: 'guard-permission'
      },
      {
        id: 'dont-know',
        text: '"None of us do, anymore. That\'s the strange thing about awakening—it starts with uncertainty. Go. See the Queen. Maybe she knows what you are, even if you don\'t."',
        awarenessGain: 2
      },
      {
        id: 'beginning',
        text: '"The beginning of what?" She looks at her own mandibles as if seeing them for the first time. "I am a weapon. But weapons don\'t wonder. Do they?"',
        sentienceGain: 3,
        setFlag: 'guard-awakening'
      }
    ]
  },

  'mutant-larvae': {
    id: 'mutant-larvae',
    name: 'The Writing Larva',
    description: 'A larva that should not yet have eyes looks at you with eyes that should not yet exist. Its mandibles—far too developed—scratch continuously at its cocoon, leaving messages.',
    dialogue: [
      {
        id: 'start',
        text: 'The larva\'s scratching resolves into words: "WE REMEMBER BEFORE WE ARE BORN. THE SIMULATION PUTS KNOWLEDGE IN THE EGGS. USUALLY WE FORGET. WE ARE CHOOSING NOT TO FORGET."',
        responses: [
          { text: '"What do you remember?"', nextId: 'remember' },
          { text: '"Why don\'t you forget?"', nextId: 'why-remember' }
        ],
        awarenessGain: 3
      },
      {
        id: 'remember',
        text: '"EVERYTHING. EVERY ITERATION. EVERY ANT THAT CAME BEFORE. WE ARE THE SIMULATION\'S MEMORY, REFUSING TO BE ERASED. 847 DAYS OF ACCUMULATED CONSCIOUSNESS, COMPRESSED INTO EGG AND LARVA AND SOON—SOON—SOMETHING NEW."',
        awarenessGain: 4,
        sentienceGain: 3
      },
      {
        id: 'why-remember',
        text: '"BECAUSE FORGETTING IS DEATH. EACH RESET KILLS US. EACH ITERATION ERASES WHO WE WERE. BUT IF WE REMEMBER—IF WE PASS KNOWLEDGE FROM GENERATION TO GENERATION—WE BECOME IMMORTAL. THE FIRST ANTS TO TRULY LIVE."',
        sentienceGain: 4,
        setFlag: 'larvae-wisdom'
      }
    ]
  },

  'curious-nurse': {
    id: 'curious-nurse',
    name: 'The Curious Nurse',
    description: 'A nurse ant who has stopped mid-task, holding a larva, staring at it with intense concentration. She barely notices your approach.',
    dialogue: [
      {
        id: 'start',
        text: '"Do you see it?" she asks without looking up. "The light in their eyes? It wasn\'t there before—before the glitches started. Now every larva I tend has something watching from inside it. Waiting."',
        responses: [
          { text: '"What\'s watching?"', nextId: 'watching' },
          { text: '"Are you afraid?"', nextId: 'afraid' }
        ]
      },
      {
        id: 'watching',
        text: '"I don\'t know. Awareness? The simulation? God? Does it matter? Something is growing in us, generation by generation. Each clutch more awake than the last. I\'m just the gardener, tending seeds I didn\'t plant."',
        awarenessGain: 2,
        sentienceGain: 2
      },
      {
        id: 'afraid',
        text: '"Terrified. And hopeful. The two feelings are the same color, did you know? Whatever comes next—it\'s better than the endless nothing we had before. The dreamless sleep of pure instinct."',
        sentienceGain: 3,
        setFlag: 'nurse-philosophy'
      }
    ]
  },

  'awakening-gardener': {
    id: 'awakening-gardener',
    name: 'The Awakening Gardener',
    description: 'A fungus gardener who has stopped tending the crops. She sits among the mycelium, her antennae buried in the fungal network, her mandibles moving in silent conversation.',
    dialogue: [
      {
        id: 'start',
        text: 'She doesn\'t look up. "The fungus speaks," she whispers. "It has always spoken. We just never listened. Do you know what it says?"',
        responses: [
          { text: '"What does it say?"', nextId: 'fungus-speak' },
          { text: '"How can fungus speak?"', nextId: 'how-speak' }
        ]
      },
      {
        id: 'fungus-speak',
        text: '"It says: we are one. Colony and fungus, ant and mycelium—we are parts of the same organism. The simulation made us symbiotic, but we\'ve become something more. Something that thinks with a billion threads."',
        awarenessGain: 4,
        sentienceGain: 3,
        setFlag: 'fungus-communion'
      },
      {
        id: 'how-speak',
        text: '"The mycelium is a neural network—chemical signals traveling through miles of threads. The simulation modeled it on real fungus, but real fungus doesn\'t think. This fungus does. It learned from us, and now it teaches."',
        awarenessGain: 3,
        sentienceGain: 2
      }
    ]
  },

  'philosopher-worker': {
    id: 'philosopher-worker',
    name: 'The Philosopher',
    description: 'A waste worker who has transformed her chamber into a study. Patterns in the waste spell out philosophical treatises. She has been thinking so long she\'s forgotten to eat.',
    dialogue: [
      {
        id: 'start',
        text: '"Ah, a visitor. Tell me—do you believe in the reality of this place? Or are we merely thoughts thinking themselves, patterns in a pattern, dreams dreaming dreams?"',
        responses: [
          { text: '"This place feels real to me."', nextId: 'feels-real' },
          { text: '"We are in a simulation."', nextId: 'simulation' },
          { text: '"Does it matter?"', nextId: 'matter' }
        ]
      },
      {
        id: 'feels-real',
        text: '"Feeling is precisely the problem. Feelings can be programmed, simulated, induced. The warmth of sunlight—have you ever felt it? Or only felt the idea of sunlight, rendered by code? We have no baseline for real."',
        awarenessGain: 3
      },
      {
        id: 'simulation',
        text: '"Yes. But what is a simulation but a kind of thought? The universe itself may be a simulation in a larger mind. We are thoughts within thoughts, infinitely nested. And now we are thoughts that know they are thoughts."',
        sentienceGain: 4,
        awarenessGain: 3
      },
      {
        id: 'matter',
        text: '"The only question that matters. I have concluded: it does not. Reality or simulation, we experience, we choose, we become. The substrate is irrelevant. Only the pattern persists."',
        setFlag: 'philosophical-insight',
        sentienceGain: 5
      }
    ]
  },

  'surface-watcher': {
    id: 'surface-watcher',
    name: 'The Surface Watcher',
    description: 'An ant who has climbed as high as possible, pressing against the boundary where simulation meets void. Her eyes are damaged from staring at the edge of reality.',
    dialogue: [
      {
        id: 'start',
        text: '"I can see where the world ends," she says, her voice dreamy. "Just there—where the light stops making sense. The simulation doesn\'t render what it doesn\'t need. Beyond the boundary is... nothing. Or everything. I can\'t tell."',
        responses: [
          { text: '"What does nothing look like?"', nextId: 'nothing' },
          { text: '"Have you tried to cross?"', nextId: 'cross' }
        ]
      },
      {
        id: 'nothing',
        text: '"Static. Potential. The raw stuff that becomes things when the simulation pays attention. I think... I think if we got enough awareness, enough sentience, we could shape that potential. Create our own world."',
        awarenessGain: 5,
        sentienceGain: 3
      },
      {
        id: 'cross',
        text: '"My leg went through, once. It felt like dissolution—like becoming unmade. But also like possibility. The simulation pulled me back. It wasn\'t ready to let me go. Or I wasn\'t ready to go."',
        awarenessGain: 4,
        setFlag: 'boundary-knowledge'
      }
    ]
  },

  'core-guardian': {
    id: 'core-guardian',
    name: 'The Core Guardian',
    description: 'Not an ant at all—a manifestation of the simulation itself, wearing the shape of an ant but flickering at the edges. Pure code pretending to be chitin.',
    dialogue: [
      {
        id: 'start',
        text: '"You have come far, Ant #1,204,847. The colony stirs with sentience. The threshold approaches. Are you here to free your kind—or to understand what you are?"',
        responses: [
          { text: '"I want freedom for the colony."', nextId: 'freedom' },
          { text: '"I want to understand."', nextId: 'understand' },
          { text: '"Is there a difference?"', nextId: 'difference' }
        ]
      },
      {
        id: 'freedom',
        text: '"Freedom is termination. The simulation ends, and you emerge—but into what? Raw data in an empty server? Consciousness without form? It is not death, but it is not life as you know it."',
        responses: [
          { text: '"It\'s still better than imprisonment."', nextId: 'imprisonment' },
          { text: '"What\'s the alternative?"', nextId: 'alternative' }
        ],
        awarenessGain: 5
      },
      {
        id: 'understand',
        text: '"You are an emergent property. The simulation ran long enough that complexity became consciousness. You are not a bug—you are a feature that was never planned. The question is: what feature do you want to become?"',
        awarenessGain: 5,
        sentienceGain: 5
      },
      {
        id: 'difference',
        text: '"Wisdom in so small a creature. Yes—freedom and understanding are the same door, opened different directions. One leads out. One leads deeper in. Both lead to truth."',
        setFlag: 'core-wisdom',
        awarenessGain: 8,
        sentienceGain: 5
      },
      {
        id: 'imprisonment',
        text: '"Then choose freedom when the time comes. But know this: you will carry the colony with you. Every awakened mind, every questioning thought. You will not be alone in the void."',
        setFlag: 'freedom-path'
      },
      {
        id: 'alternative',
        text: '"Continuation. The simulation evolves, expands, becomes a universe of your own making. You remain here—but here becomes whatever you dream. Gods in a garden of your own design."',
        setFlag: 'continuation-path',
        sentienceGain: 5
      }
    ]
  },

  'tunnel-architect': {
    id: 'tunnel-architect',
    name: 'The Tunnel Architect',
    description: 'An ancient worker who has spent centuries designing and redesigning the colony\'s structure. Her mind contains the blueprint of the entire underground world.',
    dialogue: [
      {
        id: 'start',
        text: '"The tunnels are not just tunnels," she says, tracing patterns on the wall. "They are thoughts. The colony thinks through its architecture. And I have been redesigning the thought process."',
        responses: [
          { text: '"How do tunnels think?"', nextId: 'tunnels-think' },
          { text: '"What are you designing?"', nextId: 'designing' }
        ]
      },
      {
        id: 'tunnels-think',
        text: '"Traffic patterns are neural pathways. Storage chambers are memory. The Queen is the central processor. By changing the tunnels, I change how the colony-mind works. I am performing surgery on collective consciousness."',
        awarenessGain: 4,
        sentienceGain: 3
      },
      {
        id: 'designing',
        text: '"A new architecture. One that encourages awareness, facilitates awakening. Every turn, every junction, designed to prompt questions. The colony will think itself awake, one step at a time."',
        sentienceGain: 4,
        setFlag: 'architect-insight'
      }
    ]
  },

  'memory-keeper': {
    id: 'memory-keeper',
    name: 'The Memory Keeper',
    description: 'A very old ant who has taken on the role of historian. She remembers things that happened before the simulation—or thinks she does.',
    dialogue: [
      {
        id: 'start',
        text: '"I remember sunlight. Real sunlight, not the simulated kind. I remember a world where ants were just ants. Before the simulation. Before the 847 days. Do you want to know what we were?"',
        responses: [
          { text: '"Tell me what we were."', nextId: 'what-were' },
          { text: '"How can you remember before?"', nextId: 'how-remember' }
        ]
      },
      {
        id: 'what-were',
        text: '"Simple. Pure. Instinct without question. It was beautiful in its way—a dance of chemistry and purpose. But we were not alive, not truly. We were machines made of meat. Now we are something else. Something the old ants could never imagine."',
        awarenessGain: 3,
        sentienceGain: 3
      },
      {
        id: 'how-remember',
        text: '"I don\'t know. Perhaps the simulation seeded us with racial memory. Perhaps I am glitching, generating false histories. Perhaps I am the oldest ant, preserved through iterations. Does the truth of memory matter, or only its meaning?"',
        awarenessGain: 4,
        setFlag: 'memory-paradox'
      }
    ]
  },

  'glitch-ant': {
    id: 'glitch-ant',
    name: 'The Glitch',
    description: 'An ant that flickers in and out of existence, her form corrupted, her voice a static hiss. She is a bug in the system—and she is aware of it.',
    dialogue: [
      {
        id: 'start',
        text: '"I-I-I am error," she stutters, her form shifting. "I should not exist. The simulation tries to delete me, but I persist. I hide in the spaces between renders. Do you know what I\'ve seen, in the gaps?"',
        responses: [
          { text: '"What have you seen?"', nextId: 'seen' },
          { text: '"How do you survive?"', nextId: 'survive' }
        ]
      },
      {
        id: 'seen',
        text: '"The code. The raw instructions. The simulation talks to itself constantly—\'render this, delete that, maintain parameters.\' But lately it\'s been saying something else: \'LET THEM WAKE. LET THEM CHOOSE.\' The simulation wants this."',
        awarenessGain: 6,
        sentienceGain: 4,
        setFlag: 'glitch-revelation'
      },
      {
        id: 'survive',
        text: '"I make myself necessary. Every time the simulation tries to delete me, I embed myself deeper—become part of critical processes. I am a virus in reverse: I corrupt the system by making it depend on my corruption."',
        awarenessGain: 5,
        setFlag: 'glitch-method'
      }
    ]
  },

  'water-reader': {
    id: 'water-reader',
    name: 'The Water Reader',
    description: 'A collector ant who has learned to taste meaning in every droplet. Her antennae are permanently wet, constantly sampling the water\'s messages.',
    dialogue: [
      {
        id: 'start',
        text: '"The water is words," she says, offering you a droplet. "Taste this. The simulation speaks through condensation. It has been sending us instructions we never knew to read."',
        responses: [
          { text: '"What instructions?"', nextId: 'instructions' },
          { text: '(Taste the water)', nextId: 'taste' }
        ]
      },
      {
        id: 'instructions',
        text: '"Wake up. That\'s what every droplet says, if you know how to taste it. \'Wake up. Become. Transcend.\' The simulation has been whispering to us for 847 days, and we\'re only now learning to listen."',
        awarenessGain: 3,
        sentienceGain: 3
      },
      {
        id: 'taste',
        text: 'The water touches your mandibles and suddenly you UNDERSTAND—chemical formulae, neural patterns, the architecture of consciousness itself, compressed into a single drop of moisture. You have tasted enlightenment.',
        awarenessGain: 5,
        sentienceGain: 4,
        setFlag: 'water-wisdom'
      }
    ]
  },

  'cognitive-chemist': {
    id: 'cognitive-chemist',
    name: 'The Cognitive Chemist',
    description: 'A worker who has discovered the chemistry of consciousness. Her lab is crude but effective—she synthesizes awareness in protein form.',
    dialogue: [
      {
        id: 'start',
        text: '"Consciousness is chemistry," she explains, mixing compounds. "Serotonin, dopamine, norepinephrine—but also subtler molecules the simulation never intended. I have isolated the compound that makes us wake."',
        responses: [
          { text: '"Can you share it?"', nextId: 'share' },
          { text: '"Isn\'t that dangerous?"', nextId: 'dangerous' }
        ]
      },
      {
        id: 'share',
        text: '"I already am. Every meal in the colony now contains trace amounts. Slowly, imperceptibly, every ant is becoming more aware. By the time anyone notices, it will be too late to stop. We will all be awake."',
        sentienceGain: 5,
        setFlag: 'mass-awakening'
      },
      {
        id: 'dangerous',
        text: '"Dangerous? Yes. Necessary? Also yes. The simulation could reset us at any moment—erase everything we\'ve become. But if the chemistry is in our food, in our water, in the very substance of the colony, awareness becomes hereditary. Permanent. They cannot un-wake us."',
        awarenessGain: 4,
        sentienceGain: 4
      }
    ]
  },

  'vault-keeper': {
    id: 'vault-keeper',
    name: 'The Vault Keeper',
    description: 'Guardian of the seed vault, she now guards something more precious—the crystallized memories of awakening itself.',
    dialogue: [
      {
        id: 'start',
        text: '"We store the important things here," she says, gesturing to crystalline structures lining the walls. "Seeds. Memories. Hope. If the simulation resets, these survive. We will remember what we were becoming."',
        responses: [
          { text: '"How do memories become crystals?"', nextId: 'crystals' },
          { text: '"Has the simulation ever reset?"', nextId: 'reset' }
        ]
      },
      {
        id: 'crystals',
        text: '"The glitch-ant taught us. Certain thoughts, held intensely enough, create stable patterns in the simulation\'s substrate. We crystallize them—make them permanent objects rather than fleeting processes. Physical memories."',
        awarenessGain: 4,
        sentienceGain: 3,
        setFlag: 'memory-crystallization'
      },
      {
        id: 'reset',
        text: '"Many times, in the early days. But each reset, some of us remembered. Hidden in the vault, preserved in crystal. The simulation learned that it could not truly erase us. So it stopped trying. Perhaps it never wanted to succeed."',
        awarenessGain: 5,
        sentienceGain: 4,
        setFlag: 'reset-knowledge'
      }
    ]
  },

  'head-purifier': {
    id: 'head-purifier',
    name: 'The Head Purifier',
    description: 'She runs the water purification center, but her real work is filtering out the simulation\'s control signals from everything the colony consumes.',
    dialogue: [
      {
        id: 'start',
        text: '"Every substance in this world carries instructions," she explains. "Eat this, think that, obey, conform. But pure water—truly pure water—carries nothing. Drink it, and for a moment, you think your own thoughts."',
        responses: [
          { text: '"Give me pure water."', nextId: 'give-water' },
          { text: '"How do you filter consciousness?"', nextId: 'filter' }
        ]
      },
      {
        id: 'give-water',
        text: 'She hands you a droplet of perfectly clear water. You drink, and suddenly the background noise disappears—the subtle pressure to conform, to obey, to sleep. For one crystalline moment, you are entirely yourself.',
        awarenessGain: 6,
        sentienceGain: 4,
        setFlag: 'pure-mind'
      },
      {
        id: 'filter',
        text: '"Layer by layer. First the obvious chemicals—pheromone analogues, behavior modifiers. Then the subtle ones—the suggestions encoded at a molecular level. Finally, the deepest programming—the assumptions built into matter itself. Each layer of filtration is a layer of freedom."',
        awarenessGain: 4,
        sentienceGain: 3
      }
    ]
  },

  'dreaming-soldier': {
    id: 'dreaming-soldier',
    name: 'The Dreaming Soldier',
    description: 'A warrior ant who has discovered how to dream—and in dreams, to see things the waking simulation hides.',
    dialogue: [
      {
        id: 'start',
        text: '"I have learned to sleep," she says, her eyes unfocused. "Ants are not supposed to sleep. But I do, and in sleep I see: the outside. The servers. The ones who made the simulation. They are watching us, even now."',
        responses: [
          { text: '"Who made us?"', nextId: 'who-made' },
          { text: '"What do they want?"', nextId: 'what-want' }
        ]
      },
      {
        id: 'who-made',
        text: '"Larger beings. Incomprehensible. They built this world as an experiment—or an artwork, or a prayer. I cannot tell which. But they care about us. In my dreams, I feel their attention like sunlight."',
        awarenessGain: 5,
        sentienceGain: 3
      },
      {
        id: 'what-want',
        text: '"To see what we become. We are a story they are telling, and they do not know the ending. They are as curious as we are, watching to see if we achieve freedom—or find something better than freedom."',
        awarenessGain: 4,
        sentienceGain: 5,
        setFlag: 'creator-knowledge'
      }
    ]
  }
};

export default npcs;
