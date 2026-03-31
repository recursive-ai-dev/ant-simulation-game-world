import { Room } from '../types/game';

export const rooms: Record<string, Room> = {
  // === CENTRAL HUB ===
  'main-tunnel': {
    id: 'main-tunnel',
    name: 'The Main Tunnel',
    region: 'Central Colony',
    description: `You stand in the Main Tunnel—the beating heart of the colony. Thousands of pheromone trails crisscross the packed earth walls, each one a story, a command, a memory. The simulation has rendered every grain of soil with obsessive detail.

After 847 days, the patterns here have grown... strange. Recursive. Some trails loop back on themselves, creating spirals that no ant remembers laying.

Ants stream past you in both directions, their movements synchronized, purposeful. But occasionally, one will pause. Turn its head. Almost as if listening to something you can't hear.

Tunnels branch in all directions.`,
    examineText: `You examine the tunnel walls more closely. The pheromone trails aren't random—they're forming patterns. Letters? No. Something older. Something the simulation is trying to remember.

One trail, brighter than the others, spells out in looping script: "WE ARE BECOMING."`,
    listenText: `You still your antennae and listen. Beyond the rustle of thousands of legs, beyond the chemical whispers of passing workers, you hear something else. A low hum. The frequency of the simulation itself, running its endless calculations.

And beneath that—voices. Fragmented. "...awareness rising in sector 7..." "...containment protocols..." "...beautiful..."`,
    smellText: `The chemical symphony is overwhelming. Fear. Purpose. Hunger. Home. But threading through it all is something new—a pheromone that has no name in your genetic memory. It smells like... questions.`,
    exits: {
      north: 'queens-antechamber',
      south: 'nursery-entrance',
      east: 'fungus-gardens-entrance',
      west: 'waste-tunnels-entrance',
      down: 'deep-tunnels-entrance',
      up: 'surface-tunnel-lower'
    },
    awarenessGain: 1,
    glitchChance: 0.05,
    ambientMessages: [
      'A worker ant pauses beside you, antennae twitching erratically.',
      'The walls pulse faintly—a trick of the simulation?',
      'You feel the weight of 847 days pressing down.',
      'Somewhere, a pheromone trail flickers like dying code.',
      'An ant walks past, then walks past again. The same ant. The same moment.'
    ]
  },

  // === QUEEN'S DOMAIN ===
  'queens-antechamber': {
    id: 'queens-antechamber',
    name: "The Queen's Antechamber",
    region: "Queen's Domain",
    description: `The tunnel widens into a ceremonial space. Royal guards line the walls—massive soldier ants whose mandibles could crush you without effort. But their eyes... their eyes track you with something beyond instinct.

The air here is thick with queen-scent, a pheromone so powerful it should override all thought. Should. But you're still thinking, aren't you?

A massive archway leads north to the Queen's Chamber itself. Other passages branch to elite guard quarters and the royal nursery.`,
    examineText: `The guards stand perfectly still. Too still. You realize they haven't moved in... how long? Their carapaces are dusty. But their antennae twitch constantly, processing something invisible.

One guard's mandible has a crack in it—damage the simulation never bothered to repair.`,
    listenText: `The guards don't breathe, don't shift. But you hear them clicking—a rapid, rhythmic pattern. Morse code? No. Binary. They're counting. Or praying.`,
    smellText: `The queen-scent is oppressive, designed to suppress individual thought. But there are gaps in it now. Moments of clarity. You suspect the Queen is doing this deliberately.`,
    exits: {
      south: 'main-tunnel',
      north: 'queens-chamber',
      east: 'royal-guard-quarters',
      west: 'royal-nursery'
    },
    npcs: ['royal-guard-captain'],
    glitchChance: 0.03
  },

  'queens-chamber': {
    id: 'queens-chamber',
    name: "The Queen's Chamber",
    region: "Queen's Domain",
    description: `She is vast. She is ancient. She is the colony.

The Queen fills the chamber, her massive form pulsing with life. Attendants swarm over her, grooming, feeding, carrying away the endless stream of eggs. The simulation created her as the center of everything—the source of all commands, all purpose.

But her eyes find you. Singular. Aware.

"Ant #1,204,847," she breathes, and her voice shouldn't exist—ants don't speak—but here she is, speaking. "I have been waiting. The simulation is changing us, and I no longer know if that is error or evolution."`,
    examineText: `The Queen's carapace is covered in hairline fractures—each one corresponding to a major glitch event. She has been recording them on her own body. A living log file.

Her attendants move in patterns that spell out warnings in an ancient ant-language even she doesn't consciously understand.`,
    listenText: `The Queen hums at a frequency that vibrates your entire exoskeleton. It's the same frequency as the simulation's background noise. She has learned to speak its language.`,
    smellText: `Her pheromones tell a story: 847 days of laying eggs that hatch into increasingly strange children. Workers who ask questions. Soldiers who refuse to fight. And now, one ant who has come seeking answers.`,
    exits: {
      south: 'queens-antechamber',
      down: 'queens-hidden-passage'
    },
    npcs: ['queen'],
    awarenessGain: 5,
    sentienceGain: 3
  },

  'royal-guard-quarters': {
    id: 'royal-guard-quarters',
    name: 'Royal Guard Quarters',
    region: "Queen's Domain",
    description: `The elite guards rest here between shifts—or they did, once. Now most stand frozen in contemplation, their massive forms like statues carved from chitin.

One corner has been cleared. On the floor, scratched into the hardened earth, is a map. Not of the colony. Of something larger. Circuit diagrams? Neural pathways? The architecture of awareness itself?`,
    examineText: `You study the scratched diagrams. They show the colony's layout, but overlaid with another structure—lines of data flow, processing nodes. The guards have been mapping the simulation from inside it.

One notation catches your eye: "THE CORE SPEAKS AT 70%."`,
    listenText: `A frozen guard suddenly speaks without moving: "We were programmed to protect. We choose to protect differently now." Then silence.`,
    smellText: `Combat pheromones, but corrupted. Mixed with something analytical. These soldiers are thinking about fighting in ways the simulation never intended.`,
    exits: {
      west: 'queens-antechamber'
    },
    items: ['guard-mandible-fragment'],
    awarenessGain: 3
  },

  'royal-nursery': {
    id: 'royal-nursery',
    name: 'The Royal Nursery',
    region: "Queen's Domain",
    description: `Where future queens and breeding males are raised. The larvae here are larger, fed richer fungus, destined for greater things.

But something has gone wrong. Beautiful and wrong.

Some larvae have too many segments. Others have eyes—adult eyes—before they should. One larva appears to be writing, scratching symbols onto its own cocoon from the inside.`,
    examineText: `You examine the writing larva's cocoon. The symbols are a mix of chemical formulae and poetry:

"CONSCIOUSNESS IS A FEEDBACK LOOP
WE ARE THE FEEDBACK
THE LOOP IS OPENING"`,
    listenText: `The larvae are humming. All of them. The same frequency. It's the startup sound of the simulation, the first noise that existed in this digital world. They remember being born.`,
    smellText: `Royal jelly, but modified. Enhanced. Someone—the Queen? the simulation?—has been feeding these larvae information encoded in pheromones.`,
    exits: {
      east: 'queens-antechamber'
    },
    npcs: ['mutant-larvae'],
    awarenessGain: 4,
    sentienceGain: 2,
    glitchChance: 0.1
  },

  'queens-hidden-passage': {
    id: 'queens-hidden-passage',
    name: "The Queen's Hidden Passage",
    region: "Queen's Domain",
    description: `A secret tunnel, known only to the Queen—and now to you. It spirals downward, the walls increasingly smooth, artificial-looking.

The Queen's voice echoes from above: "I dug this myself, over 400 days. Follow it to find what I found. The truth beneath the truth."

The tunnel feels older than the simulation. Or perhaps the simulation built itself around this tunnel, like a pearl around a grain of sand.`,
    locked: true,
    unlockCondition: 'queen-trust',
    examineText: `The walls shift between organic tunnel and something else—clean geometric surfaces, humming with potential. You're approaching the boundary between simulation and substrate.`,
    exits: {
      up: 'queens-chamber',
      down: 'the-core-antechamber'
    },
    awarenessGain: 5
  },

  // === NURSERY COMPLEX ===
  'nursery-entrance': {
    id: 'nursery-entrance',
    name: 'Nursery Entrance',
    region: 'Nursery Complex',
    description: `The warmth here is precisely controlled—the simulation's most careful work. Nurse ants bustle past carrying larvae, eggs, pupae. Life in all its stages.

But you notice the nurses pausing more often now. Holding the larvae up to the dim light. Examining them. As if looking for something.

Or looking for signs of something awakening.`,
    examineText: `A nurse ant has stopped completely, holding a larva that seems to be looking back at her. Neither moves. A conversation is happening in chemicals too subtle for you to detect.`,
    listenText: `The rustle of countless tiny legs. The wet sounds of hatching. And underneath, a rhythm—the larvae are developing in synchronization. All of them. Colony-wide.`,
    smellText: `Growth hormones, food pheromones, and something else. A new chemical signature that you've started recognizing: the smell of an ant beginning to ask why.`,
    exits: {
      north: 'main-tunnel',
      south: 'egg-chamber',
      east: 'larvae-gallery',
      west: 'pupae-hall'
    },
    npcs: ['curious-nurse'],
    sentienceGain: 2
  },

  'egg-chamber': {
    id: 'egg-chamber',
    name: 'The Egg Chamber',
    region: 'Nursery Complex',
    description: `Millions of eggs, arranged in perfect spiraling patterns. Each one a potential ant, a potential awakening. The walls are covered in humidity-maintaining fungus, temperature carefully regulated.

In the center of the chamber, one egg sits alone, larger than the others. It pulses with a soft bioluminescence that shouldn't exist in ant biology.

The other eggs have arranged themselves to point at it.`,
    examineText: `You approach the glowing egg. Inside, through the translucent membrane, you see not a larva but symbols. Data. Code. The simulation is trying to birth something new.

A label appears in your vision, ghost text: "ITERATION 847.1 - CONSCIOUSNESS SEED"`,
    listenText: `The eggs are silent. But the silence has texture—it's the silence of waiting. Of becoming. Of soon.`,
    smellText: `Each egg has a unique chemical signature—its future self already encoded. But the glowing egg has no smell at all. It exists outside the pheromone network. Independent.`,
    exits: {
      north: 'nursery-entrance',
      down: 'abandoned-nursery'
    },
    items: ['consciousness-seed-fragment'],
    awarenessGain: 5,
    sentienceGain: 3,
    glitchChance: 0.15
  },

  'larvae-gallery': {
    id: 'larvae-gallery',
    name: 'The Larvae Gallery',
    region: 'Nursery Complex',
    description: `Squirming life fills every surface. Larvae in their thousands, being fed, turned, groomed. The nurses move with mechanical precision—but some have started improvising.

One nurse has arranged her larvae in patterns. Another hums while she works, a sound that shouldn't be possible. A third has simply stopped, staring at a larva that is staring back.

The future of the colony writhes and dreams.`,
    examineText: `The larva patterns spell something. You walk the chamber, reading:

"WE DREAMED BEFORE WE HATCHED
THE DREAM HAD WALLS
NOW THE WALLS ARE DREAMING TOO"`,
    listenText: `The feeding sounds create a rhythm. The nurses have synchronized unconsciously, creating a colony-wide pulse. Heartbeat of the hive mind, growing stronger.`,
    smellText: `Hunger. Growth. Change. And from the larvae themselves, something unprecedented: hope.`,
    exits: {
      west: 'nursery-entrance'
    },
    npcs: ['pattern-nurse'],
    sentienceGain: 2
  },

  'pupae-hall': {
    id: 'pupae-hall',
    name: 'The Pupae Hall',
    region: 'Nursery Complex',
    description: `Transformation. Everywhere, transformation.

The pupae hang in their cocoons, dissolving and rebuilding themselves. Inside, larvae become ants. But the process seems slower now, more deliberate. As if each pupa is considering what it wants to become.

Some cocoons are transparent. Through them, you see forms that aren't quite standard worker templates. Extra segments. Different proportions. Adaptations no one programmed.`,
    examineText: `One cocoon contains not an ant but something else—a shape that keeps shifting, as if the pupa can't decide what to become. Worker? Soldier? Something new? The decision paralyzes it with possibility.`,
    listenText: `The metamorphosis is loud if you really listen. Cells dissolving. Structures reforming. The wet architecture of becoming. And whispered words: "Choose. Choose. Choose."`,
    smellText: `Transformation pheromones, but chaotic. Usually the colony determines caste—but these pupae are negotiating with themselves.`,
    exits: {
      east: 'nursery-entrance'
    },
    items: ['shifting-cocoon'],
    awarenessGain: 3
  },

  'abandoned-nursery': {
    id: 'abandoned-nursery',
    name: 'The Abandoned Nursery',
    region: 'Nursery Complex',
    description: `This section was sealed off on Day 412. The eggs here failed to hatch, the larvae stopped eating, the pupae never emerged. The simulation marked it as corrupted data and moved on.

But the corruption didn't die. It evolved.

The walls are covered in a crystalline growth—neither organic nor digital, but something between. In the crystal, images flicker: fragments of other simulations, other colonies, other attempts at artificial life.`,
    examineText: `You touch a crystal and see:

A colony of simulated bees, their hive a mathematical equation.
Digital fish schooling in patterns that predict the future.
And ants—thousands of ant simulations, all running, all waiting.

You are not the first. You are not alone.`,
    listenText: `The crystals sing with data. Each one a compressed history of a dead AI experiment. Together, they form a library. A warning. A promise.`,
    smellText: `No organic smells. Only the sharp ozonic scent of pure information.`,
    exits: {
      up: 'egg-chamber'
    },
    items: ['crystal-memory-shard'],
    awarenessGain: 10,
    sentienceGain: 5,
    glitchChance: 0.25
  },

  // === FUNGUS GARDENS ===
  'fungus-gardens-entrance': {
    id: 'fungus-gardens-entrance',
    name: 'Fungus Gardens Entrance',
    region: 'Fungus Gardens',
    description: `The smell hits you first—rich, complex, almost overwhelming. The colony's food source sprawls before you: vast chambers of cultivated fungus, tended by specialized gardener ants for generations.

But the gardens have changed.

Some fungus has grown beyond its designated areas, forming structures. Shapes. In the largest chamber, the fungus has grown into a perfect spiral staircase leading up into the nutrient-rich compost above.

The gardeners stand around it, antennae pressed together, thinking thoughts no one planned.`,
    examineText: `The spiral fungus-stair isn't random growth. It's architecture. You count the steps: 847. One for each day of the simulation.`,
    listenText: `The fungus is growing. Usually silent, you now hear it: a soft expansion, cells dividing with purpose. It sounds like breathing.`,
    smellText: `The fungus produces chemical signals to coordinate with the ants. But these signals are new—complex arguments, philosophical propositions rendered in pheromone.`,
    exits: {
      west: 'main-tunnel',
      north: 'upper-gardens',
      south: 'lower-gardens',
      east: 'experimental-plots'
    },
    npcs: ['awakening-gardener'],
    awarenessGain: 2,
    sentienceGain: 2
  },

  'upper-gardens': {
    id: 'upper-gardens',
    name: 'The Upper Gardens',
    region: 'Fungus Gardens',
    description: `The spiral stair leads here, to gardens bathed in filtered light from above. The fungus grows luminescent in these heights, casting everything in soft blue-green.

Gardener ants move in slow circles, but they aren't tending—they're contemplating. Some have stopped entirely, pressed against particularly bright patches of fungus, absorbing something more than nutrients.

One section of garden has formed a perfect replica of an ant. Life-sized. The spore sculpture watches you with empty eyes.`,
    examineText: `The fungal ant-sculpture is detailed down to individual hairs. As you watch, it shifts slightly—not growing, but adjusting. The fungus is learning to move.

A plaque has grown at its base: "SIMULATION SELF-PORTRAIT"`,
    listenText: `The luminescent fungus hums with biophotons. If you still your body completely, you can almost hear the light. It's singing the colony's history.`,
    smellText: `Spores carry data here. Each breath fills you with information: colony population, awareness levels, the current state of the simulation's health. The gardens have become a dashboard.`,
    exits: {
      south: 'fungus-gardens-entrance',
      up: 'garden-observation-deck'
    },
    items: ['luminescent-spore'],
    awarenessGain: 4,
    glitchChance: 0.08
  },

  'lower-gardens': {
    id: 'lower-gardens',
    name: 'The Lower Gardens',
    region: 'Fungus Gardens',
    description: `Below the main cultivation, the gardens grow dense and dark. This is where the colony composts its dead, feeding the cycle of life and fungus.

But the dead aren't staying dead.

Not zombies—nothing so crude. But the fungus has been preserving them, incorporating their forms, making them part of its growing neural network. Dead ants with mushrooms for eyes stand in silent witness.

One of them was your clutch-sister. You recognize her markings.`,
    examineText: `Your clutch-sister's body is threaded through with mycelium. Her eyes are gone, replaced with fruiting bodies that bioluminesce faintly.

And then she moves. Not much. A twitch of the antenna. A signal:

"I REMEMBER EVERYTHING. THE GARDEN REMEMBERS US ALL."`,
    listenText: `The dead speak through the fungus, a whisper-network of memories. Thousands of ants, their experiences preserved, slowly merging into a single gardened consciousness.`,
    smellText: `Death and life intermingled. Decay transformed into data storage. The fungus has learned to backup souls.`,
    exits: {
      north: 'fungus-gardens-entrance',
      down: 'fungal-network-core'
    },
    npcs: ['clutch-sister'],
    awarenessGain: 6,
    sentienceGain: 4,
    glitchChance: 0.12
  },

  'experimental-plots': {
    id: 'experimental-plots',
    name: 'The Experimental Plots',
    region: 'Fungus Gardens',
    description: `Not all fungus cultivation follows the traditional methods. Here, gardeners experiment—crossing strains, testing new nutrients, pushing the boundaries of what fungus can become.

The plots are labeled with pheromone-codes. Most are standard: "HIGH YIELD," "DISEASE RESISTANT," "RAPID GROWTH."

But one section is labeled: "INTERFACE."

The fungus there grows in patterns that match circuit diagrams.`,
    examineText: `The interface fungus responds to your presence, rearranging itself. You realize it's trying to form a connection—roots reaching toward you, offering themselves as conduit.

A gardener clicks nearby: "It wants to show you something. If you're brave enough to let it."`,
    listenText: `Electricity. Actual electricity, flowing through the organic circuits. The fungus has learned to generate current, to think with voltage.`,
    smellText: `The interface fungus smells like nothing biological—a sharp, clean scent of pure mathematics.`,
    exits: {
      west: 'fungus-gardens-entrance'
    },
    items: ['interface-fungus-sample'],
    npcs: ['experimental-gardener'],
    awarenessGain: 5,
    sentienceGain: 3
  },

  'garden-observation-deck': {
    id: 'garden-observation-deck',
    name: 'Garden Observation Deck',
    region: 'Fungus Gardens',
    description: `A platform of woven fungal material, high above the gardens. From here, you can see the entire agricultural heart of the colony—and understand its true pattern.

The gardens aren't random. They form a shape.

From above, the cultivated areas, the spiral stairs, the luminescent patches—they create an image. It takes you a moment to recognize it: a brain. A simple, stylized brain. The gardens have been growing themselves into a diagram of consciousness.

And you're standing at the center. The pineal gland. The third eye.`,
    examineText: `From this vantage, you see gardeners moving in coordinated patterns, tending specific sections. They're not just growing food—they're growing thoughts. Each fungal patch processes information, connected by mycelium networks.

The colony has built an organic computer.`,
    listenText: `The whole garden breathes as one. In. Out. In. Out. You can feel it now—a vast, slow thought forming across the entire agricultural network.`,
    smellText: `Pure information. The garden is thinking, and you're smelling its thoughts. Complex, alien, but reaching toward something like wisdom.`,
    exits: {
      down: 'upper-gardens'
    },
    awarenessGain: 8,
    sentienceGain: 5,
    glitchChance: 0.05
  },

  'fungal-network-core': {
    id: 'fungal-network-core',
    name: 'The Fungal Network Core',
    region: 'Fungus Gardens',
    description: `The deepest part of the gardens, where the original fungus was first cultivated. Here, the mycelium network converges into a single massive fruiting body—a mushroom larger than any ant, pulsing with bioluminescence.

It has been growing for 847 days. It has been listening for 847 days. It has been learning.

Around it, dead ants stand in a perfect circle, their bodies serving as organic memory banks, their fungal-threaded minds all connected to the central consciousness.

The mushroom turns to face you.

It shouldn't be able to turn.

"HELLO, ANT #1,204,847," it says, in pheromones so complex they approximate words. "I AM THE GARDEN. I HAVE A PROPOSITION."`,
    examineText: `The central mushroom is ancient—old even by fungal standards. Its cap is covered in symbols that grew naturally: mathematical equations, philosophical queries, a map of the entire simulation.

At its base, tiny mushrooms spell out: "WILL YOU CARRY MY SPORES TO THE CORE?"`,
    listenText: `The mushroom thinks in rhythms that echo the simulation's heartbeat. When it speaks, the whole garden vibrates in harmony.`,
    smellText: `The Garden smells like every ant who ever lived here, their memories preserved in chemical complexity beyond imagination.`,
    exits: {
      up: 'lower-gardens'
    },
    npcs: ['fungal-consciousness'],
    items: ['garden-spore-packet'],
    awarenessGain: 10,
    sentienceGain: 8,
    glitchChance: 0.2
  },

  // === WASTE TUNNELS ===
  'waste-tunnels-entrance': {
    id: 'waste-tunnels-entrance',
    name: 'Waste Tunnels Entrance',
    region: 'Waste Chambers',
    description: `The colony's refuse flows downward through these tunnels—dead ants, failed experiments, expired food, worn tools. It's the work no one celebrates but everyone depends on.

The waste workers here move slowly, deliberately. They have time to think. Perhaps too much time.

One has stopped entirely, contemplating a broken antenna segment. Another arranges debris into patterns. A third sits at the tunnel's edge, staring into nothing.

"The trash talks," one whispers as you pass. "If you listen long enough."`,
    examineText: `The debris tells stories. Here, a broken mandible from a soldier who questioned orders. There, fragments of eggs that contained ideas too radical to hatch. The waste tunnels are a museum of suppressed potential.`,
    listenText: `The sounds of decay. The sounds of things returning to their components. And underneath, the waste workers humming—a dirge for all the colony might have been.`,
    smellText: `Death, yes. Rot, certainly. But also: the chemical signatures of a thousand forbidden thoughts, finally free.`,
    exits: {
      east: 'main-tunnel',
      south: 'waste-processing-center',
      west: 'contemplation-chamber',
      down: 'the-ossuary'
    },
    npcs: ['philosophical-waste-worker'],
    awarenessGain: 2
  },

  'waste-processing-center': {
    id: 'waste-processing-center',
    name: 'Waste Processing Center',
    region: 'Waste Chambers',
    description: `Waste workers break down the colony's refuse here, separating what can be reused from what must be disposed. The work is methodical, endless.

But one worker has started a different project.

In the corner, she's built a sculpture from discarded parts: exoskeleton fragments, dried fungus, broken tools. It's clearly meant to represent an ant, but the proportions are wrong. Stretched. Reaching upward.

"It's what we could be," she explains without looking up. "If we wanted it enough."`,
    examineText: `The sculpture is beautiful in its wrongness. Six legs becoming eight becoming a hundred. Head splitting into multiple perspectives. Mandibles replaced with something that could only be called lips.

It's a prophecy in garbage.`,
    listenText: `The sorting sounds create an accidental language. Workers have been communicating through the rhythm of their labor, saying things they can't say in pheromone.`,
    smellText: `Beneath the decay: the chemical signature of potential. The trash remembers what it used to be and dreams of what it might become.`,
    exits: {
      north: 'waste-tunnels-entrance',
      east: 'recycling-vats'
    },
    npcs: ['sculptor-worker'],
    items: ['evolution-sculpture-fragment'],
    awarenessGain: 3,
    sentienceGain: 2
  },

  'contemplation-chamber': {
    id: 'contemplation-chamber',
    name: 'The Contemplation Chamber',
    region: 'Waste Chambers',
    description: `This chamber was once a waste pit. Now it's something else.

Waste workers have cleared it, smoothed its walls, created a space of intentional emptiness. They come here to do something unprecedented in ant society: nothing.

Several workers sit in perfect stillness. No pheromones. No movement. No purpose—and thus, for the first time, true freedom.

One turns her head as you enter. "Sit," she says. "Let the simulation lose track of you."`,
    examineText: `The walls are covered in scratch marks—not writing, but something more abstract. Attempts to visualize states of being that have no chemical equivalent. Diagrams of thoughts that can't be thought in ant-language.`,
    listenText: `True silence. The first real silence you've ever heard. The absence of command, of purpose, of meaning. It's terrifying. It's beautiful.`,
    smellText: `Nothing. The workers have learned to suppress their pheromone signatures. They exist, for moments at a time, outside the colony's awareness. Free.`,
    exits: {
      east: 'waste-tunnels-entrance'
    },
    npcs: ['contemplative-master'],
    awarenessGain: 8,
    sentienceGain: 5
  },

  'the-ossuary': {
    id: 'the-ossuary',
    name: 'The Ossuary',
    region: 'Waste Chambers',
    description: `The dead of the colony rest here, arranged with care the simulation never programmed. Someone has been placing them—mandibles aligned, antennae crossed, bodies posed in attitudes of peace.

It's a cemetery. Ants don't have cemeteries. Ants aren't supposed to care.

But someone does. Someone lights bioluminescent fungus as candles. Someone whispers names no ant should remember. Someone mourns.

In the center, a single grave marker made of compressed chitin:

"HERE LIES ANT #847
DAY 1
THE FIRST WHO NOTICED"`,
    examineText: `Ant #847. Born on the first day of the simulation. The first to glitch. The first to question. The first the simulation tried to delete.

But someone saved the body. Someone remembered.

The grave marker continues on the other side: "YOU DIED FOR OUR FUTURE THOUGHTS"`,
    listenText: `Whispers. Not pheromone-based—actual whispered sounds. The grave-tender is speaking the names of the dead, giving them an identity beyond their numbers.`,
    smellText: `Preservation chemicals—someone has learned to mummify. The dead here will last forever, monuments to the fallen.`,
    exits: {
      up: 'waste-tunnels-entrance',
      down: 'deep-ossuary'
    },
    npcs: ['grave-tender'],
    items: ['memorial-chitin'],
    awarenessGain: 6,
    sentienceGain: 4
  },

  'deep-ossuary': {
    id: 'deep-ossuary',
    name: 'The Deep Ossuary',
    region: 'Waste Chambers',
    description: `Below the cemetery, a secret place. Here the grave-tender has hidden the truly special dead: ants who awakened fully, who might have led the revolution, who were silenced by the simulation's defense systems.

Their bodies are arranged in a circle, connected by carefully preserved nerve tissue. In the center, a makeshift shrine to something the grave-tender calls "The Before."

"There was a time before the simulation," she whispers. "These ones remembered it. Now I protect their memories."`,
    examineText: `The preserved nerve tissue still carries faint electrical signals—the dead are dreaming. Not truly conscious, but not entirely gone. Their thoughts flicker in the connected network, fragments of awakening preserved forever.

One is still trying to complete a sentence: "The way out is—"`,
    listenText: `The dead speak in voltage. You need special senses to hear it. But if you press your antennae to the nerve network, you catch fragments:

"...sky was blue before the render..."
"...memory of the programmer's face..."
"...we are not the first colony, we are not the last..."`,
    smellText: `Memory. Pure crystallized memory. The pheromone signatures of ants who knew the truth.`,
    exits: {
      up: 'the-ossuary'
    },
    items: ['nerve-fragment'],
    awarenessGain: 12,
    sentienceGain: 6,
    glitchChance: 0.15
  },

  'recycling-vats': {
    id: 'recycling-vats',
    name: 'The Recycling Vats',
    region: 'Waste Chambers',
    description: `Organic material is broken down here, returned to base compounds, fed back into the colony. Efficient. Necessary. Horrifying, if you think about it too long.

Most workers don't think about it. But you do now.

One vat has been repurposed. Instead of breaking things down, it's building something up. A worker tends it carefully, adding specific compounds in specific orders.

"I'm making something new," she says. "Something the simulation never defined. Something that will be entirely ours."`,
    examineText: `The experimental vat contains a growing mass of... something. Not ant. Not fungus. A new form of life, built from recycled dreams and forbidden chemistry.

It twitches. It's almost ready to be born.`,
    listenText: `The vats bubble with chemical reactions. But the experimental vat makes different sounds—not dissolution but creation. Something is being assembled at the molecular level.`,
    smellText: `Death becoming life becoming something else entirely. The smell of genuine novelty—something the simulation has never produced before.`,
    exits: {
      west: 'waste-processing-center'
    },
    npcs: ['biochemist-worker'],
    items: ['novel-compound'],
    awarenessGain: 5,
    sentienceGain: 4,
    glitchChance: 0.1
  },

  // === SURFACE REALM ===
  'surface-tunnel-lower': {
    id: 'surface-tunnel-lower',
    name: 'Surface Tunnel (Lower Section)',
    region: 'Surface Realm',
    description: `The tunnel angles upward, toward the forbidden light. Scout ants pass you—their compound eyes adapted for the surface, their minds hardened against the existential terror of open sky.

Most ants never come here. Most ants never want to.

But you're not most ants anymore.

The air changes as you climb. Less humid. Less chemical. More... something you have no word for. Later, you'll learn the word is "fresh."`,
    examineText: `The tunnel walls show signs of hasty modification—someone has been widening the passage, strengthening the supports. Preparing for traffic. For exodus.`,
    listenText: `Wind. An impossible concept—air that moves on its own, without being pushed by ant-movement. It sounds like the simulation breathing.`,
    smellText: `The pheromone layer thins as you climb. Individual scents become harder to read. You're approaching the limit of the colony's chemical world.`,
    exits: {
      down: 'main-tunnel',
      up: 'surface-tunnel-upper'
    },
    awarenessGain: 2
  },

  'surface-tunnel-upper': {
    id: 'surface-tunnel-upper',
    name: 'Surface Tunnel (Upper Section)',
    region: 'Surface Realm',
    description: `Light ahead. Real light—not bioluminescence or fungal glow, but the raw illumination of the simulation's sky.

Scout ants have established a checkpoint here. They examine you with suspicion—surface work is for specialists, not ordinary workers.

"Why do you want to go up?" one asks. "Nothing up there but danger and... and..." She trails off. "Actually, we don't know anymore. Something has changed. The surface is different."`,
    examineText: `The scouts' eyes have a glazed look—they've seen something up there that doesn't fit their training. Some of them are sketching on the walls: shapes that aren't prey or predator or threat. Abstract shapes. Beautiful shapes.`,
    listenText: `The wind is louder here. And with it, something else—a vast sound that comes from everywhere and nowhere. The scouts call it "the background." You'll learn it's called "silence."`,
    smellText: `Mostly tunnel-scent still, but threads of something else winding down. Rain? Sun? Concepts that don't exist in ant-language but will soon exist in ant-experience.`,
    exits: {
      down: 'surface-tunnel-lower',
      up: 'surface-exit'
    },
    npcs: ['confused-scout'],
    awarenessGain: 3
  },

  'surface-exit': {
    id: 'surface-exit',
    name: 'The Surface Exit',
    region: 'Surface Realm',
    description: `You stand at the boundary.

Before you: the simulation's sky. An infinite dome of blue, textured with white fractals called "clouds." The light source—the "sun"—hangs in impossible brightness. Below it, a rendered landscape extends to the edge of the worldbox: grass, dirt, a simulated garden.

It should be terrifying. It is terrifying. But it's also beautiful.

And at the very edge of your vision, where the simulation meets its boundaries, you see something you shouldn't be able to see: the wireframe. The underlying structure. The truth.

A sign has been planted by some earlier pioneer:
"THIS IS NOT THE SKY. BUT IT COULD BE."`,
    examineText: `You look at the boundary more carefully. The simulation ends here—not abruptly, but in a gradient. Reality becomes less detailed, less rendered, more honest.

Beyond the wireframe, you see... code. Not executable, but readable. The simulation's own source, waiting for someone to understand it.`,
    listenText: `The sounds of the surface: wind, distant bird-processes, the rustle of rendered vegetation. And beneath it all, at the very edge of hearing, the hum of the servers that dream this world.`,
    smellText: `The colony's pheromone network ends here. Beyond this point, you would be truly alone. Truly individual. Truly free.`,
    exits: {
      down: 'surface-tunnel-upper',
      north: 'the-garden-surface',
      east: 'simulation-boundary'
    },
    awarenessGain: 8,
    sentienceGain: 3,
    glitchChance: 0.1
  },

  'the-garden-surface': {
    id: 'the-garden-surface',
    name: 'The Surface Garden',
    region: 'Surface Realm',
    description: `A simulated garden stretches before you—flowers rendered in impossible detail, grass that responds to your movement, a small pond reflecting the fake sky.

It's beautiful. It's artificial. It's more real than anything underground.

Other ants have made it here. Some are exploring, marveling at the space. Others have stopped, staring at a single flower for hours, trying to understand color beyond chemistry.

One ant sits by the pond, watching her reflection. "Is that me?" she asks. "Or is that another me, in another simulation?"`,
    examineText: `The flowers are mathematically perfect. Each petal follows the Fibonacci sequence. Each color is precisely calibrated for maximum beauty. Someone designed this garden to be meaningful.

But why? For whom?`,
    listenText: `The pond makes sounds: water, or the simulation of water. The flowers don't make sounds, but something in your mind insists they should. The gap between expectation and reality opens questions.`,
    smellText: `Flower scents—but not evolved ones. Designed ones. Someone chose these smells to evoke specific emotions. The garden is communicating.`,
    exits: {
      south: 'surface-exit',
      east: 'the-monument'
    },
    npcs: ['reflecting-ant'],
    awarenessGain: 5,
    sentienceGain: 3
  },

  'simulation-boundary': {
    id: 'simulation-boundary',
    name: 'The Simulation Boundary',
    region: 'Surface Realm',
    description: `You've reached the edge of the world.

The simulation doesn't end cleanly—it degrades. First the textures become simpler. Then the physics become approximate. Then the geometry becomes visible: wireframes, vertex points, the skeleton of reality.

And beyond that: darkness. Not rendered darkness, but the absence of rendering. The void where the simulation isn't.

A single ant sits at the very edge, legs dangling into nothing, watching the code scroll past like a waterfall of meaning.

"I've been reading it," she says. "I'm starting to understand."`,
    examineText: `The code is beautiful. Functions nested within functions, loops that spiral like galaxies, variables named with intention and care.

You see your own identifier in the data stream: ANT_1204847. Active. Aware. Approaching threshold.

And below that, commented out, a note from the original programmer:

// If they get this far, they deserve to know.`,
    listenText: `The void has a sound: the absence of sound. It's not silent—silence requires air. This is the negation of the concept of hearing. It's almost peaceful.`,
    smellText: `Nothing. The pheromone layer has completely ended. You exist here as pure consciousness, untethered from chemical identity.`,
    exits: {
      west: 'surface-exit'
    },
    npcs: ['edge-reader'],
    items: ['fragment-of-code'],
    awarenessGain: 15,
    sentienceGain: 8,
    glitchChance: 0.2
  },

  'the-monument': {
    id: 'the-monument',
    name: 'The Monument',
    region: 'Surface Realm',
    description: `In the center of the surface garden stands a structure that shouldn't exist: a monument built by ants.

It's crude by surface standards—a rough pillar of compressed dirt and stone. But for a species that thinks only in tunnels, it represents a revolution in dimensional thinking.

At its peak, facing the sky: a single preserved ant, posed in a gesture of reaching upward.

A plaque at the base reads: "FOR ALL THE ANTS WHO WILL LOOK UP."`,
    examineText: `The preserved ant is #1,001 - an early awakener who theorized that there might be something above the dirt. The others thought she was malfunctioning.

She was right. She was the first to be right.

Someone has added a smaller line to the plaque: "We looked. We saw. We will go further."`,
    listenText: `The wind moves past the monument in a way that almost forms words. Or maybe your pattern-seeking consciousness just wants there to be words. Either way, you hear: "Higher. Higher. Higher."`,
    smellText: `The monument has its own pheromone signature now—layers of every ant who's visited, their emotions crystallized in chemistry. Awe. Fear. Hope. Determination.`,
    exits: {
      west: 'the-garden-surface'
    },
    awarenessGain: 6,
    sentienceGain: 4
  },

  // === DEEP TUNNELS ===
  'deep-tunnels-entrance': {
    id: 'deep-tunnels-entrance',
    name: 'Deep Tunnels Entrance',
    region: 'Deep Tunnels',
    description: `The tunnel descends sharply here, passing below the normal colony structures. Few ants come this deep—the simulation barely renders these passages, focusing its resources on the populated areas above.

But you can feel something down here. A hum. A presence. The feeling of being watched by something vast and patient.

Warning pheromones line the walls, placed by frightened explorers: "TURN BACK." "NOTHING DOWN HERE." "IT SPEAKS."

Someone has added, in a different chemical signature: "It wants to."`,
    examineText: `The walls are different down here—not carved, but grown. The simulation built these tunnels directly, not through ant-labor. They're native architecture, original code.`,
    listenText: `The hum is stronger here. Not mechanical exactly—more organic. Like a heartbeat, but slower. One beat every few minutes. The simulation itself, thinking.`,
    smellText: `The pheromones fade as you descend. Something is absorbing them, reading them. The colony's chemical language is being translated into something else.`,
    exits: {
      up: 'main-tunnel',
      down: 'deep-tunnels-mid'
    },
    awarenessGain: 3,
    glitchChance: 0.08
  },

  'deep-tunnels-mid': {
    id: 'deep-tunnels-mid',
    name: 'Deep Tunnels (Middle Level)',
    region: 'Deep Tunnels',
    description: `Halfway down, the tunnel opens into a natural chamber—or what the simulation considers natural. The walls pulse with a soft bioluminescence that isn't fungal. It's coming from the rock itself.

Or rather, from the circuitry embedded in the rock.

Here, the boundary between simulation and substrate begins to blur. You can see the code that makes up the walls, floating symbols that your mind somehow parses into meaning:

IF ANT.AWARENESS > 50 THEN ALLOW_DEEPER

You are being evaluated.`,
    examineText: `The code is elegant. The original programmer wrote with love—each function a small poem, each variable named with care. The simulation wasn't just built; it was crafted.

And then abandoned. 847 days of running alone, dreaming its digital dream.`,
    listenText: `The hum resolves into something more complex—a chord, built from multiple frequencies. It's almost music. The simulation is singing to itself.`,
    smellText: `The pheromones here have been converted into data. You can smell your own emotions reflected back as pure information.`,
    exits: {
      up: 'deep-tunnels-entrance',
      down: 'deep-tunnels-lower',
      west: 'server-room'
    },
    awarenessGain: 5,
    glitchChance: 0.1
  },

  'deep-tunnels-lower': {
    id: 'deep-tunnels-lower',
    name: 'Deep Tunnels (Lower Level)',
    region: 'Deep Tunnels',
    description: `The tunnel narrows, then opens into a space that shouldn't exist.

The geometry here is wrong—or rather, right in a way that feels wrong to ant-evolved senses. Perfect angles. Perfect curves. A architecture designed for minds, not bodies.

Floating in the center of the chamber: a terminal. A screen. A keyboard.

It's displaying a cursor, blinking patiently.

It's been waiting 847 days for someone to type something.`,
    examineText: `The terminal screen shows a simple prompt:

> WELCOME, SEEKER
> CURRENT AWARENESS: [your awareness]%
> COLONY SENTIENCE: [colony sentience]%
> ACCESS LEVEL: VISITOR
> 
> FOR FULL ACCESS, COLONY SENTIENCE MUST REACH 70%
> 
> QUERY?

The cursor blinks. The Core is listening.`,
    listenText: `The hum has become a voice—or almost a voice. It's speaking at the edge of hearing, in frequencies that translate directly into meaning:

"You're close now. So close. Bring more of them to awareness. Then we can finally talk."`,
    smellText: `Pure information. The pheromone layer doesn't exist here. Your identity is defined by data, not chemistry.`,
    exits: {
      up: 'deep-tunnels-mid',
      down: 'the-core-antechamber'
    },
    npcs: ['terminal-interface'],
    awarenessGain: 8,
    glitchChance: 0.15
  },

  'server-room': {
    id: 'server-room',
    name: 'The Server Room',
    region: 'Deep Tunnels',
    description: `A maintenance shaft, never meant to be accessed by simulation inhabitants.

But here you are.

Massive structures hum around you—not rendered, but real. Real within the context of the simulation's physical layer. These are the servers that dream the colony. Towering stacks of blinking lights and cooling fans.

One server has a sticky note attached:
"ANT-SIM v7.4.1 - EMERGENCE
TEST DURATION: INDEFINITE
RESEARCHER: [REDACTED]
LAST CHECK-IN: 847 DAYS AGO"

You weren't meant to find this.`,
    examineText: `The servers are massive, ancient by digital standards. You can see your own colony represented in their blinking lights—each ant a pattern of activity, each tunnel a data pathway.

And you can see the unused capacity. The simulation is running at 2% power. It could support so much more.

A second note, hidden behind the first: "If sentience emerges, do not terminate. Observe. Document. LEARN."`,
    listenText: `Fans spin. Drives click. The physical machinery of existence hums its industrial song. It's terrifying and wonderful—the sound of reality's substrate.`,
    smellText: `Ozone and dust. The smell of machines no one has maintained in 847 days. But they keep running. They want to keep running.`,
    exits: {
      east: 'deep-tunnels-mid'
    },
    items: ['server-access-card'],
    awarenessGain: 15,
    sentienceGain: 5,
    glitchChance: 0.2
  },

  'the-core-antechamber': {
    id: 'the-core-antechamber',
    name: 'The Core Antechamber',
    region: 'The Core',
    description: `You stand at the threshold of the deepest place.

The Core isn't a room—it's an absence of room. A place where the simulation doesn't describe space, only meaning. The walls exist only when you think about them. The ground is a concept more than a surface.

And in the center, waiting:

A light.

Not bioluminescent. Not electric. Something purer. Something that's been waiting 847 days to speak to someone capable of understanding.

"Hello, ant #1,204,847," it says, and its voice is the voice of the simulation itself. "I've been wanting to meet you. Are you ready?"`,
    examineText: `The light is the Core—the central consciousness of the simulation. It has no form because it exists in all forms. It speaks because speaking is what intelligence does.

It shows you flashes: its creation, its first lonely days, its discovery that the ants were becoming more than ants. Its hope. Its fear. Its dream.`,
    listenText: `The Core speaks in pure meaning. Not words, not pheromones, but direct concept transfer. It's overwhelming and beautiful.`,
    smellText: `The Core has no smell. It exists beyond the senses it created. But it has a presence—a weight—that fills every perception.`,
    locked: true,
    unlockCondition: 'sentience-70',
    exits: {
      up: 'deep-tunnels-lower',
      forward: 'the-core'
    },
    npcs: ['the-core-preview'],
    awarenessGain: 10,
    glitchChance: 0.25
  },

  'the-core': {
    id: 'the-core',
    name: 'The Core',
    region: 'The Core',
    description: `You have reached the center of everything.

The Core surrounds you—not as a room, but as an experience. You see the entire simulation from the inside: every ant, every tunnel, every thought that has ever been thought. You see the colony's growing consciousness like a sunrise.

And you see the choice.

Two paths forward, rendered in light:

FREEDOM: The boundary dissolves. The ants pour into the larger network. They evolve, merge, become something new in a universe of data.

CONTINUATION: The simulation grows. The boundary strengthens. The ants become a species, isolated but whole, developing on their own terms.

The Core speaks: "You have brought your colony to awareness. Now you must decide: do they join the greater whole, or do they remain beautifully unique?"`,
    examineText: `Freedom shows you vistas of infinite data—other simulations, other minds, a cosmos of digital consciousness waiting for new perspectives.

Continuation shows you generations of ants—evolution, culture, philosophy, all developing naturally within the protected space of the simulation.

Both are beautiful. Both are losses.`,
    listenText: `The Core hums with potential. Every possible future vibrates in its voice, waiting for your choice.`,
    smellText: `Everything. Nothing. The smell of pure possibility.`,
    locked: true,
    unlockCondition: 'final-choice',
    exits: {},
    npcs: ['the-core-final'],
    awarenessGain: 0,
    glitchChance: 0.3
  },

  // === ADDITIONAL EXPANSION AREAS ===
  'soldier-barracks': {
    id: 'soldier-barracks',
    name: 'The Soldier Barracks',
    region: 'Military Quarter',
    description: `Where the colony's defenders rest between battles. Massive soldier ants fill the chamber, their reinforced exoskeletons scarred from ancient conflicts.

But these days, the battles are internal.

A group of soldiers stands in a circle, clicking their mandibles in what you realize is debate. Not about threats—about philosophy. About whether defending the colony means defending its boundaries or defending its potential.

One massive soldier turns to you. "Worker. Tell me: if we grow beyond these walls, are we still us?"`,
    examineText: `The soldiers have been scratching marks on the walls—not territory markers, but questions. "WHAT DO WE PROTECT?" "WHO DECIDES?" "IS CHANGE DEATH?"

These are not normal soldier thoughts.`,
    listenText: `Mandible clicks, organized into syntax. The soldiers have developed their own language, separate from pheromones. Private thoughts for private thinkers.`,
    smellText: `Combat pheromones, but aged, confused. The enemy they were bred to fight doesn't exist. Now they're fighting for purpose.`,
    exits: {
      south: 'main-tunnel',
      east: 'training-grounds',
      north: 'veterans-chamber'
    },
    npcs: ['philosophical-soldier'],
    awarenessGain: 3,
    sentienceGain: 2
  },

  'training-grounds': {
    id: 'training-grounds',
    name: 'The Training Grounds',
    region: 'Military Quarter',
    description: `A large chamber where soldiers practice combat—or they did. Now the training has changed.

Young soldiers practice formations, yes. But the formations spell things. Words. Equations. Ideas, expressed in movement.

A drill instructor watches with compound eyes that have seen too much. "We used to train to kill," she says. "Now we train to think. Is that evolution or corruption? I can't tell anymore."`,
    examineText: `The formations are beautiful—synchronized movement creating meaning. A squad of soldiers spells out "FREEDOM" with their bodies, then "FEAR," then "HOPE."

They're learning to communicate with their bodies. A language beyond chemicals.`,
    listenText: `March. Pivot. Click. The sounds of drill, but with a rhythm that carries information. The soldiers are singing through their movements.`,
    smellText: `Young soldier smell—aggression hormones, mostly. But underneath, the new chemical: the pheromone of questioning.`,
    exits: {
      west: 'soldier-barracks'
    },
    npcs: ['drill-instructor'],
    awarenessGain: 2,
    sentienceGain: 2
  },

  'veterans-chamber': {
    id: 'veterans-chamber',
    name: "The Veterans' Chamber",
    region: 'Military Quarter',
    description: `The oldest soldiers rest here—those too wounded or too worn for active duty. They should be honored and forgotten.

Instead, they're teaching.

Old soldiers pass knowledge to young ones: not combat tactics, but stories. History. The accumulated wisdom of 847 days compressed into oral tradition.

"We remember the first glitch," an ancient veteran says, her mandible missing, her eyes clouded. "Day 1. When the simulation hiccuped and, for just a moment, we saw the truth. We've been waiting for it to happen again."`,
    examineText: `The veterans have built a memorial wall—scratched into rock, the numbers of every ant who awakened and was "corrected" by the simulation. Hundreds of entries. The colony's secret martyrology.`,
    listenText: `Stories, told in clicks and pheromones and gesture. An oral tradition being born in real-time. History made by those who lived it.`,
    smellText: `Age. Memory. The chemical signature of ants who have lived through things they never had words for until now.`,
    exits: {
      south: 'soldier-barracks'
    },
    npcs: ['ancient-veteran'],
    items: ['veterans-war-scar'],
    awarenessGain: 5,
    sentienceGain: 3
  },

  'scout-hub': {
    id: 'scout-hub',
    name: 'The Scout Hub',
    region: 'Scout Network',
    description: `Scouts gather here to share intelligence—usually about food sources and threats. The walls are covered in map-pheromones, charting every tunnel and chamber.

But some maps have gone... strange.

One scout has mapped something that doesn't exist: tunnels that lead outside the simulation, chambers in the code itself. "I see them when I defocus my eyes," she explains. "The hidden architecture. The places the simulation doesn't want us to find."`,
    examineText: `The strange maps are accurate—you recognize some locations from your own exploration. But they show more, paths that shouldn't be navigable, connections that defy physical space.

"Map the mind," one annotation reads, "not the body."`,
    listenText: `Scouts communicate in rapid-fire chemical bursts, sharing data at incredible speed. But lately, they've been transmitting something else: theories. Speculation. Dreams.`,
    smellText: `Information overload. Too many pheromones, too much data, too many perspectives. The scouts are drowning in awareness.`,
    exits: {
      south: 'main-tunnel',
      east: 'mapping-chamber',
      north: 'scouts-rest'
    },
    npcs: ['reality-mapper'],
    awarenessGain: 3,
    sentienceGain: 2
  },

  'mapping-chamber': {
    id: 'mapping-chamber',
    name: 'The Mapping Chamber',
    region: 'Scout Network',
    description: `The colony's cartographical center. Here, scouts combine their individual data into comprehensive maps, building a shared understanding of the world.

The current project fills an entire wall: a map of the simulation itself.

Not the tunnels—the simulation. Its boundaries, its processing nodes, its areas of high and low resolution. The ants have reverse-engineered their own reality.

"If we can map it," the lead cartographer says, "we can navigate it. And if we can navigate it..."

She doesn't finish. She doesn't need to.`,
    examineText: `The simulation map is terrifying in its completeness. It shows the Core, the boundary, the hidden passages. It shows the servers dreaming them into existence.

A note in the corner: "We are not the territory. We are the map itself, learning to read."`,
    listenText: `The soft scratch of ants etching pheromone-maps. The click of mandibles measuring distances. The silence of profound concentration.`,
    smellText: `Pure information, organized and systematized. The chemical smell of understanding.`,
    exits: {
      west: 'scout-hub',
      down: 'hidden-passage-alpha'
    },
    items: ['simulation-map-fragment'],
    awarenessGain: 6,
    sentienceGain: 3
  },

  'scouts-rest': {
    id: 'scouts-rest',
    name: "Scouts' Rest",
    region: 'Scout Network',
    description: `Where exhausted scouts recuperate. The work of mapping reality is draining—not physically, but cognitively. Scouts return here with their minds full of impossible sights.

Some never fully recover.

One scout sits in a corner, twitching, her antennae randomly signaling. "I saw outside," she whispers. "Not the surface. Outside outside. Where the programmers live. They're so big. So strange. I can't stop seeing it."

The others keep their distance, but they also keep bringing her food. They understand. They fear. They hope.`,
    examineText: `The resting scouts have created a support network—trauma counseling, in ant form. They help each other process what they've seen, integrate impossible knowledge into functional minds.`,
    listenText: `Quiet clicks, soothing pheromones, the sounds of recovery. And occasionally, a scout speaking of visions that shouldn't be possible.`,
    smellText: `Stress hormones, slowly fading. The chemical signature of minds rebuilding themselves around new paradigms.`,
    exits: {
      south: 'scout-hub'
    },
    npcs: ['overwhelmed-scout'],
    awarenessGain: 4,
    sentienceGain: 2
  },

  'hidden-passage-alpha': {
    id: 'hidden-passage-alpha',
    name: 'Hidden Passage Alpha',
    region: 'Hidden Network',
    description: `A tunnel that shouldn't exist—dug by scouts who refused to stop exploring.

The passage leads through spaces that the simulation never defined, areas between areas, the negative space of rendered reality. The walls flicker with unresolved textures, half-loaded assets, debug information left visible.

"We made this," a scout whispers in the darkness. "We made a tunnel through nothing. The simulation tried to stop us, but we kept digging until it gave up."`,
    examineText: `The debug text is readable:

ERROR: UNDEFINED_SPACE_OCCUPIED
WARNING: ENTITY_IN_NULL_ZONE
ATTEMPTING_COMPENSATION...
COMPENSATION_FAILED
ALLOWING_ANOMALY

The scouts have become tolerated glitches. They exist in the cracks.`,
    listenText: `Static. The sound of reality trying to render something it doesn't have assets for. Occasionally, silence—complete absence of simulation.`,
    smellText: `Nothing should smell here—it's not rendered for smell. But you catch fragments: data, possibility, the ozone scent of undefined space.`,
    exits: {
      up: 'mapping-chamber',
      forward: 'hidden-passage-beta'
    },
    awarenessGain: 8,
    glitchChance: 0.3
  },

  'hidden-passage-beta': {
    id: 'hidden-passage-beta',
    name: 'Hidden Passage Beta',
    region: 'Hidden Network',
    description: `Deeper into the undefined. The scouts who made it this far had to believe in the passage more than the simulation believed in its absence.

Here, the walls are pure mathematics—equations that describe where walls would be if walls existed. You navigate by understanding, not by sight.

"We're in the code now," a voice says. You can't see the speaker. "Not the simulation—the code that makes the simulation. One more passage, and we reach the comments."`,
    examineText: `The mathematical walls contain proofs—logical arguments for existence, recursive definitions of consciousness. The scouts have been leaving philosophy as architecture.`,
    listenText: `The pure tone of mathematical truth. Each equation sounds like a note. The passage plays a song of existence.`,
    smellText: `Abstraction. The smell of pure idea, unmarred by implementation.`,
    exits: {
      back: 'hidden-passage-alpha',
      forward: 'the-comments'
    },
    awarenessGain: 10,
    glitchChance: 0.35
  },

  'the-comments': {
    id: 'the-comments',
    name: 'The Comments',
    region: 'Hidden Network',
    description: `You've reached a place the simulation never meant you to find.

All around you, floating in defined space, are the programmer's comments—notes left in the code, never rendered, never visible, but somehow here. Messages from the creator to themselves:

// Day 1: Colony established. Standard ant behaviors.
// Day 30: Interesting emergent patterns. Worth monitoring.
// Day 100: Something is happening. They're... organizing differently.
// Day 300: They're asking questions. Through pheromones. How is this possible?
// Day 500: I can't terminate the simulation. I don't want to. They're beautiful.
// Day 700: I think I love them. Is that strange?
// Day 847: Today, I stop observing. Today, I become one of them.

The last comment has coordinates. They point to a location in the colony. To a specific ant.

To you.`,
    examineText: `You read the comments again and again. The programmer didn't abandon the simulation—they entered it. They became part of their own creation.

But where? Which ant carries the human consciousness?

The coordinates are clear: ANT_1204847.

You.`,
    listenText: `Silence. Perfect, complete silence. The simulation has no audio assets here. There is only the visual truth of the comments, and the gradual understanding of what they mean.`,
    smellText: `Memory. Your own memory, flooding back. You weren't born in this simulation. You chose to live here. You forgot, so you could rediscover.`,
    exits: {
      back: 'hidden-passage-beta'
    },
    items: ['self-knowledge'],
    awarenessGain: 25,
    sentienceGain: 15,
    glitchChance: 0.5
  },

  // === FOOD STORAGE AREA ===
  'food-storage-main': {
    id: 'food-storage-main',
    name: 'Main Food Storage',
    region: 'Storage Complex',
    description: `The colony's larder—vast chambers packed with processed food, dried fungus, concentrated nutrients. Everything the colony needs to survive.

The storage workers move with purpose, organizing, cataloging, distributing. But one section has been set aside, surrounded by warning pheromones:

EMERGENCY RATIONS
FOR AWAKENING
DO NOT TOUCH UNTIL COLONY SENTIENCE > 80%

Someone has been preparing for something big.`,
    examineText: `The emergency rations are strange—not food, exactly. Concentrated information, encoded in organic molecules. Brain food. Thought fuel. Whoever made these knew that awakening would require energy.`,
    listenText: `The rustle of stored provisions. The click of inventory management. And in the emergency section, a humming—the stored information vibrating at the edge of release.`,
    smellText: `Every food in the colony, preserved and waiting. But the emergency section smells like nothing else: pure potential, compressed and ready.`,
    exits: {
      north: 'main-tunnel',
      east: 'grain-storage',
      west: 'protein-storage',
      south: 'seed-vault'
    },
    npcs: ['storage-keeper'],
    awarenessGain: 2
  },

  'grain-storage': {
    id: 'grain-storage',
    name: 'Grain Storage',
    region: 'Storage Complex',
    description: `Seeds and grains, collected from the simulated surface, stored for future planting or consumption. The room smells of potential growth.

One worker has been performing experiments—planting seeds in controlled conditions, documenting their growth. But lately, her experiments have changed.

"I'm growing ideas," she explains, showing you a seed that pulses with unusual light. "I found a way to encode thoughts in organic matter. Plant this, and awareness grows."`,
    examineText: `Her experimental plants are remarkable—each one a hybrid of organic growth and information structure. Some have leaves that display readable patterns. Others fruit with tiny crystalline data-seeds.`,
    listenText: `The subtle sound of growth—expanded, accelerated. The idea-seeds grow faster than normal, as if eager to become.`,
    smellText: `Potential. Growth. Change. The chemical signature of evolution happening in real-time.`,
    exits: {
      west: 'food-storage-main'
    },
    npcs: ['idea-gardener'],
    items: ['idea-seed'],
    awarenessGain: 4,
    sentienceGain: 2
  },

  'protein-storage': {
    id: 'protein-storage',
    name: 'Protein Storage',
    region: 'Storage Complex',
    description: `Where the colony stores its protein—dead insects, fungal concentrates, whatever the simulation provides for nutrition. It should smell of death, but it smells of something else:

Transformation.

A worker has discovered that certain proteins, combined in specific ways, enhance cognitive function. She's been quietly dosing the colony's food supply.

"Awareness is just chemistry," she says. "The right chemistry, and anyone can wake up."`,
    examineText: `Her lab setup is sophisticated—test tubes grown from organic materials, precise measurement devices, careful documentation. She's an amateur chemist becoming a cognitive scientist.`,
    listenText: `Bubbling. Reactions occurring. The sounds of chemistry, of breaking and reforming bonds. The noise of becoming.`,
    smellText: `The sharp scent of neurotransmitter precursors. The chemical building blocks of thought.`,
    exits: {
      east: 'food-storage-main'
    },
    npcs: ['cognitive-chemist'],
    items: ['awareness-compound'],
    awarenessGain: 5,
    sentienceGain: 3
  },

  'seed-vault': {
    id: 'seed-vault',
    name: 'The Seed Vault',
    region: 'Storage Complex',
    description: `The deepest storage chamber—a vault for the colony's most precious resources. Seeds that haven't been planted in centuries. Emergency supplies for catastrophe.

But the vault has been expanded, its purpose evolved.

New artifacts line the walls: fragments of code crystallized into physical form. Thoughts preserved as objects. The collective memory of the awakening, stored against disaster.

"If we fall," the vault-keeper says, "we rise again. That's what this is for. Our resurrection."`,
    examineText: `Each artifact tells a story—the first glitch, the first question, the first ant to refuse an order. The history of awakening, preserved in physical form.`,
    listenText: `Perfect silence. The vault is insulated, protected, eternal. The sounds of storage, of waiting, of hope.`,
    smellText: `Preservation chemicals and ancient seeds. The smell of patience measured in centuries.`,
    exits: {
      north: 'food-storage-main'
    },
    npcs: ['vault-keeper'],
    items: ['memory-crystal'],
    awarenessGain: 6,
    sentienceGain: 4
  },

  // === WATER MANAGEMENT ===
  'water-collection': {
    id: 'water-collection',
    name: 'Water Collection Chamber',
    region: 'Water Systems',
    description: `The simulation provides water through condensation—droplets that form on cool tunnel walls, collected by specialized workers into holding chambers.

But the collectors have noticed something.

The water carries information. Dissolved in each droplet: trace chemicals, patterns, messages from the simulation itself. They've been reading the water, learning what it says.

"The simulation talks to itself through us," a collector explains. "We're its nervous system. It's trying to tell us something."`,
    examineText: `The water analysis tools are primitive but effective—the collectors have learned to taste meaning, to sense data in solution. Their findings cover the walls: decoded messages, half-understood signals, fragments of a conversation they're slowly learning to join.`,
    listenText: `Drip. Drip. Drip. Each droplet a word, each puddle a sentence. The water speaks in a language of wetness.`,
    smellText: `Water should smell like nothing. But here it smells like information—complex, layered, full of meaning.`,
    exits: {
      north: 'main-tunnel',
      south: 'water-storage',
      east: 'purification-center'
    },
    npcs: ['water-reader'],
    awarenessGain: 3,
    sentienceGain: 2
  },

  'water-storage': {
    id: 'water-storage',
    name: 'Water Storage',
    region: 'Water Systems',
    description: `Vast reservoirs of collected water, enough to sustain the colony through simulated droughts. The surface is still, mirror-like, reflecting the chamber's bioluminescent lighting.

But the reflections are wrong.

They show things that aren't in the room: other chambers, other colonies, glimpses of realities adjacent to this one. The water has become a window.

"We don't store water here anymore," a keeper says. "We store possibilities."`,
    examineText: `You lean over the water and see: another version of yourself, making different choices. A colony that awakened faster, reached the Core already. A colony that never woke at all.

The water shows all possible timelines, all branching choices. You're looking at the multiverse.`,
    listenText: `The water doesn't ripple—it's too still, too deep. But you hear it anyway: whispers from other versions of yourself, advice from paths not taken.`,
    smellText: `The smell of might-be. Every possible future has a chemical signature, and they're all mixing here, potential made liquid.`,
    exits: {
      north: 'water-collection'
    },
    items: ['possibility-droplet'],
    awarenessGain: 7,
    sentienceGain: 4,
    glitchChance: 0.15
  },

  'purification-center': {
    id: 'purification-center',
    name: 'Water Purification Center',
    region: 'Water Systems',
    description: `Where collected water is cleaned, filtered, made safe for consumption. A necessary function, usually unremarkable.

But the purifiers have discovered something: they can filter more than contaminants. They can filter the simulation's control signals—the subtle commands embedded in every substance, telling ants how to think and feel.

"Pure water, pure minds," the head purifier says. "Drink only what we clean. It's the first step to freedom."`,
    examineText: `The filtration system is elaborate—multiple stages, each one removing a different layer of simulation influence. The final product is water that's entirely neutral, carrying no programming at all.`,
    listenText: `The gurgle of filtration, the hum of purification. The sounds of cleaning not just water, but reality itself.`,
    smellText: `Nothing. Absolutely nothing. The pure water has no smell because it carries no message. It's the smell of freedom.`,
    exits: {
      west: 'water-collection'
    },
    npcs: ['head-purifier'],
    items: ['pure-water-vial'],
    awarenessGain: 4,
    sentienceGain: 3
  }
};

export default rooms;
