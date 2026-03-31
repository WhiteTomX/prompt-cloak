import type { PiiCategory } from '../types'

export const CATEGORIES: PiiCategory[] = [
  'name', 'email', 'address', 'phone', 'date_of_birth', 'id_number', 'company', 'other',
]

export const CATEGORY_LABELS: Record<PiiCategory, string> = {
  name: 'Name',
  email: 'Email',
  address: 'Address',
  phone: 'Phone',
  date_of_birth: 'Date of Birth',
  id_number: 'ID Number',
  company: 'Company',
  other: 'Other',
}

/** Short labels for compact displays (e.g. mapping row badges) */
export const CATEGORY_LABELS_SHORT: Record<PiiCategory, string> = {
  name: 'Name',
  email: 'Email',
  address: 'Address',
  phone: 'Phone',
  date_of_birth: 'DOB',
  id_number: 'ID',
  company: 'Company',
  other: 'Other',
}
