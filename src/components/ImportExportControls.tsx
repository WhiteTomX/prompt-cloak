import { useRef } from 'react'
import './ImportExportControls.css'
import type { MappingSet } from '../types'
import { exportMappings, importMappings } from '../storage/fileIO'
import { useToast } from './Toast'

interface Props {
  mappingSet: MappingSet
  onReplace: (ms: MappingSet) => void
}

export function ImportExportControls({ mappingSet, onReplace }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  function handleExport() {
    exportMappings(mappingSet)
    toast.show('Mappings exported', 'success')
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
      toast.show(`Imported ${ms.mappings.length} mappings`, 'success')
    } catch (err) {
      toast.show((err as Error).message, 'error')
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
