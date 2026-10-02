import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PublicMap from "./pages/PublicMap";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useUIStore } from "./store/uiStore";
import { useEffect } from "react";

function App() {
  const { theme, lang, fontSizeLevel } = useUIStore();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  useEffect(() => {
    // A- = 90%, A = 100%, A+ = 112%
    const scale = fontSizeLevel === -1 ? "90%" : fontSizeLevel === 1 ? "112%" : "100%";
    document.documentElement.style.fontSize = scale;
  }, [fontSizeLevel]);

  // Global GIGW 3.0 Access Keys listener
  useEffect(() => {
    const handleAccessKeys = (e: KeyboardEvent) => {
      // Ignore if user is inside a form field unless it's an Alt combo
      if (!e.altKey) return;

      if (e.key === "1" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLElement>('input[type="text"], input[type="search"]');
        const mainContent = document.getElementById("main-content");
        if (searchInput) {
          searchInput.focus();
        } else if (mainContent) {
          mainContent.setAttribute("tabindex", "-1");
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else if (e.key === "2") {
        e.preventDefault();
        const navLink = document.querySelector<HTMLElement>('header nav a, nav a, [role="navigation"] a');
        if (navLink) {
          navLink.focus();
        }
      }
    };

    window.addEventListener("keydown", handleAccessKeys);
    return () => window.removeEventListener("keydown", handleAccessKeys);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/public-map" element={<PublicMap />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;