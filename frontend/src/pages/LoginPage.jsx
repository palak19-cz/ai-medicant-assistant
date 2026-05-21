import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function LoginPage() {
  const { t } = useLang()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr]   = useState('')
  const [showPass, setShowPass] = useState(false)

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(er => ({ ...er, [k]: '' }))
    setApiErr('')
  }

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = t('err_required')
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('err_email')
    if (!form.password) e.password = t('err_required')
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 401) setApiErr(t('err_login'))
      else setApiErr(t('err_network'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="card p-8 fade-up fade-up-1">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ti ti-stethoscope text-teal-600 text-2xl" aria-hidden="true" />
              </div>
              <h1 className="font-sora font-bold text-2xl text-gray-900 mb-1">{t('login_title')}</h1>
              <p className="text-sm text-gray-500">{t('login_sub')}</p>
            </div>

            {/* API Error */}
            {apiErr && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600
                              text-sm px-4 py-3 rounded-xl mb-6">
                <i className="ti ti-alert-circle text-base" aria-hidden="true" />
                {apiErr}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('login_email')}
                </label>
                <div className="relative">
                  <i className="ti ti-mail absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" aria-hidden="true" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    className={`input-field pl-10 ${errors.email ? 'border-red-400 bg-red-50' : ''}`}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-gray-700">{t('login_pass')}</label>
                  <a href="#" className="text-xs text-teal-600 hover:text-teal-800 transition-colors">
                    {t('login_forgot')}
                  </a>
                </div>
                <div className="relative">
                  <i className="ti ti-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" aria-hidden="true" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 bg-red-50' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPass ? 'Hide password' : 'Show password'}>
                    <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'} text-base`} aria-hidden="true" />
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading...</>
                  : t('login_btn')}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
                <span className="bg-white px-3">{t('login_or')}</span>
              </div>
            </div>

            {/* Social / biometric */}
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-200
                                 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600">
                <i className="ti ti-brand-google text-lg" aria-hidden="true" />
                <span className="text-xs font-medium">Google</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-200
                                 hover:bg-teal-50 hover:border-teal-200 transition-all text-gray-600 hover:text-teal-600">
                <i className="ti ti-fingerprint text-lg" aria-hidden="true" />
                <span className="text-xs font-medium">{t('login_fp')}</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-200
                                 hover:bg-teal-50 hover:border-teal-200 transition-all text-gray-600 hover:text-teal-600">
                <i className="ti ti-eye text-lg" aria-hidden="true" />
                <span className="text-xs font-medium">{t('login_face')}</span>
              </button>
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              {t('login_no_acc')}{' '}
              <Link to="/register" className="text-teal-600 font-medium hover:text-teal-800 transition-colors">
                {t('login_reg')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
