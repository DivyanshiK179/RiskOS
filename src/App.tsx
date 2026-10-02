import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicMap from "./pages/PublicMap";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useUIStore } from "./store/uiStore";
import { useEffect } from "react";

function App() {
  const { theme, fontSizeLevel } = useUIStore();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    // A- = 90%, A = 100%, A+ = 112%
    const scale = fontSizeLevel === -1 ? "90%" : fontSizeLevel === 1 ? "112%" : "100%";
    document.documentElement.style.fontSize = scale;
  }, [fontSizeLevel]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicMap />} />
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