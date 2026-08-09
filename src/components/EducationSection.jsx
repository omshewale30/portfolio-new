import PropTypes from "prop-types";
import { GraduationCap, Rocket, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cardReveal, fadeInUp, staggerContainer } from "../utils/animations";

const educationDetails = [
  {
    degree: "B.S in Computer Science",
    institution: "Arizona State University",
    years: "08/2020 – 05/2024",
    gpa: "4.0 / 4.0",
    transcriptLink: "../transcripts/ASU_Transcript.pdf",
    description: "Graduated Summa Cum Laude with the prestigious Moeur Award.",
    icon: GraduationCap,
  },
  {
    degree: "M.S in Computer Science",
    institution: "University of North Carolina at Chapel Hill",
    years: "08/2024 – 05/2026",
    gpa: "4.0 / 4.0",
    transcriptLink: "../transcripts/UNC_Transcript.pdf",
    description: "Focusing on LLMs and computer vision.",
    icon: Rocket,
  },
];

const EducationSection = ({ compact = false }) => {
  return (
    <section id="education" className="relative overflow-hidden bg-[var(--color-bg-base)]">
      <div className="section-shell relative">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="eyebrow-label mb-3">{"// Education"}</p>
          <h2 className="font-display mb-4 text-4xl text-[var(--color-text-primary)] md:text-5xl max-[480px]:text-3xl">
            Education
          </h2>
          {compact ? null : (
            <p className="mb-10 max-w-[30rem] text-[var(--color-text-muted)] md:mb-12">
              Academic background and focus areas
            </p>
          )}
        </motion.div>

        <motion.div
          className={`grid gap-6 md:grid-cols-2 ${compact ? "md:gap-6" : "md:gap-10"}`}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {educationDetails.map((edu, index) => {
            const Icon = edu.icon;
            return (
              <motion.div
                key={index}
                className={`surface-card group relative flex flex-col overflow-hidden ${
                  compact ? "p-6 md:p-7" : "min-h-[320px] p-8 md:p-10 max-md:min-h-0 max-[480px]:p-6"
                }`}
                variants={cardReveal}
              >
                <div className={`flex items-start justify-between gap-4 ${compact ? "mb-5" : "mb-8 max-md:mb-6"}`}>
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-105 ${
                      compact ? "h-11 w-11" : "h-14 w-14 md:h-16 md:w-16"
                    }`}
                  >
                    <Icon size={compact ? 20 : 24} strokeWidth={2} />
                  </div>
                  <span className="rounded border border-[var(--color-border-subtle)] px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
                    {edu.gpa} GPA
                  </span>
                </div>

                <h3
                  className={`font-display tracking-tight text-[var(--color-text-primary)] ${
                    compact ? "mb-2 text-xl" : "mb-3 text-2xl md:mb-4 md:text-[1.9rem] max-[480px]:text-xl"
                  }`}
                >
                  {edu.degree}
                </h3>
                <p
                  className={`text-[var(--color-primary)] ${
                    compact ? "mb-3 text-base" : "mb-5 text-[1.05rem] md:mb-6 md:text-[1.15rem] max-[480px]:text-base"
                  }`}
                >
                  {edu.institution}
                </p>

                <div
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-[0.07em] text-[var(--color-text-meta)] ${
                    compact ? "mb-0" : "mb-6 md:mb-7 max-md:mb-5"
                  }`}
                >
                  <span className="flex items-center gap-2 text-[var(--color-text-meta)]">
                    <Calendar size={16} strokeWidth={2} />
                    {edu.years}
                  </span>
                </div>

                {compact ? null : (
                  <>
                    <p className="mb-8 flex-1 text-base leading-[1.75] text-[var(--color-text-muted)] md:mb-10 md:text-[1.05rem] md:leading-[1.8] max-[480px]:mb-6 max-[480px]:text-[0.95rem]">
                      {edu.description}
                    </p>

                    <a
                      href={edu.transcriptLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost inline-flex w-fit items-center gap-2.5 px-5 py-2.5 max-[480px]:text-sm"
                    >
                      <ExternalLink size={18} strokeWidth={2} />
                      View transcript
                    </a>
                  </>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

EducationSection.propTypes = {
  compact: PropTypes.bool,
};

export default EducationSection;
