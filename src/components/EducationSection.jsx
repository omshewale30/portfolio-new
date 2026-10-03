import PropTypes from "prop-types";
import { GraduationCap, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, cardReveal, revealOnView } from "../utils/animations";
import { educationDetails } from "../data/education";
import SectionHeading from "./SectionHeading";

const ICONS = { rocket: Rocket, graduation: GraduationCap };

// Compact (home): just the hairline rows, stacked under the current-role card; they take their
// reveal from that column. Full (experience page): a headed section with a note under each row.
const EducationRows = ({ compact }) => (
  <motion.ul
    aria-label={compact ? "Education" : undefined}
    className={`m-0 list-none p-0 ${compact ? "flex flex-col" : "grid gap-x-4 md:grid-cols-2"}`}
    variants={staggerContainer}
    {...(compact ? {} : revealOnView)}
  >
    {educationDetails.map((edu) => {
      const Icon = ICONS[edu.icon];
      return (
        <motion.li
          key={edu.degree}
          className={`flex flex-col gap-3 border-[var(--color-border-subtle)] ${compact ? "border-b px-1 py-4" : "border-t py-5"}`}
          variants={cardReveal}
        >
          <div className={`flex items-center ${compact ? "gap-4" : "gap-[18px]"}`}>
            <Icon size={compact ? 18 : 22} strokeWidth={1.5} className="shrink-0 text-[var(--color-text-subtle)]" aria-hidden="true" />
            <span className="mr-auto flex min-w-0 flex-col gap-0.5">
              <span className={`${compact ? "text-[15px]" : "text-[17px]"} text-[var(--color-text-muted)]`}>{edu.degree}</span>
              <span className="text-[13px] text-[var(--color-text-subtle)]">{edu.institution}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-0.5 font-mono text-[11px] text-[var(--color-text-meta)]">
              <span className="text-[var(--color-text-muted)]">
                {edu.gpa}
                <span className="sr-only"> GPA</span>
              </span>
              {edu.years}
            </span>
          </div>
          {compact ? null : (
            <p className="m-0 pl-10 text-sm text-[var(--color-text-subtle)]">{edu.description}</p>
          )}
        </motion.li>
      );
    })}
  </motion.ul>
);

EducationRows.propTypes = {
  compact: PropTypes.bool.isRequired,
};

const EducationSection = ({ compact = false }) =>
  compact ? (
    <EducationRows compact />
  ) : (
    <section id="education" aria-labelledby="education-heading" className="scroll-mt-20">
      <SectionHeading
        id="education-heading"
        eyebrow="Education"
        title="Where the foundations came from."
        className="mb-8"
      />
      <EducationRows compact={false} />
    </section>
  );

EducationSection.propTypes = {
  compact: PropTypes.bool,
};

export default EducationSection;
