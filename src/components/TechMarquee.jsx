const defaultItems = [
  "React",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Node.js",
  "FastAPI",
  "LangChain",
  "OpenAI",
  "Azure",
  "Supabase",
];

function TechMarquee({ items = defaultItems }) {
  const marqueeItems = [...items, ...items];

  return (
    <div className="tech-marquee-shell" aria-label="Technology marquee">
      <div className="tech-marquee-viewport">
        <div className="marquee-track font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-subtle)]">
          {marqueeItems.map((item, index) => (
            <span className="tech-marquee-item" key={`${item}-${index}`}>
              {item}
              <span className="marquee-separator" aria-hidden="true">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TechMarquee;
