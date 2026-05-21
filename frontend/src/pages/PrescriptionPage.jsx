import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Navbar from '../components/Navbar'

// ── Category colour map ────────────────────────────────────
const CAT_COLORS = {
  Antidiabetic:     { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500'   },
  Antibiotic:       { bg: 'bg-coral-50',  text: 'text-coral-600',  dot: 'bg-coral-400'  },
  Antihypertensive: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Painkiller:       { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  Supplement:       { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  Antifungal:       { bg: 'bg-pink-50',   text: 'text-pink-700',   dot: 'bg-pink-400'   },
  default:          { bg: 'bg-gray-100',  text: 'text-gray-700',   dot: 'bg-gray-400'   },
}
const catColor = (cat) => CAT_COLORS[cat] || CAT_COLORS.default

// ── Translations ───────────────────────────────────────────
const txt = {
  en: {
    title:       'Prescription reader',
    back:        'Dashboard',
    drop_title:  'Upload your prescription',
    drop_sub:    'Drag & drop or tap to browse · JPG, PNG, PDF · Handwritten OK',
    browse:      'Browse file',
    analysing:   'AI is reading your prescription…',
    ai_note:     'This may take 10–20 seconds',
    found:       (n) => `✓ ${n} medicine${n !== 1 ? 's' : ''} found`,
    doctor:      'Doctor',
    patient:     'Patient',
    date:        'Date',
    diagnosis:   'Diagnosis',
    purpose:     'Treats',
    how_helps:   'How it helps',
    side_fx:     'Common side effects',
    frequency:   'Frequency',
    duration:    'Duration',
    instructions:'Instructions',
    set_alarm:   'Set medicine reminders →',
    save_ok:     'Prescription saved to your records',
    error_type:  'Only JPG, PNG, PDF files are supported.',
    error_size:  'File is too large. Max 10 MB.',
    error_api:   'Analysis failed. Please try again.',
    new_upload:  '+ Upload another prescription',
    general_advice: 'General advice',
    follow_up:   'Follow-up',
    raw_text:    'Raw OCR text',
    toggle_raw:  'Show raw text',
    hide_raw:    'Hide raw text',
    no_meds:     'No medicines detected. Please try a clearer image.',
    lang_label:  'Analyse in:',
  },
  hi: {
    title:       'प्रिस्क्रिप्शन रीडर',
    back:        'डैशबोर्ड',
    drop_title:  'अपना प्रिस्क्रिप्शन अपलोड करें',
    drop_sub:    'खींचें व छोड़ें या ब्राउज़ करें · JPG, PNG, PDF · हस्तलिखित भी मान्य',
    browse:      'फ़ाइल चुनें',
    analysing:   'AI आपका प्रिस्क्रिप्शन पढ़ रहा है…',
    ai_note:     'इसमें 10–20 सेकंड लग सकते हैं',
    found:       (n) => `✓ ${n} दवाई${n !== 1 ? 'याँ' : ''} मिलीं`,
    doctor:      'डॉक्टर',
    patient:     'मरीज़',
    date:        'तारीख',
    diagnosis:   'निदान',
    purpose:     'किसके लिए',
    how_helps:   'कैसे मदद करती है',
    side_fx:     'सामान्य दुष्प्रभाव',
    frequency:   'कितनी बार',
    duration:    'कितने दिन',
    instructions:'निर्देश',
    set_alarm:   'दवाई अनुस्मारक सेट करें →',
    save_ok:     'प्रिस्क्रिप्शन रिकॉर्ड में सहेजा गया',
    error_type:  'केवल JPG, PNG, PDF फ़ाइलें स्वीकार्य हैं।',
    error_size:  'फ़ाइल बहुत बड़ी है। अधिकतम 10 MB।',
    error_api:   'विश्लेषण विफल हुआ। पुनः प्रयास करें।',
    new_upload:  '+ दूसरा प्रिस्क्रिप्शन अपलोड करें',
    general_advice: 'सामान्य सलाह',
    follow_up:   'अनुवर्ती',
    raw_text:    'OCR टेक्स्ट',
    toggle_raw:  'OCR टेक्स्ट दिखाएं',
    hide_raw:    'OCR टेक्स्ट छुपाएं',
    no_meds:     'कोई दवाई नहीं मिली। कृपया साफ़ तस्वीर आज़माएं।',
    lang_label:  'किस भाषा में विश्लेषण करें:',
  }
}

// ── MedicineCard ───────────────────────────────────────────
function MedicineCard({ med, t, index }) {
  const [open, setOpen] = useState(true)
  const c = catColor(med.category)

  return (
    <div className={`rounded-2xl border ${c.bg} overflow-hidden transition-all duration-300`}
         style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
      {/* Header */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${c.dot}`} />
        <div className="flex-1 min-w-0">
          <p className="font-sora font-semibold text-gray-900 text-sm truncate">{med.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{med.frequency}{med.duration ? ` · ${med.duration}` : ''}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text} flex-shrink-0`}>
          {med.category}
        </span>
        <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'} text-gray-400 text-sm flex-shrink-0`} />
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-black/5 pt-3">
          {/* Purpose */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t.purpose}</p>
            <p className="text-sm text-gray-800">{med.purpose}</p>
          </div>

          {/* How it helps */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t.how_helps}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{med.how_it_helps}</p>
          </div>

          {/* Instructions */}
          {med.instructions && (
            <div className="flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2">
              <i className="ti ti-info-circle text-teal-600 text-base flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700">{med.instructions}</p>
            </div>
          )}

          {/* Side effects */}
          {med.side_effects?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.side_fx}</p>
              <div className="flex flex-wrap gap-1.5">
                {med.side_effects.map((s, i) => (
                  <span key={i} className="text-xs bg-white/70 border border-black/10 text-gray-600 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function PrescriptionPage() {
  const { API } = useAuth()
  const { lang } = useLang()
  const t = txt[lang]
  const navigate = useNavigate()

  const [aiLang, setAiLang]   = useState(lang)
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)   // PrescriptionOut
  const [error, setError]     = useState('')
  const [showRaw, setShowRaw] = useState(false)
  const [savedId, setSavedId] = useState(null)
  const inputRef = useRef()

  const ALLOWED = ['image/jpeg','image/png','image/webp','application/pdf']
  const MAX_MB  = 10

  const handleFile = (f) => {
    setError('')
    setResult(null)
    setSavedId(null)

    if (!ALLOWED.includes(f.type)) { setError(t.error_type); return }
    if (f.size > MAX_MB * 1024 * 1024) { setError(t.error_size); return }

    setFile(f)
    if (f.type !== 'application/pdf') {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview('pdf')
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [t])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const analyse = async () => {
    if (!file) return
    setLoading(true); setError('')

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await API.post(`/prescriptions/analyse?language=${aiLang}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      setSavedId(res.data.id)
    } catch (e) {
      setError(t.error_api)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null); setPreview(null)
    setResult(null); setError('')
    setSavedId(null)
  }

  const analysis = result?.analysis || {}
  const medicines = analysis.medicines || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 fade-up fade-up-1">
          <Link to="/dashboard"
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center
                       hover:bg-gray-50 transition-colors">
            <i className="ti ti-arrow-left text-gray-600" />
          </Link>
          <div>
            <h1 className="font-sora font-bold text-xl text-gray-900">{t.title}</h1>
            <p className="text-xs text-gray-400">Powered by Claude AI</p>
          </div>
        </div>

        {/* ── Upload zone ── */}
        {!result && (
          <div className="fade-up fade-up-2">

            {/* Lang selector */}
            <div className="flex items-center gap-3 mb-4">
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

            {/* Drop zone */}
            <div
              onClick={() => !file && inputRef.current.click()}
              onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
                ${dragging ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/40'}
                ${file ? 'p-4' : 'p-10'}`}
            >
              <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf"
                className="hidden" onChange={e => handleFile(e.target.files[0])} />

              {!file ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="ti ti-cloud-upload text-teal-600 text-3xl" />
                  </div>
                  <p className="font-sora font-semibold text-gray-900 mb-1">{t.drop_title}</p>
                  <p className="text-sm text-gray-400 mb-5">{t.drop_sub}</p>
                  <button className="btn-outline text-sm py-2 px-5">{t.browse}</button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  {preview === 'pdf' ? (
                    <div className="w-16 h-20 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ti ti-file-type-pdf text-red-500 text-3xl" />
                    </div>
                  ) : (
                    <img src={preview} alt="prescription" className="w-16 h-20 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={(e) => { e.stopPropagation(); reset() }}
                      className="text-xs text-red-500 hover:text-red-700 mt-2 transition-colors">
                      ✕ Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mt-3">
                <i className="ti ti-alert-circle" />
                {error}
              </div>
            )}

            {/* Analyse button */}
            {file && !loading && (
              <button onClick={analyse}
                className="btn-primary w-full mt-4 py-3.5 text-base flex items-center justify-center gap-2">
                <i className="ti ti-brain text-lg" />
                Analyse with AI
              </button>
            )}

            {/* Loading */}
            {loading && (
              <div className="mt-6 text-center">
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
            {savedId && (
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl">
                <i className="ti ti-circle-check text-base" />
                {t.save_ok}
              </div>
            )}

            {/* Meta card */}
            <div className="card p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="font-sora font-semibold text-gray-900">{result.title}</p>
                <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-1 rounded-full">
                  {t.found(medicines.length)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: 'ti-user-circle', label: t.doctor,    val: analysis.doctor_name    },
                  { icon: 'ti-user',        label: t.patient,   val: analysis.patient_name   },
                  { icon: 'ti-calendar',    label: t.date,      val: analysis.date           },
                  { icon: 'ti-stethoscope', label: t.diagnosis, val: analysis.diagnosis      },
                ].filter(r => r.val).map(r => (
                  <div key={r.label} className="bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <i className={`ti ${r.icon} text-teal-600 text-sm`} />
                      <span className="text-xs text-gray-400 font-medium">{r.label}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{r.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* No medicines fallback */}
            {medicines.length === 0 && (
              <div className="card p-8 text-center border border-amber-100 bg-amber-50">
                <i className="ti ti-alert-triangle text-amber-500 text-3xl mb-2" />
                <p className="text-sm text-gray-700">{t.no_meds}</p>
              </div>
            )}

            {/* Medicine cards */}
            {medicines.map((med, i) => (
              <MedicineCard key={i} med={med} t={t} index={i} />
            ))}

            {/* General advice */}
            {analysis.general_advice && (
              <div className="card p-4 border border-blue-100 bg-blue-50">
                <div className="flex items-start gap-2">
                  <i className="ti ti-notes text-blue-600 text-base flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-1">{t.general_advice}</p>
                    <p className="text-sm text-gray-700">{analysis.general_advice}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up */}
            {analysis.follow_up && (
              <div className="card p-4 border border-purple-100 bg-purple-50">
                <div className="flex items-start gap-2">
                  <i className="ti ti-calendar-event text-purple-600 text-base flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-purple-700 mb-1">{t.follow_up}</p>
                    <p className="text-sm text-gray-700">{analysis.follow_up}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Raw OCR toggle */}
            {analysis.raw_text && (
              <div>
                <button onClick={() => setShowRaw(r => !r)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2">
                  {showRaw ? t.hide_raw : t.toggle_raw}
                </button>
                {showRaw && (
                  <div className="mt-2 bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto">
                    {analysis.raw_text}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              {medicines.length > 0 && (
                <Link
                  to="/dashboard/alarms"
                  state={{ medicines }}
                  className="btn-primary w-full py-3.5 text-base text-center flex items-center justify-center gap-2">
                  <i className="ti ti-bell text-lg" />
                  {t.set_alarm}
                </Link>
              )}
              <button onClick={reset} className="btn-outline w-full py-3 text-sm">
                {t.new_upload}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
