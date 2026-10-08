// Filter chips for a list of cards, as a React island: a row of chips per
// facet group, the reader picks at most one value per group, and the groups
// combine. Groups and entries arrive as data, so the island knows nothing
// of kinds or Topics; a value no entry has gets no chip, and a group left
// with no values is not shown. The cards stay in the server-rendered list:
// each item names its entry with `data-entry-id`, and the island hides the
// ones the selection leaves out. The selection lives in the query string,
// such as `?kind=videos&topic=ai`, so a filtered view can be shared.
//
// Without JavaScript the chips are hidden and the whole list shows.

import "./FacetFilter.css";
import { useEffect, useMemo, useState } from "react";
import {
  facetGroupsInUse,
  pickFacet,
  selectionFromQuery,
  selectionToQuery,
  visibleEntries,
  type FacetedEntry,
  type FacetGroup,
  type FacetSelection,
} from "../lib/facet-filter.ts";

export interface FacetFilterProps {
  /** The groups of chips, in order, each with its values in order. */
  groups: FacetGroup[];
  /** Every entry in the list, with its values in each group. */
  entries: FacetedEntry[];
  /**
   * The id of the list the chips filter. Each of its items that holds an
   * entry carries the entry's id in `data-entry-id`.
   */
  list: string;
  /** What the list holds, in the plural, for its count; "entries" unless given. */
  noun?: string;
}

export default function FacetFilter({
  groups,
  entries,
  list,
  noun = "entries",
}: FacetFilterProps) {
  const shown = useMemo(
    () => facetGroupsInUse(groups, entries),
    [groups, entries],
  );
  // The server renders no selection; the query string is read once the
  // island runs in the browser.
  const [selection, setSelection] = useState<FacetSelection>({});
  useEffect(() => {
    setSelection(selectionFromQuery(location.search, shown));
  }, [shown]);

  const visible = useMemo(
    () => visibleEntries(entries, selection),
    [entries, selection],
  );
  useEffect(() => {
    const ids = new Set(visible.map((entry) => entry.id));
    const items = document
      .getElementById(list)
      ?.querySelectorAll<HTMLElement>("[data-entry-id]");
    for (const item of items ?? []) {
      item.hidden = !ids.has(item.dataset.entryId ?? "");
    }
  }, [list, visible]);

  function choose(next: FacetSelection) {
    setSelection(next);
    const query = selectionToQuery(next, groups, location.search);
    history.replaceState(
      history.state,
      "",
      `${location.pathname}${query}${location.hash}`,
    );
  }

  return (
    <div className="facet-filter">
      {shown.map((group) => {
        const labelId = `${list}-${group.id}-label`;
        const picked = selection[group.id];
        return (
          <div
            key={group.id}
            className="facet-group"
            role="group"
            aria-labelledby={labelId}
          >
            <span className="facet-label" id={labelId}>
              {group.label}
            </span>
            <ul className="facet-chips">
              <li>
                <button
                  type="button"
                  aria-pressed={picked === undefined}
                  onClick={() =>
                    choose(pickFacet(selection, group.id, undefined))
                  }
                >
                  All
                </button>
              </li>
              {group.values.map((value) => (
                <li key={value.id}>
                  <button
                    type="button"
                    aria-pressed={picked === value.id}
                    onClick={() =>
                      choose(pickFacet(selection, group.id, value.id))
                    }
                  >
                    {value.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <p className="facet-count" role="status">
        {visible.length === entries.length
          ? `${entries.length} ${noun}`
          : `${visible.length} of ${entries.length} ${noun}`}
      </p>
      {visible.length === 0 && (
        <p className="facet-empty">
          Nothing matches all of these filters.{" "}
          <button type="button" onClick={() => choose({})}>
            Clear the filters
          </button>
        </p>
      )}
    </div>
  );
}
