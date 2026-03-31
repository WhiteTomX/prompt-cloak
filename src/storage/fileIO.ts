import type { MappingSet } from '../types'

export function exportMappings(mappingSet: MappingSet): void {
  const json = JSON.stringify(mappingSet, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${mappingSet.name || 'mappings'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importMappings(file: File): Promise<MappingSet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as MappingSet
        if (parsed.version !== 1 || !Array.isArray(parsed.mappings)) {
          reject(new Error('Invalid mapping file format'))
          return
        }
        resolve(parsed)
      } catch {
        reject(new Error('Failed to parse mapping file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
