import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { experienceDetails } from "../data/experience";

// What I'm doing now. The title and employer live on the hero card, so this leads with the work itself.
const CurrentRoleSummary = () => {
  const currentRole = experienceDetails.find((role) => role.current);
  if (!currentRole) return null;

  return (
    <section aria-label="Current role">
      <Link
        to="/experience"
        className="surface-hover flex flex-col gap-3.5 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 text-[var(--color-text-primary)] sm:p-7"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
          Now · {currentRole.duration}
        </span>
        <h2 className="m-0 text-xl font-normal leading-snug tracking-[-0.015em] text-[var(--color-text-muted)]">
          {currentRole.short ?? currentRole.summary}
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {currentRole.technologies.slice(0, 5).map((technology) => (
            <span key={technology} className="ai-badge">
              {technology}
            </span>
          ))}
        </div>
        <span className="flex items-center pt-1 font-mono text-[11px] text-[var(--color-text-meta)]">
          all roles
          <ArrowUpRight size={14} className="ml-auto text-[var(--color-text-subtle)]" aria-hidden="true" />
        </span>
      </Link>
    </section>
  );
};

export default CurrentRoleSummary;
