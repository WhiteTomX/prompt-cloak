import type { PiiMapping, PiiCategory, MappingSet } from '../../types'
import { MappingRow } from './MappingRow'
import { AddMappingForm } from './AddMappingForm'
import { ImportExportControls } from '../ImportExportControls'

interface Props {
  mappingSet: MappingSet
  onAdd: (realValue: string, pseudonym: string, category: PiiCategory) => void
  onUpdate: (id: string, updates: Partial<Omit<PiiMapping, 'id'>>) => void
  onRemove: (id: string) => void
  onClear: () => void
  onReplace: (ms: MappingSet) => void
}

export function MappingSidebar({ mappingSet, onAdd, onUpdate, onRemove, onClear, onReplace }: Props) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Mappings ({mappingSet.mappings.length})</h2>
        <button
          className="btn-ghost"
          onClick={onClear}
          disabled={mappingSet.mappings.length === 0}
          title="Clear all mappings"
        >
          Clear all
        </button>
      </div>

      <div className="mapping-list">
        {mappingSet.mappings.length === 0 ? (
          <div className="empty-state">
            <span>No mappings yet</span>
            <span>Select text in the input or use the form below</span>
          </div>
        ) : (
          mappingSet.mappings.map(m => (
            <MappingRow key={m.id} mapping={m} onUpdate={onUpdate} onRemove={onRemove} />
          ))
        )}
      </div>

      <AddMappingForm onAdd={onAdd} />
      <ImportExportControls mappingSet={mappingSet} onReplace={onReplace} />
    </div>
  )
}
