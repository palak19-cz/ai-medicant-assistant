import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import Dashboard          from './pages/Dashboard'
import PrescriptionPage   from './pages/PrescriptionPage'
import SymptomPage        from './pages/SymptomPage'
import AlarmPage          from './pages/AlarmPage'
import RecordsPage        from './pages/RecordsPage'
import DoctorVisitPage    from './pages/DoctorVisitPage'

// Placeholder pages for Phases 3-5 (we'll build these next)
const ComingSoon = ({ title }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <i className="ti ti-tools text-teal-600 text-3xl" aria-hidden="true" />
      </div>
      <h2 className="font-sora font-bold text-2xl text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm">Coming in the next phase — building now!</p>
      <a href="/dashboard" className="inline-block mt-6 btn-outline text-sm py-2 px-5">← Back to dashboard</a>
    </div>
  </div>
)

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<LandingPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/dashboard/prescription" element={
              <ProtectedRoute><PrescriptionPage /></ProtectedRoute>
            } />
            <Route path="/dashboard/symptoms" element={
              <ProtectedRoute><SymptomPage /></ProtectedRoute>
            } />
            <Route path="/dashboard/doctor" element={
              <ProtectedRoute><DoctorVisitPage /></ProtectedRoute>
            } />
            <Route path="/dashboard/alarms" element={
              <ProtectedRoute><AlarmPage /></ProtectedRoute>
            } />
            <Route path="/dashboard/records" element={
              <ProtectedRoute><RecordsPage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
