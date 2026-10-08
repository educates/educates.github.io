// Filtering a list by facets: groups of chips such as kind and Topic, where
// the reader picks at most one value per group and the groups combine. The
// groups arrive as data, so the same logic filters any list of entries by
// any set of groups. The selection lives in the page's query string, such
// as `?kind=videos&topic=ai`, so a filtered view can be shared.

/** A value of a facet group, as its chip names it. */
export interface FacetValue {
  /** How the query string and the entries name it, such as `videos`. */
  id: string;
  label: string;
}

/** A group of chips: one way of filtering the list, such as kind. */
export interface FacetGroup {
  /** How the query string names it, such as `kind`. */
  id: string;
  label: string;
  /** Its values, in the order of their chips. */
  values: readonly FacetValue[];
}

/** An entry as the filter sees it: its id and its values in each group. */
export interface FacetedEntry {
  id: string;
  /** The ids of the entry's values, by the id of their group. */
  facets: Readonly<Record<string, readonly string[]>>;
}

/** What the reader picked: at most one value id, by the id of its group. */
export type FacetSelection = Readonly<Record<string, string>>;

/**
 * The entries that have every selected value, in the order given. An empty
 * selection shows every entry.
 */
export function visibleEntries<Entry extends FacetedEntry>(
  entries: readonly Entry[],
  selection: FacetSelection,
): Entry[] {
  const picked = Object.entries(selection);
  return entries.filter((entry) =>
    picked.every(([group, value]) => entry.facets[group]?.includes(value)),
  );
}

/**
 * The groups as their chips show for `entries`: a value no entry has is left
 * out, and so is a group left with no values.
 */
export function facetGroupsInUse(
  groups: readonly FacetGroup[],
  entries: readonly FacetedEntry[],
): FacetGroup[] {
  return groups
    .map((group) => ({
      ...group,
      values: group.values.filter((value) =>
        entries.some((entry) => entry.facets[group.id]?.includes(value.id)),
      ),
    }))
    .filter((group) => group.values.length > 0);
}

/**
 * The selection after the reader picks `value` in `group`: it replaces the
 * group's value, or clears the group when it is already the group's value
 * or when no value is picked, as an "All" chip does.
 */
export function pickFacet(
  selection: FacetSelection,
  group: string,
  value: string | undefined,
): FacetSelection {
  const { [group]: current, ...others } = selection;
  return value === undefined || value === current
    ? others
    : { ...others, [group]: value };
}

/**
 * The selection a query string holds, such as `?kind=videos&topic=ai`. A
 * parameter that names no group, a value its group does not have, and a
 * group's parameters after its first known value are ignored.
 */
export function selectionFromQuery(
  query: string,
  groups: readonly FacetGroup[],
): FacetSelection {
  const parameters = new URLSearchParams(query);
  const selection: Record<string, string> = {};
  for (const group of groups) {
    const value = parameters
      .getAll(group.id)
      .find((candidate) =>
        group.values.some((known) => known.id === candidate),
      );
    if (value !== undefined) selection[group.id] = value;
  }
  return selection;
}

/**
 * The query string that holds `selection`: the selected value of each
 * group, in the groups' order, after the parameters of `query` that name no
 * group. Empty when there is nothing to write.
 */
export function selectionToQuery(
  selection: FacetSelection,
  groups: readonly FacetGroup[],
  query = "",
): string {
  const parameters = new URLSearchParams(query);
  for (const group of groups) parameters.delete(group.id);
  for (const group of groups) {
    const value = selection[group.id];
    if (value !== undefined) parameters.append(group.id, value);
  }
  const written = parameters.toString();
  return written === "" ? "" : `?${written}`;
}
