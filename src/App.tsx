import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ClubStatusProvider } from './context/ClubStatusContext'
import { FieldTasksProvider } from './context/FieldTasksContext'
import { SignupProvider } from './context/SignupContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MembersLayout } from './components/members/MembersLayout'
import { HomePage } from './pages/HomePage'
import { MembersFieldTasksPage } from './pages/MembersFieldTasksPage'
import { MembersLoginPage } from './pages/MembersLoginPage'
import { MembersStatusPage } from './pages/MembersStatusPage'
import { MembersSignupPage } from './pages/MembersSignupPage'

export default function App() {
  return (
    <AuthProvider>
      <ClubStatusProvider>
        <FieldTasksProvider>
          <SignupProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/members/login" element={<MembersLoginPage />} />
              <Route
                path="/members"
                element={
                  <ProtectedRoute>
                    <MembersLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<MembersStatusPage />} />
                <Route path="signup" element={<MembersSignupPage />} />
                <Route path="tasks" element={<MembersFieldTasksPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SignupProvider>
        </FieldTasksProvider>
      </ClubStatusProvider>
    </AuthProvider>
  )
}
