import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Navbar from '../components/Navbar'

// ── Category colour map ────────────────────────────────────
const CAT_COLORS = {
  Antidiabetic:     { dot: 'bg-teal-500',   tag: 'bg-teal-50 text-teal-700'   },
  Antibiotic:       { dot: 'bg-coral-400',  tag: 'bg-orange-50 text-orange-700'},
  Antihypertensive: { dot: 'bg-purple-500', tag: 'bg-purple-50 text-purple-700'},
  Painkiller:       { dot: 'bg-amber-500',  tag: 'bg-amber-50 text-amber-700'  },
  Supplement:       { dot: 'bg-blue-500',   tag: 'bg-blue-50 text-blue-700'    },
  default:          { dot: 'bg-gray-400',   tag: 'bg-gray-100 text-gray-600'   },
}
const catColor = (cat) => CAT_COLORS[cat] || CAT_COLORS.default

// ── Translations ───────────────────────────────────────────
const txt = {
  en: {
    title:         'Medicine reminders',
    subtitle:      'Your smart alarm schedule',
    back:          'Dashboard',
    from_rx:       'Medicines loaded from your prescription',
    no_meds:       'No medicines loaded yet.',
    go_rx:         'Go to Prescription Reader →',
    save_btn:      'Save all reminders',
    saving:        'Saving…',
    saved_ok:      '✓ Reminders saved successfully!',
    save_err:      'Failed to save. Please try again.',
    load_err:      'Failed to load existing alarms.',
    enabled:       'On',
    disabled:      'Off',
    add_time:      '+ Add time',
    remove_time:   'Remove',
    days_label:    'Active days',
    instructions:  'Instructions',
    all_days:      'Every day',
    weekdays:      'Weekdays',
    weekends:      'Weekends',
    no_existing:   'No saved reminders yet.',
    existing_title:'Saved alarms',
    delete_btn:    'Delete',
    edit_btn:      'Edit',
    confirm_del:   'Delete this alarm set?',
    time_labels: {
      Morning:   'Morning',
      Afternoon: 'Afternoon',
      Noon:      'Noon',
      Evening:   'Evening',
      Night:     'Night',
      Bedtime:   'Bedtime',
      Sunday:    'Sunday',
    },
  },
  hi: {
    title:         'दवाई अनुस्मारक',
    subtitle:      'आपका स्मार्ट अलार्म शेड्यूल',
    back:          'डैशबोर्ड',
    from_rx:       'आपके प्रिस्क्रिप्शन से दवाइयाँ लोड हुईं',
    no_meds:       'अभी कोई दवाई लोड नहीं हुई।',
    go_rx:         'प्रिस्क्रिप्शन रीडर पर जाएं →',
    save_btn:      'सभी अनुस्मारक सहेजें',
    saving:        'सहेजा जा रहा है…',
    saved_ok:      '✓ अनुस्मारक सफलतापूर्वक सहेजे गए!',
    save_err:      'सहेजने में विफल। पुनः प्रयास करें।',
    load_err:      'मौजूदा अलार्म लोड करने में विफल।',
    enabled:       'चालू',
    disabled:      'बंद',
    add_time:      '+ समय जोड़ें',
    remove_time:   'हटाएं',
    days_label:    'सक्रिय दिन',
    instructions:  'निर्देश',
    all_days:      'हर दिन',
    weekdays:      'कार्यदिवस',
    weekends:      'सप्ताहांत',
    no_existing:   'अभी कोई सहेजा गया अनुस्मारक नहीं।',
    existing_title:'सहेजे गए अलार्म',
    delete_btn:    'हटाएं',
    edit_btn:      'संपादित करें',
    confirm_del:   'इस अलार्म सेट को हटाएं?',
    time_labels: {
      Morning:   'सुबह',
      Afternoon: 'दोपहर',
      Noon:      'दोपहर',
      Evening:   'शाम',
      Night:     'रात',
      Bedtime:   'सोने का समय',
      Sunday:    'रविवार',
    },
  },
}

