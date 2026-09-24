import PropTypes from "prop-types";
import { Maximize2 } from "lucide-react";

// A figure image that opens the lightbox. Diagrams and charts are drawn on white,
// so the plate stays white in both themes.
const FigureButton = ({ figure, onOpen, imageClassName = "w-full" }) => (
  <button
    type="button"
    onClick={onOpen}
    aria-haspopup="dialog"
    aria-label={`View larger: ${figure.alt}`}
    className="note-interactive group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-white"
  >
    <img
      src={figure.src}
      alt=""
      loading="lazy"
      decoding="async"
      className={`mx-auto block motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.01] ${imageClassName}`}
    />
    <span
      aria-hidden="true"
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
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
