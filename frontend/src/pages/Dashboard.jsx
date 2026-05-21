import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Navbar from '../components/Navbar'

const modules = [
  {
    id: 'rx',
    to: '/dashboard/prescription',
    icon: 'ti-file-text',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    border: 'border-teal-100',
    badge: 'New',
    badgeBg: 'bg-teal-50 text-teal-600',
    titleKey: 'mod_rx_title',
    descKey:  'mod_rx_desc',
  },
  {
    id: 'sym',
    to: '/dashboard/symptoms',
    icon: 'ti-stethoscope',
    bg: 'bg-orange-50',
    iconColor: 'text-coral-400',
    border: 'border-orange-100',
    badge: 'AI',
    badgeBg: 'bg-orange-50 text-coral-400',
    titleKey: 'mod_sym_title',
    descKey:  'mod_sym_desc',
  },
  {
    id: 'doctor',
    to: '/dashboard/doctor',
    icon: 'ti-calendar',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    border: 'border-purple-100',
    badge: 'Track',
    badgeBg: 'bg-purple-50 text-purple-600',
    titleKey: 'mod_doc_title',
    descKey:  'mod_doc_desc',
  },
  {
    id: 'alarm',
    to: '/dashboard/alarms',
    icon: 'ti-bell',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-400',
    border: 'border-amber-100',
    badge: '2 due',
    badgeBg: 'bg-amber-50 text-amber-400',
    titleKey: 'mod_alarm_title',
    descKey:  'mod_alarm_desc',
  },
  {
    id: 'records',
    to: '/dashboard/records',
    icon: 'ti-lock',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    border: 'border-purple-100',
    badge: '12 files',
    badgeBg: 'bg-purple-50 text-purple-600',
    titleKey: 'mod_rec_title',
    descKey:  'mod_rec_desc',
  },
]

