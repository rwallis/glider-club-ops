import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { MembersLoginPage } from './pages/MembersLoginPage'
import { MembersStatusPage } from './pages/MembersStatusPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/members/login" element={<MembersLoginPage />} />
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <MembersStatusPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
