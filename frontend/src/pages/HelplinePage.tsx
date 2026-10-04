import { Link } from "react-router-dom";
import { PhoneCall, Building, Shield, ChevronRight, ArrowRight } from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiBrandHeader from "../components/GoiBrandHeader";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";

export default function HelplinePage() {
  const { lang } = useTranslation();
  const isHi = lang === "hi";

  const districtContacts = [
    { district: "Chamoli", phone: "01372-251437", tollFree: "1077", head: "District Magistrate Gopeshwar", address: "DM Office, Gopeshwar, Chamoli" },
    { district: "Rudraprayag", phone: "01364-233727", tollFree: "1077", head: "District Magistrate Rudraprayag", address: "DEOC Collectorate, Rudraprayag" },
    { district: "Uttarkashi", phone: "01374-222722", tollFree: "1077", head: "District Magistrate Uttarkashi", address: "DEOC Collectorate, Uttarkashi" },
    { district: "Pithoragarh", phone: "01364-226326", tollFree: "1077", head: "District Magistrate Pithoragarh", address: "DEOC Collectorate, Pithoragarh" },
    { district: "Bageshwar", phone: "01363-221822", tollFree: "1077", head: "District Magistrate Bageshwar", address: "DEOC Collectorate, Bageshwar" },
    { district: "Almora", phone: "01396-231173", tollFree: "1077", head: "District Magistrate Almora", address: "DEOC Collectorate, Almora" },
    { district: "Tehri Garhwal", phone: "01376-233433", tollFree: "1077", head: "District Magistrate New Tehri", address: "DEOC Collectorate, New Tehri" },
    { district: "Pauri Garhwal", phone: "01368-221840", tollFree: "1077", head: "District Magistrate Pauri", address: "DEOC Collectorate, Pauri Garhwal" },
    { district: "Dehradun", phone: "0135-2726066", tollFree: "1077", head: "District Magistrate Dehradun", address: "DEOC Collectorate, Dehradun" },
    { district: "Haridwar", phone: "01334-223999", tollFree: "1077", head: "District Magistrate Haridwar", address: "DEOC Roshnabad, Haridwar" },
    { district: "Nainital", phone: "01342-231179", tollFree: "1077", head: "District Magistrate Nainital", address: "DEOC Collectorate, Nainital" },
    { district: "Champawat", phone: "01365-231014", tollFree: "1077", head: "District Magistrate Champawat", address: "DEOC Collectorate, Champawat" },
    { district: "Udham Singh Nagar", phone: "01394-221077", tollFree: "1077", head: "District Magistrate Rudrapur", address: "DEOC Collectorate, Rudrapur" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070D18] text-slate-100 font-sans transition-colors selection:bg-[#0B2545] selection:text-white">
      <GoiTopBar />
      <GoiBrandHeader showNav activeNav="helpline" />

      {/* Breadcrumb Navigation Strip */}
      <div className="w-full bg-slate-900/80 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-12 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-slate-400">
          <Link to="/" className="hover:text-blue-400 font-medium">
            {isHi ? "मुखपृष्ठ" : "Home"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-white font-bold">
            {isHi ? "आपातकालीन हेल्पलाइन एवं नियंत्रण कक्ष निर्देशिका" : "Emergency Operations & Helplines Directory"}
          </span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-[#7F1D1D] via-[#991B1B] to-[#450A0A] text-white py-12 px-4 sm:px-6 lg:px-12 border-b border-red-900">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30">
            <PhoneCall className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span>24x7 State Emergency Operations Centre (SEOC) Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white">
            {isHi ? "आपातकालीन नियंत्रण कक्ष एवं 24x7 हेल्पलाइन निर्देशिका" : "24x7 Emergency Operations & Helpline Roster"}
          </h1>
          <p className="text-red-100 text-sm sm:text-base max-w-3xl leading-relaxed">
            {isHi
              ? "उत्तराखंड राज्य आपातकालीन संचालन केंद्र (SEOC) सचिवालय देहरादून तथा सभी 13 जनपदों के जिला आपातकालीन संचालन केंद्रों (DEOC) के आधिकारिक दूरभाष संपर्क।"
              : "Official contact directory for State Emergency Operations Centre (SEOC) Dehradun, SDRF Headquarters, and all 13 District Emergency Operation Centres (DEOCs)."}
          </p>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 space-y-12">
        {/* State Tier Primary Hotlines Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: State Toll-Free */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border-2 border-red-500/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-2.5 py-1 rounded-full border border-red-900">
                State Toll-Free Hotline
              </span>
              <PhoneCall className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-red-400">
                1070
              </div>
              <h4 className="text-xs font-bold text-slate-200 mt-1">
                {isHi ? "राज्य आपदा हेल्पलाइन" : "State Disaster Control Room"}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Toll-free 24x7 priority dispatch for cloudbursts, flash floods, and landslides across Uttarakhand.
              </p>
            </div>
            <a
              href="tel:1070"
              className="inline-flex w-full items-center justify-center py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Dial 1070 Now
            </a>
          </div>

          {/* Card 2: District Emergency Toll-Free */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border-2 border-amber-500/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-900">
                District Level Hotline
              </span>
              <Building className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-amber-400">
                1077
              </div>
              <h4 className="text-xs font-bold text-slate-200 mt-1">
                {isHi ? "जिला आपातकालीन नियंत्रण कक्ष" : "District Emergency (DEOC)"}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Direct toll-free access connecting directly to your respective District Magistrate command room.
              </p>
            </div>
            <a
              href="tel:1077"
              className="inline-flex w-full items-center justify-center py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Dial 1077 Now
            </a>
          </div>

          {/* Card 3: SEOC Secretariat Direct */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border-2 border-blue-500/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-900">
                SEOC Secretariat Direct
              </span>
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-blue-400">
                0135-2710334
              </div>
              <h4 className="text-xs font-bold text-slate-200 mt-1">
                {isHi ? "राज्य सचिवालय नियंत्रण कक्ष" : "USDMA State Secretariat"}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Direct operations line: Secretariat Building, Subhash Road, Dehradun - 248001.
              </p>
            </div>
            <a
              href="tel:+911352710334"
              className="inline-flex w-full items-center justify-center py-2 px-3 bg-[#0B2545] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Call 0135-2710334
            </a>
          </div>
        </section>

        {/* Complete District Directory Table */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {isHi ? "उत्तराखंड के सभी 13 जनपदों के आपातकालीन संचालन केंद्र" : "District Emergency Operation Centres (DEOC) 13 Districts Directory"}
            </h3>
            <p className="text-xs text-slate-400">
              Direct landline numbers and jurisdictional locations for all revenue districts
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-bold">District</th>
                  <th className="py-3 px-4 font-bold">Direct Landline</th>
                  <th className="py-3 px-4 font-bold">Toll-Free</th>
                  <th className="py-3 px-4 font-bold">Nodal Officer</th>
                  <th className="py-3 px-4 font-bold">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {districtContacts.map((c) => (
                  <tr key={c.district} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">{c.district}</td>
                    <td className="py-3 px-4 font-mono text-blue-400 font-bold">
                      <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      <a href={`tel:${c.tollFree}`} className="hover:underline">{c.tollFree}</a>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{c.head}</td>
                    <td className="py-3 px-4 text-slate-400">{c.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Accessibility & Grievance Notice */}
        <section className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">
              {isHi ? "सुलभता एवं शिकायत निवारण (GIGW 3.0 Mandate)" : "Accessibility Grievance & Technical Redressal"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Submit formal portal feedback or request alternative accessible emergency communications formats.
            </p>
          </div>
          <Link
            to="/accessibility-grievance"
            className="px-4 py-2 bg-[#0B2545] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <span>{isHi ? "शिकायत प्रपत्र खोलें" : "Grievance Redressal Form"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </main>

      <GoiFooter />
    </div>
  );
}