const ALL_DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const WEEKDAYS  = ['Mon','Tue','Wed','Thu','Fri']
const WEEKENDS  = ['Sat','Sun']

// ── Toggle switch ──────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button onClick={onChange} type="button"
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
        ${checked ? 'bg-teal-600' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
        ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

// ── Single medicine alarm card ─────────────────────────────
function MedicineAlarmCard({ med, index, t, onChange }) {
  const c = catColor(med.category)
  const tl = t.time_labels

  const updateTime = (ti, field, val) => {
    const times = [...med.times]
    times[ti] = { ...times[ti], [field]: val }
    onChange(index, { ...med, times })
  }

  const toggleTime = (ti) => {
    const times = med.times.map((tm, i) =>
      i === ti ? { ...tm, enabled: !tm.enabled } : tm
    )
    onChange(index, { ...med, times })
  }

  const removeTime = (ti) => {
    const times = med.times.filter((_, i) => i !== ti)
    onChange(index, { ...med, times })
  }

  const addTime = () => {
    const times = [...med.times, { label: 'Evening', time: '18:00', enabled: true }]
    onChange(index, { ...med, times })
  }

  const toggleMed = () => onChange(index, { ...med, enabled: !med.enabled })

  const setDays = (days) => onChange(index, { ...med, days })

  const toggleDay = (day) => {
    const days = med.days.includes(day)
      ? med.days.filter(d => d !== day)
      : [...med.days, day]
    onChange(index, { ...med, days })
  }

  return (
    <div className={`card border overflow-hidden transition-all duration-200
      ${med.enabled ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>

      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-50">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${c.dot}`} />
        <div className="flex-1 min-w-0">
          <p className="font-sora font-semibold text-sm text-gray-900 truncate">{med.medicine_name}</p>
          {med.dosage && <p className="text-xs text-gray-400 mt-0.5">{med.dosage}</p>}
        </div>
        {med.category && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${c.tag}`}>
            {med.category}
          </span>
        )}
        <Toggle checked={med.enabled} onChange={toggleMed} />
      </div>

      {med.enabled && (
        <div className="px-4 py-3 space-y-3">

          {/* Instructions */}
          {med.instructions && (
            <div className="flex items-start gap-2 bg-teal-50 rounded-xl px-3 py-2">
              <i className="ti ti-info-circle text-teal-600 text-sm flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">{med.instructions}</p>
            </div>
          )}

          {/* Time slots */}
          <div className="space-y-2">
            {med.times.map((slot, ti) => (
              <div key={ti}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all
                  ${slot.enabled ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>

                {/* Toggle individual slot */}
                <Toggle checked={slot.enabled} onChange={() => toggleTime(ti)} />

                {/* Label */}
                <select value={slot.label}
                  onChange={e => updateTime(ti, 'label', e.target.value)}
                  className="text-xs font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer flex-shrink-0">
                  {Object.keys(tl).map(l => (
                    <option key={l} value={l}>{tl[l]}</option>
                  ))}
                </select>

                {/* Time picker */}
                <input type="time" value={slot.time}
                  onChange={e => updateTime(ti, 'time', e.target.value)}
                  className="text-sm font-sora font-semibold text-teal-600 bg-transparent
                             border-none outline-none cursor-pointer flex-1" />

                {/* Remove */}
                {med.times.length > 1 && (
                  <button onClick={() => removeTime(ti)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                    <i className="ti ti-x" />
                  </button>
                )}
              </div>
            ))}

            {/* Add time slot */}
            <button onClick={addTime}
              className="text-xs text-teal-600 font-medium hover:text-teal-800 transition-colors
                         flex items-center gap-1 mt-1">
              <i className="ti ti-plus text-sm" />
              {t.add_time}
            </button>
          </div>

          {/* Days selector */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">{t.days_label}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {/* Quick presets */}
              <button onClick={() => setDays(ALL_DAYS)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all
                  ${JSON.stringify(med.days.sort()) === JSON.stringify(ALL_DAYS.sort())
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                {t.all_days}
              </button>
              <button onClick={() => setDays(WEEKDAYS)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all
                  ${JSON.stringify(med.days.sort()) === JSON.stringify(WEEKDAYS.sort())
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                {t.weekdays}
              </button>
              <button onClick={() => setDays(WEEKENDS)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all
                  ${JSON.stringify(med.days.sort()) === JSON.stringify(WEEKENDS.sort())
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                {t.weekends}
              </button>
            </div>

            {/* Individual day toggles */}
            <div className="flex gap-1">
              {ALL_DAYS.map(day => (
                <button key={day} onClick={() => toggleDay(day)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${med.days.includes(day)
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {day[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Existing alarm set card (read-only summary) ────────────
function ExistingAlarmCard({ alarm, t, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const date = new Date(alarm.updated_at).toLocaleDateString()
  const enabledMeds = alarm.medicines.filter(m => m.enabled)

  const handleDelete = async () => {
    if (!window.confirm(t.confirm_del)) return
    setDeleting(true)
    await onDelete(alarm.id)
    setDeleting(false)
  }

  return (
    <div className="card border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{date}</p>
          <p className="text-sm font-semibold text-gray-900">
            {enabledMeds.length} active medicine{enabledMeds.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">
          <i className="ti ti-trash text-sm" />
          {deleting ? '…' : t.delete_btn}
        </button>
      </div>

      <div className="space-y-2">
        {alarm.medicines.map((med, i) => {
          const c = catColor(med.category)
          return (
            <div key={i} className={`flex items-center gap-2 ${!med.enabled ? 'opacity-40' : ''}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
              <p className="text-xs text-gray-700 flex-1 truncate font-medium">{med.medicine_name}</p>
              <div className="flex gap-1 flex-shrink-0">
                {med.times.filter(t => t.enabled).map((slot, si) => (
                  <span key={si} className="text-xs bg-teal-50 text-teal-600 font-semibold px-1.5 py-0.5 rounded-md">
                    {slot.time}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function AlarmPage() {
  const { API }  = useAuth()
  const { lang } = useLang()
  const t        = txt[lang]
  const location = useLocation()

  // medicines can be passed from PrescriptionPage via router state
  const passedMedicines = location.state?.medicines || []

  const [medicines, setMedicines] = useState([])
  const [existing,  setExisting]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [suggesting,setSuggesting]= useState(false)
  const [status,    setStatus]    = useState('')   // '', 'ok', 'err', 'load_err'
  const [fromRx,    setFromRx]    = useState(false)

  // On mount: if medicines passed from Rx page → suggest times
  // Otherwise: load existing alarms
  useEffect(() => {
    if (passedMedicines.length > 0) {
      loadSuggestions(passedMedicines)
      setFromRx(true)
    } else {
      loadExisting()
    }
  }, [])

  const loadSuggestions = async (meds) => {
    setSuggesting(true)
    try {
      const res = await API.post('/alarms/suggest', meds)
      setMedicines(res.data)
    } catch {
      // fallback: build basic alarms client-side
      setMedicines(meds.map(m => ({
        medicine_name: m.name,
        dosage:        m.dosage,
        instructions:  m.instructions,
        category:      m.category,
        enabled:       true,
        days:          ALL_DAYS,
        times:         [{ label: 'Morning', time: '08:00', enabled: true }],
      })))
    } finally {
      setSuggesting(false)
    }
  }

  const loadExisting = async () => {
    try {
      const res = await API.get('/alarms/')
      setExisting(res.data)
    } catch {
      setStatus('load_err')
    }
  }

  const updateMedicine = (index, updated) => {
    setMedicines(prev => prev.map((m, i) => i === index ? updated : m))
  }

  const saveAlarms = async () => {
    setLoading(true); setStatus('')
    try {
      await API.post('/alarms/', { medicines })
      setStatus('ok')
      // reload existing list
      await loadExisting()
      // clear the editor after save
      setTimeout(() => {
        setMedicines([])
        setFromRx(false)
        setStatus('')
      }, 2000)
    } catch {
      setStatus('err')
    } finally {
      setLoading(false)
    }
  }

  const deleteAlarm = async (id) => {
    await API.delete(`/alarms/${id}`)
    setExisting(prev => prev.filter(a => a.id !== id))
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      // In production: get FCM token here and POST to /alarms/fcm-token
      new Notification('MediPredict', {
        body: 'Medicine reminders are now enabled! 💊',
        icon: '/favicon.ico',
      })
    }
  }

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
          {/* Notification permission */}
          <button onClick={requestNotificationPermission}
            className="ml-auto flex items-center gap-1.5 text-xs border border-gray-200
                       bg-white text-gray-500 hover:text-teal-600 hover:border-teal-200
                       rounded-lg px-3 py-1.5 transition-all">
            <i className="ti ti-bell text-sm" />
            Enable alerts
          </button>
        </div>

        {/* From-Rx banner */}
        {fromRx && medicines.length > 0 && (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700
                          text-sm px-4 py-3 rounded-xl mb-5 fade-up fade-up-1">
            <i className="ti ti-file-text text-base" />
            {t.from_rx}
          </div>
        )}

        {/* ── Suggesting loader ── */}
        {suggesting && (
          <div className="text-center py-12 fade-up fade-up-1">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">AI is building your alarm schedule…</p>
            <p className="text-xs text-gray-400 mt-1">Analysing medicine frequency & category</p>
          </div>
        )}

        {/* ── Medicine alarm editor ── */}
        {!suggesting && medicines.length > 0 && (
          <div className="space-y-4 fade-up fade-up-2">

            {medicines.map((med, i) => (
              <MedicineAlarmCard
                key={i} med={med} index={i}
                t={t} onChange={updateMedicine} />
            ))}

            {/* Status messages */}
            {status === 'ok' && (
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200
                              text-teal-700 text-sm px-4 py-3 rounded-xl">
                <i className="ti ti-circle-check" /> {t.saved_ok}
              </div>
            )}
            {status === 'err' && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200
                              text-red-600 text-sm px-4 py-3 rounded-xl">
                <i className="ti ti-alert-circle" /> {t.save_err}
              </div>
            )}

            {/* Save button */}
            <button onClick={saveAlarms} disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.saving}</>
                : <><i className="ti ti-bell text-lg" />{t.save_btn}</>}
            </button>
          </div>
        )}

        {/* ── No medicines loaded ── */}
        {!suggesting && medicines.length === 0 && existing.length === 0 && (
          <div className="text-center py-16 fade-up fade-up-2">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ti ti-bell-off text-amber-500 text-3xl" />
            </div>
            <p className="text-gray-600 font-medium mb-2">{t.no_meds}</p>
            <Link to="/dashboard/prescription"
              className="text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors">
              {t.go_rx}
            </Link>
          </div>
        )}

        {/* ── Existing saved alarms ── */}
        {existing.length > 0 && medicines.length === 0 && (
          <div className="space-y-4 fade-up fade-up-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {t.existing_title}
            </p>
            {status === 'load_err' && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200
                              text-red-600 text-sm px-4 py-3 rounded-xl">
                <i className="ti ti-alert-circle" /> {t.load_err}
              </div>
            )}
            {existing.map(alarm => (
              <ExistingAlarmCard key={alarm.id} alarm={alarm} t={t} onDelete={deleteAlarm} />
            ))}
            <Link to="/dashboard/prescription"
              className="btn-outline w-full py-3 text-sm text-center block">
              + Add alarms from new prescription
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
