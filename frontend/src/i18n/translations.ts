import { LanguageCode } from '../types/index.js';

export interface Translations {
  appName: string;
  tagline: string;
  emergencyNotice: string;
  disclaimerText: string;
  nav: {
    dashboard: string;
    chat: string;
    symptoms: string;
    reports: string;
    images: string;
    medicines: string;
    profile: string;
    memory: string;
    settings: string;
    admin: string;
    login: string;
    register: string;
    logout: string;
  };
  actions: {
    checkSymptoms: string;
    uploadReport: string;
    analyzeImage: string;
    askAssistant: string;
    save: string;
    delete: string;
    cancel: string;
    submit: string;
    copy: string;
    retry: string;
    clear: string;
  };
  chat: {
    placeholder: string;
    newChat: string;
    evidenceTitle: string;
    emergencyCallout: string;
  };
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appName: 'AI Healthcare Assistant',
    tagline: 'Multimodal, Evidence-Backed Clinical Guidance & Personal Health Companion',
    emergencyNotice: 'If you are experiencing a life-threatening medical emergency (e.g. crushing chest pain, acute stroke signs, breathing failure), call emergency services immediately.',
    disclaimerText: 'AI Healthcare Assistant provides educational information and is not a replacement for professional clinical diagnosis or emergency care.',
    nav: {
      dashboard: 'Dashboard',
      chat: 'AI Health Chat',
      symptoms: 'Symptom Checker',
      reports: 'Medical Reports',
      images: 'Image Analysis',
      medicines: 'Medicine Guide',
      profile: 'Health Profile',
      memory: 'Health Memory',
      settings: 'Settings',
      admin: 'Admin Console',
      login: 'Sign In',
      register: 'Sign Up',
      logout: 'Sign Out',
    },
    actions: {
      checkSymptoms: 'Check Symptoms',
      uploadReport: 'Upload Report',
      analyzeImage: 'Analyze Scan',
      askAssistant: 'Ask AI Assistant',
      save: 'Save Changes',
      delete: 'Delete Record',
      cancel: 'Cancel',
      submit: 'Submit',
      copy: 'Copy Response',
      retry: 'Retry',
      clear: 'Clear Chat',
    },
    chat: {
      placeholder: 'Describe your symptoms, lab test results, or health question...',
      newChat: 'New Health Consultation',
      evidenceTitle: 'Medical Sources & Clinical References',
      emergencyCallout: 'Emergency Safety Alert Triggered',
    },
  },
  hi: {
    appName: 'एआई स्वास्थ्य सहायक (AI Healthcare Assistant)',
    tagline: 'मल्टीमॉडल, विश्वसनीय और व्यक्तिगत स्वास्थ्य परामर्श प्रणाली',
    emergencyNotice: 'यदि आपको कोई गंभीर आपातकालीन लक्षण है (जैसे सीने में तेज दर्द, सांस लेने में अत्यधिक तकलीफ), तो तुरंत आपातकालीन सेवा 112 / 108 पर संपर्क करें।',
    disclaimerText: 'यह प्रणाली केवल शैक्षिक और मार्गदर्शन उद्देश्य के लिए है और किसी चिकित्सक के औपचारिक निदान का विकल्प नहीं है।',
    nav: {
      dashboard: 'डैशबोर्ड',
      chat: 'स्वास्थ्य चैट',
      symptoms: 'लक्षण जांचें',
      reports: 'मेडिकल रिपोर्ट्स',
      images: 'इमेज विश्लेषण',
      medicines: 'दवा गाइड',
      profile: 'स्वास्थ्य प्रोफ़ाइल',
      memory: 'स्वास्थ्य स्मृति',
      settings: 'सेटिंग्स',
      admin: 'व्यवस्थापक',
      login: 'लॉग इन करें',
      register: 'रजिस्टर करें',
      logout: 'लॉग आउट',
    },
    actions: {
      checkSymptoms: 'लक्षण जांचें',
      uploadReport: 'रिपोर्ट अपलोड करें',
      analyzeImage: 'इमेज का विश्लेषण करें',
      askAssistant: 'सहायक से पूछें',
      save: 'सहेजें',
      delete: 'हटाएं',
      cancel: 'रद्द करें',
      submit: 'जमा करें',
      copy: 'कॉपी करें',
      retry: 'पुनः प्रयास करें',
      clear: 'चैट साफ़ करें',
    },
    chat: {
      placeholder: 'अपने लक्षण, टेस्ट रिपोर्ट या स्वास्थ्य प्रश्न लिखें...',
      newChat: 'नया स्वास्थ्य परामर्श',
      evidenceTitle: 'चिकित्सा स्रोत और संदर्भ',
      emergencyCallout: 'आपातकालीन सुरक्षा चेतावनी',
    },
  },
  mr: {
    appName: 'एआय आरोग्य सहाय्यक (AI Healthcare Assistant)',
    tagline: 'बहुभाषिक, विश्वासार्ह व वैयक्तिकृत वैद्यकीय सहाय्यक प्रणाली',
    emergencyNotice: 'आपणास तातडीची वैद्यकीय आणीबाणी असल्यास (उदा. छातीत तीव्र वेदना, श्वास घेण्यास अडचण), कृपया तात्काळ रुग्णवाहिका किंवा डॉक्टरांशी संपर्क साधा.',
    disclaimerText: 'ही प्रणाली केवळ माहिती आणि मार्गदर्शनासाठी आहे. हा अंतिम वैद्यकीय सल्ला अथवा निदान नाही.',
    nav: {
      dashboard: 'डॅशबोर्ड',
      chat: 'आरोग्य चर्चा (Chat)',
      symptoms: 'लक्षण तपासणी',
      reports: 'वैद्यकीय अहवाल (Reports)',
      images: 'प्रतिमा विश्लेषण (Images)',
      medicines: 'औषध माहिती',
      profile: 'आरोग्य प्रोफाइल',
      memory: 'आरोग्य स्मृती',
      settings: 'सेटिंग्ज',
      admin: 'प्रशासक कक्ष',
      login: 'प्रवेश करा (Login)',
      register: 'नोंदणी करा',
      logout: 'बाहेर पडा',
    },
    actions: {
      checkSymptoms: 'लक्षणे तपासा',
      uploadReport: 'अहवाल अपलोड करा',
      analyzeImage: 'स्कॅन विश्लेषण',
      askAssistant: 'सल्ला विचारा',
      save: 'जतन करा',
      delete: 'हटवा',
      cancel: 'रद्द करा',
      submit: 'सादर करा',
      copy: 'प्रत करा (Copy)',
      retry: 'पुन्हा प्रयत्न करा',
      clear: 'चर्चा साफ करा',
    },
    chat: {
      placeholder: 'आपली लक्षणे, वैद्यकीय चाचणी अथवा आरोग्य प्रश्न लिहा...',
      newChat: 'नवीन आरोग्य सल्ला',
      evidenceTitle: 'वैद्यकीय पुरावे आणि संदर्भ',
      emergencyCallout: 'तातडीची सुरक्षा सूचना',
    },
  },
};
