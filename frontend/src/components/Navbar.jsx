import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <i className="ti ti-stethoscope text-white text-base" aria-hidden="true" />
          </div>
          <span className="font-sora font-bold text-lg">
            <span className="text-teal-600">Medi</span>
            <span className="text-gray-900">Predict</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-teal-600 transition-colors">{t('nav_features')}</a>
          <a href="#how"      className="hover:text-teal-600 transition-colors">{t('nav_how')}</a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <div className="flex bg-gray-100 rounded-full p-0.5">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200
                ${lang === 'en' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200
                ${lang === 'hi' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              हि
            </button>
          </div>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors"
              >
                <i className="ti ti-layout-dashboard text-base" aria-hidden="true" />
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-outline text-sm py-2 px-4">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">
                {t('nav_login')}
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                {t('nav_start')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
