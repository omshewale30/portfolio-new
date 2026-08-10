import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

// ─── Skill data with years spent using each technology ───────────────────────
// layer: 0 = input, 1 = hidden, 2 = output — the 3 categories double as NN layers.
const CATEGORIES = {
  Languages: {
    layer: 0,
    color: "#f0d8b2",
    rgb: "240,216,178",
    stroke: "#f6e4c8",
    skills: [
      { name: "Python",     years: 5 },
      { name: "SQL",        years: 4 },
      { name: "JavaScript", years: 4 },
      { name: "C++",        years: 3 },
      { name: "Java",       years: 3 },
      { name: "Dart",       years: 2 },
      { name: "Swift",      years: 2 },
    ],
  },
  Frameworks: {
    layer: 1,
    color: "#c8a882",
    rgb: "200,168,130",
    stroke: "#d4b896",
    skills: [
      { name: "PyTorch",      years: 4 },
      { name: "LangChain",    years: 4 },
      { name: "FastAPI",      years: 4 },
      { name: "React",        years: 4 },
      { name: "TensorFlow",   years: 3 },
      { name: "LlamaIndex",   years: 3 },
      { name: "Scikit-learn", years: 3 },
      { name: "Hugging Face", years: 2 }
    ],
  },
  Tools: {
    layer: 2,
    color: "#7f5f3f",
    rgb: "127,95,63",
    stroke: "#98714a",
    skills: [
      { name: "Azure",      years: 4 },
      { name: "Docker",     years: 4 },
      { name: "PostgreSQL", years: 4 },
      { name: "Git",        years: 4 },
      { name: "ChromaDB",   years: 3 },
      { name: "AWS",        years: 3 },
      { name: "Pinecone",   years: 2 },
      { name: "Kubernetes", years: 2 },
      { name: "Supabase",   years: 2 },
    ],
  },
};

const LAYER_LABELS = ["INPUT", "HIDDEN", "OUTPUT"];
const TOTAL_SKILLS = Object.values(CATEGORIES).reduce((n, c) => n + c.skills.length, 0);

// Column bands as fractions of canvas width — left-to-right layered layout.
const BANDS = [
  { xMin: 0.03, xMax: 0.29 },
  { xMin: 0.365, xMax: 0.625 },
  { xMin: 0.70, xMax: 0.96 },
];

// Node radius: base + text-length contribution + time-spent bonus.
const calcR = (name, years) => Math.round(18 + name.length * 2.2 + years * 4.2);

const MOBILE_BREAKPOINT = 768;

const formatYears = (years) => `${years} year${years === 1 ? "" : "s"}`;

// Mobile node diameter: same "years = weight" signal as the desktop canvas radius,
// just tuned for a much smaller, wrap-friendly footprint.
const mobileNodeSize = (years) => 46 + years * 7;

const SkillNode = ({ skill, category }) => {
  const size = mobileNodeSize(skill.years);
  return (
    <div
      role="group"
      className="flex flex-col items-center gap-1.5"
      style={{ width: size + 18 }}
      aria-label={`${skill.name}, ${formatYears(skill.years)}`}
    >
      <div
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 32%, rgba(${category.rgb},0.42), rgba(${category.rgb},0.12) 60%, rgba(${category.rgb},0.04))`,
          border: `1.5px solid rgba(${category.rgb},0.65)`,
          boxShadow: `0 0 14px rgba(${category.rgb},0.22)`,
        }}
      >
        <span
          className="font-mono text-[10px] font-semibold"
          style={{ color: category.color }}
          aria-hidden="true"
        >
          {skill.years}y
        </span>
      </div>
      <span className="text-center text-xs leading-tight text-[var(--color-text-primary)]" aria-hidden="true">
        {skill.name}
      </span>
    </div>
  );
};

// Decorative fan connector between two stacked layers — a static echo of the
// desktop canvas's weight-edges, without needing real node coordinates.
const LayerConnector = ({ fromColor, toColor, connectorId }) => (
  <div className="relative mx-auto my-2 h-9 w-full max-w-[280px]" aria-hidden="true">
    <svg width="100%" height="100%" viewBox="0 0 100 36" preserveAspectRatio="none">
      <defs>
        <linearGradient id={connectorId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fromColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={toColor} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {[8, 26, 50, 74, 92].map((x) => (
        <line
          key={x}
          x1={x}
          y1="0"
          x2="50"
          y2="36"
          stroke={`url(#${connectorId})`}
          strokeWidth="0.6"
        />
      ))}
    </svg>
    <span className="skills-pulse-dot" style={{ background: toColor, boxShadow: `0 0 6px ${toColor}` }} />
  </div>
);

