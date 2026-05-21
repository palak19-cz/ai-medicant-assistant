import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mp_token')
    const saved = localStorage.getItem('mp_user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    const res = await API.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    const { access_token, user: userData } = res.data
    localStorage.setItem('mp_token', access_token)
    localStorage.setItem('mp_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const register = async ({ name, email, phone, password }) => {
    const res = await API.post('/auth/register', { name, email, phone, password })
    const { access_token, user: userData } = res.data
    localStorage.setItem('mp_token', access_token)
    localStorage.setItem('mp_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('mp_token')
    localStorage.removeItem('mp_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, API }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
