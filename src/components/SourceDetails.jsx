import PropTypes from "prop-types";

const SourceDetails = ({ source, index }) => (
    <details className="group max-w-full text-left">
        <summary className="flex w-fit max-w-full cursor-pointer list-none items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2.5 py-1 font-mono text-xs text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]">
            <span className="shrink-0 opacity-70">[{index + 1}]</span>
            <span className="truncate" title={source.filename}>
                {source.filename}
            </span>
            <span aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-90">
                ›
            </span>
        </summary>
        <div className="mt-1.5 max-w-md rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-base)] px-3 py-2 text-xs leading-relaxed text-[var(--color-text-subtle)]">
            {source.quote ? (
                <blockquote className="m-0 border-l-2 border-[var(--color-primary-muted)] pl-2">
                    {source.quote}
                </blockquote>
            ) : (
                <p className="m-0">
                    Citation from {source.filename}; no excerpt was returned by the provider.
                </p>
            )}
        </div>
    </details>
);

SourceDetails.propTypes = {
    source: PropTypes.shape({
        id: PropTypes.string.isRequired,
        filename: PropTypes.string.isRequired,
        quote: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
};

export default SourceDetails;
