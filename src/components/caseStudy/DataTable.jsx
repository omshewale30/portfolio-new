import { useId, useState } from "react";
import PropTypes from "prop-types";

const ALL = "all";

const toggleClass = (active) =>
  `note-interactive min-h-9 rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.06em] transition-colors ${
    active
      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
      : "border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
  }`;

// Wide table that breaks out of the reading column. The first column stays pinned while the rest
// scrolls; tables with `columnGroups` get a narrow-screen toggle to show one group at a time.
const DataTable = ({ table }) => {
  const [activeGroup, setActiveGroup] = useState(ALL);
  const captionId = useId();
  const groups = table.columnGroups ?? [];

  const hiddenOnNarrow = (columnIndex) => {
    if (activeGroup === ALL || columnIndex === 0) return false;
    const group = groups.find((item) => item.columns.includes(table.columns[columnIndex]));
    return Boolean(group) && group.label !== activeGroup;
  };
  const cellVisibility = (columnIndex) => (hiddenOnNarrow(columnIndex) ? "max-lg:hidden" : "");

  return (
    <figure className="case-breakout m-0 mt-8">
      {groups.length ? (
        <div role="group" aria-label="Columns to show" className="mb-3 flex flex-wrap gap-2 lg:hidden">
          {[ALL, ...groups.map((group) => group.label)].map((label) => (
            <button
              key={label}
              type="button"
              aria-pressed={activeGroup === label}
              onClick={() => setActiveGroup(label)}
              className={toggleClass(activeGroup === label)}
            >
              {label === ALL ? "All columns" : label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        role="region"
        tabIndex={0}
        aria-labelledby={table.caption ? captionId : undefined}
        aria-label={table.caption ? undefined : "Data table"}
        className="note-interactive overflow-x-auto rounded-2xl border border-[var(--color-border-subtle)]"
      >
        <table
          className={`w-full border-separate border-spacing-0 text-left text-sm ${
            activeGroup === ALL ? "min-w-[36rem]" : "min-w-[36rem] max-lg:min-w-0"
          }`}
        >
          <thead>
            <tr>
              {table.columns.map((column, columnIndex) => (
                <th
                  key={column}
                  scope="col"
                  className={`whitespace-nowrap bg-[var(--color-bg-elevated)] px-4 py-3 font-mono text-xs font-normal uppercase tracking-[0.06em] text-[var(--color-text-meta)] ${
                    columnIndex === 0 ? "sticky left-0 z-[1] shadow-[inset_-1px_0_0_var(--color-border-subtle)]" : ""
                  } ${cellVisibility(columnIndex)}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => {
              const highlighted = table.highlightRows?.includes(rowIndex);
              return (
                <tr
                  key={row[0]}
                  className={highlighted ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}
                >
                  {row.map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th
                        key={cellIndex}
                        scope="row"
                        className="sticky left-0 z-[1] whitespace-nowrap border-t border-[var(--color-border-muted)] bg-[var(--color-bg-base)] px-4 py-3 font-medium shadow-[inset_-1px_0_0_var(--color-border-subtle)]"
                      >
                        {cell}
                      </th>
                    ) : (
                      <td
                        key={cellIndex}
                        className={`whitespace-nowrap border-t border-[var(--color-border-muted)] px-4 py-3 tabular-nums ${cellVisibility(cellIndex)}`}
                      >
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {table.caption ? (
        <figcaption id={captionId} className="mt-3 text-xs leading-relaxed text-[var(--color-text-subtle)]">
          {table.caption}
        </figcaption>
      ) : null}
    </figure>
  );
};

DataTable.propTypes = {
  table: PropTypes.shape({
    caption: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
    rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    highlightRows: PropTypes.arrayOf(PropTypes.number),
    columnGroups: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        columns: PropTypes.arrayOf(PropTypes.string).isRequired,
      }),
    ),
  }).isRequired,
};

export default DataTable;
