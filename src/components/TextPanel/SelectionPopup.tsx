import { useState, useEffect, useRef } from 'react'
import './SelectionPopup.css'
import type { PiiCategory, PiiMapping } from '../../types'
import { CATEGORIES, CATEGORY_LABELS } from '../../constants/categories'

interface Props {
  selectedText: string
  anchorRect: DOMRect
  existingMapping: PiiMapping | null
  onConfirm: (pseudonym: string, category: PiiCategory) => void
  onCancel: () => void
}

export function SelectionPopup({ selectedText, anchorRect, existingMapping, onConfirm, onCancel }: Props) {
  const [pseudonym, setPseudonym] = useState(existingMapping?.pseudonym ?? '')
  const [category, setCategory] = useState<PiiCategory>(existingMapping?.category ?? 'name')
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
      role="dialog"
      aria-label="Create pseudonym mapping"
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
            {existingMapping ? 'Update' : 'Add Mapping'}
          </button>
        </div>
      </form>
    </div>
  )
}
