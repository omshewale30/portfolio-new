import PropTypes from "prop-types";

// A cited document as an accent chip; opening it shows the excerpt the answer drew on.
const SourceDetails = ({ source, index }) => (
    <details className="group max-w-full text-left">
        <summary className="source-chip flex w-fit max-w-full cursor-pointer list-none items-center gap-1.5">
            <span className="shrink-0 opacity-70">[{index + 1}]</span>
            <span className="truncate" title={source.filename}>
                {source.filename}
            </span>
            <span aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-90">
                ›
            </span>
        </summary>
        <div className="mt-1.5 max-w-md rounded-[7px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs leading-relaxed text-[var(--color-text-subtle)]">
            {source.quote ? (
                <blockquote className="m-0 border-l border-[var(--color-border-hover)] pl-2">
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
        id: PropTypes.string,
        filename: PropTypes.string.isRequired,
        quote: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
};

export default SourceDetails;
