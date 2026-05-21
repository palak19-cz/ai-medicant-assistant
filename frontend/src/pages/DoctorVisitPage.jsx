import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Navbar from '../components/Navbar'

const txt = {
  en: {
    title:        'Doctor visit tracker',
    subtitle:     'Your complete visit history & upcoming appointments',
    add_btn:      'Log visit',
    no_visits:    'No visits logged yet.',
    log_first:    'Log your first doctor visit',
    loading:      'Loading visits…',
    err_load:     'Failed to load visits.',
    err_save:     'Failed to save visit.',
    save_ok:      '✓ Visit saved!',
    upcoming:     'Upcoming',
    past:         'Past visits',
    next_visit:   'Next appointment',
    modal_title:  'Log doctor visit',
    f_doctor:     'Doctor name *',
    f_specialty:  'Specialty',
    f_hospital:   'Hospital / Clinic',
    f_date:       'Visit date *',
    f_next:       'Next appointment date',
    f_diagnosis:  'Diagnosis / Reason',
    f_notes:      'Notes',
    save_btn:     'Save visit',
    saving:       'Saving…',
    cancel:       'Cancel',
    delete_visit: 'Delete visit',
    confirm_del:  'Delete this visit record?',
    days_ago:     (n) => n === 0 ? 'Today' : n === 1 ? 'Yesterday' : `${n} days ago`,
    days_left:    (n) => n === 0 ? 'Today!' : n === 1 ? 'Tomorrow!' : `In ${n} days`,
    ph_doctor:    'Dr. Meera Sharma',
    ph_specialty: 'Cardiologist, General Physician…',
    ph_hospital:  'Apollo Hospital, Jaipur',
    ph_diagnosis: 'Annual checkup, Fever…',
    ph_notes:     'Any notes about this visit…',
  },
  hi: {
    title:        'डॉक्टर विज़िट ट्रैकर',
    subtitle:     'आपका पूरा विज़िट इतिहास और आगामी अपॉइंटमेंट',
    add_btn:      'विज़िट दर्ज करें',
    no_visits:    'अभी तक कोई विज़िट दर्ज नहीं।',
    log_first:    'अपनी पहली डॉक्टर विज़िट दर्ज करें',
    loading:      'विज़िट लोड हो रही हैं…',
    err_load:     'विज़िट लोड करने में विफल।',
    err_save:     'विज़िट सहेजने में विफल।',
    save_ok:      '✓ विज़िट सहेजी गई!',
    upcoming:     'आगामी',
    past:         'पिछली विज़िट',
    next_visit:   'अगली अपॉइंटमेंट',
    modal_title:  'डॉक्टर विज़िट दर्ज करें',
    f_doctor:     'डॉक्टर का नाम *',
    f_specialty:  'विशेषज्ञता',
    f_hospital:   'अस्पताल / क्लिनिक',
    f_date:       'विज़िट की तारीख *',
    f_next:       'अगली अपॉइंटमेंट की तारीख',
    f_diagnosis:  'निदान / कारण',
    f_notes:      'नोट्स',
    save_btn:     'विज़िट सहेजें',
    saving:       'सहेजा जा रहा है…',
    cancel:       'रद्द करें',
    delete_visit: 'विज़िट हटाएं',
    confirm_del:  'इस विज़िट रिकॉर्ड को हटाएं?',
    days_ago:     (n) => n === 0 ? 'आज' : n === 1 ? 'कल' : `${n} दिन पहले`,
    days_left:    (n) => n === 0 ? 'आज!' : n === 1 ? 'कल!' : `${n} दिन में`,
    ph_doctor:    'डॉ. मीरा शर्मा',
    ph_specialty: 'हृदय रोग विशेषज्ञ, सामान्य चिकित्सक…',
    ph_hospital:  'अपोलो अस्पताल, जयपुर',
    ph_diagnosis: 'वार्षिक जाँच, बुखार…',
    ph_notes:     'इस विज़िट के बारे में कोई नोट्स…',
  },
}

