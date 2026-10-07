// Links to workshops on the Educates Hub. Pages name a Hub workshop by its
// id and never write a Hub URL into their copy; the ids, titles and URLs
// live in one file, src/content/hub-workshops.yml. These helpers take the
// links as plain data, so they work on that collection and in tests alike.

/** A workshop on the Hub: its id, its title as the Hub shows it, and its page. */
export interface HubWorkshopLink {
  id: string;
  title: string;
  url: string;
}

/** The file that holds the Hub workshop links. */
export const hubWorkshopsFile = "src/content/hub-workshops.yml";

/**
 * The Hub workshops named by `ids`, in that order, from `links`. An id the
 * links file does not define fails the build; `usedBy` names the page or
 * file that named it, for the error message.
 */
export function hubWorkshopLinks(
  ids: readonly string[],
  links: readonly HubWorkshopLink[],
  usedBy: string,
): HubWorkshopLink[] {
  const byId = new Map(links.map((link) => [link.id, link]));
  return ids.map((id) => {
    const link = byId.get(id);
    if (!link) {
      throw new Error(
        `${usedBy} names Hub workshop "${id}", which ${hubWorkshopsFile} does not define`,
      );
    }
    return link;
  });
}
