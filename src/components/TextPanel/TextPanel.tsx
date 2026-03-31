import { useCallback, useEffect, useRef } from 'react'
import './TextPanel.css'
import type { PiiCategory, PiiMapping } from '../../types'
import type { AddMappingResult } from '../../hooks/useMappings'
import { useTextSelection } from '../../hooks/useTextSelection'
import { useToast } from '../Toast'
import { SelectionPopup } from './SelectionPopup'
import { HighlightedText } from '../HighlightedText'

interface Props {
  value: string
  onChange: (v: string) => void
  mappings: PiiMapping[]
  onAddMapping: (realValue: string, pseudonym: string, category: PiiCategory) => AddMappingResult
  onUpdateMapping: (id: string, updates: Partial<Omit<PiiMapping, 'id'>>) => void
  active?: boolean
}

export function TextPanel({ value, onChange, mappings, onAddMapping, onUpdateMapping, active }: Props) {
  const { selection, textareaRef, handleSelect, clearSelection } = useTextSelection()
  const containerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

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

  const existingMapping = mappings.find(
    m => m.realValue.toLowerCase() === selection.text.toLowerCase()
  ) ?? null

  function handleConfirm(pseudonym: string, category: PiiCategory) {
    if (existingMapping) {
      onUpdateMapping(existingMapping.id, { pseudonym, category })
    } else {
      const result = onAddMapping(selection.text, pseudonym, category)
      if (!result.added) {
        toast.show(result.reason ?? 'Duplicate mapping', 'error')
        return
      }
    }
    clearSelection()
  }

  const syncScroll = useCallback(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [textareaRef])

  return (
    <div ref={containerRef} style={{ display: 'contents' }}>
      <div className="panel" data-active={active}>
        <div className="panel-header">
          <h2>Input — Your Text</h2>
          <span className="panel-hint">Select text to create a mapping</span>
        </div>
        <div className="panel-body text-panel-body">
          {!value && (
            <div className="text-panel-empty">
              <div className="empty-step-number">1</div>
              <h3>Paste your text</h3>
              <p>Paste any text containing sensitive information, then select words to create pseudonym mappings.</p>
              <div className="empty-example">
                <span className="empty-example-original">John Smith</span>
                <span className="empty-example-arrow">&rarr;</span>
                <span className="empty-example-pseudo">PERSON_1</span>
              </div>
            </div>
          )}
          <div ref={backdropRef} className="text-panel-backdrop" aria-hidden="true">
            <HighlightedText text={value} mappings={mappings} mode="real" />
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onMouseUp={handleSelect}
            onKeyUp={handleSelect}
            onScroll={syncScroll}
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
          existingMapping={existingMapping}
          onConfirm={handleConfirm}
          onCancel={clearSelection}
        />
      )}
    </div>
  )
}
