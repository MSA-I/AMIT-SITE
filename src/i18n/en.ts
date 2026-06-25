import type { Dict } from './he';

export const en: Dict = {
  dir: 'ltr',
  langName: 'English',
  switchTo: 'עברית',

  nav: {
    home: 'Home',
    portfolio: 'Portfolio',
    about: 'About',
    process: 'Process',
    services: 'Services',
    contact: 'Contact',
    book: "Let's meet",
  },

  hero: {
    name: 'Amit Bar',
    role: 'Interior Designer',
    intro: 'A boutique studio for interior planning and design - luxury apartments, private homes and commercial spaces.',
    ctaPrimary: "Let's meet",
    ctaSecondary: 'View work',
    scrollHint: 'Scroll',
  },

  about: {
    eyebrow: 'About',
    heading: 'About Amit Bar',
    journey:
      'Every project is a journey of open dialogue with the client. It begins by identifying their personal needs and desires, continues through inspiration and smart planning that reflect their character, and ends in a finished space that is both refined and practical.',
    style:
      'The studio signature is modern and elegant - clean elements, functionality, and a careful connection between materials.',
    valuesHeading: 'We design',
    values: [
      'Service, professionalism and trust',
      'Maximising the space down to the last metre',
      'A designed fingerprint tailored to each client',
    ],
  },

  process: {
    eyebrow: 'How we work',
    heading: 'Our process',
    steps: [
      { n: '01', title: 'First meeting', desc: 'Getting to know each other, shaping the design concept and initial planning.' },
      { n: '02', title: 'Construction plans', desc: 'Selecting the build plan, detailed planning and contractor tendering.' },
      { n: '03', title: 'Material selection', desc: 'Work begins - choosing finishes, textiles and furniture.' },
      { n: '04', title: 'Project supervision', desc: 'Guiding the process and verifying the work is executed to plan.' },
      { n: '05', title: 'Handover', desc: 'Final styling of the space and handing over the keys.' },
    ],
  },

  materials: {
    eyebrow: 'Material language',
    heading: 'Materials for interior design',
    note: 'A quiet dialogue between raw materials - the foundation of every space we design.',
    items: [
      { key: 'concrete', name: 'Concrete' },
      { key: 'wood', name: 'Wood' },
      { key: 'vegetation', name: 'Vegetation' },
      { key: 'brass', name: 'Brass' },
    ],
  },

  services: {
    eyebrow: 'What we do',
    heading: 'Design services',
    groups: [
      {
        title: 'Residential',
        items: ['Modern contractor apartments', 'Luxury apartments', 'Private homes'],
      },
      {
        title: 'Spaces at home',
        items: ['Bedrooms & bathrooms', 'Kitchens & living rooms', 'Modern exteriors'],
      },
      {
        title: 'Commercial',
        items: ['Commercial interiors', 'Offices', 'Coworking spaces', 'Open public spaces'],
      },
    ],
  },

  portfolio: {
    eyebrow: 'Portfolio',
    heading: 'Selected projects',
    subheading: 'Recent work - apartments, private homes and commercial spaces.',
    filters: { all: 'All', residential: 'Residential', spaces: 'Spaces', exterior: 'Exterior' },
    viewProject: 'View project',
    viewAll: 'All projects',
    related: 'More projects',
    photoCount: (n: number) => `${n} photos`,
  },

  testimonials: {
    eyebrow: 'Testimonials',
    heading: 'What clients say',
    items: [
      {
        name: 'Hana',
        quote:
          "I've known Amit for a long time, and it was clear that when I wanted to renovate, she would be the address. I came in with a clear, limited budget. Amit interviewed us, identified our needs and allocated the budget so we never went over. Beyond her professionalism, she stayed close to the contractor and trades throughout. The result is stunning and we're delighted.",
      },
      {
        name: 'Keren',
        quote:
          'We came to Amit after receiving a building permit for an extension, and saw it as a chance to rethink the whole house. Using the space to the maximum mattered to us. Amit listened closely to our vision and brought it to life beautifully, fully involving us at every stage with precise professional guidance.',
      },
      {
        name: 'Barel',
        quote:
          'I came to Amit for design advice before starting the renovation. I had no knowledge and was anxious about the process. Amit guided me from start to the very last detail, explained the pros and cons at each step, and saved me a great deal of money with smart early planning.',
      },
      {
        name: 'Daniel',
        quote:
          'I bought an apartment as an investment and wanted to turn it into a boutique, non-standard design - on a tight timeline. Amit handled the design and home styling, transformed the apartment beyond expectations, raised its value significantly and kept us on schedule.',
      },
    ],
  },

  contact: {
    eyebrow: 'Get in touch',
    heading: "Let's create your new space",
    sub: 'A one-hour consultation - in person or over Zoom. Tell me about the project and I will get back to you.',
    form: {
      name: 'Full name',
      phone: 'Phone',
      email: 'Email',
      projectType: 'Project type',
      projectOptions: ['Apartment', 'Private home', 'Kitchen', 'Commercial space', 'Other'],
      message: 'Message',
      submit: 'Send',
      sending: 'Sending…',
      success: "Thank you! I'll be in touch soon.",
      error: 'Something went wrong. You can reach me on WhatsApp.',
    },
    whatsapp: 'WhatsApp',
    call: 'Call',
    whatsappMessage: "Hi Amit, I'd love to talk about a design project.",
    consultTypes: ['In person', 'Zoom'],
  },

  footer: {
    tagline: 'Interior design - luxury apartments, private homes and commercial spaces.',
    nav: 'Navigation',
    contactHeading: 'Get in touch',
    follow: 'Follow',
    rights: 'All rights reserved',
    privacy: 'Privacy policy',
    accessibility: 'Accessibility statement',
  },

  legal: {
    privacyHeading: 'Privacy policy',
    accessibilityHeading: 'Accessibility statement',
    back: 'Back to home',
  },

  notFound: {
    heading: 'Page not found',
    text: 'The link you requested does not exist.',
    home: 'Back to home',
  },
};
