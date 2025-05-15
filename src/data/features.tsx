import { FaCode, FaGlobe, FaPencilAlt } from "react-icons/fa";

import { IconType } from "react-icons";
import { FaBook, FaDocker, FaExpandArrowsAlt, FaLock, FaPuzzlePiece } from "react-icons/fa";
import { FaCloud } from "react-icons/fa";

export interface FeatureProps {
    title: string;
    description: string;
    icon: IconType;
}


export const features: FeatureProps[] = [
    {
        title: 'Kubernetes Native',
        description: 'Built from the ground up to run natively on Kubernetes, leveraging its powerful features and ecosystem.',
        icon: FaCloud,
    },
    {
        title: 'Secure by Design',
        description: 'Enterprise-grade security with isolated environments and controlled access for each participant.',
        icon: FaLock,
    },
    {
        title: 'Highly Scalable',
        description: 'Scale your training environments effortlessly to accommodate any number of participants.',
        icon: FaExpandArrowsAlt,
    },
    {
        title: 'Extensible Platform',
        description: 'Customize and extend the platform to meet your specific training needs and requirements.',
        icon: FaPuzzlePiece,
    },
    {
        title: 'Local Container Runtime',
        description: 'Run the platform locally using a local container runtime.',
        icon: FaDocker,
    },
    {
        title: 'Self Paced or Supervised',
        description: 'Choose between self-paced or supervised training modes to suit your learning style and needs.',
        icon: FaBook,
    },
    {
        title: 'Developer Friendly',
        description: 'The platform is designed to be developer friendly, with a focus on ease of use and content creation.',
        icon: FaCode,
    },
    {
        title: 'Customizable',
        description: 'Provide your own theme and branding to make the platform your own.',
        icon: FaPencilAlt,
    },
    {
        title: 'Run Anywhere',
        description: 'The platform can be run anywhere, whether it be on a local machine, a cloud provider, or a Kubernetes cluster.',
        icon: FaGlobe,
    },
    {
        title: 'Open Source',
        description: 'The platform is Open Source and free to use and licensed under the Apache 2.0 license.',
        icon: FaCode,
    },
];
