export type Feature = {
    title: string;
    description: string;
    icon?: string | null; // null = use our serverless screenshot service
    link?: string;
    // tags: TagType[];
};

export const allFeatures: Feature[] = [
    {
        title: 'Kubernetes Cloud Native',
        description: "Cloud native application that runs on Kubernetes and provides it’s own CRDs.",
    },
    {
        title: 'Developer Friendly',
        description: "Enables local development environment to be productive from minute zero.",
    },
    {
        title: 'Run on the Cloud',
        description: "Easily installable on most of the major clouds such as GCP, AWS, Azure etc.",
    },
    {
        title: 'Secure Sandbox',
        description: "Provides a secure sandbox for your users to learn safely on a shared cluster.",
    },
    {
        title: 'Unlimited scalability',
        description: "Can scale to thousands of users and workshops without any performance degradation.",
    },
    {
        title: 'Configurable Look and Feel',
        description: "Customize the look and feel of the portals and workshops to fit your own style.",
    },
    {
        title: 'Extensible',
        description: "Extend the basic capabilities to adapt to the technologies that you want to showcase.",
    },
    {
        title: 'Open Source',
        description: "Developed as an open-source project with a great community of developers and users behind.",
    },
    {
        title: 'World class documentation',
        description: "Comprehensive documentation to help you get started and understand the internals.",
        // icon: 'https://docusaurus.io/img/undraw_docusaurus_react.svg',
    },
];