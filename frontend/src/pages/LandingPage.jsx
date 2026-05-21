import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import Navbar from '../components/Navbar'

const features = [
  { key: '1', icon: 'ti-file-text',     color: 'bg-teal-50   text-teal-600',   border: 'border-teal-100' },
  { key: '2', icon: 'ti-stethoscope',   color: 'bg-coral-50  text-coral-400',  border: 'border-orange-100' },
  { key: '3', icon: 'ti-calendar',      color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
  { key: '4', icon: 'ti-bell',          color: 'bg-amber-50  text-amber-400',  border: 'border-amber-100' },
  { key: '5', icon: 'ti-lock',          color: 'bg-teal-50   text-teal-600',   border: 'border-teal-100' },
]

const steps = ['how_1', 'how_2', 'how_3', 'how_4']

export default function LandingPage() {
  const { t } = useLang()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-coral-50 rounded-full blur-3xl opacity-40 -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-600
                          text-xs font-semibold px-4 py-2 rounded-full mb-6 fade-up fade-up-1">
            <span className="w-2 h-2 bg-teal-400 rounded-full pulse-teal" />
            {t('hero_badge')}
          </div>

          {/* Headline */}
          <h1 className="font-sora font-bold text-5xl sm:text-6xl text-gray-900 leading-tight mb-6 fade-up fade-up-2">
            {t('hero_h1_a')}<br />
            <span className="text-teal-600">{t('hero_h1_b')}</span>
          </h1>

          {/* Sub */}
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed fade-up fade-up-3">
            {t('hero_p')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 fade-up fade-up-4">
            <Link to="/register" className="btn-primary text-base px-8 py-4 w-full sm:w-auto text-center">
              {t('hero_cta')} →
            </Link>
            <a href="#features" className="btn-outline text-base px-8 py-4 w-full sm:w-auto text-center">
              {t('nav_features')}
            </a>
          </div>

          <p className="text-xs text-gray-400 fade-up fade-up-5">{t('hero_sub')}</p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 fade-up fade-up-6">
            {['trust_1','trust_2','trust_3'].map((k) => (
              <div key={k} className="flex items-center gap-2 text-sm text-gray-500">
                <i className="ti ti-shield-check text-teal-600 text-base" aria-hidden="true" />
                {t(k)}
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual — health stats cards */}
        <div className="relative max-w-2xl mx-auto mt-16 float">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Health score</p>
                <p className="font-sora font-bold text-4xl text-teal-600 mt-0.5">78<span className="text-lg text-gray-400 font-normal">/100</span></p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-teal-400 border-t-teal-100 flex items-center justify-center">
                <span className="font-sora font-bold text-sm text-teal-600">78%</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Medicines', value: '3', icon: 'ti-pill',     bg: 'bg-teal-50', tc: 'text-teal-600' },
                { label: 'Reports',   value: '12', icon: 'ti-file',    bg: 'bg-purple-50', tc: 'text-purple-600' },
                { label: 'Next visit', value: '7d', icon: 'ti-calendar', bg: 'bg-amber-50', tc: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                  <i className={`ti ${s.icon} ${s.tc} text-xl`} aria-hidden="true" />
                  <p className={`font-sora font-bold text-lg ${s.tc} mt-1`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Reminder bar */}
            <div className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <i className="ti ti-bell text-amber-400 text-lg" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-600">Medicine reminder</p>
                <p className="text-xs text-gray-500">Metformin 500mg — due at 8:00 PM</p>
              </div>
              <span className="text-xs bg-amber-400 text-white px-2 py-0.5 rounded-full font-medium">Now</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">{t('feat_title')}</p>
            <h2 className="font-sora font-bold text-4xl text-gray-900">{t('feat_sub')}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.key}
                className={`card p-6 border ${f.border} hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default`}>
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <i className={`ti ${f.icon} text-2xl`} aria-hidden="true" />
                </div>
                <div className="inline-block bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full mb-3">
                  {t(`feat_${f.key}_tag`)}
                </div>
                <h3 className="font-sora font-semibold text-lg text-gray-900 mb-2">
                  {t(`feat_${f.key}_title`)}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t(`feat_${f.key}_desc`)}
                </p>
              </div>
            ))}

            {/* CTA card */}
            <div className="card p-6 bg-teal-600 border-teal-600 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <i className="ti ti-rocket text-white text-2xl" aria-hidden="true" />
                </div>
                <h3 className="font-sora font-semibold text-xl text-white mb-2">Ready to start?</h3>
                <p className="text-sm text-teal-100 leading-relaxed mb-6">
                  Create your free account in 30 seconds and take control of your health.
                </p>
              </div>
              <Link to="/register" className="bg-white text-teal-600 font-semibold text-sm px-5 py-3 rounded-xl
                                              hover:bg-teal-50 transition-colors text-center">
                {t('hero_cta')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-sora font-bold text-4xl text-gray-900">{t('how_title')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((key, i) => (
              <div key={key} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100
                                flex items-center justify-center mx-auto mb-4
                                font-sora font-bold text-xl text-teal-600">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-gray-700 leading-snug">{t(key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────── */}
      <section className="py-24 px-4 bg-teal-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-sora font-bold text-4xl text-white mb-4">{t('cta_h')}</h2>
          <p className="text-teal-100 text-lg mb-10">{t('cta_p')}</p>
          <Link to="/register"
            className="inline-block bg-white text-teal-600 font-semibold text-base
                       px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors">
            {t('cta_btn')} →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-teal-600 rounded flex items-center justify-center">
            <i className="ti ti-stethoscope text-white text-xs" aria-hidden="true" />
          </div>
          <span className="font-sora font-bold text-gray-700">
            <span className="text-teal-600">Medi</span>Predict
          </span>
        </div>
        <p>© 2026 MediPredict · Built with ❤️ for better health</p>
      </footer>
    </div>
  )
}
