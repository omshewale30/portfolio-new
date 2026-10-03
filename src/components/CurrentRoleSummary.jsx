import { Link } from "react-router-dom";
import { experienceDetails } from "../data/experience";

const CurrentRoleSummary = () => {
  const currentRole = experienceDetails.find((role) => role.current);
  if (!currentRole) return null;

  return (
    <section aria-label="Current role">
      <Link
        to="/experience"
        className="surface-hover flex h-full flex-col gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 text-[var(--color-text-primary)] sm:p-7"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
          Now · {currentRole.duration}
        </span>
        <h2 className="m-0 text-[22px] font-normal tracking-[-0.015em] text-[var(--color-text-muted)]">
          {currentRole.title}
        </h2>
        <span className="text-[13px] text-[var(--color-text-subtle)]">{currentRole.company}</span>
        <p className="m-0 text-sm leading-relaxed text-[var(--color-text-muted)]">
          {currentRole.short ?? currentRole.summary}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {currentRole.technologies.slice(0, 5).map((technology) => (
            <span key={technology} className="ai-badge">
              {technology}
            </span>
          ))}
        </div>
      </Link>
    </section>
  );
};

export default CurrentRoleSummary;
