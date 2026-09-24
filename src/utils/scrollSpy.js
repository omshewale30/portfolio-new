import { useEffect, useState } from "react";

// Returns the id of the section the reader is in: the last of `ids` whose top
// has scrolled above `offset` px (just under the fixed navbar), or the last id
// once the page bottom is reached so short closing sections can still activate.
export const useScrollSpy = (ids, { enabled = true, offset = 160 } = {}) => {
  const [activeId, setActiveId] = useState(null);
  const idsKey = ids.join("|");

  useEffect(() => {
    if (!enabled || !idsKey) return;
    const sectionIds = idsKey.split("|");

    let frameId = null;
    const update = () => {
      frameId = null;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      let current = null;
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActiveId(current);
    };
    const handleScroll = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [enabled, idsKey, offset]);

  return activeId;
};
