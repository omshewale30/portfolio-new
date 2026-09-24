import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const controlClass =
  "note-interactive flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]";

// Modal figure viewer on a native <dialog>: showModal() makes the page inert and gives Esc for free.
// Mounted only while open; unmounting closes it and hands focus back to the figure that opened it.
const Lightbox = ({ figures, index, opener, onClose, onStep }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(opener ?? document.activeElement);
  const figure = figures[index];
  const count = figures.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    const returnFocusTo = openerRef.current;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;

    root.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();

    return () => {
      root.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      if (returnFocusTo instanceof HTMLElement) returnFocusTo.focus({ preventScroll: true });
    };
  }, []);

  const handleKeyDown = (event) => {
    if (count > 1 && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      onStep(event.key === "ArrowLeft" ? -1 : 1);
      return;
    }
    if (event.key !== "Tab") return;

    // Keep Tab cycling inside the viewer rather than escaping to the browser chrome.
    const focusable = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  // `close` also fires for our own dialog.close() in effect cleanup (StrictMode re-runs effects),
  // after the dialog may already be reopened; only a dialog that is really closed means "close".
  const handleClose = () => {
    if (!dialogRef.current?.open) onClose();
  };

  // Clicks on the dimmed area around the panel close the viewer.
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget || event.target.dataset.lightboxBackdrop !== undefined) onClose();
  };

  const caption = figure.caption || figure.label;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Figure viewer"
      className="case-lightbox"
      onCancel={handleCancel}
      onClose={handleClose}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div data-lightbox-backdrop="" className="flex h-full w-full items-center justify-center p-3 sm:p-6">
        <div className="case-lightbox-panel flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-glass-strong)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-muted)] px-4 py-2">
            <p className="m-0 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]" aria-live="polite">
              {count > 1 ? `Figure ${index + 1} of ${count}` : "Figure"}
              <span className="sr-only">{`: ${figure.alt}`}</span>
            </p>
            <div className="flex items-center gap-2">
              <a
                href={figure.src}
                target="_blank"
                rel="noopener noreferrer"
                className="note-interactive inline-flex min-h-10 items-center gap-1.5 px-2 font-mono text-xs uppercase tracking-[0.06em] text-[var(--color-primary)]"
              >
                Full size
                <ArrowUpRight size={14} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close figure viewer" className={controlClass}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* sm+: side gutters so the step buttons sit beside the figure instead of over it. */}
          <div
            className={`relative flex min-h-0 flex-1 items-center justify-center bg-white p-2 sm:py-4 ${
              count > 1 ? "sm:px-16" : "sm:px-4"
            }`}
          >
            <img
              src={figure.src}
              alt={figure.alt}
              className="block max-h-[calc(100vh-14rem)] w-auto max-w-full object-contain"
            />
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => onStep(-1)}
                  aria-label="Previous figure"
                  className={`${controlClass} absolute left-2 top-1/2 -translate-y-1/2 sm:left-3`}
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onStep(1)}
                  aria-label="Next figure"
                  className={`${controlClass} absolute right-2 top-1/2 -translate-y-1/2 sm:right-3`}
                >
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>

          {caption ? (
            <p className="m-0 border-t border-[var(--color-border-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-subtle)]">
              {caption}
            </p>
          ) : null}
        </div>
      </div>
    </dialog>
  );
};

Lightbox.propTypes = {
  figures: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired,
      caption: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  index: PropTypes.number.isRequired,
  opener: PropTypes.instanceOf(Element),
  onClose: PropTypes.func.isRequired,
  onStep: PropTypes.func.isRequired,
};

export default Lightbox;
