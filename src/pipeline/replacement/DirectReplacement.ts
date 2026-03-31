import type { ReplacementStrategy, ReplacementPair } from '../types'
import { escapeRegex } from '../../utils/escapeRegex'

/**
 * Single-pass replacement using placeholder tokens.
 *
 * Algorithm:
 *   1. Sort pairs longest-source-first (greedy, prevents partial matches).
 *   2. Replace each source with a unique null-byte-delimited placeholder so
 *      a later shorter match cannot clobber an already-replaced span.
 *   3. Resolve all placeholders to their final targets.
 *
 * This makes the replacement direction-agnostic: callers decide which values
 * are `source` and which are `target`.
 */
export class DirectReplacement implements ReplacementStrategy {
  id = 'direct'

  replace(text: string, pairs: ReplacementPair[]): string {
    if (!text || pairs.length === 0) return text

    // Longest source first — prevents "John" from matching before "John Smith"
    const sorted = [...pairs].sort((a, b) => b.source.length - a.source.length)

    const placeholders = new Map<string, string>()
    let result = text

    for (const pair of sorted) {
      if (!pair.source) continue
      const token = `\x00${placeholders.size}\x00`
      placeholders.set(token, pair.target)
      const flags = pair.caseSensitive === false ? 'gi' : 'g'
      const pattern = new RegExp(escapeRegex(pair.source), flags)
      result = result.replace(pattern, token)
    }

    // Resolve placeholders (tokens contain \x00 so they can't collide with input)
    for (const [token, target] of placeholders) {
      result = result.split(token).join(target)
    }

    return result
  }
}
