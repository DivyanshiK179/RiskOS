import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const authLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      await authLogin(data.access, data.refresh, username);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials. Check your username and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060c1a] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden">
        {/* Map-texture background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #060c1a 0%, #0a1628 40%, #0d1f38 100%)",
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">RiskSetu</span>
          </div>

          {/* Main copy */}
          <div className="mt-auto mb-16">
            <div className="mb-4">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                National Disaster Risk Assessment Platform
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
              Geospatial Decision<br />Support for Safer<br />Communities
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              An end-to-end platform for identifying at-risk settlements, matching safe relocation sites, 
              and coordinating evacuation operations across districts.
            </p>

            {/* Feature list */}
            <div className="mt-8 space-y-3">
              {[
                "Multi-hazard risk scoring (seismic, flood, landslide)",
                "AI-assisted safe site matching with capacity tracking",
                "Real-time early warning broadcast system",
                "Relocation plan lifecycle management",
              ].map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-10 pt-8 border-t border-slate-800/60 flex gap-8">
              <div>
                <div className="text-2xl font-bold text-white font-mono">5,400+</div>
                <div className="text-xs text-slate-500 mt-0.5">Settlements monitored</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">324</div>
                <div className="text-xs text-slate-500 mt-0.5">Verified safe sites</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">28</div>
                <div className="text-xs text-slate-500 mt-0.5">Districts covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-[#080e1d]">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg">RiskSetu</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-1">Sign in to your account</h2>
            <p className="text-sm text-slate-500">Official access for authorised personnel only</p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-950/60 border border-red-800/60 rounded-md flex items-start gap-2.5 text-sm text-red-400 animate-fade-in">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Authenticating...
                </>
              ) : "Sign in"}
            </button>
          </form>

          {/* Quick fill for demo */}
          <div className="mt-6 p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 mb-2.5 font-medium">Demo credentials</p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => { setUsername("official"); setPassword("RiskSetu@2026"); }}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 rounded-md border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <span className="text-xs text-slate-300 font-medium">Disaster Official</span>
                <span className="text-xs text-slate-600 group-hover:text-slate-400 font-mono transition-colors">official / RiskSetu@2026</span>
              </button>
              <button
                type="button"
                onClick={() => { setUsername("admin"); setPassword("admin123"); }}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 rounded-md border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <span className="text-xs text-slate-300 font-medium">System Admin</span>
                <span className="text-xs text-slate-600 group-hover:text-slate-400 font-mono transition-colors">admin / admin123</span>
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-1.5 text-xs text-slate-600">
            <svg className="w-3.5 h-3.5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Dev database console:
            <a href="http://localhost:8000/system-console/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 font-mono transition-colors">
              /system-console/
            </a>
          </div>
        </div>

        <div className="mt-12 text-xs text-slate-700">
          <Link to="/" className="hover:text-slate-500 transition-colors">← View public hazard map</Link>
        </div>
      </div>
    </div>
  );
}