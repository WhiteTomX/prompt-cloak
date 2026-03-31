import { segmentText } from './segmentText'
import type { PiiMapping } from '../types'

function m(overrides: Partial<PiiMapping> & Pick<PiiMapping, 'realValue' | 'pseudonym'>): PiiMapping {
  return { id: '1', category: 'name', caseSensitive: true, ...overrides }
}

describe('segmentText', () => {
  it('returns single plain segment when no mappings', () => {
    expect(segmentText('hello world', [], 'real')).toEqual([{ text: 'hello world' }])
  })

  it('returns empty array for empty text', () => {
    expect(segmentText('', [m({ realValue: 'x', pseudonym: 'y' })], 'real')).toEqual([])
  })

  it('highlights a single mapping in real mode', () => {
    const mapping = m({ realValue: 'John', pseudonym: 'PERSON_1' })
    const result = segmentText('Hello John!', [mapping], 'real')
    expect(result).toEqual([
      { text: 'Hello ' },
      { text: 'John', mapping },
      { text: '!' },
    ])
  })

  it('highlights a single mapping in pseudo mode', () => {
    const mapping = m({ realValue: 'John', pseudonym: 'PERSON_1' })
    const result = segmentText('Hello PERSON_1!', [mapping], 'pseudo')
    expect(result).toEqual([
      { text: 'Hello ' },
      { text: 'PERSON_1', mapping },
      { text: '!' },
    ])
  })

  it('highlights multiple non-overlapping mappings', () => {
    const m1 = m({ id: '1', realValue: 'John', pseudonym: 'P1' })
    const m2 = m({ id: '2', realValue: 'Acme', pseudonym: 'C1', category: 'company' })
    const result = segmentText('John works at Acme.', [m1, m2], 'real')
    expect(result).toEqual([
      { text: 'John', mapping: m1 },
      { text: ' works at ' },
      { text: 'Acme', mapping: m2 },
      { text: '.' },
    ])
  })

  it('longer mapping wins over shorter overlap', () => {
    const short = m({ id: '1', realValue: 'John', pseudonym: 'P1' })
    const long = m({ id: '2', realValue: 'John Smith', pseudonym: 'P2' })
    const result = segmentText('Hello John Smith!', [short, long], 'real')
    expect(result).toEqual([
      { text: 'Hello ' },
      { text: 'John Smith', mapping: long },
      { text: '!' },
    ])
  })

  it('matches case-insensitively when caseSensitive is false', () => {
    const mapping = m({ realValue: 'John', pseudonym: 'P1', caseSensitive: false })
    const result = segmentText('hello JOHN and john', [mapping], 'real')
    expect(result).toEqual([
      { text: 'hello ' },
      { text: 'JOHN', mapping },
      { text: ' and ' },
      { text: 'john', mapping },
    ])
  })

  it('matches case-sensitively by default', () => {
    const mapping = m({ realValue: 'John', pseudonym: 'P1', caseSensitive: true })
    const result = segmentText('hello JOHN and John', [mapping], 'real')
    expect(result).toEqual([
      { text: 'hello JOHN and ' },
      { text: 'John', mapping },
    ])
  })

  it('handles multiple occurrences of the same mapping', () => {
    const mapping = m({ realValue: 'cat', pseudonym: 'ANIMAL' })
    const result = segmentText('the cat sat on a cat', [mapping], 'real')
    expect(result).toEqual([
      { text: 'the ' },
      { text: 'cat', mapping },
      { text: ' sat on a ' },
      { text: 'cat', mapping },
    ])
  })

  it('returns plain segment when text has no matches', () => {
    const mapping = m({ realValue: 'xyz', pseudonym: 'P1' })
    expect(segmentText('hello world', [mapping], 'real')).toEqual([{ text: 'hello world' }])
  })
})
