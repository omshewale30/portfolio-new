import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../context/ThemeContext.jsx";

const GRID = 30;
const RADIUS = 170;
const BASE_ALPHA = 0.25;

const readRgb = (name, fallback) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  const parts = value.split(",").map((part) => Number.parseFloat(part));
  return parts.length === 3 && parts.every(Number.isFinite) ? parts : fallback;
};

// A grid of dots that drifts slightly and bends toward the cursor. Dots near the
// cursor brighten and shift to the accent, then fade back over about a second.
const ParticleField = ({ hostRef }) => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [dr, dg, db] = readRgb("--field-dot-rgb", [128, 128, 128]);
    const [ar, ag, ab] = readRgb("--field-accent-rgb", [229, 83, 61]);

    let width = 0;
    let height = 0;
    let points = [];
    let mouse = null;
    let frameId = 0;
    let visible = true;
    let t = 0;

    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      width = host.offsetWidth;
      height = host.offsetHeight;
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

    const frame = () => {
      t += 0.01;
      draw();
      frameId = visible ? window.requestAnimationFrame(frame) : 0;
    };

    const start = () => {
      if (!reducedMotion && !frameId) frameId = window.requestAnimationFrame(frame);
    };

    const handleMove = (event) => {
      const rect = host.getBoundingClientRect();
      mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const handleLeave = () => {
      mouse = null;
    };

    size();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      size();
      draw();
    });
    resizeObserver.observe(host);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    visibilityObserver.observe(host);

    if (!reducedMotion) {
      host.addEventListener("pointermove", handleMove, { passive: true });
      host.addEventListener("pointerleave", handleLeave);
      start();
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener("pointermove", handleMove);
      host.removeEventListener("pointerleave", handleLeave);
    };
  }, [hostRef, theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};

ParticleField.propTypes = {
  hostRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
};

export default ParticleField;
