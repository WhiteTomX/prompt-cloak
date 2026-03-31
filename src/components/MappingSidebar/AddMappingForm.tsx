import { useState } from 'react'
import type { PiiCategory } from '../../types'

const CATEGORIES: PiiCategory[] = [
  'name', 'email', 'address', 'phone', 'date_of_birth', 'id_number', 'company', 'other',
]

const CATEGORY_LABELS: Record<PiiCategory, string> = {
  name: 'Name',
  email: 'Email',
  address: 'Address',
  phone: 'Phone',
  date_of_birth: 'Date of Birth',
  id_number: 'ID Number',
  company: 'Company',
  other: 'Other',
}

interface Props {
  onAdd: (realValue: string, pseudonym: string, category: PiiCategory) => void
}

export function AddMappingForm({ onAdd }: Props) {
  const [realValue, setRealValue] = useState('')
  const [pseudonym, setPseudonym] = useState('')
  const [category, setCategory] = useState<PiiCategory>('name')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!realValue.trim() || !pseudonym.trim()) return
    onAdd(realValue.trim(), pseudonym.trim(), category)
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
          onChange={e => setRealValue(e.target.value)}
        />
        <input
          type="text"
          placeholder="Pseudonym"
          value={pseudonym}
          onChange={e => setPseudonym(e.target.value)}
        />
      </div>
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
