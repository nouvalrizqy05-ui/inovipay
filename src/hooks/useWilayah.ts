import { useState, useEffect } from 'react'

export interface Province {
  code: string
  name: string
}

export interface Regency {
  code: string
  name: string
}

export function useWilayah() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingRegencies, setLoadingRegencies] = useState(false)
  
  // If API fails, we use text input fallback
  const [isFallbackMode, setIsFallbackMode] = useState(false)

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const res = await fetch('https://wilayah.id/api/provinces.json')
        if (!res.ok) throw new Error('Failed to fetch provinces')
        const data = await res.json()
        if (data && data.data) {
          setProvinces(data.data)
        } else {
          setIsFallbackMode(true)
        }
      } catch (err) {
        console.error('API Wilayah Error:', err)
        setIsFallbackMode(true)
      } finally {
        setLoadingProvinces(false)
      }
    }

    fetchProvinces()
  }, [])

  const fetchRegencies = async (provinceCode: string) => {
    if (isFallbackMode) return
    setLoadingRegencies(true)
    setRegencies([])
    try {
      const res = await fetch(`https://wilayah.id/api/regencies/${provinceCode}.json`)
      if (!res.ok) throw new Error('Failed to fetch regencies')
      const data = await res.json()
      if (data && data.data) {
        setRegencies(data.data)
      } else {
        setIsFallbackMode(true)
      }
    } catch (err) {
      console.error('API Wilayah Error:', err)
      setIsFallbackMode(true)
    } finally {
      setLoadingRegencies(false)
    }
  }

  const resetRegencies = () => {
    setRegencies([])
  }

  return {
    provinces,
    regencies,
    loadingProvinces,
    loadingRegencies,
    isFallbackMode,
    fetchRegencies,
    resetRegencies
  }
}
