import { KotahiReviewField, KotahiSettingsFormData } from './schema'

import { parse, isValid } from 'date-fns'

const POSSIBLE_FORMATS = [
  'yyyy-MM-dd',
  'yyyy/MM/dd',
  'dd/MM/yyyy',
  'MMMM yyyy', // January 2011
  'MMM yyyy', // Jan 2011
  'yyyy', // 2011
]

export const getYearFromInput = (input: string): number => {
  for (const fmt of POSSIBLE_FORMATS) {
    const parsed = parse(input, fmt, new Date())

    if (isValid(parsed)) {
      return parsed.getFullYear()
    }
  }

  const timestamp = Date.parse(input)
  if (!Number.isNaN(timestamp)) return new Date(timestamp).getFullYear()

  return new Date().getFullYear()
}

export const getValidDate = (input: string): string => {
  for (const fmt of POSSIBLE_FORMATS) {
    const parsed = parse(input, fmt, new Date())

    if (isValid(parsed)) {
      return parsed.toISOString().slice(0, 10)
    }
  }

  const ts = Date.parse(input)
  if (!Number.isNaN(ts)) {
    return new Date(ts).toISOString().slice(0, 10)
  }

  return new Date().toISOString().slice(0, 10)
}

export function isKotahiSettingsFormData(
  data: unknown,
): data is KotahiSettingsFormData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'endpoint' in data &&
    'groupId' in data &&
    'apiKey' in data
  )
}

export const getValueFromReviewField = (
  reviewField: KotahiReviewField | undefined,
): string | string[] => {
  if (!reviewField) return ''

  return reviewField.value
}

export const parseFormValue = (name: string, value: string) => {
  // number fields
  if (name === 'year') return parseInt(value, 10)

  // array of integers
  if (name === 'virusCategoryIds') {
    return [parseInt(value, 10)]
  }

  // array of strings
  if (name === 'regions') {
    return [value]
  }

  // default → regular string
  return value
}
