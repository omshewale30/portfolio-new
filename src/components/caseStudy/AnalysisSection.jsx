import PropTypes from "prop-types";
import DataTable from "./DataTable";
import FigureButton from "./FigureButton";

// One long-form `sections[]` entry: centred eyebrow and heading, left-aligned prose and an
// optional numbered list, then its table and figure grid, which break out wider than the reading column.
const AnalysisSection = ({ section, onOpenFigure, className = "" }) => (
  <section id={section.id} aria-labelledby={`${section.id}-heading`} className={`case-flow scroll-mt-28 ${className}`}>
    <header className="text-center">
      {section.eyebrow ? <p className="eyebrow-label mb-3">{`// ${section.eyebrow}`}</p> : null}
      <h2
        id={`${section.id}-heading`}
        className="m-0 text-balance font-display text-2xl text-[var(--color-text-primary)] md:text-3xl"
      >
        {section.heading}
      </h2>
    </header>

    {section.paragraphs?.length || section.list?.length ? (
      <div className="mt-6 flex flex-col gap-4">
        {section.paragraphs?.map((paragraph, index) => (
          <p key={index} className="m-0 text-base leading-relaxed text-[var(--color-text-muted)]">
            {paragraph}
          </p>
        ))}
        {section.list?.length ? (
          <ol className="m-0 flex list-decimal flex-col gap-3 pl-6 text-base leading-relaxed text-[var(--color-text-muted)] marker:text-[var(--color-primary)]">
            {section.list.map((item) => (
              <li key={item} className="pl-1">
                {item}
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    ) : null}

    {section.table ? <DataTable table={section.table} /> : null}

    {section.figures?.length ? (
      <div className="case-breakout case-figure-grid mt-8">
        {section.figures.map((figure, index) => (
          <figure key={figure.src} className="m-0">
            <FigureButton
              figure={figure}
              onOpen={(event) => onOpenFigure(section.figures, index, event.currentTarget)}
            />
            {figure.caption ? (
              <figcaption className="mt-3 text-sm leading-relaxed text-[var(--color-text-subtle)]">{figure.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    ) : null}
  </section>
);

AnalysisSection.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    eyebrow: PropTypes.string,
    heading: PropTypes.string.isRequired,
    paragraphs: PropTypes.arrayOf(PropTypes.string),
    list: PropTypes.arrayOf(PropTypes.string),
    table: PropTypes.object,
    figures: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired,
        caption: PropTypes.string,
      }),
    ),
  }).isRequired,
  onOpenFigure: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default AnalysisSection;
