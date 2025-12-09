import { KotahiReviewField, KotahiSettingsFormData } from './schema'

export const getYearFromInput = (dateString: string): number => {
  const timestamp = Date.parse(dateString)

  if (Number.isNaN(timestamp)) {
    // Invalid date → fallback to current year
    return new Date().getFullYear()
  }

  return new Date(timestamp).getFullYear()
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
): string => {
  if (!reviewField) return ''

  if (Array.isArray(reviewField.value)) {
    return reviewField.value[0]
  }

  return reviewField.value
}
