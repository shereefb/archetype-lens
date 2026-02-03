export const ARCHETYPES = {
  // Main archetypes
  king: { name: 'King', color: 'amber', slug: 'king' },
  warrior: { name: 'Warrior', color: 'red', slug: 'warrior' },
  magician: { name: 'Magician', color: 'purple', slug: 'magician' },
  lover: { name: 'Lover', color: 'rose', slug: 'lover' },

  // King sub-archetypes
  elder: { name: 'Elder', color: 'amber', parent: 'king', slug: 'elder' },
  peacemaker: { name: 'Peacemaker', color: 'amber', parent: 'king', slug: 'peacemaker' },
  provider: { name: 'Provider', color: 'amber', parent: 'king', slug: 'provider' },
  visionary: { name: 'Visionary', color: 'amber', parent: 'king', slug: 'visionary' },

  // Warrior sub-archetypes
  explorer: { name: 'Explorer', color: 'red', parent: 'warrior', slug: 'explorer' },
  knight: { name: 'Knight', color: 'red', parent: 'warrior', slug: 'knight' },
  challenger: { name: 'Challenger', color: 'red', parent: 'warrior', slug: 'challenger' },
  chief: { name: 'Chief', color: 'red', parent: 'warrior', slug: 'chief' },

  // Magician sub-archetypes
  alchemist: { name: 'Alchemist', color: 'purple', parent: 'magician', slug: 'alchemist' },
  guide: { name: 'Guide', color: 'purple', parent: 'magician', slug: 'guide' },
  healer: { name: 'Healer', color: 'purple', parent: 'magician', slug: 'healer' },
  seeker: { name: 'Seeker', color: 'purple', parent: 'magician', slug: 'seeker' },

  // Lover sub-archetypes
  artist: { name: 'Artist', color: 'rose', parent: 'lover', slug: 'artist' },
  caregiver: { name: 'Caregiver', color: 'rose', parent: 'lover', slug: 'caregiver' },
  trickster: { name: 'Trickster', color: 'rose', parent: 'lover', slug: 'trickster' },
  infinite_player: { name: 'Infinite Player', color: 'rose', parent: 'lover', slug: 'infiniteplayer' },

  // King shadows (main archetype shadows)
  tyrant: { name: 'Tyrant', color: 'zinc', parent: 'king', shadowOf: 'king', shadow: 'active', slug: 'tyrant' },
  victim: { name: 'Victim', color: 'zinc', parent: 'king', shadowOf: 'king', shadow: 'passive', slug: 'victim' },
  // Elder shadows
  rebel: { name: 'Rebel', color: 'zinc', parent: 'king', shadowOf: 'elder', shadow: 'active', slug: 'rebel' },
  bystander: { name: 'Bystander', color: 'zinc', parent: 'king', shadowOf: 'elder', shadow: 'passive', slug: 'bystander' },
  // Peacemaker shadows
  judge: { name: 'Judge', color: 'zinc', parent: 'king', shadowOf: 'peacemaker', shadow: 'active', slug: 'judge' },
  pushover: { name: 'Pushover', color: 'zinc', parent: 'king', shadowOf: 'peacemaker', shadow: 'passive', slug: 'pushover' },
  // Provider shadows
  codependent: { name: 'Codependent', color: 'zinc', parent: 'king', shadowOf: 'provider', shadow: 'active', slug: 'codependent' },
  mooch: { name: 'Mooch', color: 'zinc', parent: 'king', shadowOf: 'provider', shadow: 'passive', slug: 'mooch' },
  // Visionary shadows
  dreamer: { name: 'Dreamer', color: 'zinc', parent: 'king', shadowOf: 'visionary', shadow: 'active', slug: 'dreamer' },
  traditionalist: { name: 'Traditionalist', color: 'zinc', parent: 'king', shadowOf: 'visionary', shadow: 'passive', slug: 'traditionalist' },

  // Warrior shadows (main archetype shadows)
  bully: { name: 'Bully', color: 'zinc', parent: 'warrior', shadowOf: 'warrior', shadow: 'active', slug: 'bully' },
  wimp: { name: 'Wimp', color: 'zinc', parent: 'warrior', shadowOf: 'warrior', shadow: 'passive', slug: 'wimp' },
  // Explorer shadows
  orphan: { name: 'Orphan', color: 'zinc', parent: 'warrior', shadowOf: 'explorer', shadow: 'active', slug: 'orphan' },
  homebody: { name: 'Homebody', color: 'zinc', parent: 'warrior', shadowOf: 'explorer', shadow: 'passive', slug: 'homebody' },
  // Knight shadows
  loser: { name: 'Loser', color: 'zinc', parent: 'warrior', shadowOf: 'knight', shadow: 'active', slug: 'loser' },
  mercenary: { name: 'Mercenary', color: 'zinc', parent: 'warrior', shadowOf: 'knight', shadow: 'passive', slug: 'mercenary' },
  // Challenger shadows
  asshole: { name: 'Asshole', color: 'zinc', parent: 'warrior', shadowOf: 'challenger', shadow: 'active', slug: 'asshole' },
  doormat: { name: 'Doormat', color: 'zinc', parent: 'warrior', shadowOf: 'challenger', shadow: 'passive', slug: 'doormat' },
  // Chief shadows
  hustler: { name: 'Hustler', color: 'zinc', parent: 'warrior', shadowOf: 'chief', shadow: 'active', slug: 'hustler' },
  chump: { name: 'Chump', color: 'zinc', parent: 'warrior', shadowOf: 'chief', shadow: 'passive', slug: 'chump' },

  // Magician shadows (main archetype shadows)
  manipulator: { name: 'Manipulator', color: 'zinc', parent: 'magician', shadowOf: 'magician', shadow: 'active', slug: 'manipulator' },
  dummy: { name: 'Dummy', color: 'zinc', parent: 'magician', shadowOf: 'magician', shadow: 'passive', slug: 'dummy' },
  // Alchemist shadows
  know_it_all: { name: 'Know-it-all', color: 'zinc', parent: 'magician', shadowOf: 'alchemist', shadow: 'active', slug: 'knowitall' },
  consumer: { name: 'Consumer', color: 'zinc', parent: 'magician', shadowOf: 'alchemist', shadow: 'passive', slug: 'consumer' },
  // Guide shadows
  infidel: { name: 'Infidel', color: 'zinc', parent: 'magician', shadowOf: 'guide', shadow: 'active', slug: 'infidel' },
  space_cadet: { name: 'Space Cadet', color: 'zinc', parent: 'magician', shadowOf: 'guide', shadow: 'passive', slug: 'spacecadet' },
  // Healer shadows
  charlatan: { name: 'Charlatan', color: 'zinc', parent: 'magician', shadowOf: 'healer', shadow: 'active', slug: 'charlatan' },
  wounded_child: { name: 'Wounded Child', color: 'zinc', parent: 'magician', shadowOf: 'healer', shadow: 'passive', slug: 'woundedchild' },
  // Seeker shadows
  extremist: { name: 'Extremist', color: 'zinc', parent: 'magician', shadowOf: 'seeker', shadow: 'active', slug: 'extremist' },
  blind_follower: { name: 'Blind Follower', color: 'zinc', parent: 'magician', shadowOf: 'seeker', shadow: 'passive', slug: 'blindfollower' },

  // Lover shadows (main archetype shadows)
  addict: { name: 'Addict', color: 'zinc', parent: 'lover', shadowOf: 'lover', shadow: 'active', slug: 'addict' },
  hermit: { name: 'Hermit', color: 'zinc', parent: 'lover', shadowOf: 'lover', shadow: 'passive', slug: 'hermit' },
  // Artist shadows
  sellout: { name: 'Sellout', color: 'zinc', parent: 'lover', shadowOf: 'artist', shadow: 'active', slug: 'sellout' },
  tortured_artist: { name: 'Tortured Artist', color: 'zinc', parent: 'lover', shadowOf: 'artist', shadow: 'passive', slug: 'torturedartist' },
  // Caregiver shadows
  narcissist: { name: 'Narcissist', color: 'zinc', parent: 'lover', shadowOf: 'caregiver', shadow: 'active', slug: 'narcissist' },
  martyr: { name: 'Martyr', color: 'zinc', parent: 'lover', shadowOf: 'caregiver', shadow: 'passive', slug: 'martyr' },
  // Trickster shadows
  jerk: { name: 'Jerk', color: 'zinc', parent: 'lover', shadowOf: 'trickster', shadow: 'active', slug: 'jerk' },
  grump: { name: 'Grump', color: 'zinc', parent: 'lover', shadowOf: 'trickster', shadow: 'passive', slug: 'grump' },
  // Infinite Player shadows
  seducer: { name: 'Seducer', color: 'zinc', parent: 'lover', shadowOf: 'infinite_player', shadow: 'active', slug: 'seducer' },
  rigid_romeo: { name: 'Rigid Romeo', color: 'zinc', parent: 'lover', shadowOf: 'infinite_player', shadow: 'passive', slug: 'rigidromeo' },
} as const

