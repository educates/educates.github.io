/** A link in a docs section's sidebar, with the pages under it. */
export interface SidebarItem {
  label: string;
  href: string;
  /** A short marker shown before the label, such as a step number. */
  marker?: string;
  /** The pages under this one, shown nested below it. */
  items?: SidebarItem[];
}

/**
 * A docs section's sidebar: the section's name, linking to its first page,
 * then its pages.
 */
export interface Sidebar {
  label: string;
  href: string;
  items: SidebarItem[];
}
