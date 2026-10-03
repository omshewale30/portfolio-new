import { Link } from "react-router-dom";
import { proofStats } from "../data/stats";

const ProofStrip = () => (
  <section aria-label="Evidence at a glance" className="px-6">
    {/* A results table: 2px ink rule on top, 1px rules between cells */}
    <div
      className="ruled-grid grid grid-cols-2 gap-px border-b border-t-2 border-[var(--color-border-strong)] md:grid-cols-4"
      style={{ maxWidth: "calc(var(--container-max) - 2 * var(--space-6))", marginInline: "auto" }}
    >
      {proofStats.map((stat) => (
        <Link
          key={stat.label}
          to={stat.href}
          className="group relative flex min-h-36 flex-col justify-center gap-2 bg-[var(--color-bg-surface)] px-5 py-7 no-underline transition-colors hover:bg-[var(--color-bg-elevated)] md:min-h-40 md:px-6"
        >
          <strong className="font-display text-5xl font-normal leading-none tracking-[-0.03em] text-[var(--color-text-primary)]">
            {stat.value}
          </strong>
          <span className="text-sm leading-snug text-[var(--color-text-muted)]">
            {stat.label}
          </span>
          <span aria-hidden="true" className="font-mono text-xs text-[var(--color-primary)] transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      ))}
    </div>
  </section>
);

export default ProofStrip;