// Virtue to archetype mapping for URL generation
export const VIRTUE_MAPPING: Record<string, { archetype: string; slug: string }> = {
  // King pillars
  'Power': { archetype: 'king', slug: 'power' },
  'Vulnerability': { archetype: 'king', slug: 'vulnerability' },
  'Sovereignty': { archetype: 'king', slug: 'sovereignty' },
  'Responsibility': { archetype: 'king', slug: 'responsibility' },
  'Justice': { archetype: 'king', slug: 'justice' },
  'Mercy': { archetype: 'king', slug: 'mercy' },
  'Generosity': { archetype: 'king', slug: 'generosity' },
  'Receptivity': { archetype: 'king', slug: 'receptivity' },
  'Progress': { archetype: 'king', slug: 'progress' },
  'Conservation': { archetype: 'king', slug: 'conservation' },
  // Warrior pillars
  'Strength': { archetype: 'warrior', slug: 'strength' },
  'Compassion': { archetype: 'warrior', slug: 'compassion' },
  'Wanderlust': { archetype: 'warrior', slug: 'wanderlust' },
  'Belonging': { archetype: 'warrior', slug: 'belonging' },
  'Honor': { archetype: 'warrior', slug: 'honor' },
  'Discipline': { archetype: 'warrior', slug: 'discipline' },
  'Confrontation': { archetype: 'warrior', slug: 'confrontation' },
  'Acceptance': { archetype: 'warrior', slug: 'acceptance' },
  'Confidence': { archetype: 'warrior', slug: 'confidence' },
  'Humility': { archetype: 'warrior', slug: 'humility' },
  // Magician pillars
  'Knowledge': { archetype: 'magician', slug: 'knowledge' },
  'Reverence': { archetype: 'magician', slug: 'reverence' },
  'Mastery': { archetype: 'magician', slug: 'mastery' },
  "Beginner's Mind": { archetype: 'magician', slug: 'beginnersmind' },
  'Worldliness': { archetype: 'magician', slug: 'worldliness' },
  'Spirituality': { archetype: 'magician', slug: 'spirituality' },
  'Intuition': { archetype: 'magician', slug: 'intuition' },
  'Empathy': { archetype: 'magician', slug: 'empathy' },
  'Allegiance to the Flame': { archetype: 'magician', slug: 'allegiancetotheflame' },
  'Obedience': { archetype: 'magician', slug: 'obedience' },
  // Lover pillars
  'Passion': { archetype: 'lover', slug: 'passion' },
  'Presence': { archetype: 'lover', slug: 'presence' },
  'Performance': { archetype: 'lover', slug: 'performance' },
  'Authenticity': { archetype: 'lover', slug: 'authenticity' },
  'Self-Worth': { archetype: 'lover', slug: 'selfworth' },
  'Agape': { archetype: 'lover', slug: 'agape' },
  'Mischief': { archetype: 'lover', slug: 'mischief' },
  'Dignity': { archetype: 'lover', slug: 'dignity' },
  'Charm': { archetype: 'lover', slug: 'charm' },
  'Devotion': { archetype: 'lover', slug: 'devotion' },
}

