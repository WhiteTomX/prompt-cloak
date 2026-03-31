import { useState, useEffect, useCallback } from 'react'
import type { PiiMapping, MappingSet, PiiCategory } from '../types'
import { saveMappings, loadMappings } from '../storage/localStorage'

function emptyMappingSet(): MappingSet {
  return { version: 1, name: 'My Mappings', mappings: [] }
}

export function useMappings() {
  const [mappingSet, setMappingSet] = useState<MappingSet>(() => {
    return loadMappings() ?? emptyMappingSet()
  })

  useEffect(() => {
    saveMappings(mappingSet)
  }, [mappingSet])

  const addMapping = useCallback(
    (realValue: string, pseudonym: string, category: PiiCategory, caseSensitive = true) => {
      const mapping: PiiMapping = {
        id: crypto.randomUUID(),
        realValue,
        pseudonym,
        category,
        caseSensitive,
      }
      setMappingSet(prev => ({ ...prev, mappings: [...prev.mappings, mapping] }))
    },
    [],
  )

  const updateMapping = useCallback((id: string, updates: Partial<Omit<PiiMapping, 'id'>>) => {
    setMappingSet(prev => ({
      ...prev,
      mappings: prev.mappings.map(m => (m.id === id ? { ...m, ...updates } : m)),
    }))
  }, [])

  const removeMapping = useCallback((id: string) => {
    setMappingSet(prev => ({
      ...prev,
      mappings: prev.mappings.filter(m => m.id !== id),
    }))
  }, [])

  const clearMappings = useCallback(() => {
    setMappingSet(emptyMappingSet())
  }, [])

  const replaceMappingSet = useCallback((ms: MappingSet) => {
    setMappingSet(ms)
  }, [])

  const setName = useCallback((name: string) => {
    setMappingSet(prev => ({ ...prev, name }))
  }, [])

  return {
    mappingSet,
    addMapping,
    updateMapping,
    removeMapping,
    clearMappings,
    replaceMappingSet,
    setName,
  }
}
