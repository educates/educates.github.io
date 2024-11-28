import { useEffect, useRef } from 'react';
// import clsx from 'clsx';
// import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
// import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import Img from '@theme/MDXComponents/Img';
import { initializeItyped } from '../js/ityped';
import { ImageAndText } from '../components/ImageAndText';

// create a list of strings
const educatesHighlights = [
  "Interactive workshop environments in Kubernetes",
  "Open-Source",
  "Secure",
  "Scalable",
  "Extensible",
];

function MainSection({ title }: { title: string }): JSX.Element {
  return (<div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // height: '60vh',
    // fontSize: '20px',
  }}>
    <div id="hero" className="centered-content">
      <Img src="/img/logo.svg"
        alt="Project Logo"
        className="centered-image"
      />
      {/* <Heading as="h1" className="hero__title">
        {title}
      </Heading> */}
      <div className="typing-carousel">
        <span id="ityped" className="ityped ityped-text"></span>
        <span className="ityped-cursor ityped-text"></span>
      </div>
      <ul id="typing-carousel-data" style={{ display: 'none' }}>
        {educatesHighlights.map((feature) => (
          <li>{feature}</li>
        ))}
      </ul>
    </div>
  </div>
  );
}


export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeItyped(educatesHighlights);
  }, []);

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <MainSection title={siteConfig.title} />
      <ImageAndText
        title='Educates Training Platform'
        imageUrl='/img/screenshot.png'
        imageAlt='Educates Training Platform'
        gray={true}
        imageOnTheRight={true}
      >
        The Educates project provides a system for hosting interactive workshop environments in Kubernetes, or on top of a local container runtime. It can be used for self paced or supervised workshops. It can also be useful where you need to package up demos of applications hosted in Kubernetes or a local container runtime.
      </ImageAndText>
    </Layout>
  );
}
