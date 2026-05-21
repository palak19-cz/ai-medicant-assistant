import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function RegisterPage() {
  const { t } = useLang()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: ''
  })
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
    if (!form.name.trim())  e.name    = t('err_required')
    if (!form.email)        e.email   = t('err_required')
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('err_email')
    if (!form.phone.trim()) e.phone   = t('err_required')
    if (!form.password)     e.password = t('err_required')
    else if (form.password.length < 8) e.password = t('err_pass_len')
    if (form.password !== form.confirm) e.confirm = t('err_pass_match')
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      await register({
        name: form.name, email: form.email,
        phone: form.phone, password: form.password
      })
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 409) setApiErr('An account with this email already exists.')
      else setApiErr(t('err_network'))
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name',     type: 'text',     icon: 'ti-user',     label: t('reg_name'),    placeholder: 'Rahul Sharma',        auto: 'name' },
    { key: 'email',    type: 'email',    icon: 'ti-mail',     label: t('reg_email'),   placeholder: 'you@example.com',     auto: 'email' },
    { key: 'phone',    type: 'tel',      icon: 'ti-phone',    label: t('reg_phone'),   placeholder: '+91 98765 43210',     auto: 'tel' },
    { key: 'password', type: 'password', icon: 'ti-lock',     label: t('reg_pass'),    placeholder: '••••••••',            auto: 'new-password' },
    { key: 'confirm',  type: 'password', icon: 'ti-lock-check',label: t('reg_confirm'), placeholder: '••••••••',           auto: 'new-password' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card p-8 fade-up fade-up-1">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ti ti-user-plus text-teal-600 text-2xl" aria-hidden="true" />
              </div>
              <h1 className="font-sora font-bold text-2xl text-gray-900 mb-1">{t('reg_title')}</h1>
              <p className="text-sm text-gray-500">{t('reg_sub')}</p>
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
              {fields.map((f) => (
                <div className="mb-4" key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <i className={`ti ${f.icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base`} aria-hidden="true" />
                    <input
                      type={f.key.includes('pass') || f.key === 'confirm' ? (showPass ? 'text' : 'password') : f.type}
                      value={form[f.key]}
                      onChange={set(f.key)}
                      className={`input-field pl-10 ${(f.key === 'password' || f.key === 'confirm') ? 'pr-10' : ''} ${errors[f.key] ? 'border-red-400 bg-red-50' : ''}`}
                      placeholder={f.placeholder}
                      autoComplete={f.auto}
                    />
                    {(f.key === 'password') && (
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle password visibility">
                        <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'} text-base`} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  {errors[f.key] && <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>}
                </div>
              ))}

              {/* Password strength indicator */}
              {form.password && (
                <div className="mb-4">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => {
                      const strength = form.password.length >= 12 ? 4
                        : form.password.length >= 10 ? 3
                        : form.password.length >= 8  ? 2 : 1
                      return (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength
                            ? strength === 1 ? 'bg-red-400'
                              : strength === 2 ? 'bg-amber-400'
                              : strength === 3 ? 'bg-teal-400'
                              : 'bg-teal-600'
                            : 'bg-gray-200'
                        }`} />
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400">
                    {form.password.length < 8 ? 'Too short' : form.password.length < 10 ? 'Fair' : form.password.length < 12 ? 'Good' : 'Strong ✓'}
                  </p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                  : t('reg_btn')}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">{t('reg_or')}</span>
              </div>
            </div>

            {/* Google */}
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200
                               hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700">
              <i className="ti ti-brand-google text-lg" aria-hidden="true" />
              {t('reg_or')} Google
            </button>

            {/* Terms */}
            <p className="text-center text-xs text-gray-400 mt-5">{t('reg_terms')}</p>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500 mt-4">
              {t('reg_have_acc')}{' '}
              <Link to="/login" className="text-teal-600 font-medium hover:text-teal-800 transition-colors">
                {t('reg_login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
