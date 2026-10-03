import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { proofStats } from "../data/stats";
import { cardReveal, revealOnView, staggerContainer } from "../utils/animations";
import CountUpValue from "./caseStudy/CountUpValue";

const ProofStrip = () => (
  <section aria-label="Evidence at a glance">
    <motion.div
      className="mx-auto grid max-w-[var(--container-max)] grid-cols-2 gap-3 px-4 sm:px-6 md:grid-cols-4 lg:px-12"
      variants={staggerContainer}
      {...revealOnView}
    >
      {proofStats.map((stat) => (
        <motion.div key={stat.label} variants={cardReveal}>
          <Link
            to={stat.href}
            className="surface-hover flex h-full flex-col gap-1.5 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5"
          >
            <strong className="headline text-[30px] font-medium leading-none text-[var(--color-text-primary)] sm:text-4xl">
              <CountUpValue value={stat.value} align="left" />
            </strong>
            <span className="text-xs text-[var(--color-text-subtle)]">{stat.label}</span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default ProofStrip;
