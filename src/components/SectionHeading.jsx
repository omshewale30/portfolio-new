import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { fadeInUp, revealOnView } from "../utils/animations";

const TITLE_SIZES = {
  h1: "text-4xl sm:text-5xl md:text-6xl",
  h2: "text-[32px] sm:text-[40px]",
};

// The one header pattern used across the site: an eyebrow pill, a title, an optional lede and
// an optional action pinned to the right. Page titles (h1) are already in view on arrival and
// fade in with the route, so only section headings reveal on scroll.
const SectionHeading = ({ eyebrow, title, lede, as: Tag = "h2", id, action, className = "" }) => (
  <motion.header
    className={`flex flex-wrap items-end gap-4 ${className}`.trim()}
    variants={fadeInUp}
    {...(Tag === "h1" ? {} : revealOnView)}
  >
    <div className="mr-auto flex max-w-3xl flex-col gap-2">
      {eyebrow ? <p className="eyebrow-label eyebrow-pill m-0">{eyebrow}</p> : null}
      <Tag id={id} className={`headline m-0 leading-tight text-[var(--color-text-primary)] ${TITLE_SIZES[Tag]}`}>
        {title}
      </Tag>
      {lede ? <p className="m-0 mt-1 text-[15px] leading-relaxed text-[var(--color-text-subtle)] sm:text-base">{lede}</p> : null}
    </div>
    {action}
  </motion.header>
);

SectionHeading.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.node.isRequired,
  lede: PropTypes.node,
  as: PropTypes.oneOf(["h1", "h2"]),
  id: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};

export default SectionHeading;
