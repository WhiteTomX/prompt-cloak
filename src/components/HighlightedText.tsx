import { useMemo } from 'react'
import './HighlightedText.css'
import type { PiiMapping } from '../types'
import { segmentText } from '../utils/segmentText'

interface Props {
  text: string
  mappings: PiiMapping[]
  mode: 'real' | 'pseudo'
}

export function HighlightedText({ text, mappings, mode }: Props) {
  const segments = useMemo(
    () => segmentText(text, mappings, mode),
    [text, mappings, mode],
  )

  return (
    <>
      {segments.map((seg, i) =>
        seg.mapping ? (
          <mark key={i} data-category={seg.mapping.category} className="pii-highlight">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  )
}
