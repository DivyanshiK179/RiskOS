import React, { useEffect, useRef } from "react";
import { X, Shield, FileText, Lock, Globe, AlertTriangle, Eye, CheckCircle2 } from "lucide-react";
import { useTranslation } from "../i18n/translations";

export type PolicyKey = "terms" | "privacy" | "hyperlink" | "copyright" | "accessibility" | "disclaimer";

interface PolicyModalProps {
  policyKey: PolicyKey | null;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

interface PolicySection {
  title: string;
  text: string;
}

interface PolicyData {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: PolicySection[];
  statuteNotice?: string;
}

export default function PolicyModal({ policyKey, onClose, triggerRef }: PolicyModalProps) {
  const { lang } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape & trap focus
  useEffect(() => {
    if (!policyKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on close button
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      // Restore focus to triggering link
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    };
  }, [policyKey, onClose, triggerRef]);

  if (!policyKey) return null;

  const getPolicyContent = (key: PolicyKey): PolicyData => {
    switch (key) {
      case "terms":
        return {
          title: lang === "hi" ? "उपयोग की शर्तें" : "Terms of Use",
          subtitle:
            lang === "hi"
              ? "आपदा प्रबंधन अधिनियम, 2005 के अंतर्गत वैधानिक पोर्टल उपयोग नियम"
              : "Statutory Portal Usage Rules under the Disaster Management Act, 2005",
          icon: Shield,
          statuteNotice:
            lang === "hi"
              ? "आपदा प्रबंधन अधिनियम, 2005 की धारा 51 एवं सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 66 के अधीन प्रवर्तनीय।"
              : "Enforceable under Section 51 of Disaster Management Act, 2005 & Section 66 of Information Technology Act, 2000.",
          sections: [
            {
              title: lang === "hi" ? "1. वैधानिक अधिकार क्षेत्र एवं स्वीकृति" : "1. Legislative Authority & Acceptance",
              text:
                lang === "hi"
                  ? "इस पोर्टल (RiskOS) का उपयोग राष्ट्रीय आपदा प्रबंधन अधिनियम, 2005 तथा सूचना प्रौद्योगिकी अधिनियम, 2000 के विधिक प्रावधानों के अधीन है। पोर्टल पर प्रवेश करने या इसके भू-स्थानिक डेटा का उपयोग करने पर आप इन शर्तों के पूर्ण अनुपालन के लिए बाध्य हैं।"
                  : "Access to and use of RiskOS is governed by the National Disaster Management Act, 2005 (DM Act, 2005) and the Information Technology Act, 2000. Accessing this system constitutes mandatory acceptance of statutory directives issued by SDMA Uttarakhand and NDMA."
            },
            {
              title: lang === "hi" ? "2. अधिकृत परिचालन उपयोग" : "2. Authorized Operational Usage",
              text:
                lang === "hi"
                  ? "यह पोर्टल आपदा परिदृश्य विश्लेषण, प्रारंभिक चेतावनी प्रसारण, संवेदनशीलता मूल्यांकन एवं निकासी योजना निर्माण हेतु राज्य आपदा प्रबंधन प्राधिकरणों, जिलाधिकारियों एवं आपातकालीन राहत दलों के आधिकारिक उपयोग के लिए अधिकृत है।"
                  : "RiskOS is deployed specifically for disaster scenario analysis, vulnerability assessment, early warning broadcast, and emergency relocation logistics by authorized state officials, District Magistrates, and civil protection personnel."
            },
            {
              title: lang === "hi" ? "3. निषिद्ध गतिविधियां एवं प्रतिबंध" : "3. Prohibited Conduct & Restrictions",
              text:
                lang === "hi"
                  ? "पोर्टल पर अनधिकृत स्वचालित डेटा निष्कर्षण (Scraping), सुरक्षा परीक्षण (Penetration Testing), रिवर्स इंजीनियरिंग, अथवा सिस्टम अवसंरचना पर सेवा-अवरोध (DoS/DDoS) का प्रयास पूर्णतः गैरकानूनी है। उल्लंघनकर्ताओं के विरुद्ध कठोर दंडात्मक कार्रवाई की जाएगी।"
                  : "Automated scraping, denial-of-service attempts, unauthorized reverse-engineering, security scanning, or commercial redistribution of sensitive habitation telemetry without express written statutory authorization is strictly prohibited."
            },
            {
              title: lang === "hi" ? "4. विधिक दंडात्मक प्रावधान" : "4. Penal Sanctions for Tampering",
              text:
                lang === "hi"
                  ? "पोर्टल के डेटा अथवा कार्यप्रणाली में किसी भी प्रकार की छेड़छाड़ सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 66 तथा आपदा प्रबंधन अधिनियम की धारा 51 एवं 52 के अंतर्गत संज्ञेय और गैर-जमानती अपराध है, जिसके लिए कारावास व अर्थदंड का प्रावधान है।"
                  : "Tampering with official telemetry, falsifying hazard warnings, or interfering with civil defense operations constitutes a cognizable offense punishable under Section 66 of the IT Act, 2000 and Sections 51-54 of the DM Act, 2005."
            }
          ]
        };

      case "privacy":
        return {
          title: lang === "hi" ? "गोपनीयता नीति" : "Privacy Policy",
          subtitle:
            lang === "hi"
              ? "डेटा संरक्षण एवं गोपनीयता सुरक्षा उपाय (GIGW 3.0 एवं आईटी अधिनियम, 2000)"
              : "Data Protection & Privacy Safeguards (GIGW 3.0 & IT Act, 2000)",
          icon: Lock,
          statuteNotice:
            lang === "hi"
              ? "सूचना प्रौद्योगिकी (उचित सुरक्षा पद्धतियां और प्रक्रियाएं) नियम, 2011 के अनुरूप।"
              : "In accordance with Information Technology (Reasonable Security Practices) Rules, 2011.",
          sections: [
            {
              title: lang === "hi" ? "1. व्यक्तिगत पहचान योग्य जानकारी का अनाहरण" : "1. Non-Collection of Personal Data",
              text:
                lang === "hi"
                  ? "RiskOS पोर्टल सार्वजनिक आगंतुकों से व्यक्तिगत पहचान योग्य जानकारी (जैसे नाम, व्यक्तिगत फोन नंबर या पता) स्वचालित रूप से एकत्र नहीं करता है। सार्वजनिक मानचित्र दर्शक बिना किसी पंजीकरण के उपलब्ध हैं।"
                  : "RiskOS does not automatically capture personally identifiable information (PII) such as personal names, private contact numbers, or home addresses from citizens accessing public hazard advisory and evacuation map views."
            },
            {
              title: lang === "hi" ? "2. प्रशासनिक सत्र एवं अधिकारी क्रेडेंशियल" : "2. Administrative Telemetry & Authentication",
              text:
                lang === "hi"
                  ? "अधिकृत राज्य अधिकारियों के लिए सत्र कुकीज (Session Cookies) और टोकन प्रमाणीकरण का उपयोग केवल सुरक्षित पहुंच बनाए रखने और एनडीएमए सुरक्षा एसओपी के तहत ऑडिट लॉग दर्ज करने के लिए किया जाता है।"
                  : "Administrative session tokens and security cookies are utilized exclusively for authenticated state officials to maintain authorized access and generate immutable audit trails as mandated by NDMA security SOPs."
            },
            {
              title: lang === "hi" ? "3. भू-स्थानिक एवं संवेदी डेटा का प्रबंधन" : "3. Spatial Data & Telemetry Handling",
              text:
                lang === "hi"
                  ? "जनगणना व सुदूर संवेदन डेटासेट केवल सार्वजनिक सुरक्षा, भूस्खलन जोखिम मूल्यांकन एवं राहत शिविर मिलान के लिए संसाधित किए जाते हैं। इस डेटा का कोई वाणिज्यिक उपयोग नहीं किया जाता।"
                  : "Census aggregated indicators, terrain models, and remote sensing telemetry are processed exclusively for disaster risk modeling and humanitarian logistics, without any commercial profiling or secondary marketing transfer."
            },
            {
              title: lang === "hi" ? "4. सीईआरटी-इन क्लाउड सुरक्षा अनुपालन" : "4. CERT-In Cybersecurity Compliance",
              text:
                lang === "hi"
                  ? "सभी परिचालन डेटाबेस भारत सरकार के क्लाउड सुरक्षा मानकों और भारतीय कंप्यूटर आपातकालीन प्रतिक्रिया दल (CERT-In) के दिशा-निर्देशों के अनुसार कड़े एन्क्रिप्शन और अभिगम नियंत्रण में सुरक्षित हैं।"
                  : "Data transmissions and storage clusters strictly adhere to CERT-In cybersecurity standards, Government of India Cloud Security Directives, and TLS 1.3 cryptographic protocols."
            }
          ]
        };

      case "hyperlink":
        return {
          title: lang === "hi" ? "हाइपरलिंक नीति" : "Hyperlink Policy",
          subtitle:
            lang === "hi"
              ? "GIGW 3.0 हाइपरलिंकिंग मानक एवं दिशा-निर्देश"
              : "GIGW 3.0 Hyperlinking Standards & External Link Directives",
          icon: Globe,
          statuteNotice:
            lang === "hi"
              ? "भारतीय सरकारी वेबसाइटों के लिए दिशा-निर्देश (GIGW 3.0) क्लॉज 4.4 के तहत निर्धारित।"
              : "Governed under Guidelines for Indian Government Websites (GIGW 3.0), Section 4.4.",
          sections: [
            {
              title: lang === "hi" ? "1. RiskOS से इनबाउंड लिंकिंग" : "1. Inbound Hyperlinking to RiskOS",
              text:
                lang === "hi"
                  ? "सरकारी विभागों, शैक्षणिक संस्थानों और नागरिक सुरक्षा संस्थाओं को RiskOS पोर्टल से सीधे लिंक करने की पूर्व अनुमति की आवश्यकता नहीं है, बशर्ते लिंक भ्रामक फ्रेम में प्रदर्शित न हो और स्पष्ट संदर्भ ('भारत सरकार • उत्तराखंड एसडीएमए') दिया गया हो।"
                  : "Prior permission is not required before hyperlinking to RiskOS from recognized government agencies, research bodies, or educational institutions, provided links do not render inside unauthorized frames and maintain explicit attribution."
            },
            {
              title: lang === "hi" ? "2. आधिकारिक बाह्य कड़ियों का संदर्भ" : "2. Outbound Links to Statutory Portals",
              text:
                lang === "hi"
                  ? "इस पोर्टल पर राष्ट्रीय आपदा प्रबंधन प्राधिकरण (ndma.gov.in), इलेक्ट्रॉनिकी एवं सूचना प्रौद्योगिकी मंत्रालय (meity.gov.in), एनआईसी (nic.in) तथा भारत मौसम विज्ञान विभाग (imd.gov.in) जैसी आधिकारिक संस्थाओं के हाइपरलिंक प्रदान किए गए हैं।"
                  : "RiskOS provides outbound hyperlinks to statutory GOI authorities including the National Disaster Management Authority (ndma.gov.in), Ministry of Electronics & IT (meity.gov.in), NIC (nic.in), and IMD (imd.gov.in)."
            },
            {
              title: lang === "hi" ? "3. बाह्य वेबसाइटों पर अनापत्ति एवं अस्वीकरण" : "3. Non-Endorsement & External Disclaimer",
              text:
                lang === "hi"
                  ? "उत्तराखंड राज्य आपदा प्रबंधन प्राधिकरण और MeitY बाह्य वेबसाइटों की सामग्री, अद्यतन स्थिति या विश्वसनीयता के लिए उत्तरदायी नहीं हैं और उनमें व्यक्त विचारों का स्वतः समर्थन नहीं करते हैं।"
                  : "USDMA and MeitY cannot guarantee the continuous availability of external links and assume no responsibility for the contents, privacy practices, or operational reliability of linked non-RiskOS portals."
            }
          ]
        };

      case "copyright":
        return {
          title: lang === "hi" ? "कॉपीराइट नीति" : "Copyright Policy",
          subtitle:
            lang === "hi"
              ? "बौद्धिक संपदा एवं सामग्री स्वामित्व ढांचा"
              : "Intellectual Property & Content Ownership Framework",
          icon: FileText,
          statuteNotice:
            lang === "hi"
              ? "कॉपीराइट अधिनियम, 1957 (भारत सरकार) के प्रावधानों के अंतर्गत संरक्षित।"
              : "Protected under the Copyright Act, 1957 (Government of India).",
          sections: [
            {
              title: lang === "hi" ? "1. स्वामित्व एवं बौद्धिक संपदा" : "1. Statutory Proprietary Ownership",
              text:
                lang === "hi"
                  ? "इस पोर्टल पर प्रदर्शित समस्त सामग्री (भू-स्थानिक एल्गोरिदम, मानचित्रण परतें, बस्ती विश्लेषण स्कोर और इंटरफ़ेस डिजाइन) उत्तराखंड राज्य आपदा प्रबंधन प्राधिकरण (USDMA) और इलेक्ट्रॉनिकी एवं सूचना प्रौद्योगिकी मंत्रालय (MeitY) की बौद्धिक संपदा है।"
                  : "The material featured on this portal—including PostGIS algorithmic workflows, cadastral analytics, vulnerability indices, and UI frameworks—is the proprietary intellectual property of USDMA and MeitY, Government of India."
            },
            {
              title: lang === "hi" ? "2. गैर-वाणिज्यिक एवं शैक्षणिक पुनःप्रकाशन" : "2. Educational & Non-Commercial Reproduction",
              text:
                lang === "hi"
                  ? "सामग्री को आधिकारिक आपदा प्रबंधन, अकादमिक अनुसंधान तथा गैर-वाणिज्यिक शिक्षा के लिए बिना किसी शुल्क के पुनः प्रस्तुत किया जा सकता है, बशर्ते इसे सटीक रूप से और बिना किसी भ्रामक संदर्भ के प्रस्तुत किया जाए।"
                  : "Material may be reproduced free of charge in any format or media for official disaster mitigation planning, scientific research, and non-commercial civil defense training, provided it is reproduced accurately and without distortion."
            },
            {
              title: lang === "hi" ? "3. अनिवार्य स्रोत आभारोल्लेख" : "3. Mandatory Source Attribution",
              text:
                lang === "hi"
                  ? "जहाँ भी इस पोर्टल से डेटा या मानचित्र उद्धृत किए जाएं, वहाँ स्रोत को प्रमुखता से 'स्रोत: RiskOS - वैधानिक जीआईएस-डीएसएस पोर्टल, भारत सरकार एवं एसडीएमए उत्तराखंड' के रूप में स्वीकार किया जाना अनिवार्य है।"
                  : "Whenever material from RiskOS is republished or cited, source acknowledgement must be prominently credited as: 'Source: RiskOS - Statutory Geospatial Decision Support System, Government of India & SDMA Uttarakhand'."
            }
          ]
        };

      case "accessibility":
        return {
          title: lang === "hi" ? "पहुंच विवरण" : "Accessibility Statement",
          subtitle:
            lang === "hi"
              ? "WCAG 2.1 स्तर AA एवं GIGW 3.0 अनुपालन प्रतिबद्धता"
              : "Commitment to WCAG 2.1 Level AA & GIGW 3.0 Standards",
          icon: Eye,
          statuteNotice:
            lang === "hi"
              ? "दिव्यांगजन अधिकार अधिनियम, 2016 तथा GIGW 3.0 पहुंच मानकों के अनुरूप।"
              : "Conforming to Rights of Persons with Disabilities Act, 2016 and GIGW 3.0 Accessibility Rules.",
          sections: [
            {
              title: lang === "hi" ? "1. सार्वभौमिक पहुंच प्रतिबद्धता" : "1. Universal Access Commitment",
              text:
                lang === "hi"
                  ? "हम यह सुनिश्चित करने के लिए पूर्णतः प्रतिबद्ध हैं कि RiskOS पोर्टल किसी भी दिव्यांगता, उपकरण या तकनीकी सीमा की परवाह किए बिना सभी नागरिकों और अधिकारियों के लिए सुलभ हो। यह पोर्टल W3C वेब सामग्री पहुंच दिशानिर्देश (WCAG 2.1 Level AA) का अनुपालन करता है।"
                  : "We are committed to ensuring that the RiskOS Decision Support System is accessible to all users regardless of disability, assistive technology, or network device, adhering strictly to W3C Web Content Accessibility Guidelines (WCAG 2.1 Level AA)."
            },
            {
              title: lang === "hi" ? "2. सहायक तकनीक एवं स्क्रीन रीडर संगतता" : "2. Assistive Technology Provisions",
              text:
                lang === "hi"
                  ? "पोर्टल पर मानक ARIA लैंडमार्क, अर्थपूर्ण शीर्ष संरचना (Semantic Heading) और उच्च-कंट्रास्ट लेबल प्रदान किए गए हैं, जो JAWS, NVDA, VoiceOver और TalkBack जैसे स्क्रीन रीडर्स के साथ पूर्णतः संगत हैं।"
                  : "The user interface utilizes standard ARIA roles, descriptive alt texts, semantic HTML5 elements, and logical tab sequences, ensuring frictionless compatibility with leading screen readers (NVDA, JAWS, VoiceOver, TalkBack)."
            },
            {
              title: lang === "hi" ? "3. एकीकृत पहुंच नियंत्रण" : "3. Integrated Accessibility Controls",
              text:
                lang === "hi"
                  ? "शीर्ष एक्सेसिबिलिटी पट्टी में फ़ॉन्ट आकार स्केलर (A- | A | A+), उच्च-कंट्रास्ट डार्क/लाइट थीम टॉगल, द्विभाषी स्विच (EN/HI) तथा मुख्य सामग्री पर सीधे जाने (Skip to Main Content) का विकल्प उपलब्ध है।"
                  : "The dedicated accessibility utility strip features multi-level typography scalers (A- | A | A+), high-contrast dual-theme switching (Light/Dark), bilingual localization, and standard Skip-to-Main-Content keyboard bypass shortcuts."
            },
            {
              title: lang === "hi" ? "4. पहुंच शिकायत एवं फीडबैक" : "4. Accessibility Grievance Mechanism",
              text:
                lang === "hi"
                  ? "यदि आपको पोर्टल की किसी भी सामग्री तक पहुंचने में कठिनाई होती है, तो कृपया राज्य आपातकालीन संचालन केंद्र (SEOC) की टोल-फ्री हेल्पलाइन 1070 / 1077 पर संपर्क करें।"
                  : "If you experience accessibility barriers or difficulty reading any geospatial layer, please notify the State Emergency Operations Centre (SEOC) accessibility coordinator via toll-free helpline 1070 / 1077 or direct landline 0135-2710334."
            }
          ]
        };

      case "disclaimer":
        return {
          title: lang === "hi" ? "वैधानिक अस्वीकरण" : "Statutory Disclaimer",
          subtitle:
            lang === "hi"
              ? "भू-स्थानिक विश्लेषणात्मक मॉडल एवं प्रारंभिक चेतावनी अनुमान"
              : "Geospatial Analytical Models & Predictive Early Warning Projections",
          icon: AlertTriangle,
          statuteNotice:
            lang === "hi"
              ? "आपातकालीन योजना एवं निर्णय समर्थन के उद्देश्य से जारी आधिकारिक परामर्श।"
              : "Official Advisory Issued for Tactical Civil Defense and Emergency Mitigation Planning.",
          sections: [
            {
              title: lang === "hi" ? "1. विश्लेषणात्मक सिमुलेशन की प्रकृति" : "1. Nature of Geospatial Models",
              text:
                lang === "hi"
                  ? "RiskOS द्वारा उत्पन्न परिदृश्य सिमुलेशन, प्रभाव त्रिज्या बफ़र, और जनसांख्यिकीय हताहत अनुमान कंप्यूटर आधारित विश्लेषणात्मक मॉडल हैं, जो सामरिक आपदा तैयारियों और प्रशासनिक निर्णय समर्थन में सहायता के लिए अभिकल्पित किए गए हैं।"
                  : "Geospatial blast radiuses, multi-hazard shockwave buffers, and casualty estimation tiers generated by RiskOS are computational prognostications engineered to assist tactical civil protection and administrative preparedness."
            },
            {
              title: lang === "hi" ? "2. जमीनी सत्यापन की आवश्यकता" : "2. Ground Truth Verification Required",
              text:
                lang === "hi"
                  ? "यद्यपि यह प्रणाली जीएसआई ढलान स्थिरता डेटा, उपग्रह चित्रों एवं आधिकारिक जनगणना आंकड़ों को एकीकृत करती है, तथापि वास्तविक आपदा स्थिति में त्वरित क्षेत्रीय बदलाव संभव हैं। निर्णय लेते समय स्थानीय प्रशासन, आईएमडी बुलेटिन और जमीनी रिपोर्ट से मिलान आवश्यक है।"
                  : "While models synthesize remote sensing, GSI geological fault buffers, and census records, dynamic micro-climate anomalies can produce divergent ground realities. Operational evacuation orders must be cross-verified against real-time field telemetry and official SDMA bulletins."
            },
            {
              title: lang === "hi" ? "3. दायित्व की सीमा" : "3. Statutory Limitation of Liability",
              text:
                lang === "hi"
                  ? "राज्य आपदा प्रबंधन प्राधिकरण, MeitY या तकनीकी विकास दल तीव्र प्राकृतिक आपदाओं के दौरान प्रारंभिक अनुमानों के आधार पर किसी भी परिणामी परिचालन हानि या व्यवधान के लिए कानूनी रूप से उत्तरदायी नहीं होंगे।"
                  : "Under no statutory circumstance shall the Uttarakhand SDMA, MeitY, or system engineering personnel be held liable for operational outcomes, delays, or consequential damages resulting from predictive scenario analysis during extreme natural calamity events."
            }
          ]
        };
    }
  };

  const policy = getPolicyContent(policyKey);
  const IconComponent = policy.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Tricolor Accent Header Bar */}
        <div className="h-[3px] w-full flex shrink-0">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-400 font-serif text-[10px] font-black flex items-center justify-center">
                  GOI
                </span>
                <h3 id="policy-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {policy.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {policy.subtitle}
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={lang === "hi" ? "बंद करें" : "Close dialog"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-3 select-text">
          {policy.statuteNotice && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-blue-800 dark:text-blue-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>{policy.statuteNotice}</span>
            </div>
          )}

          {policy.sections.map((section, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
            >
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {section.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {section.text}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
            GIGW 3.0 • NIC / MeitY • SDMA Uttarakhand
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            {lang === "hi" ? "बंद करें (Close)" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
