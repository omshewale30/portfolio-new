import PropTypes from "prop-types";

const STEPS = [
  { key: "before", label: "The problem" },
  { key: "intervention", label: "The intervention" },
  { key: "after", label: "The result" },
];

// Problem → intervention → result as one numbered sequence joined by a rail, ending on the result.
const StoryStepper = ({ study }) => (
  <ol className="m-0 mt-8 list-none p-0">
    {STEPS.map((step, index) => {
      const isResult = index === STEPS.length - 1;
      const { title, description } = study[step.key];
      return (
        <li key={step.key} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 pb-10 last:pb-0 md:gap-x-6">
          {isResult ? null : (
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-5 top-12 w-px -translate-x-1/2 bg-gradient-to-b from-[var(--color-primary-muted)] to-[var(--color-border-subtle)]"
            />
          )}
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs ${
              isResult
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-bg-base)]"
                : "border-[var(--color-border-focus)] bg-[var(--color-bg-surface)] text-[var(--color-primary)]"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div
            className={
              isResult
                ? "rounded-2xl border border-[var(--color-border-focus)] bg-[var(--color-bg-surface)] p-5 md:p-6"
                : "pt-2"
            }
          >
            <p className="eyebrow-label m-0">{step.label}</p>
            <h3 className="mt-2 font-display text-xl leading-snug text-[var(--color-text-primary)] md:text-2xl">{title}</h3>
            <p className="mb-0 mt-3 text-base leading-relaxed text-[var(--color-text-muted)]">{description}</p>
          </div>
        </li>
      );
    })}
  </ol>
);

const storyPart = PropTypes.shape({
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
}).isRequired;

StoryStepper.propTypes = {
  study: PropTypes.shape({
    before: storyPart,
    intervention: storyPart,
    after: storyPart,
  }).isRequired,
};

export default StoryStepper;
