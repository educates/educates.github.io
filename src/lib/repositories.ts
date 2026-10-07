// Links to repositories on GitHub that a page sends readers to, to try a
// tool that lives outside the platform, such as the AI authoring skills. A
// page names each repository as owner/name and never writes its URL.

/** A repository as a page names it, with a line on what it holds. */
export interface Repository {
  /** The repository on GitHub, as owner/name. */
  name: string;
  /** What it holds, or what it does for the reader, in a line. */
  text: string;
}

/** A repository with its page on GitHub. */
export interface RepositoryLink extends Repository {
  href: string;
}

const ownerAndName = /^[\w.-]+\/[\w.-]+$/;

/**
 * The repositories in `repositories`, in that order, each with its page on
 * GitHub. A name not of the form owner/name fails the build; `usedBy` names
 * the page or file that named it, for the error message.
 */
export function repositoryLinks(
  repositories: readonly Repository[],
  usedBy: string,
): RepositoryLink[] {
  return repositories.map(({ name, text }) => {
    if (!ownerAndName.test(name)) {
      throw new Error(
        `${usedBy} names repository "${name}", which is not of the form owner/name, such as educates/educates-course-design-skill`,
      );
    }
    return { name, text, href: `https://github.com/${name}` };
  });
}
