import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  User,
  Mail,
  Building2,
  MapPin,
  Phone,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  FileCheck
} from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiFooter from "../components/GoiFooter";
import { registerUser } from "../api/auth";
import { useTranslation } from "../i18n/translations";

const DEPARTMENTS = [
  "Uttarakhand SDMA (USDMA)",
  "NDRF - 8th Battalion",
  "SDRF Uttarakhand Police",
  "District Disaster Management Authority (DDMA)",
  "Public Works Department (PWD Uttarakhand)",
  "Irrigation & Flood Control Dept.",
  "Geological Survey of India (GSI Dehradun)",
  "Indian Meteorological Department (IMD)",
  "State Remote Sensing Application Centre (USAC)",
  "Revenue & Relief Department"
];

const DISTRICTS = [
  "State Headquarters (Dehradun)",
  "Almora",
  "Bageshwar",
  "Chamoli",
  "Champawat",
  "Dehradun",
  "Haridwar",
  "Nainital",
  "Pauri Garhwal",
  "Pithoragarh",
  "Rudraprayag",
  "Tehri Garhwal",
  "Udham Singh Nagar",
  "Uttarkashi"
];

export default function Register() {
  const navigate = useNavigate();
  const { lang } = useTranslation();
  const isHi = lang === "hi";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    employeeId: "",
    department: DEPARTMENTS[0],
    designation: "",
    district: DISTRICTS[0],
    phone: "",
    password: "",
    confirmPassword: "",
    role: "OFFICIAL"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(isHi ? "पासवर्ड मेल नहीं खा रहे हैं।" : "Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError(isHi ? "पासवर्ड कम से कम 8 वर्णों का होना चाहिए।" : "Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim(),
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        role: formData.role,
        department: formData.department,
        designation: formData.designation.trim() || "Field Officer",
        district: formData.district,
        phone_number: formData.phone.trim(),
        employee_id: formData.employeeId.trim(),
      });

      setSuccessStatus(res.approval_status || "PENDING");
    } catch (err: any) {
      const msg = err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.error ||
        (isHi ? "पंजीकरण विफल रहा। कृपया विवरण पुनः जांचें।" : "Registration failed. Please verify submitted fields.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="main-content" className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070D18] text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <GoiTopBar />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {/* Header Ribbon */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#0B2545] dark:text-blue-300 text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>{isHi ? "भारत सरकार • राज्य आपदा प्रबंधन प्राधिकरण" : "Government of India • USDMA Statutory Portal"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] dark:text-white font-serif">
            {isHi ? "सरकारी विभागीय कार्मिक पंजीकरण" : "Official Department Personnel Registration"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {isHi
              ? "आपदा प्रबंधन अधिनियम, 2005 के अंतर्गत अधिकृत अधिकारियों, फील्ड विश्लेषकों एवं सर्वेक्षणकर्ताओं हेतु वैधानिक नामांकन"
              : "Institutional credential enrollment for Field Officers, GIS Analysts, and Incident Responders under DMA 2005."}
          </p>
        </div>

        {/* Success Modal / Card */}
        {successStatus ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0F172A] border-2 border-emerald-500 shadow-2xl text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-700">
                STATUS: {successStatus === "PENDING" ? (isHi ? "अनुमोदन लंबित" : "PENDING MANAGER APPROVAL") : "APPROVED"}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isHi ? "पंजीकरण आवेदन सफलतापूर्वक दर्ज किया गया" : "Enrollment Dossier Successfully Submitted"}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                {isHi
                  ? `उपयोगकर्ता नाम '${formData.username}' के लिए आपका आवेदन राज्य आपदा प्रबंधन प्राधिकरण (USDMA) के नोडल हेड/डिजास्टर मैनेजर के पास सत्यापन हेतु भेजा गया है। अनुमोदन प्राप्त होने पर आप अपने क्रेडेंशियल्स के साथ लॉगिन कर सकेंगे।`
                  : `Your credentials for '${formData.username}' have been queued for Disaster Manager review. Once authenticated by the State Nodal Authority, your command clearance will be activated.`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5 max-w-md mx-auto">
              <div><strong className="text-slate-500">{isHi ? "विभाग:" : "Department:"}</strong> {formData.department}</div>
              <div><strong className="text-slate-500">{isHi ? "पदनाम:" : "Designation:"}</strong> {formData.designation || "Field Officer"}</div>
              <div><strong className="text-slate-500">{isHi ? "कर्मचारी आईडी:" : "Service ID:"}</strong> {formData.employeeId || "Pending Verification"}</div>
              <div><strong className="text-slate-500">{isHi ? "सत्यापन स्तर:" : "Security Tier:"}</strong> Tier 2 (Department Field Officer)</div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0B2545] hover:bg-[#103058] text-white font-bold text-xs rounded-lg shadow transition"
              >
                {isHi ? "अधिकारी लॉगिन पर जाएं" : "Return to Officer Login"}
              </button>
              <button
                onClick={() => navigate("/public-map")}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg border border-slate-300 dark:border-slate-700 transition"
              >
                {isHi ? "सार्वजनिक आपदा मानचित्र देखें" : "View Public Hazard Map"}
              </button>
            </div>
          </div>
        ) : (
          /* Enrollment Form Card */
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "पहला नाम *" : "First Name *"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder={isHi ? "उदा. राहुल" : "e.g. Rahul"}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "अंतिम नाम *" : "Last Name *"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder={isHi ? "उदा. शर्मा" : "e.g. Sharma"}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Official Email & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "विभागीय ईमेल *" : "Official Gov/Dept Email *"}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="officer@usdma.uk.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {isHi ? "सरकारी डोमेन (.gov.in / .nic.in) अनुशंसित" : "Preferably official .gov.in or .nic.in address"}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "लॉगिन उपयोगकर्ता नाम *" : "Desired Username *"}
                  </label>
                  <div className="relative">
                    <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                      placeholder="rahul_sdma"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {isHi ? "केवल लोअरकेस अक्षर व अंडरस्कोर" : "Lowercase characters and underscore only"}
                  </span>
                </div>
              </div>

              {/* Row 3: Employee ID & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "कर्मचारी / सेवा आईडी बैज *" : "Service Badge / Employee ID *"}
                  </label>
                  <div className="relative">
                    <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="UK-DMA-2026-904"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "संपर्क मोबाइल नंबर *" : "Official Contact Mobile *"}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Department & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "विभागीय एजेंसी *" : "Department / Agency *"}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none appearance-none"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "पदनाम / उत्तरदायित्व *" : "Designation / Role *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder={isHi ? "उदा. सहायक भू-स्थानिक विश्लेषक" : "e.g. Field GIS Analyst"}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Jurisdiction District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isHi ? "कार्यक्षेत्र ज़िला *" : "Jurisdiction District *"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none appearance-none"
                  >
                    {DISTRICTS.map((dst) => (
                      <option key={dst} value={dst}>
                        {dst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 6: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "सुरक्षित पासवर्ड *" : "Password *"}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none"
                    />
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((lvl) => (
                          <div
                            key={lvl}
                            className={`flex-1 rounded-full transition-all ${
                              strength >= lvl
                                ? strength >= 3
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                                : "bg-slate-200 dark:bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {strength < 2
                          ? (isHi ? "कमजोर (कम से कम 8 वर्ण, 1 बड़ा अक्षर व संख्या आवश्यक)" : "Weak (Min 8 chars, 1 uppercase & 1 number)")
                          : strength < 4
                          ? (isHi ? "मध्यम" : "Moderate")
                          : (isHi ? "मजबूत पासवर्ड" : "Strong Password")}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHi ? "पासवर्ड की पुष्टि करें *" : "Confirm Password *"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B2545] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Statutory Declaration Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>
                  <strong>{isHi ? "वैधानिक घोषणा:" : "Statutory Declaration:"}</strong>{" "}
                  {isHi
                    ? "मैं प्रमाणित करता हूँ कि मैं आपदा प्रबंधन प्राधिकरण या संबंधित अधिकृत सरकारी विभाग का सक्रिय कार्मिक हूँ। किसी भी अनधिकृत पहुंच या मिथ्या विवरण पर आपदा प्रबंधन अधिनियम 2005 की धारा 51 से 58 के अंतर्गत दंडात्मक कार्रवाई की जा सकती है।"
                    : "I certify that I am active personnel of a recognized disaster response department. Falsification of identity is punishable under Sections 51-58 of the Disaster Management Act, 2005."}
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0B2545] hover:bg-[#103058] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>{isHi ? "आवेदन दर्ज हो रहा है..." : "Submitting Dossier..."}</span>
                  ) : (
                    <>
                      <span>{isHi ? "विभागीय क्रेडेंशियल्स दर्ज करें" : "Submit Official Enrollment Request"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center border-t border-slate-200 dark:border-slate-800 pt-4">
              <span className="text-xs text-slate-500">
                {isHi ? "पहले से पंजीकृत हैं?" : "Already hold an official clearance?"}{" "}
                <Link to="/login" className="text-[#0B2545] dark:text-blue-400 font-bold hover:underline">
                  {isHi ? "अधिकारी लॉगिन करें" : "Sign in here"}
                </Link>
              </span>
            </div>
          </div>
        )}
      </div>

      <GoiFooter />
    </div>
  );
}
