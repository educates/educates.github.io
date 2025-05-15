import React, { useEffect } from 'react';
import Layout from '@theme-original/Layout';
import { useLocation } from '@docusaurus/router';

export default function LayoutWrapper(props) {
  const location = useLocation();

  useEffect(() => {
    // This runs on mount, even before router is ready
    if (location.pathname !== '/' && location.pathname !== '/index.html') {
      document.body.classList.add('navbar-bg-transparent');
    } else {
      document.body.classList.remove('navbar-bg-transparent');
    }
  }, []);

  useEffect(() => {
    // Wait for DOM to be ready
    setTimeout(() => {
      if (location.pathname !== '/' && location.pathname !== '/index.html') {
        document.body.classList.add('navbar-bg-transparent');
      } else {
        document.body.classList.remove('navbar-bg-transparent');
      }
    }, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // Use a lower threshold on mobile
      if (location.pathname === '/' || location.pathname === '/index.html') {
        const isMobile = window.innerWidth <= 600;
        const threshold = isMobile ? 80 : 200;
        if (window.scrollY > threshold) {
          document.body.classList.add('navbar-bg-transparent');
        } else {
          document.body.classList.remove('navbar-bg-transparent');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <Layout {...props} />;
} 