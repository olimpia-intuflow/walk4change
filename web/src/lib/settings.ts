export type Gender = 'f' | 'm'

const KEY = 'ss-gender'

export function getGender(): Gender {
  const v = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
  return v === 'm' ? 'm' : 'f'
}

export function saveGender(g: Gender) {
  localStorage.setItem(KEY, g)
}

/** Końcówka zależna od płci: g('Gotow','a','y') -> 'Gotowa' / 'Gotowy'. */
export function gword(stem: string, f: string, m: string, gender: Gender) {
  return stem + (gender === 'm' ? m : f)
}
