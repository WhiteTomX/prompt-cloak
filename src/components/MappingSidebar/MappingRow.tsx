import './MappingRow.css'
import type { PiiMapping } from '../../types'
import { CATEGORY_LABELS_SHORT } from '../../constants/categories'

interface Props {
  mapping: PiiMapping
  onUpdate: (id: string, updates: Partial<Omit<PiiMapping, 'id'>>) => void
  onRemove: (id: string) => void
}

export function MappingRow({ mapping, onUpdate, onRemove }: Props) {
  return (
    <div className="mapping-row">
      <input
        type="text"
        value={mapping.realValue}
        onChange={e => onUpdate(mapping.id, { realValue: e.target.value })}
        title="Real value"
        placeholder="Real value"
      />
      <input
        type="text"
        value={mapping.pseudonym}
        onChange={e => onUpdate(mapping.id, { pseudonym: e.target.value })}
        title="Pseudonym"
        placeholder="Pseudonym"
      />
      <button
        className="btn-danger"
        onClick={() => onRemove(mapping.id)}
        title="Remove mapping"
        aria-label={`Remove mapping for ${mapping.realValue}`}
      >
        ×
      </button>
      <span className={`category-badge cat-${mapping.category}`}>
        {CATEGORY_LABELS_SHORT[mapping.category]}
      </span>
    </div>
  )
}
