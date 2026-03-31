export type PiiCategory =
  | 'name'
  | 'email'
  | 'address'
  | 'phone'
  | 'date_of_birth'
  | 'id_number'
  | 'company'
  | 'other'

export interface PiiMapping {
  id: string
  realValue: string
  pseudonym: string
  category: PiiCategory
  caseSensitive: boolean
}

export interface MappingSet {
  version: 1
  name: string
  mappings: PiiMapping[]
}
