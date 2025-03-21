import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Educates Training Platform",
  tagline: "Interactive workshop environments on Kubernetes",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://educates.dev/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "educates", // Usually your GitHub org/user name.
  projectName: "educates.github.io", // Usually your repo name.
  trailingSlash: false, // See: https://docusaurus.io/docs/deployment#docusaurusconfigjs-settings
  deploymentBranch: "main", // The branch your GitHub pages site is deployed from.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // scripts: [
  //   {
  //     src: "/js/ityped.ts",
  //     async: true,
  //   },
  // ],

  // stylesheets: [
  //   {
  //     href: "/css/ityped.css",
  //     type: "text/css",
  //   },
  // ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "getting-started-guides",
        sidebarPath: "./sidebars.ts",
        path: "./getting-started-guides",
        routeBasePath: "getting-started-guides",
        // Please change this to your repo.
        // Remove this to remove the "edit this page" links.
        editUrl: "https://github.com/educates/educates.github.io/tree/develop/",
      },
    ],
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      },
    ],
  ],

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          // Default docs folder
          path: "docs",
          routeBasePath: "docs",
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: {
          blogTitle: "Educates Training Platform blog!",
          blogDescription: "A blog about all things Educates!",
          // blogSidebarTitle: "All posts",
          // blogSidebarCount: "ALL",
          // postsPerPage: "ALL",
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/educates/educates.github.io/tree/develop/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/logo.svg",
    navbar: {
      title: "Educates Training Platform",
      logo: {
        alt: "Educates Training Platform",
        src: "img/logo.svg",
      },
      items: [
        { to: "/features", label: "Features", position: "left" },
        // { to: "/team", label: "Team", position: "left" },
        // { to: "/resources", label: "Resources", position: "left" },
        // {
        //   type: "docSidebar",
        //   sidebarId: "tutorialSidebar",
        //   position: "left",
        //   label: "Ref docs",
        // },
        {
          label: "Getting Started Guides",
          to: "/getting-started-guides",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://docs.educates.dev",
          label: "Docs",
          position: "left",
        },
        {
          href: "https://github.com/educates/educates-training-platform",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Project",
          items: [
            {
              label: "Features",
              to: "/features",
            },
            // {
            //   label: "Team",
            //   href: "/team",
            // },
          ],
        },
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started Guides",
              to: "/getting-started-guides",
            },
            {
              label: "Reference docs",
              href: "https://docs.educates.dev",
            },
            {
              label: "Additional resources",
              href: "/resources",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "Slack",
              href: "https://kubernetes.slack.com/archives/C05UWT4SKRV",
            },
            {
              label: "GitHub",
              href: "https://github.com/educates/educates-training-platform",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Educates Team. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
