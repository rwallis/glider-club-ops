import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_MEMBER_ACCESS_CODE,
  USE_DEFAULT_MEMBER_ACCESS,
  getMemberAccessCode,
} from '../config/auth'

const STORAGE_KEY = 'flf-member-session'
const LOGOUT_KEY = 'flf-member-logged-out'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (code: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredAuth(): boolean {
  try {
    if (USE_DEFAULT_MEMBER_ACCESS && sessionStorage.getItem(LOGOUT_KEY) !== 'true') {
      return true
    }
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return USE_DEFAULT_MEMBER_ACCESS
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStoredAuth)

  const login = useCallback((code: string) => {
    if (code.trim() !== getMemberAccessCode()) return false
    sessionStorage.removeItem(LOGOUT_KEY)
    sessionStorage.setItem(STORAGE_KEY, 'true')
    setIsAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
    sessionStorage.setItem(LOGOUT_KEY, 'true')
    sessionStorage.removeItem(STORAGE_KEY)
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { DEFAULT_MEMBER_ACCESS_CODE }
