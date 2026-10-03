import { Link } from "react-router-dom";
import { proofStats } from "../data/stats";

const ProofStrip = () => (
  <section aria-label="Evidence at a glance" className="bg-[var(--color-bg-base)]">
    <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-2 gap-3 px-4 sm:px-6 md:grid-cols-4 lg:px-12">
      {proofStats.map((stat) => (
        <Link
          key={stat.label}
          to={stat.href}
          className="surface-hover flex flex-col gap-1.5 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5"
        >
          <strong className="headline text-[30px] font-medium leading-none text-[var(--color-text-primary)] sm:text-4xl">
            {stat.value}
          </strong>
          <span className="text-xs text-[var(--color-text-subtle)]">{stat.label}</span>
        </Link>
      ))}
    </div>
  </section>
);

export default ProofStrip;
