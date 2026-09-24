import PropTypes from "prop-types";

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
).isRequired;

// lg+: sticky rail in the left margin, highlighting the section in view.
export const TocRail = ({ items, activeId }) => (
  <nav aria-label="On this page">
    <p className="eyebrow-label mb-4">On this page</p>
    <ol className="m-0 flex list-none flex-col p-0">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active ? "true" : undefined}
              className={`note-interactive block border-l-2 py-1.5 pl-3 text-[0.8125rem] leading-snug transition-colors ${
                active
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-[var(--color-border-subtle)] text-[var(--color-text-subtle)] hover:border-[var(--color-border-focus)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ol>
  </nav>
);

TocRail.propTypes = {
  items: itemsPropType,
  activeId: PropTypes.string,
};

// Below lg: the collapsible table of contents notes already use.
export const TocDetails = ({ items }) => {
  // Collapse before the jump so the target lands where the closed layout puts it.
  const closeDetails = (event) => event.currentTarget.closest("details")?.removeAttribute("open");

  return (
    <details className="note-toc lg:hidden">
      <summary className="note-interactive">On this page</summary>
      <nav aria-label="On this page">
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <a className="note-interactive" href={`#${item.id}`} onClick={closeDetails}>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
};

TocDetails.propTypes = {
  items: itemsPropType,
};