export const VIRTUES = Object.keys(VIRTUE_MAPPING) as readonly string[]

export const CATEGORIES = {
  movie: { name: 'Movie', icon: '🎬' },
  book: { name: 'Book', icon: '📚' },
  history: { name: 'History', icon: '🏛️' },
  story: { name: 'Story', icon: '📜' },
  current_event: { name: 'Current Event', icon: '📰' },
} as const

export type ArchetypeKey = keyof typeof ARCHETYPES
export type Virtue = keyof typeof VIRTUE_MAPPING
export type Category = keyof typeof CATEGORIES

const BASE_URL = 'https://www.maturemasculine.org'

/**
 * Get the URL for an archetype, sub-archetype, or shadow
 * URL patterns:
 * - Main archetype (King): /king/king/
 * - Sub-archetype (Elder): /king/elder/
 * - Shadow of main (Tyrant): /king/king/king--tyrant/
 * - Shadow of sub (Bystander): /king/elder/elder--bystander/
 */
export function getArchetypeUrl(archetypeName: string): string | null {
  const key = archetypeName.toLowerCase().replace(/[\s-]/g, '_').replace("'", '') as ArchetypeKey
  const data = ARCHETYPES[key]

  if (!data) return null

  // Check if it's a shadow
  if ('shadowOf' in data && data.shadowOf) {
    const shadowOfData = ARCHETYPES[data.shadowOf as ArchetypeKey]
    if (!shadowOfData) return null

    // Shadow of sub-archetype: /king/elder/elder--bystander/
    if ('parent' in shadowOfData && shadowOfData.parent) {
      return `${BASE_URL}/${shadowOfData.parent}/${data.shadowOf}/${data.shadowOf}--${data.slug}/`
    } else {
      // Shadow of main archetype: /king/king/king--tyrant/
      return `${BASE_URL}/${data.shadowOf}/${data.shadowOf}/${data.shadowOf}--${data.slug}/`
    }
  }

  // Check if it's a sub-archetype
  if ('parent' in data && data.parent) {
    return `${BASE_URL}/${data.parent}/${data.slug}/`
  }

  // Main archetype: /king/king/
  return `${BASE_URL}/${data.slug}/${data.slug}/`
}

/**
 * Get the URL for a virtue
 */
export function getVirtueUrl(virtueName: string): string | null {
  const mapping = VIRTUE_MAPPING[virtueName]
  if (!mapping) return null

  return `${BASE_URL}/${mapping.archetype}/virtues/${mapping.slug}/`
}
