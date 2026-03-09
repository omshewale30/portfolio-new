import React, { useState, useEffect, useRef } from 'react';

const skillIcons = {
  Python: "🐍", "C++": "⚙️", JavaScript: "JS", Java: "☕",
  HTML: "</>", Swift: "◆", SQL: "⛁", CSS: "✦",
  React: "⚛", FastAPI: "⚡", LangChain: "🔗", "Tailwind CSS": "💨",
  TensorFlow: "🧠", "Scikit-learn": "📊", "Node.js": "⬡", Express: "◈",
  Supabase: "⬡", Git: "⎇", GitHub: "◎", Docker: "🐳",
  Jira: "◈", JUnit: "✓", MySQL: "⛁", MongoDB: "🍃",
};

const skills = {
  Languages: [
    { name: "Python" }, { name: "C++" }, { name: "JavaScript" }, { name: "Java" },
    { name: "HTML" }, { name: "Swift" }, { name: "SQL" }, { name: "CSS" },
  ],
  Frameworks: [
    { name: "React" }, { name: "FastAPI" }, { name: "LangChain" }, { name: "Tailwind CSS" },
    { name: "TensorFlow" }, { name: "Scikit-learn" }, { name: "Node.js" }, { name: "Express" },
  ],
  Tools: [
    { name: "Supabase" }, { name: "Git" }, { name: "GitHub" }, { name: "Docker" },
    { name: "Jira" }, { name: "JUnit" }, { name: "MySQL" }, { name: "MongoDB" },
  ]
};

const categoryConfig = {
  Languages: {
    icon: "💻",
    gradient: "from-[var(--color-primary)] to-[#b58e60]",
    glow: "rgba(200,168,130,0.15)",
    accent: "#c8a882",
    tagAccent: "rgba(200,168,130,0.12)",
    tagBorder: "rgba(200,168,130,0.3)",
    tagHoverBorder: "rgba(200,168,130,0.7)",
    tagHoverBg: "rgba(200,168,130,0.18)",
  },
  Frameworks: {
    icon: "⚡",
    gradient: "from-[#ad875d] to-[#9a754f]",
    glow: "rgba(181,141,94,0.15)",
    accent: "#b58e60",
    tagAccent: "rgba(181,141,94,0.12)",
    tagBorder: "rgba(181,141,94,0.3)",
    tagHoverBorder: "rgba(181,141,94,0.7)",
    tagHoverBg: "rgba(181,141,94,0.18)",
  },
  Tools: {
    icon: "🛠️",
    gradient: "from-[#c8a882] to-[#8f6e4a]",
    glow: "rgba(154,117,79,0.15)",
    accent: "#9a754f",
    tagAccent: "rgba(154,117,79,0.12)",
    tagBorder: "rgba(154,117,79,0.3)",
    tagHoverBorder: "rgba(154,117,79,0.7)",
    tagHoverBg: "rgba(154,117,79,0.18)",
  },
};

const SkillBadge = ({ skill, config, index }) => {
  const [hovered, setHovered] = useState(false);
  const icon = skillIcons[skill.name] || "◆";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${0.3 + index * 0.06}s`,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        borderRadius: "10px",
        border: `1px solid ${hovered ? config.tagHoverBorder : config.tagBorder}`,
        background: hovered ? config.tagHoverBg : config.tagAccent,
        transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: hovered ? "translateX(4px) scale(1.015)" : "translateX(0) scale(1)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      className="animate-[fade-in-up_0.5s_ease-out_both]"
    >
      {/* left accent line */}
      <div style={{
        position: "absolute",
        left: 0,
        top: "20%",
        height: "60%",
        width: "2px",
        borderRadius: "2px",
        background: config.accent,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.2s ease",
      }} />

      {/* icon pill */}
      <span style={{
        fontSize: "0.75rem",
        minWidth: "24px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        background: hovered ? `${config.accent}33` : "transparent",
        color: config.accent,
        fontFamily: "monospace",
        fontWeight: "700",
        transition: "background 0.2s ease",
        letterSpacing: "-0.02em",
      }}>
        {icon}
      </span>

      <span style={{
        fontSize: "0.875rem",
        fontWeight: "500",
        color: hovered
          ? "var(--color-text-primary)"
          : "var(--color-text-muted)",
        transition: "color 0.2s ease",
        letterSpacing: "0.01em",
      }}>
        {skill.name}
      </span>
    </div>
  );
};

const CategoryCard = ({ category, items, config, isActive, isFiltered }) => {
  const [cardHovered, setCardHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      style={{
        position: "relative",
        borderRadius: "20px",
        border: "1px solid var(--color-border-subtle)",
        background: "var(--color-bg-elevated)",
        padding: "0",
        overflow: "hidden",
        transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: cardHovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: cardHovered
          ? `0 20px 60px ${config.glow}, 0 4px 20px rgba(0,0,0,0.12)`
          : "0 2px 8px rgba(0,0,0,0.06)",
        opacity: isFiltered ? 0.35 : 1,
      }}
    >
      {/* Top gradient bar - always visible, pulses on hover */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: `linear-gradient(90deg, ${config.accent}, ${config.accent}88)`,
        opacity: cardHovered ? 1 : 0.45,
        transition: "opacity 0.3s ease",
      }} />

      {/* Glow orb background */}
      <div style={{
        position: "absolute",
        top: "-60px",
        right: "-60px",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
        opacity: cardHovered ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      }} />

      {/* Card header */}
      <div style={{
        padding: "28px 28px 20px",
        borderBottom: "1px solid var(--color-border-muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Icon container */}
          <div style={{
            width: "46px",
            height: "46px",
            borderRadius: "12px",
            background: `${config.accent}22`,
            border: `1px solid ${config.accent}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: cardHovered ? "scale(1.1) rotate(8deg)" : "scale(1) rotate(0deg)",
          }}>
            {config.icon}
          </div>

          <div>
            <h3 style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}>
              {category}
            </h3>
            <p style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              marginTop: "2px",
              opacity: 0.7,
            }}>
              {items.length} technologies
            </p>
          </div>
        </div>

      </div>

      {/* Skills grid */}
      <div style={{
        padding: "20px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}>
        {items.map((skill, index) => (
          <SkillBadge key={skill.name} skill={skill} config={config} index={index} />
        ))}
      </div>
    </div>
  );
};

const SkillsSection = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const tabRefs = useRef({});

  useEffect(() => {
    const activeTab = tabRefs.current[activeFilter];
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [activeFilter]);

  return (
    <section
      id="skills"
      className="relative overflow-hidden bg-[var(--color-bg-base)]"
    >
      <div className="section-shell">

        {/* Header */}
        <div className="relative mb-10 animate-[fade-in-up_0.8s_ease-out]">
          <p className="eyebrow-label mb-3">// Skills</p>
          <h2 className="font-display mb-4 text-4xl tracking-[-0.02em] text-[var(--color-text-primary)] max-md:text-[2.5rem] max-[480px]:text-[2rem]">
            Technical Skills
          </h2>
          <p className="max-w-[600px] text-xl leading-relaxed text-[var(--color-text-muted)] max-md:text-[1.1rem]">
            Expertise across languages, frameworks, and development tools
          </p>
        </div>


        {/* Cards grid */}
        <div
          className="animate-[fade-in-up_0.8s_ease-out_0.2s_both]"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {Object.entries(skills).map(([category, items]) => (
            <CategoryCard
              key={category}
              category={category}
              items={items}

              config={categoryConfig[category]}
              isActive={activeFilter === category || activeFilter === "All"}
              isFiltered={activeFilter !== "All" && activeFilter !== category}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default SkillsSection;