// Quick translations for dashboard strings not in main context yet
const dash = {
  en: {
    greeting: (name) => `Good day, ${name} 👋`,
    sub: 'Here\'s your health overview',
    score_label: 'Health score',
    score_sub: 'Good — 2 reminders today',
    upcoming: 'Upcoming appointment',
    doctor: 'Dr. Meera Sharma',
    appt_info: 'General physician · 11:00 AM',
    appt_tag: 'Follow-up visit',
    quick_title: 'Quick actions',
    mod_rx_title: 'Prescription reader',
    mod_rx_desc: 'Upload & understand any prescription instantly',
    mod_sym_title: 'Symptom checker',
    mod_sym_desc: 'Describe symptoms by text or photo',
    mod_doc_title: 'Doctor visit tracker',
    mod_doc_desc: 'Log visits & track next appointment',
    mod_alarm_title: 'Medicine alarms',
    mod_alarm_desc: 'Smart reminders for every tablet',
    mod_rec_title: 'Health records vault',
    mod_rec_desc: 'All reports secured with biometrics',
    reminder_title: 'Today\'s reminders',
    med1: 'Metformin 500mg',
    med1t: '8:00 PM · After dinner',
    med2: 'Atorvastatin 10mg',
    med2t: '10:00 PM · After dinner',
    view_all: 'View all reminders →',
  },
  hi: {
    greeting: (name) => `नमस्ते, ${name} 👋`,
    sub: 'आपका स्वास्थ्य सारांश',
    score_label: 'स्वास्थ्य स्कोर',
    score_sub: 'अच्छा — आज 2 अनुस्मारक',
    upcoming: 'आगामी अपॉइंटमेंट',
    doctor: 'डॉ. मीरा शर्मा',
    appt_info: 'सामान्य चिकित्सक · सुबह 11:00',
    appt_tag: 'फॉलो-अप विज़िट',
    quick_title: 'त्वरित क्रियाएं',
    mod_rx_title: 'प्रिस्क्रिप्शन रीडर',
    mod_rx_desc: 'कोई भी पर्चा तुरंत अपलोड करें व समझें',
    mod_sym_title: 'लक्षण जाँचकर्ता',
    mod_sym_desc: 'टेक्स्ट या फोटो से लक्षण बताएं',
    mod_doc_title: 'डॉक्टर विज़िट ट्रैकर',
    mod_doc_desc: 'विज़िट दर्ज करें और अगली अपॉइंटमेंट ट्रैक करें',
    mod_alarm_title: 'दवाई अलार्म',
    mod_alarm_desc: 'हर गोली के लिए स्मार्ट अनुस्मारक',
    mod_rec_title: 'स्वास्थ्य रिकॉर्ड वॉल्ट',
    mod_rec_desc: 'सभी रिपोर्ट बायोमेट्रिक्स से सुरक्षित',
    reminder_title: 'आज के अनुस्मारक',
    med1: 'मेटफ़ॉर्मिन 500mg',
    med1t: 'रात 8:00 · रात के खाने के बाद',
    med2: 'एटोरवास्टेटिन 10mg',
    med2t: 'रात 10:00 · रात के खाने के बाद',
    view_all: 'सभी अनुस्मारक देखें →',
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const { lang } = useLang()
  const d = dash[lang]
  const firstName = user?.name?.split(' ')[0] || 'User'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Greeting ── */}
        <div className="mb-6 fade-up fade-up-1">
          <p className="text-gray-500 text-sm">{d.greeting(firstName)}</p>
          <h1 className="font-sora font-bold text-2xl text-gray-900 mt-0.5">{d.sub}</h1>
        </div>

        {/* ── Health score card ── */}
        <div className="bg-teal-600 rounded-2xl p-6 mb-6 fade-up fade-up-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium mb-1">{d.score_label}</p>
              <p className="font-sora font-bold text-5xl text-white">
                78<span className="text-xl font-normal text-teal-200">/100</span>
              </p>
              <p className="text-teal-200 text-sm mt-1">{d.score_sub}</p>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-4 border-white border-b-transparent border-l-transparent rotate-45" />
                <span className="font-sora font-bold text-white text-lg relative z-10">78%</span>
              </div>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: 'ti-pill',     val: '3',  label: lang === 'en' ? 'Medicines' : 'दवाइयाँ' },
              { icon: 'ti-file',    val: '12', label: lang === 'en' ? 'Reports'   : 'रिपोर्ट' },
              { icon: 'ti-calendar',val: '7d', label: lang === 'en' ? 'Next visit' : 'अगली विज़िट' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <i className={`ti ${s.icon} text-white text-xl`} aria-hidden="true" />
                <p className="font-sora font-bold text-white text-lg mt-0.5">{s.val}</p>
                <p className="text-teal-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Module grid ── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 fade-up fade-up-3">
          {d.quick_title}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 fade-up fade-up-3">
          {modules.map((m) => (
            <Link key={m.id} to={m.to}
              className={`card p-5 border ${m.border} hover:shadow-md hover:-translate-y-1
                          transition-all duration-300 group`}>
              <div className={`w-11 h-11 ${m.bg} rounded-xl flex items-center justify-center mb-3`}>
                <i className={`ti ${m.icon} ${m.iconColor} text-2xl`} aria-hidden="true" />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.badgeBg} mb-2 inline-block`}>
                {m.badge}
              </span>
              <h3 className="font-sora font-semibold text-sm text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
                {d[m.titleKey]}
              </h3>
              <p className="text-xs text-gray-500 leading-snug">{d[m.descKey]}</p>
            </Link>
          ))}
        </div>

        {/* ── Today's reminders ── */}
        <div className="fade-up fade-up-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {d.reminder_title}
          </p>
          <div className="card border border-amber-100 overflow-hidden">
            {[
              { name: d.med1, time: d.med1t, dot: 'bg-teal-600', done: true },
              { name: d.med2, time: d.med2t, dot: 'bg-coral-400', done: false },
            ].map((med, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-4 ${i < 1 ? 'border-b border-gray-100' : ''}`}>
                <div className={`w-3 h-3 rounded-full ${med.dot} flex-shrink-0`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{med.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{med.time}</p>
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${med.done ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}>
                  {med.done && <i className="ti ti-check text-white text-xs" aria-hidden="true" />}
                </div>
              </div>
            ))}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <Link to="/dashboard/alarms" className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors">
                {d.view_all}
              </Link>
            </div>
          </div>
        </div>

        {/* ── Upcoming appointment ── */}
        <div className="fade-up fade-up-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            {d.upcoming}
          </p>
          <div className="card border border-purple-100 p-5 flex items-center gap-4">
            <div className="bg-purple-50 rounded-xl p-3 text-center min-w-[56px]">
              <p className="font-sora font-bold text-2xl text-purple-600 leading-none">24</p>
              <p className="text-xs font-semibold text-purple-400 mt-0.5">MAY</p>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">{d.doctor}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{d.appt_info}</p>
              <span className="inline-block mt-2 text-xs bg-purple-50 text-purple-600 font-medium px-2 py-0.5 rounded-full">
                {d.appt_tag}
              </span>
            </div>
            <Link to="/dashboard/doctor"
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-teal-50 transition-colors">
              <i className="ti ti-arrow-right text-gray-500 text-base" aria-hidden="true" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
