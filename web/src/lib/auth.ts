const KEY = 'ss-auth'

export function isAuthed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setAuthed(v: boolean) {
  if (v) localStorage.setItem(KEY, '1')
  else localStorage.removeItem(KEY)
}
