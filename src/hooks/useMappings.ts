import { useState, useEffect, useCallback } from 'react'
import type { PiiMapping, MappingSet, PiiCategory } from '../types'
import { saveMappings, loadMappings } from '../storage/localStorage'

function emptyMappingSet(): MappingSet {
  return { version: 1, name: 'My Mappings', mappings: [] }
}

export interface AddMappingResult {
  added: boolean
  reason?: string
}

export function useMappings() {
  const [mappingSet, setMappingSet] = useState<MappingSet>(() => {
    return loadMappings() ?? emptyMappingSet()
  })
  const [saveCount, setSaveCount] = useState(0)

  useEffect(() => {
    saveMappings(mappingSet)
  }, [mappingSet])

  function bumpSave() {
    setSaveCount(c => c + 1)
  }

  const addMapping = useCallback(
    (realValue: string, pseudonym: string, category: PiiCategory, caseSensitive = true): AddMappingResult => {
      let duplicate = false
      setMappingSet(prev => {
        const exists = prev.mappings.some(
          m => m.realValue.toLowerCase() === realValue.toLowerCase()
        )
        if (exists) {
          duplicate = true
          return prev
        }
        const mapping: PiiMapping = {
          id: crypto.randomUUID(),
          realValue,
          pseudonym,
          category,
          caseSensitive,
        }
        return { ...prev, mappings: [...prev.mappings, mapping] }
      })
      if (duplicate) {
        return { added: false, reason: `"${realValue}" already has a mapping` }
      }
      bumpSave()
      return { added: true }
    },
    [],
  )

  const updateMapping = useCallback((id: string, updates: Partial<Omit<PiiMapping, 'id'>>) => {
    setMappingSet(prev => ({
      ...prev,
      mappings: prev.mappings.map(m => (m.id === id ? { ...m, ...updates } : m)),
    }))
    bumpSave()
  }, [])

  const removeMapping = useCallback((id: string) => {
    setMappingSet(prev => ({
      ...prev,
      mappings: prev.mappings.filter(m => m.id !== id),
    }))
    bumpSave()
  }, [])

  const clearMappings = useCallback(() => {
    setMappingSet(emptyMappingSet())
    bumpSave()
  }, [])

  const replaceMappingSet = useCallback((ms: MappingSet) => {
    setMappingSet(ms)
    bumpSave()
  }, [])

  const setName = useCallback((name: string) => {
    setMappingSet(prev => ({ ...prev, name }))
    bumpSave()
  }, [])

  return {
    mappingSet,
    addMapping,
    updateMapping,
    removeMapping,
    clearMappings,
    replaceMappingSet,
    setName,
    saveCount,
  }
}
