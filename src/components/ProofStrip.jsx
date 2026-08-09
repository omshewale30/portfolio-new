import { Link } from "react-router-dom";
import { proofStats } from "../data/stats";

const ProofStrip = () => (
  <section
    aria-label="Evidence at a glance"
    className="border-y border-[var(--color-border-muted)] bg-[var(--color-bg-elevated)]"
  >
    <div
      className="grid grid-cols-2 px-6 md:grid-cols-4"
      style={{ maxWidth: "var(--container-max)", marginInline: "auto" }}
    >
      {proofStats.map((stat, index) => (
        <Link
          key={stat.label}
          to={stat.href}
          className="group relative flex min-h-36 flex-col justify-center px-4 py-7 text-center no-underline transition-colors hover:bg-[var(--color-bg-surface)] md:min-h-40 md:px-7"
        >
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 font-mono text-xs text-[var(--color-primary-muted)] md:block"
            >
              ✦
            </span>
          ) : null}
          <strong className="font-display text-4xl font-normal text-[var(--color-primary)] md:text-5xl">
            {stat.value}
          </strong>
          <span className="mt-2 font-mono text-xs uppercase leading-relaxed tracking-[0.08em] text-[var(--color-text-meta)] transition-colors group-hover:text-[var(--color-text-muted)]">
            {stat.label}
          </span>
        </Link>
      ))}
    </div>
  </section>
);

export default ProofStrip;
