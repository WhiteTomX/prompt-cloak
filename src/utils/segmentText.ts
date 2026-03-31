import type { PiiMapping } from '../types'
import { escapeRegex } from './escapeRegex'

export interface TextSegment {
  text: string
  mapping?: PiiMapping
}

/**
 * Split text into segments, tagging spans that match a mapping value.
 *
 * @param text    The full text to segment.
 * @param mappings The current mapping set.
 * @param mode    `'real'` matches `realValue`, `'pseudo'` matches `pseudonym`.
 * @returns An array of segments in document order.
 */
export function segmentText(
  text: string,
  mappings: PiiMapping[],
  mode: 'real' | 'pseudo',
): TextSegment[] {
  if (!text || mappings.length === 0) return text ? [{ text }] : []

  // Longest match value first — mirrors DirectReplacement's greedy strategy
  const sorted = [...mappings].sort((a, b) => {
    const aVal = mode === 'real' ? a.realValue : a.pseudonym
    const bVal = mode === 'real' ? b.realValue : b.pseudonym
    return bVal.length - aVal.length
  })

  // Collect all match ranges
  const ranges: { start: number; end: number; mapping: PiiMapping }[] = []

  for (const m of sorted) {
    const value = mode === 'real' ? m.realValue : m.pseudonym
    if (!value) continue
    const flags = m.caseSensitive === false ? 'gi' : 'g'
    const pattern = new RegExp(escapeRegex(value), flags)
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      const start = match.index
      const end = start + match[0].length
      // Skip if this range overlaps with an already-claimed range
      const overlaps = ranges.some(r => start < r.end && end > r.start)
      if (!overlaps) {
        ranges.push({ start, end, mapping: m })
      }
    }
  }

  if (ranges.length === 0) return [{ text }]

  // Sort ranges by position
  ranges.sort((a, b) => a.start - b.start)

  // Build segments
  const segments: TextSegment[] = []
  let cursor = 0

  for (const r of ranges) {
    if (r.start > cursor) {
      segments.push({ text: text.slice(cursor, r.start) })
    }
    segments.push({ text: text.slice(r.start, r.end), mapping: r.mapping })
    cursor = r.end
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) })
  }

  return segments
}
