export interface Company {
    name: string;
    logo: string;
    testimonial: string;
  }
  
  export const companies: Company[] = [
    {
      name: 'Terasky',
      logo: '/img/customers/terasky-logo.svg',
      testimonial: "Educates has transformed how we deliver technical training to our teams.",
    },
    {
      name: 'Broadcom',
      logo: '/img/customers/broadcom-logo.png',
      testimonial: "The platform's flexibility and ease of use have made our workshops much more effective.",
    },
    {
      name: 'Netways',
      logo: '/img/customers/netways-logo.png',
      testimonial: "We've seen a significant improvement in learning outcomes since adopting Educates.",
    },
  ];