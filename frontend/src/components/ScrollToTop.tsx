import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop guarantees that when navigating between pages or returning
 * to the home page without an explicit hash, the window always resets to the top (0, 0).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Disable browser's automatic restoration to stale bottom scroll positions
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash]);

  return null;
}
