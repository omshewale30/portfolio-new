import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

const GRID = 30;
const RADIUS = 170;
const BASE_ALPHA = 0.25;
// Connection lines reach a little past the pull radius, so the outermost linked dots sit still.
const LINK_RADIUS = 210;
const LINK_ALPHA = 0.34;
// Over anything the reader can click or is reading, the field calms down so the target stays clear.
const CALM_OVER = "a, button, input, textarea, select, label, summary, [role='button'], h1, h2, h3, h4, p, li, img";

const readRgb = (name, fallback) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  const parts = value.split(",").map((part) => Number.parseFloat(part));
  return parts.length === 3 && parts.every(Number.isFinite) ? parts : fallback;
};

// The home page's backdrop: a viewport-sized grid of dots, fixed behind the content, that
// drifts slightly and bends toward the cursor. Dots near the cursor brighten and shift to the
// accent, then fade back over about a second. Thin lines connect the cursor to every dot
// within reach, fading with distance; they ease in on arrival and fade out after it leaves,
// or when it moves onto a link, button or text.
// Fixed to the viewport rather than the page: a page-tall canvas costs far more memory and
// passes Safari's canvas size limit on retina screens.
const ParticleField = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [dr, dg, db] = readRgb("--field-dot-rgb", [128, 128, 128]);
    const [ar, ag, ab] = readRgb("--field-accent-rgb", [229, 83, 61]);

    let width = 0;
    let height = 0;
    let points = [];
    let mouse = null;
    // Last cursor position, kept after it leaves so the links can fade out where they were.
    let anchor = null;
    // 0–1 strength of the links: eases toward 1 while the cursor is on the page, 0 after.
    let link = 0;
    let frameId = 0;
    let t = 0;

    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = [];
      for (let y = GRID / 2; y < height; y += GRID) {
        for (let x = GRID / 2; x < width; x += GRID) points.push({ ox: x, oy: y, x, y, h: 0 });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      link += ((mouse ? 1 : 0) - link) * 0.08;

      for (const p of points) {
        let tx = p.ox + Math.sin(t + p.oy * 0.02) * 1.5;
        let ty = p.oy + Math.cos(t + p.ox * 0.02) * 1.5;
        let pull = 0;
        if (mouse) {
          const dx = p.ox - mouse.x;
          const dy = p.oy - mouse.y;
          const distance = Math.hypot(dx, dy);
          if (distance < RADIUS) {
            pull = 1 - distance / RADIUS;
            tx -= dx * pull * 0.35;
            ty -= dy * pull * 0.35;
          }
        }
        p.h = Math.max(pull, p.h * 0.96);
        p.x += (tx - p.x) * 0.12;
        p.y += (ty - p.y) * 0.12;
      }

      // Lines first, so the dots sit on top of them.
      if (anchor && link > 0.01) {
        ctx.lineWidth = 1;
        for (const p of points) {
          const distance = Math.hypot(p.x - anchor.x, p.y - anchor.y);
          if (distance >= LINK_RADIUS) continue;
          ctx.strokeStyle = `rgba(${ar},${ag},${ab},${link * LINK_ALPHA * (1 - distance / LINK_RADIUS)})`;
          ctx.beginPath();
          ctx.moveTo(anchor.x, anchor.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${link * 0.9})`;
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of points) {
        const heat = p.h;
        const mix = heat > 0.02 ? Math.min(1, heat * 1.4) : 0;
        const r = Math.round(dr + (ar - dr) * mix);
        const g = Math.round(dg + (ag - dg) * mix);
        const b = Math.round(db + (ab - db) * mix);
        ctx.fillStyle = `rgba(${r},${g},${b},${BASE_ALPHA + heat * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + heat * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // requestAnimationFrame already pauses in background tabs, so the loop needs no visibility check.
    const frame = () => {
      t += 0.01;
      draw();
      frameId = window.requestAnimationFrame(frame);
    };

    const handleMove = (event) => {
      // Treated like the cursor leaving: links and pull fade out rather than cutting off.
      if (event.target instanceof Element && event.target.closest(CALM_OVER)) {
        mouse = null;
        return;
      }
      mouse = { x: event.clientX, y: event.clientY };
      anchor = mouse;
    };
    const handleLeave = () => {
      mouse = null;
    };
    const handleResize = () => {
      size();
      draw();
    };

    size();
    draw();
    window.addEventListener("resize", handleResize);

    if (!reducedMotion) {
      window.addEventListener("pointermove", handleMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", handleLeave);
      frameId = window.requestAnimationFrame(frame);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, [theme]);

  // A negative z-index puts it above the page background and below every section's content.
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
};

export default ParticleField;
