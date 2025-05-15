import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
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
      title={`${siteConfig.title}`}
      description="Interactive workshop environments in Kubernetes. Educates provides a system for hosting interactive workshop environments in Kubernetes, or on top of a local container runtime.">
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
