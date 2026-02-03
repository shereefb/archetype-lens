export const ARCHETYPES = {
  // Main archetypes
  king: { name: 'King', color: 'amber' },
  warrior: { name: 'Warrior', color: 'red' },
  magician: { name: 'Magician', color: 'purple' },
  lover: { name: 'Lover', color: 'rose' },

  // King sub-archetypes
  elder: { name: 'Elder', color: 'amber', parent: 'king' },
  peacemaker: { name: 'Peacemaker', color: 'amber', parent: 'king' },
  provider: { name: 'Provider', color: 'amber', parent: 'king' },
  visionary: { name: 'Visionary', color: 'amber', parent: 'king' },

  // Warrior sub-archetypes
  explorer: { name: 'Explorer', color: 'red', parent: 'warrior' },
  knight: { name: 'Knight', color: 'red', parent: 'warrior' },
  challenger: { name: 'Challenger', color: 'red', parent: 'warrior' },
  chief: { name: 'Chief', color: 'red', parent: 'warrior' },

  // Magician sub-archetypes
  alchemist: { name: 'Alchemist', color: 'purple', parent: 'magician' },
  guide: { name: 'Guide', color: 'purple', parent: 'magician' },
  healer: { name: 'Healer', color: 'purple', parent: 'magician' },
  seeker: { name: 'Seeker', color: 'purple', parent: 'magician' },

  // Lover sub-archetypes
  artist: { name: 'Artist', color: 'rose', parent: 'lover' },
  caregiver: { name: 'Caregiver', color: 'rose', parent: 'lover' },
  trickster: { name: 'Trickster', color: 'rose', parent: 'lover' },
  infinite_player: { name: 'Infinite Player', color: 'rose', parent: 'lover' },

  // Shadows (using darker shades)
  tyrant: { name: 'Tyrant', color: 'zinc', parent: 'king', shadow: 'active' },
  victim: { name: 'Victim', color: 'zinc', parent: 'king', shadow: 'passive' },
  bully: { name: 'Bully', color: 'zinc', parent: 'warrior', shadow: 'active' },
  wimp: { name: 'Wimp', color: 'zinc', parent: 'warrior', shadow: 'passive' },
  manipulator: { name: 'Manipulator', color: 'zinc', parent: 'magician', shadow: 'active' },
  dummy: { name: 'Dummy', color: 'zinc', parent: 'magician', shadow: 'passive' },
  addict: { name: 'Addict', color: 'zinc', parent: 'lover', shadow: 'active' },
  hermit: { name: 'Hermit', color: 'zinc', parent: 'lover', shadow: 'passive' },
} as const

export const VIRTUES = [
  // King pillars
  'Power', 'Vulnerability', 'Sovereignty', 'Responsibility', 'Justice', 'Mercy',
  'Generosity', 'Receptivity', 'Progress', 'Conservation',
  // Warrior pillars
  'Strength', 'Compassion', 'Wanderlust', 'Belonging', 'Honor', 'Discipline',
  'Confrontation', 'Acceptance', 'Confidence', 'Humility',
  // Magician pillars
  'Knowledge', 'Reverence', 'Mastery', "Beginner's Mind", 'Worldliness', 'Spirituality',
  'Intuition', 'Empathy', 'Allegiance to the Flame', 'Obedience',
  // Lover pillars
  'Passion', 'Presence', 'Performance', 'Authenticity', 'Self-Worth', 'Agape',
  'Mischief', 'Dignity', 'Charm', 'Devotion',
] as const

export const CATEGORIES = {
  movie: { name: 'Movie', icon: '🎬' },
  book: { name: 'Book', icon: '📚' },
  history: { name: 'History', icon: '🏛️' },
  story: { name: 'Story', icon: '📜' },
  current_event: { name: 'Current Event', icon: '📰' },
} as const

export type ArchetypeKey = keyof typeof ARCHETYPES
export type Virtue = typeof VIRTUES[number]
export type Category = keyof typeof CATEGORIES
