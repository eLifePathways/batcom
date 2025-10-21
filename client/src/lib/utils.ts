import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