// ── Days difference helper ─────────────────────────────────
function daysDiff(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0)
  const d     = new Date(dateStr); d.setHours(0,0,0,0)
  return Math.round((d - today) / 86400000)
}

// ── Add Visit Modal ────────────────────────────────────────
function AddVisitModal({ t, onClose, onSaved, API }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    doctor_name:'', specialty:'', hospital:'',
    visit_date: today, next_visit:'', diagnosis:'', notes:''
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.doctor_name.trim() || !form.visit_date) { setError('Doctor name and date are required.'); return }
    setLoading(true); setError('')
    try {
      const payload = { ...form }
      Object.keys(payload).forEach(k => { if (!payload[k]) payload[k] = null })
      payload.doctor_name = form.doctor_name
      payload.visit_date  = form.visit_date
      const res = await API.post('/visits/', payload)
      onSaved(res.data)
    } catch { setError(t.err_save) }
    finally { setLoading(false) }
  }

  const fields = [
    { key:'doctor_name', label:t.f_doctor,    type:'text',  ph:t.ph_doctor,    req:true  },
    { key:'specialty',   label:t.f_specialty,  type:'text',  ph:t.ph_specialty, req:false },
    { key:'hospital',    label:t.f_hospital,   type:'text',  ph:t.ph_hospital,  req:false },
    { key:'visit_date',  label:t.f_date,       type:'date',  ph:'',             req:true  },
    { key:'next_visit',  label:t.f_next,       type:'date',  ph:'',             req:false },
    { key:'diagnosis',   label:t.f_diagnosis,  type:'text',  ph:t.ph_diagnosis, req:false },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-sora font-bold text-lg text-gray-900">{t.modal_title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="ti ti-x text-sm text-gray-600" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={set(f.key)}
                placeholder={f.ph} required={f.req}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 bg-gray-50" />
            </div>
          ))}
          {/* Notes textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.f_notes}</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2}
              placeholder={t.ph_notes}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 bg-gray-50 resize-none" />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1 py-3 text-sm">{t.cancel}</button>
            <button onClick={save} disabled={loading}
              className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t.saving}</> : t.save_btn}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Visit card ─────────────────────────────────────────────
function VisitCard({ visit, t, isUpcoming, onDelete }) {
  const diff     = daysDiff(visit.visit_date)
  const dateLabel = isUpcoming ? t.days_left(-diff) : t.days_ago(Math.abs(diff))
  const formatted = new Date(visit.visit_date).toLocaleDateString('en-IN', {
    weekday:'short', day:'numeric', month:'short', year:'numeric'
  })

  return (
    <div className={`card border p-4 transition-all hover:shadow-md
      ${isUpcoming ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100'}`}>
      <div className="flex items-start gap-3">
        {/* Date block */}
        <div className={`rounded-xl p-2.5 text-center min-w-[52px] flex-shrink-0
          ${isUpcoming ? 'bg-purple-100' : 'bg-gray-100'}`}>
          <p className={`font-sora font-bold text-xl leading-none
            ${isUpcoming ? 'text-purple-600' : 'text-gray-700'}`}>
            {new Date(visit.visit_date).getDate()}
          </p>
          <p className={`text-xs font-semibold mt-0.5
            ${isUpcoming ? 'text-purple-400' : 'text-gray-400'}`}>
            {new Date(visit.visit_date).toLocaleString('default', { month:'short' }).toUpperCase()}
          </p>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{visit.doctor_name}</p>
              {visit.specialty && <p className="text-xs text-gray-500 truncate">{visit.specialty}</p>}
              {visit.hospital  && <p className="text-xs text-gray-400 truncate">{visit.hospital}</p>}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0
              ${isUpcoming ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
              {dateLabel}
            </span>
          </div>

          {visit.diagnosis && (
            <div className="mt-2 flex items-start gap-1.5">
              <i className="ti ti-stethoscope text-teal-600 text-xs flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">{visit.diagnosis}</p>
            </div>
          )}

          {visit.notes && (
            <p className="text-xs text-gray-400 mt-1 truncate">{visit.notes}</p>
          )}

          {/* Next visit badge */}
          {visit.next_visit && !isUpcoming && (
            <div className="mt-2 flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
              <i className="ti ti-calendar-event text-amber-500 text-xs" />
              <p className="text-xs text-amber-700 font-medium">
                Next: {new Date(visit.next_visit).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                {' · '}{t.days_left(daysDiff(visit.next_visit))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete */}
      <div className="flex justify-end mt-3 pt-3 border-t border-gray-50">
        <button onClick={() => {
          if (window.confirm(t.confirm_del)) onDelete(visit.id)
        }} className="text-xs text-gray-300 hover:text-red-400 transition-colors flex items-center gap-1">
          <i className="ti ti-trash text-xs" /> {t.delete_visit}
        </button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function DoctorVisitPage() {
  const { API }  = useAuth()
  const { lang } = useLang()
  const t        = txt[lang]

  const [visits,   setVisits]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [showAdd,  setShowAdd]  = useState(false)
  const [saveOk,   setSaveOk]   = useState(false)

  useEffect(() => { loadVisits() }, [])

  const loadVisits = async () => {
    setLoading(true); setError('')
    try {
      const res = await API.get('/visits/')
      setVisits(res.data)
    } catch { setError(t.err_load) }
    finally { setLoading(false) }
  }

  const onSaved = (v) => {
    setVisits(prev => [v, ...prev].sort((a,b) => new Date(b.visit_date) - new Date(a.visit_date)))
    setShowAdd(false); setSaveOk(true)
    setTimeout(() => setSaveOk(false), 3000)
  }

  const onDelete = async (id) => {
    try {
      await API.delete(`/visits/${id}`)
      setVisits(prev => prev.filter(v => v.id !== id))
    } catch {}
  }

  const today      = new Date().toISOString().split('T')[0]
  const upcoming   = visits.filter(v => v.visit_date >= today).sort((a,b) => a.visit_date.localeCompare(b.visit_date))
  const past       = visits.filter(v => v.visit_date <  today).sort((a,b) => b.visit_date.localeCompare(a.visit_date))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {showAdd && <AddVisitModal t={t} onClose={() => setShowAdd(false)} onSaved={onSaved} API={API} />}

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
          <button onClick={() => setShowAdd(true)}
            className="ml-auto btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
            <i className="ti ti-plus text-sm" /> {t.add_btn}
          </button>
        </div>

        {/* Save ok banner */}
        {saveOk && (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl mb-4">
            <i className="ti ti-circle-check" /> {t.save_ok}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">{t.loading}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && visits.length === 0 && (
          <div className="text-center py-16 fade-up fade-up-2">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ti ti-calendar-plus text-purple-600 text-3xl" />
            </div>
            <p className="text-gray-600 font-medium mb-3">{t.no_visits}</p>
            <button onClick={() => setShowAdd(true)} className="btn-outline text-sm py-2.5 px-6">
              {t.log_first}
            </button>
          </div>
        )}

        {/* Upcoming */}
        {!loading && upcoming.length > 0 && (
          <div className="mb-6 fade-up fade-up-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2">
              <i className="ti ti-calendar-event" /> {t.upcoming}
            </p>
            <div className="space-y-3">
              {upcoming.map(v => <VisitCard key={v.id} visit={v} t={t} isUpcoming onDelete={onDelete} />)}
            </div>
          </div>
        )}

        {/* Past */}
        {!loading && past.length > 0 && (
          <div className="fade-up fade-up-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <i className="ti ti-history" /> {t.past}
            </p>
            <div className="space-y-3">
              {past.map(v => <VisitCard key={v.id} visit={v} t={t} isUpcoming={false} onDelete={onDelete} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
