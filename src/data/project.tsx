export type Project = {
    projectGitHubUrl: string;
    contributingUrl: string;
    sponsorshipUrl: string;
    descriptionTitle: string;
    description: string;
    screenshot: string;
    youtubeUrl: string;
};

export const educatesProject: Project =
{
    projectGitHubUrl: "https://github.com/educates/educates-training-platform",
    contributingUrl: "https://github.com/educates/educates-training-platform/blob/develop/CONTRIBUTING.md",
    sponsorshipUrl: "https://github.com/sponsors/educates",
    descriptionTitle: "Interactive Training Platform",
    description: "The Educates project provides a system for hosting interactive workshop environments in Kubernetes,"
                    + "or on top of a local container runtime. It can be used for self paced or supervised workshops."
                    + "It can also be useful where you need to package up demos of applications hosted in Kubernetes"
                    + "or a local container runtime.",
    screenshot: "/img/screenshot.png",
    youtubeUrl: "https://www.youtube.com/@EducatesTrainingPlatform",
};