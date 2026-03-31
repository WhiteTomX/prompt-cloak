import { useState } from 'react'
import './AddMappingForm.css'
import type { PiiCategory } from '../../types'
import { CATEGORIES, CATEGORY_LABELS } from '../../constants/categories'
import type { AddMappingResult } from '../../hooks/useMappings'

interface Props {
  onAdd: (realValue: string, pseudonym: string, category: PiiCategory) => AddMappingResult
}

export function AddMappingForm({ onAdd }: Props) {
  const [realValue, setRealValue] = useState('')
  const [pseudonym, setPseudonym] = useState('')
  const [category, setCategory] = useState<PiiCategory>('name')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!realValue.trim() || !pseudonym.trim()) return
    const result = onAdd(realValue.trim(), pseudonym.trim(), category)
    if (!result.added) {
      setError(result.reason ?? 'Duplicate mapping')
      return
    }
    setError('')
    setRealValue('')
    setPseudonym('')
  }

  return (
    <form className="add-mapping-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          placeholder="Real value"
          value={realValue}
          onChange={e => { setRealValue(e.target.value); setError('') }}
        />
        <input
          type="text"
          placeholder="Pseudonym"
          value={pseudonym}
          onChange={e => setPseudonym(e.target.value)}
        />
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-row">
        <select value={category} onChange={e => setCategory(e.target.value as PiiCategory)}>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary" disabled={!realValue.trim() || !pseudonym.trim()}>
          Add
        </button>
      </div>
    </form>
  )
}
