export type StarItemSlot =
  | 'hat'
  | 'glasses'
  | 'neck'
  | 'shoes'
  | 'handheld'
  | 'trail'

export type EquippedStarItems = {
  hat?: string
  glasses?: string
  neck?: string
  shoes?: string
  handheld?: string
  trail?: string
}

export type StarProfile = {
  starName: string
  ownedItemIds: string[]
  equipped: EquippedStarItems
  updatedAt: string
}

const STORAGE_KEY = 'lumamath_star_profiles'

const RANDOM_STAR_NAMES = [
  'Nova',
  'Comet',
  'Spark',
  'Orbit',
  'Glimmer',
  'Pip',
  'Beam',
  'Cosmo',
  'Sunny',
  'Astro',
  'Glow',
  'Nimbus',
]

function getAllStarProfiles(): Record<string, StarProfile> {
  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return {}
  }

  try {
    return JSON.parse(saved) as Record<string, StarProfile>
  } catch {
    return {}
  }
}

function saveAllStarProfiles(profiles: Record<string, StarProfile>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export function getRandomStarName() {
  const index = Math.floor(Math.random() * RANDOM_STAR_NAMES.length)
  return RANDOM_STAR_NAMES[index]
}

export function getStarProfile(studentId: string): StarProfile {
  const profiles = getAllStarProfiles()

  return (
    profiles[studentId] ?? {
      starName: '',
      ownedItemIds: [],
      equipped: {},
      updatedAt: new Date().toISOString(),
    }
  )
}

export function hasNamedStar(studentId: string) {
  return getStarProfile(studentId).starName.trim().length > 0
}

export function updateStarProfile(
  studentId: string,
  updates: Partial<Omit<StarProfile, 'updatedAt'>>,
): StarProfile {
  const profiles = getAllStarProfiles()
  const currentProfile = getStarProfile(studentId)

  const nextProfile: StarProfile = {
    ...currentProfile,
    ...updates,
    starName:
      updates.starName !== undefined
        ? cleanStarName(updates.starName)
        : currentProfile.starName,
    equipped: {
      ...currentProfile.equipped,
      ...updates.equipped,
    },
    updatedAt: new Date().toISOString(),
  }

  profiles[studentId] = nextProfile
  saveAllStarProfiles(profiles)

  return nextProfile
}

export function cleanStarName(name: string) {
  return name.trim().slice(0, 16)
}

export function resetStarProfile(studentId: string) {
  const profiles = getAllStarProfiles()
  delete profiles[studentId]
  saveAllStarProfiles(profiles)
}
