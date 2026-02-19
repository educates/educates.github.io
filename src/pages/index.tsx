import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Description from '../components/sections/Description';
import Features from '../components/sections/Features';
import UseCases from '../components/sections/UseCases';
import Team from '../components/sections/Team';
import References from '../components/sections/References';
import Pricing from '../components/sections/Pricing';
import FeaturedContent from '../components/sections/FeaturedContent';
import featuredCards from '../data/featuredContent';
export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  var index = 1;

  function getSectionType(index: number) {
    return index % 2 === 0 ? 'odd' : 'even';
  }

  return (
    <Layout
      title="Interactive Workshop Environments on Kubernetes"
      description="Educates provides a system for hosting interactive workshop environments in Kubernetes, or on top of a local container runtime. Use it for self-paced or supervised workshops and application demos.">
      <Head>
        <link rel="canonical" href="https://educates.dev/" />
      </Head>
      <Description sectionType={getSectionType(index++)} />
      <UseCases sectionType={getSectionType(index++)} />
      <Features sectionType={getSectionType(index++)} />
      <Team sectionType={getSectionType(index++)} />
      <Pricing sectionType={getSectionType(index++)} />
      {/* <References sectionType={getSectionType(index++)} /> */}
      <FeaturedContent cards={featuredCards} sectionType={getSectionType(index++)} />
      </Layout>
  );
}
