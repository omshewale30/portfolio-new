import { useEffect, useState } from "react";

// How far (0–100) the reader has scrolled through `targetRef`, for the fixed
// `.note-reading-progress` bar. `resetKey` re-measures when the page content changes.
export const useReadingProgress = (targetRef, { enabled = true, resetKey } = {}) => {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let frameId = null;
    const updateProgress = () => {
      frameId = null;
      const article = targetRef.current;
      if (!article) return;

      // Page offset rather than offsetTop, so a positioned ancestor can't skew it.
      const start = article.getBoundingClientRect().top + window.scrollY;
      const finish = Math.max(start + article.offsetHeight - window.innerHeight, start + 1);
      const progress = ((window.scrollY - start) / (finish - start)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };
    const handleScroll = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [enabled, resetKey, targetRef]);

  return readingProgress;
};
