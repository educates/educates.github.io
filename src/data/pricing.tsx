export interface PricingPlan {
    name: string;
    price?: string;
    features: string[];
    isPopular?: boolean;
    isOSS?: boolean;
  }

  export const pricingTitle = 'Pricing';
  export const pricingDescription = 'Just kidding! Educates is free and Open-Source. You can still make your contribution by sponsoring the project, or hire us to help you out!';
  
  export const pricingPlans: PricingPlan[] = [
    {
      name: 'Open Source',
      // price: '0',
      features: [
        'Self-hosted (Install on your own infrastructure)',
        'Community support',
        'Basic features',
        'GitHub repository access',
        'Apache 2.0 License',
        'Free forever',
      ],
      isOSS: true,
      isPopular: true,
    },
    {
      name: 'Sponsored Open Source',
      // price: '0',
      features: [
        'Self-hosted (Install on your own infrastructure)',
        'Premium Community support',
        'Basic features',
        'GitHub repository access',
        'Apache 2.0 License',
        'Free forever',
        'Our love and gratitude',
      ],
      isOSS: true,
      isPopular: false,
    },
    // {
    //   name: 'Free',
    //   price: '0',
    //   features: [
    //     'Up to 10 workshops',
    //     'Basic support',
    //     'Community access',
    //     'Basic analytics',
    //   ],
    // },
    // {
    //   name: 'Professional',
    //   price: '49',
    //   features: [
    //     'Up to 100 workshops',
    //     'Advanced support',
    //     'Advanced analytics',
    //   ],
    // },
    // {
    //   name: 'Enterprise',
    //   price: '299',
    //   features: [
    //     'Everything in Professional',
    //     'White label of site',
    //     'Dedicated support',
    //     'Custom integrations',
    //     'SLA guarantee',
    //     'Dedicated infrastructure',
    //   ],
    // },
    {
      name: 'Consultancy',
      price: 'On request',
      features: [
        'Our time and expertise',
        'Priority support',
        'Priority feature requests',
        'Roadmap influence',
      ],
    },
  ];
  