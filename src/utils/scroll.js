export const preferredScrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

// Bring the hero's Jarvis panel into view and put the cursor in its input.
// Returns false when Jarvis isn't on this page, so callers can route home instead.
export const scrollToJarvis = () => {
  const jarvis = document.getElementById("jarvis");
  if (!jarvis) return false;

  const behavior = preferredScrollBehavior();
  jarvis.scrollIntoView({ behavior, block: "start" });
  window.setTimeout(
    () => document.getElementById("jarvis-input")?.focus({ preventScroll: true }),
    behavior === "smooth" ? 400 : 0,
  );
  return true;
};
