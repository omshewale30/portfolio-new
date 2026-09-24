import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { easing } from "../../utils/animations";

// One number with optional non-numeric prefix/suffix: "200+", "~10×", "1,973", "0.837", "~600 pages".
const NUMERIC_VALUE = /^(\D*?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(\D*)$/;

const parseValue = (value) => {
  const match = value.match(NUMERIC_VALUE);
  if (!match) return null;
  const [, prefix, integer, fraction = "", suffix] = match;
  return {
    prefix,
    suffix,
    target: Number(`${integer.replaceAll(",", "")}${fraction}`),
    decimals: Math.max(0, fraction.length - 1),
    grouped: integer.includes(","),
  };
};

const formatValue = ({ prefix, suffix, decimals, grouped }, number) =>
  `${prefix}${number.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  })}${suffix}`;

// Counts numeric stats up from zero the first time they scroll into view. Values without a
// number ("Email triage") and readers who prefer reduced motion get the final value as-is.
const CountUpValue = ({ value }) => {
  const ref = useRef(null);
  const parsed = useMemo(() => parseValue(value), [value]);
  const reduceMotion = useReducedMotion();
  const animated = Boolean(parsed) && !reduceMotion;
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [display, setDisplay] = useState(value);

  // Start from zero before the first paint, so the final value never flashes first.
  useLayoutEffect(() => {
    setDisplay(animated ? formatValue(parsed, 0) : value);
  }, [animated, parsed, value]);

  useEffect(() => {
    if (!animated || !inView) return;
    const controls = animate(0, parsed.target, {
      duration: 1.2,
      ease: easing,
      onUpdate: (latest) => setDisplay(formatValue(parsed, latest)),
      onComplete: () => setDisplay(value),
    });
    return () => controls.stop();
  }, [animated, inView, parsed, value]);

  if (!parsed) return value;

  return (
    <span ref={ref} className="relative inline-block tabular-nums">
      {/* The final value reserves the width, so the count doesn't reflow the card. */}
      <span className="invisible" aria-hidden="true">{value}</span>
      <span className="absolute inset-0 text-center" aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
};

CountUpValue.propTypes = {
  value: PropTypes.string.isRequired,
};

export default CountUpValue;
