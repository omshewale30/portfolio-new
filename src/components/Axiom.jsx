import PropTypes from "prop-types";

// A short aphorism threaded between home-page sections.
const Axiom = ({ label = "// axiom", children }) => (
  <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-1.5 px-4 pb-14 pt-20 sm:px-6 lg:px-12 lg:pb-16 lg:pt-24">
    <span className="mono-label">{label}</span>
    <p className="headline m-0 text-[26px] leading-tight text-[var(--color-text-primary)] sm:text-[34px]">{children}</p>
  </div>
);

Axiom.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Axiom;
