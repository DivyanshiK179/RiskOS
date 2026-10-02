/**
 * Reusable ARIA Live Region Announcer for statutory GIGW 3.0 / WCAG 2.1 AA compliance.
 * Dispatches polite or assertive screen-reader verbal alerts to #aria-live-announcer.
 */
export function announceAria(message: string, priority: "polite" | "assertive" = "polite"): void {
  if (typeof document === "undefined") return;

  let announcer = document.getElementById("aria-live-announcer");
  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "aria-live-announcer";
    announcer.className = "sr-only";
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    document.body.appendChild(announcer);
  } else {
    announcer.setAttribute("aria-live", priority);
  }

  // Clear and update to ensure screen reader detects text node mutation
  announcer.textContent = "";
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = message;
    }
  }, 50);
}

export function useAriaAnnounce() {
  return { announce: announceAria };
}
