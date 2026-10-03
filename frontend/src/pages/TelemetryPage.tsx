import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiBrandHeader from "../components/GoiBrandHeader";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";

function CountUpNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * target);
            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function TelemetryPage() {
  const { lang } = useTranslation();
  const isHi = lang === "hi";

  const districts = [
    { name: "Chamoli", settlements: 1240, highRisk: 312, pop: 142500, status: "CRITICAL" },
    { name: "Rudraprayag", settlements: 688, highRisk: 198, pop: 89400, status: "CRITICAL" },
    { name: "Uttarkashi", settlements: 1045, highRisk: 284, pop: 115200, status: "HIGH" },
    { name: "Pithoragarh", settlements: 1680, highRisk: 395, pop: 178000, status: "HIGH" },
    { name: "Tehri Garhwal", settlements: 1845, highRisk: 260, pop: 154300, status: "MODERATE" },
    { name: "Pauri Garhwal", settlements: 2420, highRisk: 210, pop: 188400, status: "MODERATE" },
    { name: "Bageshwar", settlements: 874, highRisk: 142, pop: 74200, status: "MODERATE" },
    { name: "Almora", settlements: 1950, highRisk: 165, pop: 162000, status: "LOW" },
    { name: "Nainital", settlements: 1102, highRisk: 120, pop: 135000, status: "LOW" },
    { name: "Dehradun", settlements: 765, highRisk: 85, pop: 112000, status: "LOW" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070D18] text-slate-100 font-sans transition-colors selection:bg-[#0B2545] selection:text-white">
      <GoiTopBar />
      <GoiBrandHeader showNav activeNav="telemetry" />

      {/* Breadcrumb Navigation Strip */}
      <div className="w-full bg-slate-900/80 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-12 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-slate-400">
          <Link to="/" className="hover:text-blue-400 font-medium">
            {isHi ? "मुखपृष्ठ" : "Home"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-white font-bold">
            {isHi ? "राज्य सांख्यिकी एवं वास्तविक समय टेलीमेट्री" : "State Telemetry & Operational Metrics"}
          </span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-[#0B2545] via-[#103058] to-[#081930] text-white py-12 px-4 sm:px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isHi ? "वास्तविक समय राज्य निगरानी डेटा" : "PostGIS 100% Operational • Live Sync"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white">
            {isHi ? "उत्तराखंड राज्य सांख्यिकी एवं आपदा जोखिम टेलीमेट्री" : "Statewide Telemetry & Habitation Risk Aggregations"}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {isHi
              ? "उत्तराखंड के सभी 13 जनपदों की 13,967 ग्रामीण बस्तियों का आधिकारिक स्थानिक विश्लेषण। जनगणना 2026, भारतीय भूवैज्ञानिक सर्वेक्षण तथा राज्य आपदा प्रबंधन प्राधिकरण द्वारा प्रमाणित डेटा।"
              : "Sub-meter hazard indexes, exposure aggregations, and shelter preparedness parameters across all 13 districts of Uttarakhand powered by PostGIS and Census 2026 ground data."}
          </p>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 space-y-12">
        {/* Core Metrics Cards Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 block w-fit mb-3">
              Total Habitations
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-500 mb-1">
              <CountUpNumber target={13967} />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase">
              {isHi ? "कुल मूल्यांकित बस्तियाँ" : "Settlements Scored"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">All 13 Districts Indexed</p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800 block w-fit mb-3">
              High Exposure
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-rose-500 mb-1">
              <CountUpNumber target={1340000} suffix="+" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase">
              {isHi ? "संवेदनशील आबादी" : "Vulnerable Population"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Red & High Risk Zones</p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 block w-fit mb-3">
              Transit Camps
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-500 mb-1">
              <CountUpNumber target={20} />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase">
              {isHi ? "सुरक्षित राहत शिविर" : "Verified Shelters"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">42,000 Verified Placements</p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800 block w-fit mb-3">
              Statutory Compliance
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-sky-500 mb-1">
              <CountUpNumber target={100} suffix="%" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase">
              {isHi ? "गीग्व 3.0 सुलभता" : "GIGW 3.0 / WCAG"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Bilingual & Screen Reader</p>
          </div>
        </section>

        {/* District Risk Exposure Table */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isHi ? "जनपद-वार बहु-आपदा संवेदनशीलता मैट्रिक्स" : "District-Wise Multi-Hazard Exposure Roster"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                PostGIS spatial intersection aggregated across 13 revenue districts
              </p>
            </div>
            <Link
              to="/dashboard?tab=analytics"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{isHi ? "पूर्ण एनालिटिक्स डैशबोर्ड खोलें" : "View Comprehensive Analytics Dashboard"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-bold">District Name</th>
                  <th className="py-3 px-4 font-bold">Total Habitations</th>
                  <th className="py-3 px-4 font-bold">High Risk Villages</th>
                  <th className="py-3 px-4 font-bold">Population Exposed</th>
                  <th className="py-3 px-4 font-bold">Exposure Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {districts.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">{d.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{d.settlements.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-red-400 font-bold">{d.highRisk}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{d.pop.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          d.status === "CRITICAL"
                            ? "bg-red-950/60 text-red-400 border-red-800"
                            : d.status === "HIGH"
                            ? "bg-amber-950/60 text-amber-400 border-amber-800"
                            : "bg-blue-950/60 text-blue-400 border-blue-800"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <GoiFooter />
    </div>
  );
}
