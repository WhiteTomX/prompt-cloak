import { describe, it, expect } from 'vitest'
import { DirectReplacement } from './DirectReplacement'

const dr = new DirectReplacement()

describe('DirectReplacement', () => {
  it('returns text unchanged when no pairs', () => {
    expect(dr.replace('hello world', [])).toBe('hello world')
  })

  it('returns empty string unchanged', () => {
    expect(dr.replace('', [{ source: 'a', target: 'b' }])).toBe('')
  })

  it('replaces a single term', () => {
    const result = dr.replace('Hello John', [{ source: 'John', target: 'PERSON_1' }])
    expect(result).toBe('Hello PERSON_1')
  })

  it('replaces all occurrences', () => {
    const result = dr.replace('John met John at the park', [{ source: 'John', target: 'PERSON_1' }])
    expect(result).toBe('PERSON_1 met PERSON_1 at the park')
  })

  it('longest match wins over shorter overlapping match', () => {
    const pairs = [
      { source: 'John', target: 'PERSON_1' },
      { source: 'John Smith', target: 'PERSON_2' },
    ]
    const result = dr.replace('Hello John Smith', pairs)
    expect(result).toBe('Hello PERSON_2')
  })

  it('does not double-replace (pseudonym is not re-processed)', () => {
    // If PERSON_1 were also a source, it should not be replaced
    const pairs = [
      { source: 'John', target: 'PERSON_1' },
      { source: 'PERSON_1', target: 'oops' },
    ]
    // John → PERSON_1 (token), then PERSON_1 source won't match token
    const result = dr.replace('John', pairs)
    expect(result).toBe('PERSON_1')
  })

  it('handles special regex characters in source', () => {
    const result = dr.replace('price: $100.00', [{ source: '$100.00', target: 'AMOUNT' }])
    expect(result).toBe('price: AMOUNT')
  })

  it('case-sensitive by default', () => {
    const result = dr.replace('john and John', [{ source: 'John', target: 'PERSON_1' }])
    expect(result).toBe('john and PERSON_1')
  })

  it('case-insensitive when caseSensitive is false', () => {
    const result = dr.replace('john and John', [
      { source: 'John', target: 'PERSON_1', caseSensitive: false },
    ])
    expect(result).toBe('PERSON_1 and PERSON_1')
  })

  it('replaces multiple different terms', () => {
    const pairs = [
      { source: 'John', target: 'PERSON_1' },
      { source: 'Acme Corp', target: 'COMPANY_1' },
    ]
    const result = dr.replace('John works at Acme Corp', pairs)
    expect(result).toBe('PERSON_1 works at COMPANY_1')
  })

  it('round-trips: pseudonymize then depseudonymize equals original', () => {
    const original = 'John Smith works at Acme Corp. Email: john@acme.com'
    const forwardPairs = [
      { source: 'John Smith', target: 'PERSON_1' },
      { source: 'Acme Corp', target: 'COMPANY_1' },
      { source: 'john@acme.com', target: 'EMAIL_1' },
    ]
    const pseudonymized = dr.replace(original, forwardPairs)
    expect(pseudonymized).toBe('PERSON_1 works at COMPANY_1. Email: EMAIL_1')

    const reversePairs = forwardPairs.map(p => ({ source: p.target, target: p.source }))
    const restored = dr.replace(pseudonymized, reversePairs)
    expect(restored).toBe(original)
  })

  it('handles empty source gracefully', () => {
    const result = dr.replace('hello', [{ source: '', target: 'x' }])
    expect(result).toBe('hello')
  })
})
