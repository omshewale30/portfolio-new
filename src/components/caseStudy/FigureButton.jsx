import PropTypes from "prop-types";
import { Maximize2 } from "lucide-react";

// A figure image that opens the lightbox. Diagrams and charts are drawn on white;
// `figure-img` inverts/greyscales them so they sit on the page surface in either theme.
const FigureButton = ({ figure, onOpen, imageClassName = "w-full" }) => (
  <button
    type="button"
    onClick={onOpen}
    aria-haspopup="dialog"
    aria-label={`View larger: ${figure.alt}`}
    className="note-interactive group relative block w-full cursor-zoom-in overflow-hidden rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] transition-colors hover:border-[var(--color-border-hover)]"
  >
    <img
      src={figure.src}
      alt=""
      loading="lazy"
      decoding="async"
      className={`figure-img mx-auto block ${imageClassName}`}
    />
    <span
      aria-hidden="true"
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <Maximize2 size={14} />
    </span>
  </button>
);

FigureButton.propTypes = {
  figure: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
  imageClassName: PropTypes.string,
};

export default FigureButton;
