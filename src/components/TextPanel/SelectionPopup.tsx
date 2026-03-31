import { useState, useEffect, useRef } from 'react'
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
  selectedText: string
  anchorRect: DOMRect
  onConfirm: (pseudonym: string, category: PiiCategory) => void
  onCancel: () => void
}

export function SelectionPopup({ selectedText, anchorRect, onConfirm, onCancel }: Props) {
  const [pseudonym, setPseudonym] = useState('')
  const [category, setCategory] = useState<PiiCategory>('name')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Position below the selected text, flip above if not enough space
  const popupHeight = 160
  const popupWidth = 260
  const fitsBelow = anchorRect.bottom + 8 + popupHeight < window.innerHeight
  const top = fitsBelow ? anchorRect.bottom + 8 : anchorRect.top - popupHeight - 8
  const left = Math.min(anchorRect.left, window.innerWidth - popupWidth - 8)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pseudonym.trim()) return
    onConfirm(pseudonym.trim(), category)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div
      className="selection-popup"
      style={{ top, left }}
      onKeyDown={handleKeyDown}
    >
      <div className="selected-text">{selectedText}</div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as PiiCategory)}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <input
          ref={inputRef}
          type="text"
          placeholder="Pseudonym (e.g. PERSON_1)"
          value={pseudonym}
          onChange={e => setPseudonym(e.target.value)}
        />
        <div className="popup-actions">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={!pseudonym.trim()}>
            Add Mapping
          </button>
        </div>
      </form>
    </div>
  )
}
