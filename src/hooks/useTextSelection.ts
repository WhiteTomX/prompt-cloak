import { useState, useCallback, useRef } from 'react'

export interface SelectionState {
  text: string
  rect: DOMRect | null
}

const MIRROR_STYLES: (keyof CSSStyleDeclaration)[] = [
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
  'letterSpacing', 'wordSpacing', 'paddingTop', 'paddingRight',
  'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth',
  'borderBottomWidth', 'borderLeftWidth', 'boxSizing', 'whiteSpace',
  'wordWrap', 'overflowWrap', 'tabSize',
]

function getSelectionRect(el: HTMLTextAreaElement, start: number, end: number): DOMRect {
  const computed = window.getComputedStyle(el)

  const mirror = document.createElement('div')
  mirror.style.position = 'fixed'
  mirror.style.visibility = 'hidden'
  mirror.style.pointerEvents = 'none'
  mirror.style.overflow = 'auto'
  mirror.style.whiteSpace = 'pre-wrap'

  for (const prop of MIRROR_STYLES) {
    (mirror.style as unknown as Record<string, string>)[prop as string] =
      computed[prop] as string
  }

  const taRect = el.getBoundingClientRect()
  mirror.style.top = `${taRect.top}px`
  mirror.style.left = `${taRect.left}px`
  mirror.style.width = `${taRect.width}px`
  mirror.style.height = `${taRect.height}px`

  const before = document.createTextNode(el.value.slice(0, start))
  const selected = document.createElement('span')
  selected.textContent = el.value.slice(start, end) || '\u200b'
  const after = document.createTextNode(el.value.slice(end))

  mirror.appendChild(before)
  mirror.appendChild(selected)
  mirror.appendChild(after)

  document.body.appendChild(mirror)
  // Sync scroll
  mirror.scrollTop = el.scrollTop
  const rect = selected.getBoundingClientRect()
  document.body.removeChild(mirror)

  return rect
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

    if (!selected || !/\w/.test(selected)) {
      setSelection({ text: '', rect: null })
      return
    }

    const rect = getSelectionRect(el, start, end)
    setSelection({ text: selected, rect })
  }, [])

  const clearSelection = useCallback(() => {
    setSelection({ text: '', rect: null })
  }, [])

  return { selection, textareaRef, handleSelect, clearSelection }
}
