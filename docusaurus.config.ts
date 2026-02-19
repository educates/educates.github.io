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

  customFields: {
    educatesProject: {
      projectGitHubUrl:
        "https://github.com/educates/educates-training-platform",
      projectSlackUrl: "https://kubernetes.slack.com/archives/C05UWT4SKRV",
      contributingUrl:
        "https://github.com/educates/educates-training-platform/blob/develop/CONTRIBUTING.md",
      sponsorshipUrl: "https://github.com/sponsors/educates",
      downloadsUrl:
        "https://github.com/educates/educates-training-platform/releases",
      descriptionTitle: "Interactive Training Platform",
      description:
        "The Educates project provides a system for hosting interactive workshop environments in Kubernetes, " +
        "or on top of a local container runtime. It can be used for self paced or supervised workshops. " +
        "It can also be useful where you need to package up demos of applications hosted in Kubernetes " +
        "or a local container runtime.",
      screenshot: "/img/screenshot.png",
      youtubeUrl: "https://www.youtube.com/@EducatesTrainingPlatform",
    },
  },

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  // Set to "ignore" because navbar/footer link to homepage section anchors
  // (e.g. /#use-cases, /#features) which are rendered by React components
  // with id props. Docusaurus's static checker can't detect these.
  onBrokenAnchors: "ignore",

  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  headTags: [
    {
      tagName: "script",
      attributes: { type: "application/ld+json" },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Educates Training Platform",
        description:
          "A system for hosting interactive workshop environments in Kubernetes, or on top of a local container runtime.",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Kubernetes",
        url: "https://educates.dev",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        sourceOrganization: {
          "@type": "Organization",
          name: "Educates",
          url: "https://educates.dev",
          logo: "https://educates.dev/img/educates-social-card.png",
          sameAs: [
            "https://github.com/educates/educates-training-platform",
            "https://www.youtube.com/@EducatesTrainingPlatform",
          ],
        },
      }),
    },
  ],

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
      "@docusaurus/plugin-content-docs",
      {
        id: "about-educates",
        sidebarPath: "./sidebars.ts",
        path: "./about-educates",
        routeBasePath: "about-educates",
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
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
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
        gtag: {
          trackingID: "G-6E8JHKBWNX",
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/educates-social-card.png",
    metadata: [
      { name: "keywords", content: "kubernetes, training, workshops, interactive learning, hands-on labs, developer education, cloud native, containers" },
      { name: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    colorMode: {
      defaultMode: "light",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    // announcementBar: {
    //   id: 'support_us',
    //   content:
    //     'We are looking for support to help us maintain the project, please <a target="_blank" rel="noopener noreferrer" href="https://github.com/sponsors/educates">sponsor us</a>',
    //   backgroundColor: '#fafbfc',
    //   textColor: '#091E42',
    //   isCloseable: true,
    // },
    navbar: {
      title: "Educates Training Platform",
      logo: {
        alt: "Educates Training Platform",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "dropdown",
          label: "Project",
          position: "left",
          items: [
            { to: "/#use-cases", label: "Use Cases" },
            { to: "/#features", label: "Features" },
            { to: "/#team", label: "Team" },
            // { to: '/#references', label: 'References', position: 'left' },
            { to: "/#pricing", label: "Pricing" },
            { to: "/#featured-content", label: "Featured Content" },
          ],
        },
        { to: "/downloads", label: "Downloads", position: "left" },
        {
          type: "dropdown",
          label: "About",
          position: "left",
          items: [
            { to: "/about-educates", label: "Architecture" },
            { to: "/about-educates/deployment", label: "Deployment" },
            { to: "/about-educates/workshop-capabilities", label: "Workshop Capabilities" },
            { to: "/about-educates/workflows", label: "Workflows" },
            { to: "/about-educates/local-dev", label: "Local Development" },
            { to: "/about-educates/history", label: "Educates History" },
          ],
        },
        {
          type: "dropdown",
          label: "Guides",
          position: "left",
          items: [
            { to: "/getting-started-guides", label: "Getting Started" },
            { to: "/getting-started-guides/setup", label: "Setup" },
            { to: "/getting-started-guides/about", label: "About" },
            { to: "/getting-started-guides/authoring", label: "Authoring" },
          ],
        },
        { to: "/blog", label: "Blog", position: "left" },
        { href: "https://hub.educates.dev", label: "Hub", position: "right" },
        { href: "https://docs.educates.dev", label: "Docs", position: "right" },
        {
          href: "https://github.com/educates/educates-training-platform",
          label: "GitHub",
          position: "right",
        },
        // { href: '/login', label: 'Login / Sign Up', position: 'right', className: 'navbar-login-button' },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Project",
          items: [
            { label: "Use Cases", to: "/#use-cases" },
            { label: "Features", to: "/#features" },
            { label: "Team", to: "/#team" },
            // { label: "References", to: "/#references" },
            { label: "Pricing", to: "/#pricing" },
            { label: "Downloads", to: "/downloads" },
          ],
        },
        {
          title: "Docs",
          items: [
            { label: "Featured Content", to: "/#featured-content" },
            { label: "Blog", to: "/blog" },
            {
              label: "Getting Started Guides",
              to: "/getting-started-guides",
            },
            {
              label: "Reference docs",
              href: "https://docs.educates.dev",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Educates Hub",
              href: "https://hub.educates.dev",
            },
            {
              label: "Slack",
              href: "https://kubernetes.slack.com/archives/C05UWT4SKRV",
            },
            {
              label: "GitHub",
              href: "https://github.com/educates/educates-training-platform",
            },
            {
              label: "YouTube",
              href: "https://www.youtube.com/@EducatesTrainingPlatform",
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
