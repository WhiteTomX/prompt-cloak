import type { MappingSet } from '../types'

const STORAGE_KEY = 'pseudonymizer_mappings_v1'

export function saveMappings(mappingSet: MappingSet): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappingSet))
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

export function loadMappings(): MappingSet | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MappingSet
    if (parsed.version !== 1) return null
    return parsed
  } catch {
    return null
  }
}

export function clearMappings(): void {
  localStorage.removeItem(STORAGE_KEY)
}
