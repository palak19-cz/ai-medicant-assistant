import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Navbar from '../components/Navbar'

// ── Category config ────────────────────────────────────────
const CATEGORIES = {
  All:          { icon: 'ti-files',        bg: 'bg-gray-100',    text: 'text-gray-600'   },
  Prescription: { icon: 'ti-file-text',    bg: 'bg-teal-50',     text: 'text-teal-600'   },
  Report:       { icon: 'ti-report',       bg: 'bg-purple-50',   text: 'text-purple-600' },
  Scan:         { icon: 'ti-scan',         bg: 'bg-orange-50',   text: 'text-orange-600' },
  Other:        { icon: 'ti-file',         bg: 'bg-gray-100',    text: 'text-gray-500'   },
}

const txt = {
  en: {
    title:         'Health records vault',
    subtitle:      'All your reports — secured & searchable',
    lock_msg:      '🔒 Vault locked — authenticate to view files',
    unlock_face:   'Unlock with Face ID',
    unlock_fp:     'Unlock with Fingerprint',
    unlock_pin:    'Unlock with PIN',
    pin_placeholder:'Enter PIN',
    pin_btn:       'Unlock',
    pin_wrong:     'Incorrect PIN. Try again.',
    unlocked:      '🔓 Vault unlocked',
    lock_btn:      'Lock vault',
    upload_btn:    'Upload record',
    upload_title:  'Upload new record',
    search_ph:     'Search records…',
    filter_label:  'Filter:',
    no_records:    'No records found.',
    upload_first:  'Upload your first health record',
    loading:       'Loading records…',
    err_load:      'Failed to load records.',
    err_upload:    'Upload failed. Please try again.',
    upload_ok:     'Record uploaded successfully!',
    delete_confirm:'Delete this record permanently?',
    download:      'Download',
    delete:        'Delete',
    close:         'Close',
    field_title:   'Title',
    field_cat:     'Category',
    field_doctor:  'Doctor name',
    field_hospital:'Hospital / Clinic',
    field_notes:   'Notes (optional)',
    field_file:    'File (JPG, PNG, PDF)',
    submit_upload: 'Upload',
    uploading:     'Uploading…',
    file_size:     (b) => b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/1024/1024).toFixed(1)} MB`,
    categories:    ['All','Prescription','Report','Scan','Other'],
  },
  hi: {
    title:         'स्वास्थ्य रिकॉर्ड वॉल्ट',
    subtitle:      'आपकी सभी रिपोर्ट — सुरक्षित और खोज योग्य',
    lock_msg:      '🔒 वॉल्ट बंद है — फ़ाइलें देखने के लिए प्रमाणीकरण करें',
    unlock_face:   'Face ID से खोलें',
    unlock_fp:     'Fingerprint से खोलें',
    unlock_pin:    'PIN से खोलें',
    pin_placeholder:'PIN दर्ज करें',
    pin_btn:       'खोलें',
    pin_wrong:     'गलत PIN। पुनः प्रयास करें।',
    unlocked:      '🔓 वॉल्ट खुला है',
    lock_btn:      'वॉल्ट बंद करें',
    upload_btn:    'रिकॉर्ड अपलोड करें',
    upload_title:  'नया रिकॉर्ड अपलोड करें',
    search_ph:     'रिकॉर्ड खोजें…',
    filter_label:  'फ़िल्टर:',
    no_records:    'कोई रिकॉर्ड नहीं मिला।',
    upload_first:  'अपना पहला स्वास्थ्य रिकॉर्ड अपलोड करें',
    loading:       'रिकॉर्ड लोड हो रहे हैं…',
    err_load:      'रिकॉर्ड लोड करने में विफल।',
    err_upload:    'अपलोड विफल। पुनः प्रयास करें।',
    upload_ok:     'रिकॉर्ड सफलतापूर्वक अपलोड हुआ!',
    delete_confirm:'इस रिकॉर्ड को स्थायी रूप से हटाएं?',
    download:      'डाउनलोड',
    delete:        'हटाएं',
    close:         'बंद करें',
    field_title:   'शीर्षक',
    field_cat:     'श्रेणी',
    field_doctor:  'डॉक्टर का नाम',
    field_hospital:'अस्पताल / क्लिनिक',
    field_notes:   'नोट्स (वैकल्पिक)',
    field_file:    'फ़ाइल (JPG, PNG, PDF)',
    submit_upload: 'अपलोड करें',
    uploading:     'अपलोड हो रहा है…',
    file_size:     (b) => b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/1024/1024).toFixed(1)} MB`,
    categories:    ['सभी','प्रिस्क्रिप्शन','रिपोर्ट','स्कैन','अन्य'],
  },
}

const CAT_EN = ['All','Prescription','Report','Scan','Other']

