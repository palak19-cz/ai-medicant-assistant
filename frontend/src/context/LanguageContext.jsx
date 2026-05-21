import { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    // Navbar
    nav_features: 'Features',
    nav_how:      'How it works',
    nav_login:    'Login',
    nav_start:    'Get started',

    // Hero
    hero_badge:   '🩺 AI-powered health assistant',
    hero_h1_a:    'Your health,',
    hero_h1_b:    'understood.',
    hero_p:       'Upload prescriptions, check symptoms with AI, set smart medicine reminders, and keep all your reports safe — in Hindi or English.',
    hero_cta:     'Start for free',
    hero_sub:     'No credit card needed · Takes 30 seconds',

    // Trust badges
    trust_1:      'Bank-grade encryption',
    trust_2:      'Hindi + English',
    trust_3:      'AI powered by Claude',

    // Features section
    feat_title:   'Everything your health needs',
    feat_sub:     'Five powerful tools, one simple app.',

    feat_1_title: 'Prescription reader',
    feat_1_desc:  'Upload any prescription — typed or handwritten. Our AI reads it and explains every medicine, its purpose, dosage, and side effects in plain language.',
    feat_1_tag:   'OCR + AI analysis',

    feat_2_title: 'Symptom checker',
    feat_2_desc:  'Describe your symptoms by text or photo. Get instant AI guidance — what it could be, what to avoid, which medicines help, and when to see a doctor.',
    feat_2_tag:   'Text & photo input',

    feat_3_title: 'Doctor visit tracker',
    feat_3_desc:  'Log every doctor visit, upload the prescription from that day, and track your next appointment date — all in one timeline.',
    feat_3_tag:   'Visit history',

    feat_4_title: 'Medicine alarms',
    feat_4_desc:  'AI reads your prescription and suggests smart time slots for each medicine. Confirm once and get push notifications at the right time, every day.',
    feat_4_tag:   'Smart reminders',

    feat_5_title: 'Health records vault',
    feat_5_desc:  'Upload all your reports, scans, and prescriptions. Protected by biometric authentication — face, fingerprint, or PIN. Find any report instantly.',
    feat_5_tag:   'Biometric security',

    // How it works
    how_title:    'How it works',
    how_1:        'Register & login securely',
    how_2:        'Upload a prescription or describe symptoms',
    how_3:        'AI analyses and explains everything',
    how_4:        'Set reminders, save reports, stay healthy',

    // CTA section
    cta_h:        'Take control of your health today',
    cta_p:        'Join thousands of patients who use MediPredict to understand their health better.',
    cta_btn:      'Create free account',

    // Auth pages
    login_title:  'Welcome back',
    login_sub:    'Login to your health dashboard',
    login_email:  'Email address',
    login_pass:   'Password',
    login_forgot: 'Forgot password?',
    login_btn:    'Login',
    login_or:     'or continue with',
    login_google: 'Continue with Google',
    login_fp:     'Fingerprint',
    login_face:   'Face ID',
    login_no_acc: "Don't have an account?",
    login_reg:    'Register here',

    reg_title:    'Create your account',
    reg_sub:      'Free forever · No credit card',
    reg_name:     'Full name',
    reg_email:    'Email address',
    reg_phone:    'Phone number',
    reg_pass:     'Password',
    reg_confirm:  'Confirm password',
    reg_btn:      'Create account',
    reg_or:       'or sign up with',
    reg_have_acc: 'Already have an account?',
    reg_login:    'Login here',
    reg_terms:    'By registering, you agree to our Terms & Privacy Policy.',

    // Errors
    err_required: 'This field is required',
    err_email:    'Enter a valid email address',
    err_pass_len: 'Password must be at least 8 characters',
    err_pass_match:'Passwords do not match',
    err_login:    'Invalid email or password',
    err_network:  'Network error. Please try again.',
  },

  hi: {
    nav_features: 'सुविधाएं',
    nav_how:      'कैसे काम करता है',
    nav_login:    'लॉगिन',
    nav_start:    'शुरू करें',

    hero_badge:   '🩺 AI-संचालित स्वास्थ्य सहायक',
    hero_h1_a:    'आपका स्वास्थ्य,',
    hero_h1_b:    'समझा गया।',
    hero_p:       'प्रिस्क्रिप्शन अपलोड करें, AI से लक्षण जांचें, स्मार्ट दवाई अनुस्मारक सेट करें, और सभी रिपोर्ट सुरक्षित रखें — हिंदी या अंग्रेज़ी में।',
    hero_cta:     'निःशुल्क शुरू करें',
    hero_sub:     'क्रेडिट कार्ड की ज़रूरत नहीं · 30 सेकंड में',

    trust_1:      'बैंक-स्तरीय एन्क्रिप्शन',
    trust_2:      'हिंदी + अंग्रेज़ी',
    trust_3:      'Claude द्वारा AI संचालित',

    feat_title:   'आपके स्वास्थ्य की हर ज़रूरत',
    feat_sub:     'पाँच शक्तिशाली टूल, एक सरल ऐप।',

    feat_1_title: 'प्रिस्क्रिप्शन रीडर',
    feat_1_desc:  'कोई भी पर्चा अपलोड करें — टाइप या हाथ से लिखा। हमारा AI हर दवाई, उसका उद्देश्य, खुराक और दुष्प्रभाव सरल भाषा में समझाता है।',
    feat_1_tag:   'OCR + AI विश्लेषण',

    feat_2_title: 'लक्षण जाँचकर्ता',
    feat_2_desc:  'टेक्स्ट या फोटो से अपने लक्षण बताएं। तुरंत AI मार्गदर्शन पाएं — क्या हो सकता है, क्या न करें, कौन सी दवाई लें, और डॉक्टर कब दिखाएं।',
    feat_2_tag:   'टेक्स्ट और फोटो',

    feat_3_title: 'डॉक्टर विज़िट ट्रैकर',
    feat_3_desc:  'हर डॉक्टर मुलाकात दर्ज करें, उस दिन का पर्चा अपलोड करें, और अगली अपॉइंटमेंट तारीख ट्रैक करें — सब एक टाइमलाइन में।',
    feat_3_tag:   'विज़िट इतिहास',

    feat_4_title: 'दवाई अलार्म',
    feat_4_desc:  'AI आपका पर्चा पढ़कर हर दवाई के लिए स्मार्ट टाइम स्लॉट सुझाता है। एक बार पुष्टि करें और हर दिन सही समय पर अनुस्मारक पाएं।',
    feat_4_tag:   'स्मार्ट अनुस्मारक',

    feat_5_title: 'स्वास्थ्य रिकॉर्ड वॉल्ट',
    feat_5_desc:  'सभी रिपोर्ट, स्कैन और पर्चे अपलोड करें। बायोमेट्रिक प्रमाणीकरण — चेहरा, फिंगरप्रिंट या PIN से सुरक्षित। कोई भी रिपोर्ट तुरंत खोजें।',
    feat_5_tag:   'बायोमेट्रिक सुरक्षा',

    how_title:    'कैसे काम करता है',
    how_1:        'सुरक्षित रूप से रजिस्टर और लॉगिन करें',
    how_2:        'प्रिस्क्रिप्शन अपलोड करें या लक्षण बताएं',
    how_3:        'AI सब कुछ विश्लेषित करके समझाता है',
    how_4:        'अनुस्मारक सेट करें, रिपोर्ट सहेजें, स्वस्थ रहें',

    cta_h:        'आज अपने स्वास्थ्य पर नियंत्रण लें',
    cta_p:        'हज़ारों मरीज़ MediPredict से अपना स्वास्थ्य बेहतर समझते हैं।',
    cta_btn:      'निःशुल्क खाता बनाएं',

    login_title:  'वापस स्वागत है',
    login_sub:    'अपने स्वास्थ्य डैशबोर्ड में लॉगिन करें',
    login_email:  'ईमेल पता',
    login_pass:   'पासवर्ड',
    login_forgot: 'पासवर्ड भूल गए?',
    login_btn:    'लॉगिन करें',
    login_or:     'या इससे जारी रखें',
    login_google: 'Google से जारी रखें',
    login_fp:     'फिंगरप्रिंट',
    login_face:   'Face ID',
    login_no_acc: 'खाता नहीं है?',
    login_reg:    'यहाँ रजिस्टर करें',

    reg_title:    'अपना खाता बनाएं',
    reg_sub:      'हमेशा निःशुल्क · कोई क्रेडिट कार्ड नहीं',
    reg_name:     'पूरा नाम',
    reg_email:    'ईमेल पता',
    reg_phone:    'फ़ोन नंबर',
    reg_pass:     'पासवर्ड',
    reg_confirm:  'पासवर्ड की पुष्टि करें',
    reg_btn:      'खाता बनाएं',
    reg_or:       'या इससे साइन अप करें',
    reg_have_acc: 'पहले से खाता है?',
    reg_login:    'यहाँ लॉगिन करें',
    reg_terms:    'रजिस्टर करके आप हमारी शर्तों और गोपनीयता नीति से सहमत हैं।',

    err_required: 'यह फ़ील्ड आवश्यक है',
    err_email:    'मान्य ईमेल पता दर्ज करें',
    err_pass_len: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए',
    err_pass_match:'पासवर्ड मेल नहीं खाते',
    err_login:    'ईमेल या पासवर्ड गलत है',
    err_network:  'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।',
  }
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = (key) => translations[lang][key] || key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
