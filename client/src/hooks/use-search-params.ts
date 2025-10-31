import { useLocation } from 'wouter'
import { useMemo } from 'react'

const useQueryParams = () => {
  const [location] = useLocation()
  return useMemo(() => new URLSearchParams(window.location.search), [location])
}

export default useQueryParams
