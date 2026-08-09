import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { experienceDetails } from "../data/experience";
import { fadeInUp } from "../utils/animations";

const CurrentRoleSummary = () => {
  const currentRole = experienceDetails.find((role) => role.current);
  if (!currentRole) return null;

  return (
    <section className="relative border-y border-[var(--color-border-muted)] bg-[var(--color-bg-elevated)]">
      <motion.div
        className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div>
          <p className="eyebrow-label mb-3">{"// Current role"}</p>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
            {currentRole.duration}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-[var(--color-text-primary)] md:text-5xl">
            {currentRole.title}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-[var(--color-text-muted)]">
            {currentRole.company}
          </p>
          <p className="mt-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
            <MapPin size={14} aria-hidden="true" />
            {currentRole.location}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 md:p-8">
          <p className="m-0 text-lg leading-8 text-[var(--color-text-muted)]">
            {currentRole.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {currentRole.technologies.slice(0, 5).map((technology) => (
              <span key={technology} className="ai-badge">
                {technology}
              </span>
            ))}
          </div>
          <Link
            to="/experience"
            className="mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)] no-underline transition-colors hover:text-[var(--color-primary-hover)]"
          >
            See full experience
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default CurrentRoleSummary;
