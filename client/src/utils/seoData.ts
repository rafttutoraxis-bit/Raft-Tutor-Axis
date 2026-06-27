// SEO page configurations and structured schema data

export const baseSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://rafttutoraxis.in/#organization",
      "name": "Raft Tutor Axis",
      "url": "https://rafttutoraxis.in",
      "logo": "https://rafttutoraxis.in/Logo.png",
      "email": "support@rafttutoraxis.in",
      "telephone": "+91-6205355760",
      "foundingDate": "2025",
      "areaServed": "India",
      "contactPoint": [
        {
        "@type": "ContactPoint",
        "telephone": "+91-6205355760",
        "contactType": "customer support",
        "areaServed": "IN",
        "availableLanguage": [
          "English",
          "Hindi"
        ]
      }
    ],
      "sameAs": [
        "https://www.facebook.com/rafttutoraxis",
        "https://www.instagram.com/rafttutoraxis",
        "https://www.linkedin.com/company/rafttutoraxis"
      ]
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://rafttutoraxis.in/#educational-organization",
      "name": "Raft Tutor Axis",
      "url": "https://rafttutoraxis.in",
      "logo": "https://rafttutoraxis.in/BG.png",
      "email": "support@rafttutoraxis.in",
      "telephone": "+91-6205355760",
      "foundingDate": "2025",
      "areaServed": "India",
      "knowsAbout": [
        "Home Tuition",
        "Online Tuition",
        "School Teacher Recruitment",
        "Private Tutors"
      ],
      "description": "India's growing verified teacher and home tutor recruitment network."
    },
    {
      "@type": "WebSite",
      "@id": "https://rafttutoraxis.in/#website",
      "url": "https://rafttutoraxis.in",
      "name": "Raft Tutor Axis",
    }
  ]
};

// FAQ Schema
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How to hire a home tutor on Raft Tutor Axis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Parents can click on Register, fill out the Parent Request form with details such as student class, educational board, subjects needed, and preferred tuition mode. An RTA coordinator will contact you and assign a matching vetted tutor within 24 hours."
      }
    },
    {
      "@type": "Question",
      "name": "How to register as a teacher?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Qualified educators can navigate to the Register tab, complete the Teacher Registration wizard, specify teaching subjects, preferred cities, upload their resume/biodata, and create a login password."
      }
    },
    {
      "@type": "Question",
      "name": "What is the teacher verification process?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every teacher in the Raft Tutor Axis network undergoes strict manual credential checks, including identity verification, academic qualification screening, and past references check to ensure maximum trust."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a registration fee for teachers and parents?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Parents can register and request home tuition for free. A small, one-time profile activation fee applies to teachers to join our verified educator network and access teaching inquiries."
      }
    },
    {
      "@type": "Question",
      "name": "Are online tuition modes available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we support both home tuition (physical classroom study) and online tuition classes equipped with interactive digital tools to fit any student's flexibility."
      }
    },
    {
      "@type": "Question",
      "name": "How do schools hire teachers through Raft Tutor Axis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schools and coaching centers can submit their faculty specifications and salary slabs via the School Recruitment inquiry form. We match and forward pre-screened faculty profiles in 24 hours."
      }
    }
  ]
};

// Local Business Schema listing Target Cities
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Raft Tutor Axis",
  "image": "https://rafttutoraxis.in/BG.png",
  "url": "https://rafttutoraxis.in",
  "telephone": "+91-6205355760",
  "email": "support@rafttutoraxis.in",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressRegion": "Bihar"
  },
"openingHours": "Mo-Su 09:00-20:00",
  "areaServed": [
    { "@type": "City", "name": "Patna" },
    { "@type": "City", "name": "Muzaffarpur" },
    { "@type": "City", "name": "Gaya" },
    { "@type": "City", "name": "Darbhanga" },
    { "@type": "City", "name": "Bhagalpur" },
    { "@type": "City", "name": "Lucknow" },
    { "@type": "City", "name": "Varanasi" },
    { "@type": "City", "name": "Prayagraj" },
    { "@type": "City", "name": "Kanpur" },
    { "@type": "City", "name": "Vadodara" },
    { "@type": "City", "name": "Ahmedabad" },
    { "@type": "City", "name": "Surat" },
    { "@type": "City", "name": "Rajkot" }
  ],
  "priceRange": "$$"
};

// SEO page configs mapping
export const pageSeoConfigs = {
  home: {
    title: "Raft Tutor Axis | Best Home Tutor & School Teacher Provider in India",
    description: "Raft Tutor Axis connects parents, schools, coaching institutes and qualified teachers across India. Find trusted home tutors, online tutors and teaching jobs.",
    keywords: "home tutor, tutor near me, home tuition, online tuition, school teacher jobs, teacher vacancy, tutor provider, Raft Tutor Axis, Bihar tutor, Gujarat tutor, Uttar Pradesh tutor",
    canonicalUrl: "https://rafttutoraxis.in/",
    schemaData: [baseSchema, localBusinessSchema]
  },
  about: {
    title: "About Us | Raft Tutor Axis - Verified Academic Teacher Network",
    description: "Learn more about Raft Tutor Axis, India's premier vetted educator network linking qualified home tutors, online teachers, and schools across major cities.",
    keywords: "about raft tutor axis, tutor network, verified educators, home teacher company, school teacher providers",
    canonicalUrl: "https://rafttutoraxis.in/about",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rafttutoraxis.in/" },
        { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://rafttutoraxis.in/about" }
      ]
    }
  },
  services: {
    title: "Our Services | Home Tuition, Online Classes & School Recruitment",
    description: "Explore our comprehensive educational services including physical home tuitions, customized online live lessons, and professional school faculty placement.",
    keywords: "home tuition service, school teacher hiring, online live tutoring, coaching institute faculty recruitment",
    canonicalUrl: "https://rafttutoraxis.in/services",
    schemaData: [faqSchema]
  },
  register: {
    title: "Register | Join as Parent, Teacher or School | Raft Tutor Axis",
    description: "Get matched with vetted academic specialists or post teaching vacancies. Join as a Parent, register as an Educator, or submit a School requirement form.",
    keywords: "teacher registration, school teacher vacancy, parent home tutor request, register for tuition",
    canonicalUrl: "https://rafttutoraxis.in/register",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rafttutoraxis.in/" },
        { "@type": "ListItem", "position": 2, "name": "Register", "item": "https://rafttutoraxis.in/register" }
      ]
    }
  },
  founders: {
    title: "Founders | Raft Tutor Axis - Guided by Visionary Leadership",
    description: "Meet the executive team behind Raft Tutor Axis directing school educator recruitment and strategic home tuition services across Bihar, UP, and Gujarat.",
    keywords: "raft tutor axis leadership, founders, operational managers, education network leaders",
    canonicalUrl: "https://rafttutoraxis.in/founders",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rafttutoraxis.in/" },
        { "@type": "ListItem", "position": 2, "name": "Founders", "item": "https://rafttutoraxis.in/founders" }
      ]
    }
  },
  contact: {
    title: "Contact Us | Raft Tutor Axis Help Desk & Phone Helpline",
    description: "Get in touch with Raft Tutor Axis. Contact our support team for home tutor booking, teacher application inquiries, and school recruitment helplines.",
    keywords: "contact raft tutor axis, helpline phone, tutor support, school recruitment support email",
    canonicalUrl: "https://rafttutoraxis.in/contact",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rafttutoraxis.in/" },
        { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://rafttutoraxis.in/contact" }
      ]
    }
  }
};
