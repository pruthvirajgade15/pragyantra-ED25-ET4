import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {

    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [lang, setLang]       = useState(() => localStorage.getItem('lang') || 'en')

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login(email, password)
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    if (data.language) {
      setLang(data.language)
      localStorage.setItem('lang', data.language)
    }
    return data
  }, [])

  const register = useCallback(async (name, email, password, language = 'en') => {
    const { data } = await authAPI.register({ name, email, password, language })
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    setLang(language)
    localStorage.setItem('lang', language)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const switchLang = useCallback((l) => {
    setLang(l)
    localStorage.setItem('lang', l)
  }, [])

  const value = useMemo(() => ({
    user, loading, lang, login, register, logout, switchLang
  }), [user, loading, lang, login, register, logout, switchLang])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)