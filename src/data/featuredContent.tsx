import { FeaturedCardData } from "../components/sections/FeaturedContent";

const featuredCards: FeaturedCardData[] = [
  {
    image: '/img/featured-content/working_locally.jpeg',
    title: 'How to best work locally',
    description: 'When you run Educates locally, it\'s easy to go with the defaults, just create your Educates cluster as explained in the Getting Started on Kind article. But that is not the most optimal workflow. Why?',
    ctaLabel: 'Read blog',
    ctaHref: '/blog/how-to-best-work-locally',
  },
  {
    image: '/img/featured-content/cloud.jpeg',
    title: 'Installing Educates on a cloud provider (Part 1)',
    description: 'Learn how to use the Educates CLI to install Educates Training Platform on a Cloud Provider, and specifically Google Cloud.',
    ctaLabel: 'Read blog',
    ctaHref: '/blog/install-educates-cloud-cli',
  },
  {
    image: '/img/featured-content/cloud.jpeg',
    title: 'Installing Educates on a cloud provider (Part 2)',
    description: 'Verification of the installation of Educates Training Platform on a cloud provider including verification of the platform components and deploy and verify a training portal and workshop',
    ctaLabel: 'Read blog',
    ctaHref: '/blog/verify-educates-cloud-install',
  },
];
export default featuredCards;