// ── Upload modal ───────────────────────────────────────────
function UploadModal({ t, onClose, onUploaded, API }) {
  const [form, setForm]     = useState({ title:'', category:'Report', doctor_name:'', hospital:'', notes:'' })
  const [file, setFile]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const fileRef = useRef()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.title.trim() || !file) { setError('Title and file are required.'); return }
    setLoading(true); setError('')
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => v && fd.append(k, v))
    fd.append('file', file)
    try {
      const res = await API.post('/records/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onUploaded(res.data)
    } catch { setError(t.err_upload) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-sora font-bold text-lg text-gray-900">{t.upload_title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <i className="ti ti-x text-sm text-gray-600" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.field_title} *</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Blood test report May 2026"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 bg-gray-50" />
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.field_cat}</label>
            <select value={form.category} onChange={set('category')}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 bg-gray-50">
              {CAT_EN.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.field_doctor}</label>
            <input value={form.doctor_name} onChange={set('doctor_name')} placeholder="Dr. Meera Sharma"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 bg-gray-50" />
          </div>
          {/* Hospital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.field_hospital}</label>
            <input value={form.hospital} onChange={set('hospital')} placeholder="Apollo Hospital, Jaipur"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 bg-gray-50" />
          </div>
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.field_notes}</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 bg-gray-50 resize-none" />
          </div>
          {/* File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.field_file} *</label>
            <button onClick={() => fileRef.current.click()}
              className={`w-full border-2 border-dashed rounded-xl py-4 text-sm transition-all
                ${file ? 'border-teal-400 bg-teal-50 text-teal-600' : 'border-gray-200 text-gray-400 hover:border-teal-300'}`}>
              {file ? `✓ ${file.name}` : '+ Choose file'}
            </button>
            <input ref={fileRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,.webp"
              onChange={e => setFile(e.target.files[0])} />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={submit} disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t.uploading}</> : t.submit_upload}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Record card ────────────────────────────────────────────
function RecordCard({ rec, t, onDelete, API }) {
  const cat  = CATEGORIES[rec.category] || CATEGORIES.Other
  const date = new Date(rec.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(t.delete_confirm)) return
    setDeleting(true)
    try { await API.delete(`/records/${rec.id}`); onDelete(rec.id) }
    catch {} finally { setDeleting(false) }
  }

  const handleDownload = async () => {
    try {
      const res = await API.get(`/records/${rec.id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      a.href = url; a.download = rec.file_name; a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  return (
    <div className="card border border-gray-100 p-4 hover:border-gray-200 transition-all group">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-11 h-11 ${cat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <i className={`ti ${cat.icon} ${cat.text} text-xl`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{rec.title}</p>
          {rec.doctor_name && <p className="text-xs text-gray-500 mt-0.5 truncate">{rec.doctor_name}{rec.hospital ? ` · ${rec.hospital}` : ''}</p>}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>{rec.category}</span>
            <span className="text-xs text-gray-300">{date}</span>
            <span className="text-xs text-gray-300">{t.file_size(rec.file_size)}</span>
          </div>
          {rec.notes && <p className="text-xs text-gray-400 mt-1 truncate">{rec.notes}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {rec.has_file && (
            <button onClick={handleDownload}
              className="w-8 h-8 rounded-lg bg-teal-50 hover:bg-teal-100 flex items-center justify-center transition-colors"
              title={t.download}>
              <i className="ti ti-download text-teal-600 text-sm" />
            </button>
          )}
          <button onClick={handleDelete} disabled={deleting}
            className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center transition-colors"
            title={t.delete}>
            <i className={`ti ti-trash text-sm ${deleting ? 'text-gray-300' : 'text-gray-400 hover:text-red-500'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function RecordsPage() {
  const { API }  = useAuth()
  const { lang } = useLang()
  const t        = txt[lang]

  const [unlocked,   setUnlocked]   = useState(false)
  const [pinMode,    setPinMode]    = useState(false)
  const [pin,        setPin]        = useState('')
  const [pinError,   setPinError]   = useState(false)
  const [records,    setRecords]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('All')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadOk,   setUploadOk]   = useState(false)

  // Demo PIN is "1234" — in prod this would be device biometric / backend verified
  const DEMO_PIN = '1234'

  const unlock = (method) => {
    if (method === 'pin') {
      if (pin === DEMO_PIN) { setUnlocked(true); setPinMode(false); loadRecords() }
      else { setPinError(true); setTimeout(() => setPinError(false), 1500) }
    } else {
      // Biometric — in prod use WebAuthn; here simulate unlock
      setUnlocked(true); loadRecords()
    }
  }

  const lock = () => { setUnlocked(false); setRecords([]); setPin(''); setPinMode(false) }

  const loadRecords = async () => {
    setLoading(true); setError('')
    try {
      const params = {}
      if (category !== 'All') params.category = category
      if (search.trim())       params.search   = search.trim()
      const res = await API.get('/records/', { params })
      setRecords(res.data)
    } catch { setError(t.err_load) }
    finally { setLoading(false) }
  }

  // Reload when filter changes (only if unlocked)
  useEffect(() => { if (unlocked) loadRecords() }, [category, search])

  const onUploaded = (rec) => {
    setRecords(prev => [rec, ...prev])
    setShowUpload(false)
    setUploadOk(true)
    setTimeout(() => setUploadOk(false), 3000)
  }

  const onDelete = (id) => setRecords(prev => prev.filter(r => r.id !== id))

  const langCats = t.categories  // localised labels
  const catKeys  = CAT_EN        // English keys for API

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {showUpload && <UploadModal t={t} onClose={() => setShowUpload(false)} onUploaded={onUploaded} API={API} />}

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
          {unlocked && (
            <button onClick={lock}
              className="ml-auto flex items-center gap-1.5 text-xs border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-all">
              <i className="ti ti-lock text-sm" /> {t.lock_btn}
            </button>
          )}
        </div>

        {/* ── LOCKED state ── */}
        {!unlocked && (
          <div className="card border border-purple-100 p-8 text-center fade-up fade-up-2">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ti ti-lock text-purple-600 text-3xl" />
            </div>
            <p className="font-sora font-semibold text-gray-900 mb-1">{t.lock_msg}</p>
            <p className="text-xs text-gray-400 mb-6">Your records are encrypted and protected</p>

            {/* Biometric buttons */}
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button onClick={() => unlock('face')}
                className="flex items-center gap-3 justify-center py-3 rounded-xl border border-purple-200 bg-purple-50
                           text-purple-700 font-medium text-sm hover:bg-purple-100 transition-all">
                <i className="ti ti-eye text-lg" /> {t.unlock_face}
              </button>
              <button onClick={() => unlock('fingerprint')}
                className="flex items-center gap-3 justify-center py-3 rounded-xl border border-teal-200 bg-teal-50
                           text-teal-700 font-medium text-sm hover:bg-teal-100 transition-all">
                <i className="ti ti-fingerprint text-lg" /> {t.unlock_fp}
              </button>

              {!pinMode ? (
                <button onClick={() => setPinMode(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2">
                  {t.unlock_pin}
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="password" maxLength={6} value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/,'').slice(0,6))}
                    onKeyDown={e => e.key === 'Enter' && unlock('pin')}
                    placeholder={t.pin_placeholder}
                    className={`flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none text-center tracking-widest font-mono
                      ${pinError ? 'border-red-400 bg-red-50 animate-pulse' : 'border-gray-200 bg-gray-50 focus:border-teal-400'}`}
                  />
                  <button onClick={() => unlock('pin')}
                    className="btn-primary px-4 py-2.5 text-sm">
                    {t.pin_btn}
                  </button>
                </div>
              )}
              {pinError && <p className="text-red-500 text-xs">{t.pin_wrong}</p>}
            </div>

            <p className="text-xs text-gray-300 mt-6">Demo PIN: 1234</p>
          </div>
        )}

        {/* ── UNLOCKED state ── */}
        {unlocked && (
          <div className="space-y-4 fade-up fade-up-1">

            {/* Unlocked banner */}
            <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
              <p className="text-sm text-teal-700 font-medium">{t.unlocked}</p>
              <button onClick={() => setShowUpload(true)}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                <i className="ti ti-upload text-sm" /> {t.upload_btn}
              </button>
            </div>

            {/* Upload success */}
            {uploadOk && (
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-xl">
                <i className="ti ti-circle-check" /> {t.upload_ok}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t.search_ph}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-teal-400" />
            </div>

            {/* Category filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {catKeys.map((cat, i) => {
                const cfg = CATEGORIES[cat]
                return (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                      ${category === cat ? 'bg-teal-600 text-white' : `${cfg.bg} ${cfg.text} hover:opacity-80`}`}>
                    <i className={`ti ${cfg.icon} text-sm`} />
                    {langCats[i]}
                  </button>
                )
              })}
            </div>

            {/* Records count */}
            {!loading && (
              <p className="text-xs text-gray-400">
                {records.length} record{records.length !== 1 ? 's' : ''} found
              </p>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-400">{t.loading}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <i className="ti ti-alert-circle" /> {error}
              </div>
            )}

            {/* Records list */}
            {!loading && records.length === 0 && (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <i className="ti ti-file-off text-gray-400 text-2xl" />
                </div>
                <p className="text-sm text-gray-500 mb-3">{t.no_records}</p>
                <button onClick={() => setShowUpload(true)} className="btn-outline text-sm py-2 px-5">
                  {t.upload_first}
                </button>
              </div>
            )}

            <div className="space-y-3">
              {records.map(rec => (
                <RecordCard key={rec.id} rec={rec} t={t} onDelete={onDelete} API={API} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
