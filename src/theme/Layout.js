import React, { useEffect } from 'react';
import Layout from '@theme-original/Layout';
import { useLocation } from '@docusaurus/router';

export default function LayoutWrapper(props) {
  const location = useLocation();

  useEffect(() => {
    // Add/remove home-navbar-bg based on current path
    if (location.pathname === '/' || location.pathname === '/index.html') {
      document.body.classList.add('home-navbar-bg');
    } else {
      document.body.classList.remove('home-navbar-bg');
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        document.body.classList.add('navbar-bg-transparent');
      } else {
        document.body.classList.remove('navbar-bg-transparent');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <Layout {...props} />;
} 