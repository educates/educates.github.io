import React from 'react';
import Layout from '@theme/Layout';
import FeatureCards from '../components/FeaturesCards';
import Heading from '@theme/Heading';

const TITLE = "Project Features";

function FeaturesHeader() {
  return (
    <section className="margin-top--lg margin-bottom--lg text--center">
      <Heading as="h1">{TITLE}</Heading>
    </section>
  );
}

export default function Features() {
  return (
    <Layout
      title={TITLE}
      description="Educates Training Platform Project Features">
      <main className="margin-vert--lg">
        <FeaturesHeader />
        <FeatureCards />
      </main>
    </Layout>
  );
}