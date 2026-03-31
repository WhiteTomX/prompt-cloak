import { useEffect, useRef } from 'react'
import type { PiiCategory } from '../../types'
import { useTextSelection } from '../../hooks/useTextSelection'
import { SelectionPopup } from './SelectionPopup'

interface Props {
  value: string
  onChange: (v: string) => void
  onAddMapping: (realValue: string, pseudonym: string, category: PiiCategory) => void
}

export function TextPanel({ value, onChange, onAddMapping }: Props) {
  const { selection, textareaRef, handleSelect, clearSelection } = useTextSelection()
  const containerRef = useRef<HTMLDivElement>(null)

  // Close popup when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      const popup = document.querySelector('.selection-popup')
      if (popup && !popup.contains(e.target as Node)) {
        clearSelection()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [clearSelection])

  function handleConfirm(pseudonym: string, category: PiiCategory) {
    onAddMapping(selection.text, pseudonym, category)
    clearSelection()
  }

  return (
    <div ref={containerRef} style={{ display: 'contents' }}>
      <div className="panel">
        <div className="panel-header">
          <h2>Input — Your Text</h2>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Select text to create a mapping
          </span>
        </div>
        <div className="panel-body">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onMouseUp={handleSelect}
            onKeyUp={handleSelect}
            placeholder="Paste your text here. Select any sensitive word or phrase to pseudonymize it."
            spellCheck={false}
          />
        </div>
        <div className="panel-footer">
          <span className="char-count">{value.length} chars</span>
        </div>
      </div>

      {selection.text && selection.rect && (
        <SelectionPopup
          selectedText={selection.text}
          anchorRect={selection.rect}
          onConfirm={handleConfirm}
          onCancel={clearSelection}
        />
      )}
    </div>
  )
}
