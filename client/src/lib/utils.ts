import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { QUALITY_COLOURS, QualityKey } from '@shared/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const setToken = (token: string) => {
  localStorage.setItem('batcom_admin_token', token)
}
export const getToken = () => {
  return localStorage.getItem('batcom_admin_token')
}
export const clearToken = () => {
  localStorage.removeItem('batcom_admin_token')
}

/**
 * Validate the stored JWT without a round-trip: it must be well-formed and not
 * past its `exp` claim. The signature can only be checked server-side, so a
 * forged token still passes here but is rejected on the next API call (which
 * then redirects to login). This is enough to keep an expired session out of
 * the admin area immediately.
 */
export const isTokenValid = (): boolean => {
  const token = getToken()
  if (!token) return false

  try {
    const payloadB64 = token.split('.')[1]
    if (!payloadB64) return false

    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as { exp?: number }

    if (typeof payload.exp !== 'number') return false

    // `exp` is in seconds since the epoch
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export const getQualityColour = (key: string): string => {
  const quality = key.slice(9) as QualityKey
  return QUALITY_COLOURS[quality]
}
