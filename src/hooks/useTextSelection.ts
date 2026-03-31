import { useState, useCallback, useRef } from 'react'

export interface SelectionState {
  text: string
  rect: DOMRect | null
}

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionState>({ text: '', rect: null })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSelect = useCallback(() => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = el.value.slice(start, end).trim()

    if (!selected) {
      setSelection({ text: '', rect: null })
      return
    }

    // Position popup near selection — use textarea bounding rect as approximation
    const rect = el.getBoundingClientRect()
    setSelection({ text: selected, rect })
  }, [])

  const clearSelection = useCallback(() => {
    setSelection({ text: '', rect: null })
  }, [])

  return { selection, textareaRef, handleSelect, clearSelection }
}
