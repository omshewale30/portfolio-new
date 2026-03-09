import React, { useState, useEffect, useRef } from "react";

// ─── Skill data with experience weights ──────────────────────────────────────
const CATEGORIES = {
  Languages: {
    color: "#f0d8b2",
    rgb: "240,216,178",
    stroke: "#f6e4c8",
    anchor: [0.21, 0.46],
    skills: [
      { name: "Python",     exp: 5 },
      { name: "SQL",        exp: 4 },
      { name: "JavaScript", exp: 4 },
      { name: "C++",        exp: 3 },
      { name: "Java",       exp: 3 },
      { name: "Dart",       exp: 2 },
      { name: "Swift",      exp: 2 },
    ],
  },
  Frameworks: {
    color: "#c8a882",
    rgb: "200,168,130",
    stroke: "#d4b896",
    anchor: [0.72, 0.28],
    skills: [
      { name: "PyTorch",      exp: 4 },
      { name: "LangChain",    exp: 4 },
      { name: "FastAPI",      exp: 4 },
      { name: "React",        exp: 4 },
      { name: "TensorFlow",   exp: 3 },
      { name: "LlamaIndex",   exp: 3 },
      { name: "Scikit-learn", exp: 3 },
      { name: "Hugging Face", exp: 2 }
    ],
  },
  Tools: {
    color: "#7f5f3f",
    rgb: "127,95,63",
    stroke: "#98714a",
    anchor: [0.63, 0.73],
    skills: [
      { name: "Azure",      exp: 4 },
      { name: "Docker",     exp: 4 },
      { name: "PostgreSQL",     exp: 4 },
      { name: "Git",        exp: 4 },
      { name: "ChromaDB",   exp: 3 },
      { name: "AWS",        exp: 3 },
      { name: "Pinecone",   exp: 2 },
      { name: "Kubernetes", exp: 2 },
      { name: "Supabase",   exp: 2 },
    ],
  },
};

// Node radius: base + text-length contribution + experience bonus
const calcR = (name, exp) => Math.round(22 + name.length * 2.6 + exp * 5);

// ─── Component ────────────────────────────────────────────────────────────────
export default function SkillsSection() {
  const canvasRef = useRef(null);
  const S = useRef({
    nodes: [], stars: [],
    hovered: null,
    mouse: { x: -9999, y: -9999 },
    W: 0, H: 0,
  });
  const rafRef = useRef(null);
  const [cursor, setCursor] = useState("default");

  useEffect(() => {
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

      // Stars
      S.current.stars = Array.from({ length: 180 }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.5 + 0.15,
        phase: Math.random() * Math.PI * 2,
        spd:   0.008 + Math.random() * 0.024,
        cross: Math.random() < 0.06,
      }));

      // Nodes
      const nodes = [];
      Object.entries(CATEGORIES).forEach(([catName, cat]) => {
        const ax = cat.anchor[0] * W;
        const ay = cat.anchor[1] * H;
        cat.skills.forEach((sk, i) => {
          const spread = 72 + Math.random() * 60;
          const angle  = (i / cat.skills.length) * Math.PI * 2 + i * 0.35;
          nodes.push({
            id:     `${catName}::${sk.name}`,
            name:   sk.name,
            cat:    catName,
            exp:    sk.exp,
            r:      calcR(sk.name, sk.exp),
            color:  cat.color,
            rgb:    cat.rgb,
            stroke: cat.stroke,
            x: ax + spread * Math.cos(angle),
            y: ay + spread * Math.sin(angle),
            vx: 0, vy: 0,
            tx: ax, ty: ay,
          });
        });
      });
      S.current.nodes = nodes;

      // Pre-settle (no render)
      for (let i = 0; i < 280; i++) physicsStep(nodes, W, H, 0.75);
    };

    // ── Physics ────────────────────────────────────────────────────────────
    const physicsStep = (nodes, W, H, damp = 0.85) => {
      const REPEL  = 3400;
      const GRAV   = 0.019;
      const BORDER = 0.38;
      const MOUSE_RADIUS = 180;
      const MOUSE_REPEL = 0.9;
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

        fx += (n.tx - n.x) * GRAV;
        fy += (n.ty - n.y) * GRAV;

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

        const mg = n.r + 16;
        if (n.x < mg)          fx += (mg - n.x)       * BORDER;
        else if (n.x > W - mg) fx -= (n.x - (W - mg)) * BORDER;
        if (n.y < mg)          fy += (mg - n.y)       * BORDER;
        else if (n.y > H - mg) fy -= (n.y - (H - mg)) * BORDER;

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
      const { W, H, nodes, stars, hovered } = S.current;
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

      Object.entries(CATEGORIES).forEach(([, cat]) => {
        const ax = cat.anchor[0] * W;
        const ay = cat.anchor[1] * H;
        const g  = ctx.createRadialGradient(ax, ay, 0, ax, ay, 255);
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

      /* 4 ── Proximity edges (same category) ───────────────────────────── */
      Object.entries(CATEGORIES).forEach(([catName, cat]) => {
        const cn = nodes.filter(n => n.cat === catName);
        for (let i = 0; i < cn.length; i++) {
          for (let j = i + 1; j < cn.length; j++) {
            const a = cn[i], b = cn[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 215) {
              ctx.save();
              ctx.globalAlpha = (1 - d / 215) * 0.22;
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

        /* ── Experience pips ── */
        const dotR   = 2.2;
        const dotGap = 7;
        const dotsW  = (n.exp - 1) * dotGap;
        for (let di = 0; di < n.exp; di++) {
          ctx.beginPath();
          ctx.arc(cx - dotsW / 2 + di * dotGap, cy + r * 0.5, dotR, 0, Math.PI * 2);
          ctx.fillStyle = isH ? n.color : `rgba(${n.rgb},0.58)`;
          ctx.fill();
        }
        ctx.restore();
      });

      /* 6 ── Tooltip ────────────────────────────────────────────────────── */
      if (hovered) {
        const n = nodes.find(nd => nd.id === hovered);
        if (n) {
          const label = `${n.name}  ·  ${n.exp} yr${n.exp > 1 ? "s" : ""}`;
          ctx.font     = `600 11px 'DM Sans', system-ui`;
          const tw     = ctx.measureText(label).width;
          const pw = tw + 24, ph = 28;
          const tx = Math.min(Math.max(n.x - pw / 2, 8), W - pw - 8);
          const ty = Math.max(n.y - n.r - ph - 10, 8);

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

    // ── Animation loop ────────────────────────────────────────────────────
    const loop = () => {
      physicsStep(S.current.nodes, S.current.W, S.current.H, 0.86);

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
  }, []);

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
          // Skills
        </p>
        <h2 style={{
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
          Force-directed graph · node size = years of experience
        </p>
      </div>

      {/* ── Canvas ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <canvas
          ref={canvasRef}
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
              fontSize: "0.72rem",
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
          fontSize: "0.68rem",
          fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
        }}>
          ◈&nbsp;&nbsp;24 skills
        </span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@600;700&display=swap');
      `}</style>
    </section>
  );
}