SkillNode.propTypes = {
  skill: PropTypes.shape({
    name: PropTypes.string.isRequired,
    years: PropTypes.number.isRequired,
  }).isRequired,
  category: PropTypes.shape({
    color: PropTypes.string.isRequired,
    rgb: PropTypes.string.isRequired,
  }).isRequired,
};

LayerConnector.propTypes = {
  fromColor: PropTypes.string.isRequired,
  toColor: PropTypes.string.isRequired,
  connectorId: PropTypes.string.isRequired,
};

const SkillsFlow = () => {
  const entries = Object.entries(CATEGORIES);
  return (
    <div className="mx-auto mt-8 max-w-[520px] px-6" aria-labelledby="skills-heading">
      <p className="font-mono mb-6 text-center text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
        Node size = years spent, not a proficiency score
      </p>

      {entries.map(([name, category], i) => {
        const headingId = `skills-${name.toLowerCase()}`;
        const next = entries[i + 1]?.[1];
        return (
          <div key={name}>
            <section aria-labelledby={headingId}>
              <div className="mb-4 flex items-center justify-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: category.color, boxShadow: `0 0 8px rgba(${category.rgb},0.9)` }}
                  aria-hidden="true"
                />
                <h3
                  id={headingId}
                  className="font-mono m-0 text-xs uppercase tracking-[0.1em] text-[var(--color-text-subtle)]"
                >
                  {LAYER_LABELS[category.layer]} · {name}
                </h3>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-4">
                {category.skills.map((skill) => (
                  <SkillNode key={skill.name} skill={skill} category={category} />
                ))}
              </div>
            </section>

            {next ? (
              <LayerConnector
                connectorId={`connector-${i}`}
                fromColor={category.color}
                toColor={next.color}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SkillsSection() {
  const canvasRef = useRef(null);
  const S = useRef({
    nodes: [], stars: [], edges: [], pulses: [],
    hovered: null,
    mouse: { x: -9999, y: -9999 },
    W: 0, H: 0,
    nextPulseAt: 0,
  });
  const rafRef = useRef(null);
  const [cursor, setCursor] = useState("default");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ── Initialise ─────────────────────────────────────────────────────────
    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      const W   = canvas.offsetWidth;
      const H   = canvas.offsetHeight;
      S.current.W = W;
      S.current.H = H;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      const RSCALE = Math.max(0.78, Math.min(1, W / 1050));

      // Stars
      S.current.stars = Array.from({ length: 180 }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.5 + 0.15,
        phase: Math.random() * Math.PI * 2,
        spd:   0.008 + Math.random() * 0.024,
        cross: Math.random() < 0.06,
      }));

      // Nodes — grouped by layer, banded left-to-right.
      const nodes = [];
      const nodesByLayer = [[], [], []];
      Object.entries(CATEGORIES).forEach(([catName, cat]) => {
        const band = BANDS[cat.layer];
        const bx = ((band.xMin + band.xMax) / 2) * W;
        const by = H / 2;
        cat.skills.forEach((sk, i) => {
          const spread = 60 + Math.random() * 50;
          const angle  = (i / cat.skills.length) * Math.PI * 2 + i * 0.35;
          const node = {
            id:     `${catName}::${sk.name}`,
            name:   sk.name,
            cat:    catName,
            layer:  cat.layer,
            years:  sk.years,
            r:      Math.round(calcR(sk.name, sk.years) * RSCALE),
            color:  cat.color,
            rgb:    cat.rgb,
            stroke: cat.stroke,
            x: bx + spread * Math.cos(angle) * 0.4,
            y: by + spread * Math.sin(angle),
            vx: 0, vy: 0,
            tx: bx, ty: by,
          };
          nodes.push(node);
          nodesByLayer[cat.layer].push(node);
        });
      });
      S.current.nodes = nodes;

      // Decorative weight edges — fixed fan-out between adjacent layers only.
      const edges = [];
      nodesByLayer[0].forEach((n, i) => {
        const targets = [i % nodesByLayer[1].length, (i + 1) % nodesByLayer[1].length, (i + 3) % nodesByLayer[1].length];
        [...new Set(targets)].forEach(ti => {
          edges.push({ a: n.id, b: nodesByLayer[1][ti].id, seed: Math.random() });
        });
      });
      nodesByLayer[1].forEach((n, i) => {
        const targets = [i % nodesByLayer[2].length, (i + 2) % nodesByLayer[2].length, (i + 5) % nodesByLayer[2].length];
        [...new Set(targets)].forEach(ti => {
          edges.push({ a: n.id, b: nodesByLayer[2][ti].id, seed: Math.random() });
        });
      });
      S.current.edges = edges;
      S.current.pulses = [];
      S.current.nextPulseAt = performance.now() + 400;

      // Pre-settle (no render) — banded/clamped packing needs a slower settle.
      for (let i = 0; i < 380; i++) physicsStep(nodes, W, H, 0.75);
    };

    // ── Physics ────────────────────────────────────────────────────────────
    const physicsStep = (nodes, W, H, damp = 0.85) => {
      const REPEL  = 3400;
      const GRAV_STRONG = 0.045;
      const GRAV_WEAK   = 0.006;
      const BORDER = 0.38;
      const MOUSE_RADIUS = 180;
      const MOUSE_REPEL = 0.5;
      const { mouse } = S.current;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let fx = 0, fy = 0;

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const m  = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const d  = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const minD = n.r + m.r + 20;

          if (d < minD) {
            const push = (minD - d) * 0.58;
            fx += (dx / d) * push;
            fy += (dy / d) * push;
          } else if (d < 300) {
            const f = REPEL / (d * d);
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
        }

        // Strong pull to band-center-X, weak recenter on Y.
        fx += (n.tx - n.x) * GRAV_STRONG;
        fy += (n.ty - n.y) * GRAV_WEAK;

        // Hard band clamp — keeps nodes from drifting into a neighboring layer's column.
        const band = BANDS[n.layer];
        const bx0 = band.xMin * W + n.r + 8;
        const bx1 = band.xMax * W - n.r - 8;
        if (n.x < bx0)      fx += (bx0 - n.x) * 0.5;
        else if (n.x > bx1) fx -= (n.x - bx1) * 0.5;

        // Interactive pointer repulsion keeps the graph lively on hover.
        if (mouse.x > -1000 && mouse.y > -1000) {
          const mdx = n.x - mouse.x;
          const mdy = n.y - mouse.y;
          const md = Math.hypot(mdx, mdy) || 0.1;
          if (md < MOUSE_RADIUS) {
            const repel = (1 - md / MOUSE_RADIUS) * MOUSE_REPEL;
            fx += (mdx / md) * repel * 6;
            fy += (mdy / md) * repel * 6;
          }
        }

        const mgTop = n.r + 40; // reserve a strip for the layer label
        const mgOther = n.r + 16;
        if (n.x < mgOther)          fx += (mgOther - n.x)       * BORDER;
        else if (n.x > W - mgOther) fx -= (n.x - (W - mgOther)) * BORDER;
        if (n.y < mgTop)            fy += (mgTop - n.y)         * BORDER;
        else if (n.y > H - mgOther) fy -= (n.y - (H - mgOther)) * BORDER;

        // Tiny ambient jitter so nodes never look frozen.
        fx += (Math.random() - 0.5) * 0.045;
        fy += (Math.random() - 0.5) * 0.045;

        n.vx = (n.vx + fx * 0.085) * damp;
        n.vy = (n.vy + fy * 0.085) * damp;
        n.x += n.vx;
        n.y += n.vy;
      }
    };

    // ── Round rect helper ─────────────────────────────────────────────────
    const rRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y,     x + w, y + h, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x,     y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x,     y + h, x,     y,     r);
      ctx.lineTo(x,    y + r);
      ctx.arcTo(x,     y,     x + w, y,     r);
      ctx.closePath();
    };

    // ── Draw ──────────────────────────────────────────────────────────────
    const draw = () => {
      const { W, H, nodes, stars, hovered, edges, pulses } = S.current;
      ctx.clearRect(0, 0, W, H);

      /* 1 ── Warm dark background (aligned with app palette) ───────────── */
      const bgG = ctx.createLinearGradient(0, 0, W, H);
      bgG.addColorStop(0,   "#16120d");
      bgG.addColorStop(0.5, "#1b150f");
      bgG.addColorStop(1,   "#16120d");
      ctx.fillStyle = bgG;
      ctx.fillRect(0, 0, W, H);

      /* 2 ── Warm ambient halos ─────────────────────────────────────────── */
      const ambients = [
        { x: 0.5, y: 0.54, r: 360, color: "200,168,130", a: 0.055 },
        { x: 0.08, y: 0.14, r: 240, color: "217,185,143", a: 0.06 },
        { x: 0.92, y: 0.86, r: 240, color: "160,127,90", a: 0.055 },
      ];
      ambients.forEach(({ x, y, r, color, a }) => {
        const g = ctx.createRadialGradient(x * W, y * H, 0, x * W, y * H, r);
        g.addColorStop(0, `rgba(${color},${a})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      Object.values(CATEGORIES).forEach(cat => {
        const band = BANDS[cat.layer];
        const ax = ((band.xMin + band.xMax) / 2) * W;
        const ay = H / 2;
        const g  = ctx.createRadialGradient(ax, ay, 0, ax, ay, H * 0.6);
        g.addColorStop(0,   `rgba(${cat.rgb},0.10)`);
        g.addColorStop(0.5, `rgba(${cat.rgb},0.03)`);
        g.addColorStop(1,   "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      /* 3 ── Starfield ──────────────────────────────────────────────────── */
      stars.forEach(s => {
        s.phase += s.spd;
        const a = Math.sin(s.phase) * 0.28 + 0.52;

        if (s.cross) {
          ctx.save();
          ctx.globalAlpha  = a * 0.55;
          ctx.strokeStyle  = "rgba(226,211,189,0.85)";
          ctx.lineWidth    = 0.55;
          const len = s.r * 3.8;
          ctx.beginPath();
          ctx.moveTo(s.x - len, s.y); ctx.lineTo(s.x + len, s.y);
          ctx.moveTo(s.x, s.y - len); ctx.lineTo(s.x, s.y + len);
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239,226,206,${a * 0.6})`;
        ctx.fill();
      });

      /* 4 ── Proximity edges (same layer) ───────────────────────────────── */
      Object.entries(CATEGORIES).forEach(([catName, cat]) => {
        const cn = nodes.filter(n => n.cat === catName);
        for (let i = 0; i < cn.length; i++) {
          for (let j = i + 1; j < cn.length; j++) {
            const a = cn[i], b = cn[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 130) {
              ctx.save();
              ctx.globalAlpha = (1 - d / 130) * 0.2;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = cat.color;
              ctx.lineWidth   = 1;
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      });

      /* 4b ── Weight edges (decorative, between adjacent layers) ────────── */
      const nodeById = {};
      nodes.forEach(n => { nodeById[n.id] = n; });
      edges.forEach(e => {
        const a = nodeById[e.a], b = nodeById[e.b];
        if (!a || !b) return;
        ctx.save();
        ctx.globalAlpha = 0.045 + e.seed * 0.05;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.restore();
      });
      if (hovered) {
        edges.forEach(e => {
          if (e.a !== hovered && e.b !== hovered) return;
          const a = nodeById[e.a], b = nodeById[e.b];
          if (!a || !b) return;
          const hoveredNode = nodeById[hovered];
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = hoveredNode.color;
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.restore();
        });
      }

      /* 4c ── Ambient signal pulses ───────────────────────────────────── */
      pulses.forEach(p => {
        const e = edges[p.edgeIdx];
        if (!e) return;
        const a = nodeById[e.a], b = nodeById[e.b];
        if (!a || !b) return;
        const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        const t0 = Math.max(0, p.t - 0.15);
        const et0 = ease(t0), et1 = ease(p.t);
        const x0 = a.x + (b.x - a.x) * et0;
        const y0 = a.y + (b.y - a.y) * et0;
        const x1 = a.x + (b.x - a.x) * et1;
        const y1 = a.y + (b.y - a.y) * et1;

        ctx.save();
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, `rgba(${a.rgb},0)`);
        grad.addColorStop(1, `rgba(${a.rgb},0.9)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x1, y1, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.shadowBlur = 14;
        ctx.shadowColor = `rgba(${a.rgb},0.9)`;
        ctx.fill();
        ctx.restore();
      });

      /* 5 ── Nodes ──────────────────────────────────────────────────────── */
      nodes.forEach(n => {
        const isH = hovered === n.id;
        const r   = isH ? n.r * 1.09 : n.r;
        const cx  = n.x, cy = n.y;

        ctx.save();
        if (isH) {
          ctx.shadowBlur  = 40;
          ctx.shadowColor = `rgba(${n.rgb},0.85)`;
        }

        // Radial fill
        const fill = ctx.createRadialGradient(
          cx - r * 0.22, cy - r * 0.22, 0,
          cx, cy, r * 1.08
        );
        fill.addColorStop(0,   `rgba(${n.rgb},${isH ? 0.5 : 0.38})`);
        fill.addColorStop(0.5, `rgba(${n.rgb},${isH ? 0.2 : 0.13})`);
        fill.addColorStop(1,   `rgba(${n.rgb},0.03)`);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();

        // Border
        ctx.strokeStyle = isH ? n.color : `rgba(${n.rgb},0.72)`;
        ctx.lineWidth   = isH ? 2.6 : 1.6;
        ctx.stroke();
        ctx.restore();

        /* ── Label text ── */
        ctx.save();
        const fs = Math.max(9.5, Math.min(r * 0.30, 13.5));
        ctx.font         = `700 ${fs}px 'DM Sans', system-ui, sans-serif`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle    = isH ? "#fdf8f0" : "rgba(245,232,216,0.94)";

        if (isH) {
          ctx.shadowBlur  = 10;
          ctx.shadowColor = `rgba(${n.rgb},0.9)`;
        }

        // Clip inside node so long names never bleed
        ctx.beginPath();
        ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillText(n.name, cx, cy - 4);

        /* ── Time-spent pips ── */
        const dotR   = 2.2;
        const dotGap = 7;
        const dotsW  = (n.years - 1) * dotGap;
        for (let di = 0; di < n.years; di++) {
          ctx.beginPath();
          ctx.arc(cx - dotsW / 2 + di * dotGap, cy + r * 0.5, dotR, 0, Math.PI * 2);
          ctx.fillStyle = isH ? n.color : `rgba(${n.rgb},0.58)`;
          ctx.fill();
        }
        ctx.restore();
      });

      /* 6 ── Layer labels ─────────────────────────────────────────────── */
      BANDS.forEach((band, i) => {
        const cx = ((band.xMin + band.xMax) / 2) * W;
        ctx.save();
        ctx.font = `600 10px 'IBM Plex Mono', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(200,168,130,0.5)";
        ctx.letterSpacing = "1.2px";
        ctx.fillText(LAYER_LABELS[i], cx, 14);
        ctx.restore();
      });

      /* 7 ── Tooltip ────────────────────────────────────────────────────── */
      if (hovered) {
        const n = nodeById[hovered];
        if (n) {
          const label = `${n.name}  ·  ${n.years} yr${n.years > 1 ? "s" : ""}`;
          ctx.font     = `600 11px 'DM Sans', system-ui`;
          const tw     = ctx.measureText(label).width;
          const pw = tw + 24, ph = 28;
          const tx = Math.min(Math.max(n.x - pw / 2, 8), W - pw - 8);
          const ty = Math.max(n.y - n.r - ph - 10, 36);

          ctx.save();
          ctx.shadowBlur  = 16;
          ctx.shadowColor = `rgba(${n.rgb},0.45)`;
          ctx.fillStyle   = "rgba(22,18,13,0.94)";
          rRect(tx, ty, pw, ph, 7);
          ctx.fill();
          ctx.strokeStyle = `rgba(${n.rgb},0.5)`;
          ctx.lineWidth   = 1;
          ctx.stroke();
          ctx.restore();

          ctx.font         = `600 11px 'DM Sans', system-ui`;
          ctx.fillStyle    = n.color;
          ctx.textAlign    = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(label, tx + 12, ty + ph / 2);
        }
      }
    };

    // ── Pulse spawning/advancing ──────────────────────────────────────────
    const updatePulses = () => {
      const now = performance.now();
      const { edges, pulses } = S.current;
      const inputEdgeIdxs = edges
        .map((e, idx) => ({ e, idx }))
        .filter(({ e }) => nodeIdLayer(e.a) === 0);

      if (now >= S.current.nextPulseAt && pulses.length < 10 && inputEdgeIdxs.length) {
        const pick = inputEdgeIdxs[Math.floor(Math.random() * inputEdgeIdxs.length)];
        pulses.push({ edgeIdx: pick.idx, t: 0, speed: 1 / (60 + Math.random() * 40) });
        S.current.nextPulseAt = now + 900 + Math.random() * 700;
      }

      const nodeById = {};
      S.current.nodes.forEach(n => { nodeById[n.id] = n; });

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) {
          const edge = edges[p.edgeIdx];
          pulses.splice(i, 1);
          if (edge && Math.random() < 0.7) {
            const arrivedId = edge.b;
            const arrivedNode = nodeById[arrivedId];
            if (arrivedNode && arrivedNode.layer === 1) {
              const outgoing = edges
                .map((e, idx) => ({ e, idx }))
                .filter(({ e }) => e.a === arrivedId);
              if (outgoing.length) {
                const next = outgoing[Math.floor(Math.random() * outgoing.length)];
                pulses.push({ edgeIdx: next.idx, t: 0, speed: 1 / (60 + Math.random() * 40) });
              }
            }
          }
        }
      }
    };

    const nodeIdLayer = id => {
      const n = S.current.nodes.find(nd => nd.id === id);
      return n ? n.layer : -1;
    };

    // ── Animation loop ────────────────────────────────────────────────────
    const loop = () => {
      physicsStep(S.current.nodes, S.current.W, S.current.H, 0.86);
      updatePulses();

      const { mouse, nodes } = S.current;
      let nh = null;
      for (const n of nodes) {
        if (Math.hypot(n.x - mouse.x, n.y - mouse.y) < n.r) { nh = n.id; break; }
      }
      if (nh !== S.current.hovered) {
        S.current.hovered = nh;
        setCursor(nh ? "pointer" : "default");
      }

      // Hovered node gets a soft orbital force and nudges neighbors.
      if (S.current.hovered) {
        const active = nodes.find(n => n.id === S.current.hovered);
        if (active) {
          const t = performance.now() * 0.0045;
          active.vx += Math.cos(t) * 0.14;
          active.vy += Math.sin(t * 1.2) * 0.14;
          for (const n of nodes) {
            if (n.id === active.id) continue;
            const dx = n.x - active.x;
            const dy = n.y - active.y;
            const d = Math.hypot(dx, dy) || 0.1;
            if (d < 220) {
              const push = (1 - d / 220) * 0.05;
              n.vx += (dx / d) * push;
              n.vy += (dy / d) * push;
            }
          }
        }
      }

      draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    init();
    loop();

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      init();
      loop();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [isMobile]);

  const onMove = e => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) S.current.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onClick = () => {
    const { mouse, nodes } = S.current;
    const target = nodes.find(n => Math.hypot(n.x - mouse.x, n.y - mouse.y) < n.r);
    if (!target) return;

    // Click burst: impulse wave from the clicked node.
    for (const n of nodes) {
      const dx = n.x - target.x;
      const dy = n.y - target.y;
      const d = Math.hypot(dx, dy) || 0.1;
      if (d < 260) {
        const impulse = (1 - d / 260) * 3.4;
        n.vx += (dx / d) * impulse + (Math.random() - 0.5) * 0.28;
        n.vy += (dy / d) * impulse + (Math.random() - 0.5) * 0.28;
      }
    }
  };

  return (
    <section
      id="skills"
      style={{
        background: "var(--color-bg-base, #16120d)",
        padding: "80px 0 64px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 36px" }}>
        <p style={{
          color: "var(--color-text-meta, #9a8f7a)",
          fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          marginBottom: 10,
          opacity: 1,
          textTransform: "uppercase",
        }}>
          {"// Skills"}
        </p>
        <h2 id="skills-heading" style={{
          fontFamily: "var(--font-display, 'DM Serif Display', Georgia, serif)",
          fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)",
          fontWeight: 400,
          color: "var(--color-text-primary, #eef6ff)",
          letterSpacing: "-0.02em",
          margin: "0 0 10px",
          lineHeight: 1.15,
        }}>
          Technical Skills
        </h2>
        <p style={{
          color: "var(--color-text-muted, #e8e2d8)",
          fontSize: "0.92rem",
          margin: 0,
          fontFamily: "var(--font-body, 'Crimson Pro', Georgia, serif)",
        }}>
          A layered map of the stack — node size and years below both track time spent, not self-rated skill.
        </p>
      </div>

      {!isMobile ? (
        <>
          {/* ── Decorative canvas ── */}
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              onMouseMove={onMove}
              onClick={onClick}
              onMouseLeave={() => { S.current.mouse = { x: -9999, y: -9999 }; }}
              style={{
                width: "100%",
                height: 550,
                display: "block",
                borderRadius: 18,
                border: "1px solid var(--color-border-subtle, rgba(200, 168, 130, 0.12))",
                cursor,
              }}
            />
          </div>

          {/* ── Legend ── */}
          <div style={{
            maxWidth: 1100,
            margin: "20px auto 0",
            padding: "0 40px",
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
          }}>
            {Object.entries(CATEGORIES).map(([name, cat]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  display: "inline-block",
                  width: 9, height: 9, borderRadius: "50%",
                  background: cat.color,
                  boxShadow: `0 0 8px rgba(${cat.rgb},0.9)`,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--color-text-subtle, #b8a990)",
                }}>
                  {name}
                </span>
              </div>
            ))}
            <span style={{
              color: "var(--color-text-meta, #9a8f7a)",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
            }}>
              ◈&nbsp;&nbsp;{TOTAL_SKILLS} skills
            </span>
          </div>
        </>
      ) : null}

      {isMobile ? <SkillsFlow /> : null}

      {isMobile ? (
        <style>{`
          .skills-pulse-dot {
            position: absolute;
            left: 50%;
            top: 0;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            transform: translateX(-50%);
            animation: skills-pulse-flow 2.6s ease-in-out infinite;
          }
          @keyframes skills-pulse-flow {
            0%   { top: 4%; opacity: 0; }
            15%  { opacity: 0.9; }
            85%  { opacity: 0.9; }
            100% { top: 92%; opacity: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .skills-pulse-dot { animation: none; opacity: 0.6; top: 45%; }
          }
        `}</style>
      ) : null}

    </section>
  );
}
