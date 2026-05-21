import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Navbar from '../components/Navbar'

// ── Severity config ────────────────────────────────────────
const SEV = {
  Mild:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500',  icon: 'ti-mood-smile'   },
  Moderate: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500',  icon: 'ti-mood-neutral' },
  Severe:   { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500',    icon: 'ti-mood-sad'     },
}

// ── Translations ───────────────────────────────────────────
const txt = {
  en: {
    title:        'Symptom checker',
    subtitle:     'Describe what you\'re feeling — text, voice, or photo',
    lang_label:   'AI responds in:',
    placeholder:  'e.g. I have a sore throat, mild fever since 2 days, and body ache…',
    char_count:   (n) => `${n} / 2000`,
    add_photo:    'Add photo of symptom',
    photo_added:  'Photo added ✓',
    remove_photo: 'Remove',
    analyse_btn:  'Analyse symptoms',
    analysing:    'AI is analysing your symptoms…',
    ai_note:      'Takes about 5–10 seconds',
    history_title:'Recent checks',
    no_history:   'No previous checks yet',
    // Result sections
    condition:    'Likely condition',
    severity:     'Severity',
    description:  'What this means',
    avoid_title:  'What to avoid',
    medicines:    'Suggested relief',
    remedies:     'Home remedies',
    tests_title:  'Tests if it worsens',
    see_doctor:   'See a doctor if',
    recovery:     'Typical recovery',
    disclaimer:   '⚠ This is AI guidance only. It is not a medical diagnosis. Always consult a qualified doctor for medical decisions.',
    check_again:  '+ Check another symptom',
    saved:        'Check saved to your history',
    err_short:    'Please describe your symptoms in at least a few words.',
    err_api:      'Analysis failed. Please try again.',
    err_img:      'Only JPG, PNG, WEBP images are supported.',
    err_size:     'Image too large. Max 8 MB.',
    photo_tip:    'You can upload a photo of a rash, swelling, or visible symptom.',
  },
  hi: {
    title:        'लक्षण जाँचकर्ता',
    subtitle:     'अपना लक्षण बताएं — टेक्स्ट, आवाज़ या फोटो',
    lang_label:   'AI इस भाषा में जवाब दे:',
    placeholder:  'उदा. मुझे 2 दिन से गले में दर्द, हल्का बुखार और बदन दर्द है…',
    char_count:   (n) => `${n} / 2000`,
    add_photo:    'लक्षण की फोटो जोड़ें',
    photo_added:  'फोटो जोड़ी गई ✓',
    remove_photo: 'हटाएं',
    analyse_btn:  'लक्षण विश्लेषण करें',
    analysing:    'AI आपके लक्षणों का विश्लेषण कर रहा है…',
    ai_note:      'इसमें 5–10 सेकंड लगते हैं',
    history_title:'हाल की जाँच',
    no_history:   'अभी तक कोई जाँच नहीं',
    condition:    'संभावित स्थिति',
    severity:     'गंभीरता',
    description:  'इसका क्या मतलब है',
    avoid_title:  'क्या न करें',
    medicines:    'सुझाई गई दवाइयाँ',
    remedies:     'घरेलू उपाय',
    tests_title:  'बिगड़ने पर टेस्ट',
    see_doctor:   'डॉक्टर को कब दिखाएं',
    recovery:     'सामान्य रिकवरी समय',
    disclaimer:   '⚠ यह केवल AI मार्गदर्शन है। यह चिकित्सा निदान नहीं है। चिकित्सा निर्णयों के लिए हमेशा योग्य डॉक्टर से परामर्श लें।',
    check_again:  '+ दूसरा लक्षण जाँचें',
    saved:        'जाँच आपके इतिहास में सहेजी गई',
    err_short:    'कृपया अपने लक्षण थोड़ा विस्तार से बताएं।',
    err_api:      'विश्लेषण विफल हुआ। पुनः प्रयास करें।',
    err_img:      'केवल JPG, PNG, WEBP चित्र स्वीकार्य हैं।',
    err_size:     'चित्र बहुत बड़ा है। अधिकतम 8 MB।',
    photo_tip:    'आप चकत्ते, सूजन या दिखाई देने वाले लक्षण की फोटो अपलोड कर सकते हैं।',
  },
}

// ── Result section component ───────────────────────────────
function Section({ icon, label, children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-50  border-gray-100',
    teal:   'bg-teal-50  border-teal-100',
    amber:  'bg-amber-50 border-amber-100',
    red:    'bg-red-50   border-red-100',
    purple: 'bg-purple-50 border-purple-100',
    blue:   'bg-blue-50  border-blue-100',
    green:  'bg-green-50 border-green-100',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <i className={`ti ${icon} text-base text-gray-600`} />
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      </div>
      {children}
    </div>
  )
}

// ── History item ───────────────────────────────────────────
function HistoryItem({ check, t, onClick }) {
  const sev  = SEV[check.analysis?.severity] || SEV.Mild
  const date = new Date(check.created_at).toLocaleDateString()
  return (
    <button onClick={() => onClick(check)}
      className="w-full text-left card p-4 border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${sev.dot}`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{check.analysis?.likely_condition}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{check.symptom_text}</p>
          <p className="text-xs text-gray-300 mt-1">{date}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${sev.bg} ${sev.text}`}>
          {check.analysis?.severity}
        </span>
      </div>
    </button>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function SymptomPage() {
  const { API } = useAuth()
  const { lang } = useLang()
  const t = txt[lang]

  const [aiLang, setAiLang]     = useState(lang)
  const [text, setText]         = useState('')
  const [image, setImage]       = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [history, setHistory]   = useState([])
  const [error, setError]       = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const imgRef = useRef()

  // Load history lazily
  const loadHistory = async () => {
    if (historyLoaded) { setShowHistory(h => !h); return }
    try {
      const res = await API.get('/symptoms/?limit=10')
      setHistory(res.data)
      setHistoryLoaded(true)
      setShowHistory(true)
    } catch {}
  }

  const handleImage = (f) => {
    setError('')
    const ALLOWED = ['image/jpeg','image/png','image/webp']
    if (!ALLOWED.includes(f.type)) { setError(t.err_img); return }
    if (f.size > 8 * 1024 * 1024)  { setError(t.err_size); return }
    setImage(f)
    setImgPreview(URL.createObjectURL(f))
  }

  const removeImage = () => { setImage(null); setImgPreview(null) }

  const analyse = async () => {
    if (text.trim().length < 3) { setError(t.err_short); return }
    setLoading(true); setError(''); setResult(null)

    const form = new FormData()
    form.append('symptom_text', text.trim())
    form.append('language', aiLang)
    if (image) form.append('image', image)

    try {
      const res = await API.post('/symptoms/analyse', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      // prepend to history
      setHistory(h => [res.data, ...h])
    } catch {
      setError(t.err_api)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setText(''); setImage(null); setImgPreview(null)
    setResult(null); setError('')
  }

  const a = result?.analysis || {}
  const sev = SEV[a.severity] || SEV.Mild

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 fade-up fade-up-1">
          <Link to="/dashboard"
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
            <i className="ti ti-arrow-left text-gray-600" />
          </Link>
          <div>
            <h1 className="font-sora font-bold text-xl text-gray-900">{t.title}</h1>
            <p className="text-xs text-gray-400">{t.subtitle}</p>
          </div>
          {/* History toggle */}
          <button onClick={loadHistory}
            className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal-600 transition-colors border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <i className="ti ti-history text-sm" />
            {t.history_title}
          </button>
        </div>

        {/* History drawer */}
        {showHistory && (
          <div className="mb-6 fade-up fade-up-1">
            <div className="card border border-gray-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{t.history_title}</p>
              {history.length === 0
                ? <p className="text-sm text-gray-400 text-center py-4">{t.no_history}</p>
                : <div className="space-y-2">
                    {history.map(h => (
                      <HistoryItem key={h.id} check={h} t={t}
                        onClick={(c) => { setResult(c); setShowHistory(false) }} />
                    ))}
                  </div>
              }
            </div>
          </div>
        )}

        {/* ── Input form ── */}
        {!result && (
          <div className="space-y-4 fade-up fade-up-2">

            {/* Language selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">{t.lang_label}</span>
              <div className="flex bg-gray-100 rounded-full p-0.5">
                {['en','hi'].map(l => (
                  <button key={l} onClick={() => setAiLang(l)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
                      ${aiLang === l ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                    {l === 'en' ? 'English' : 'हिंदी'}
                  </button>
                ))}
              </div>
            </div>

            {/* Text area */}
            <div className="card border border-gray-200 overflow-hidden">
              <textarea
                value={text}
                onChange={e => { setText(e.target.value.slice(0,2000)); setError('') }}
                placeholder={t.placeholder}
                rows={5}
                className="w-full px-4 pt-4 pb-2 text-sm text-gray-900 placeholder-gray-400
                           bg-white resize-none outline-none font-dm leading-relaxed"
              />
              <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <span className="text-xs text-gray-300">{t.char_count(text.length)}</span>
                {/* quick chips */}
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {(lang === 'en'
                    ? ['Fever','Headache','Cough','Stomach pain','Rash']
                    : ['बुखार','सिरदर्द','खांसी','पेट दर्द','चकत्ते']
                  ).map(chip => (
                    <button key={chip}
                      onClick={() => setText(p => p ? p + ', ' + chip.toLowerCase() : chip.toLowerCase())}
                      className="text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600
                                 px-2 py-0.5 rounded-full transition-colors">
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Photo section */}
            <div className="card border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-3">{t.photo_tip}</p>
              {!imgPreview ? (
                <button onClick={() => imgRef.current.click()}
                  className="flex items-center gap-2 text-sm text-teal-600 font-medium hover:text-teal-800 transition-colors">
                  <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                    <i className="ti ti-camera text-teal-600" />
                  </div>
                  {t.add_photo}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={imgPreview} alt="symptom" className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                  <div>
                    <p className="text-sm font-medium text-teal-600">{t.photo_added}</p>
                    <button onClick={removeImage} className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors">
                      {t.remove_photo}
                    </button>
                  </div>
                </div>
              )}
              <input ref={imgRef} type="file" accept=".jpg,.jpeg,.png,.webp"
                className="hidden" onChange={e => handleImage(e.target.files[0])} />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <i className="ti ti-alert-circle" /> {error}
              </div>
            )}

            {/* Analyse btn */}
            {!loading ? (
              <button onClick={analyse} disabled={!text.trim()}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50">
                <i className="ti ti-brain text-lg" />
                {t.analyse_btn}
              </button>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="font-medium text-gray-700">{t.analysing}</p>
                <p className="text-xs text-gray-400 mt-1">{t.ai_note}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <div className="space-y-4 fade-up fade-up-1">

            {/* Saved banner */}
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl">
              <i className="ti ti-circle-check" /> {t.saved}
            </div>

            {/* Condition + severity header */}
            <div className={`rounded-2xl border p-5 ${sev.bg} ${sev.border}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">{t.condition}</p>
                  <h2 className="font-sora font-bold text-xl text-gray-900">{a.likely_condition}</h2>
                  {a.recovery_time && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <i className="ti ti-clock" /> {t.recovery}: {a.recovery_time}
                    </p>
                  )}
                </div>
                <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${sev.bg} border ${sev.border} flex-shrink-0`}>
                  <i className={`ti ${sev.icon} text-2xl ${sev.text}`} />
                  <span className={`text-xs font-bold ${sev.text}`}>{a.severity}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Section icon="ti-info-circle" label={t.description} color="blue">
              <p className="text-sm text-gray-700 leading-relaxed">{a.description}</p>
            </Section>

            {/* What to avoid */}
            {a.avoid?.length > 0 && (
              <Section icon="ti-ban" label={t.avoid_title} color="red">
                <ul className="space-y-2">
                  {a.avoid.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <i className="ti ti-x text-red-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Suggested medicines */}
            {a.suggested_medicines && (
              <Section icon="ti-pill" label={t.medicines} color="teal">
                <p className="text-sm text-gray-700 leading-relaxed">{a.suggested_medicines}</p>
              </Section>
            )}

            {/* Home remedies */}
            {a.home_remedies?.length > 0 && (
              <Section icon="ti-home-heart" label={t.remedies} color="green">
                <ul className="space-y-2">
                  {a.home_remedies.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <i className="ti ti-check text-green-600 flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Tests if worsens */}
            {a.tests_if_worsens?.length > 0 && (
              <Section icon="ti-test-pipe" label={t.tests_title} color="purple">
                <ul className="space-y-2">
                  {a.tests_if_worsens.map((test, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <i className="ti ti-flask text-purple-600 flex-shrink-0 mt-0.5" />
                      {test}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* See doctor if */}
            {a.see_doctor_if && (
              <Section icon="ti-stethoscope" label={t.see_doctor} color="amber">
                <p className="text-sm text-gray-700 leading-relaxed">{a.see_doctor_if}</p>
              </Section>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 bg-gray-100 rounded-xl p-4">
              <i className="ti ti-shield-exclamation text-gray-400 text-base flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">{t.disclaimer}</p>
            </div>

            {/* Check again */}
            <button onClick={reset}
              className="btn-outline w-full py-3 text-sm">
              {t.check_again}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
