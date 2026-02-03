import { cookies } from 'next/headers'

const SELECTION_COOKIE = 'archetype-lens-selection'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function getSelectionFromCookie(): Promise<string[]> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SELECTION_COOKIE)
  if (!cookie) return []
  try {
    return JSON.parse(cookie.value)
  } catch {
    return []
  }
}

export async function setSelectionCookie(sourceIds: string[]) {
  const cookieStore = await cookies()
  cookieStore.set(SELECTION_COOKIE, JSON.stringify(sourceIds), {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  })
}

export async function addToSelection(sourceId: string) {
  const current = await getSelectionFromCookie()
  if (!current.includes(sourceId)) {
    await setSelectionCookie([...current, sourceId])
  }
}

export async function removeFromSelection(sourceId: string) {
  const current = await getSelectionFromCookie()
  await setSelectionCookie(current.filter(id => id !== sourceId))
}
