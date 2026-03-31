import { useRef } from 'react'
import type { MappingSet } from '../types'
import { exportMappings, importMappings } from '../storage/fileIO'

interface Props {
  mappingSet: MappingSet
  onReplace: (ms: MappingSet) => void
}

export function ImportExportControls({ mappingSet, onReplace }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    exportMappings(mappingSet)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const ms = await importMappings(file)
      onReplace(ms)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="import-export">
      <button
        className="btn-ghost"
        onClick={handleExport}
        disabled={mappingSet.mappings.length === 0}
        title="Export mappings as JSON"
      >
        Export JSON
      </button>
      <button className="btn-ghost" onClick={handleImportClick} title="Import mappings from JSON">
        Import JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
