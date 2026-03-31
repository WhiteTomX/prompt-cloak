import { useState, useEffect } from 'react'
import './MappingSidebar.css'
import type { PiiMapping, PiiCategory, MappingSet } from '../../types'
import type { AddMappingResult } from '../../hooks/useMappings'
import { MappingRow } from './MappingRow'
import { AddMappingForm } from './AddMappingForm'
import { ImportExportControls } from '../ImportExportControls'
import { ConfirmDialog } from '../ConfirmDialog'

interface Props {
  mappingSet: MappingSet
  onAdd: (realValue: string, pseudonym: string, category: PiiCategory) => AddMappingResult
  onUpdate: (id: string, updates: Partial<Omit<PiiMapping, 'id'>>) => void
  onRemove: (id: string) => void
  onClear: () => void
  onReplace: (ms: MappingSet) => void
  open?: boolean
  lastSaved: number | null
}

export function MappingSidebar({ mappingSet, onAdd, onUpdate, onRemove, onClear, onReplace, open, lastSaved }: Props) {
  const [filterText, setFilterText] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (lastSaved === null) return
    setShowSaved(true)
    const timer = setTimeout(() => setShowSaved(false), 2000)
    return () => clearTimeout(timer)
  }, [lastSaved])

  const hasMappings = mappingSet.mappings.length > 0
  const filtered = filterText
    ? mappingSet.mappings.filter(m =>
        m.realValue.toLowerCase().includes(filterText.toLowerCase()) ||
        m.pseudonym.toLowerCase().includes(filterText.toLowerCase())
      )
    : mappingSet.mappings

  function handleClearClick() {
    setShowConfirm(true)
  }

  function handleClearConfirm() {
    onClear()
    setShowConfirm(false)
    setFilterText('')
  }

  return (
    <div className={`sidebar${open ? ' open' : ''}`} role="complementary" aria-label="Mapping management">
      <div className="sidebar-header">
        <h2>
          Mappings ({mappingSet.mappings.length})
          {showSaved && <span className="saved-indicator"> Saved</span>}
        </h2>
        <button
          className="btn-ghost"
          onClick={handleClearClick}
          disabled={!hasMappings}
          title="Clear all mappings"
        >
          Clear all
        </button>
      </div>

      <div className="mapping-list">
        {hasMappings && (
          <input
            type="text"
            className="mapping-filter"
            placeholder="Filter mappings..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        )}

        {!hasMappings ? (
          <div className="empty-state">
            <div className="empty-state-icon">{ }</div>
            <span className="empty-state-title">No mappings yet</span>
            <ol className="empty-state-steps">
              <li>Paste text in the input panel</li>
              <li>Select a sensitive word or phrase</li>
              <li>Or use the form below to add manually</li>
            </ol>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-title">No matches</span>
          </div>
        ) : (
          filtered.map(m => (
            <MappingRow key={m.id} mapping={m} onUpdate={onUpdate} onRemove={onRemove} />
          ))
        )}
      </div>

      <div className="sidebar-section-label">Add New</div>
      <AddMappingForm onAdd={onAdd} />
      <ImportExportControls mappingSet={mappingSet} onReplace={onReplace} />

      {showConfirm && (
        <ConfirmDialog
          title="Clear all mappings"
          message={`This will remove all ${mappingSet.mappings.length} mapping${mappingSet.mappings.length === 1 ? '' : 's'}. This cannot be undone.`}
          confirmLabel="Clear all"
          onConfirm={handleClearConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
