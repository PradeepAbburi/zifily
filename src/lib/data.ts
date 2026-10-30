import james from "@/assets/james.jpg";
import sarah from "@/assets/sarah.jpg";
import david from "@/assets/david.jpg";
import boiler from "@/assets/boiler.jpg";

export const boilerImg = boiler;

export type Service = { id: string; name: string; desc: string; icon: string; price: string };
export type Review = { name: string; rating: number; when: string; text: string };
export type Trader = {
  id: string;
  name: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  distance: number;
  photo: string;
  years: number;
  about: string;
  badges: string[];
  services: Service[];
  reviewList: Review[];
  gallery: { tag: string; hue: number; label: string }[];
};

// Over 50 Verified UK Trade, Cleaning, Motoring, Professional & Digital Categories (6 sections of 10, ending with 'More')
export const categories = [
  // Section 1: Top UK Trades & Heating
  { name: "Gas Safe Engineer", icon: "Flame" },
  { name: "Boiler Service & Repair", icon: "Thermometer" },
  { name: "Sparks (Electrician)", icon: "Zap" },
  { name: "Plumber & Drainage", icon: "ShowerHead" },
  { name: "Handyman & Odd Jobs", icon: "Wrench" },
  { name: "Painter & Decorator", icon: "PaintRoller" },
  { name: "Chippy (Carpenter & Joiner)", icon: "Hammer" },
  { name: "Plasterer & Renderer", icon: "Paintbrush" },
  { name: "Roofer & Guttering", icon: "Home" },
  { name: "Locksmith & Security", icon: "Key" },

  // Section 2: UK Construction, Flooring & Outdoors
  { name: "Bricklayer & Builder", icon: "Boxes" },
  { name: "Tiler & Floor Fitter", icon: "Grid" },
  { name: "Scaffolder", icon: "Building" },
  { name: "Garden Landscaper", icon: "Trees" },
  { name: "Tree Surgeon (Arborist)", icon: "Leaf" },
  { name: "Driveways & Paving", icon: "Sparkles" },
  { name: "Double Glazing & Windows", icon: "AppWindow" },
  { name: "Damp Proofing Specialist", icon: "Droplets" },
  { name: "Air Conditioning & HVAC", icon: "Wind" },
  { name: "Solar Panels & EV Charger", icon: "Sun" },

  // Section 3: UK Cleaning & Domestic Services
  { name: "House & Domestic Cleaner", icon: "SprayCan" },
  { name: "End of Tenancy Cleaning", icon: "Brush" },
  { name: "Carpet & Upholstery Cleaner", icon: "Waves" },
  { name: "Window Cleaner", icon: "Sparkles" },
  { name: "Oven & Appliance Cleaner", icon: "Flame" },
  { name: "Dry Cleaning & Alterations", icon: "Shirt" },
  { name: "Ironing & Laundry Service", icon: "Shirt" },
  { name: "Rubbish Clearance & Skip Hire", icon: "Trash2" },
  { name: "Man with a Van (Removals)", icon: "Truck" },
  { name: "Domestic Appliance Repair", icon: "WashingMachine" },

  // Section 4: UK Digital, Creative & Software
  { name: "Web Developer & Engineer", icon: "Code" },
  { name: "UI/UX & Product Designer", icon: "Layout" },
  { name: "Digital Marketing & PPC", icon: "TrendingUp" },
  { name: "SEO Specialist", icon: "Compass" },
  { name: "Graphic & Brand Designer", icon: "Palette" },
  { name: "Mobile App Developer", icon: "Smartphone" },
  { name: "Software Engineer & SaaS", icon: "Terminal" },
  { name: "IT Support & Cybersecurity", icon: "ShieldCheck" },
  { name: "Copywriter & Content Writer", icon: "FileText" },
  { name: "Video Editor & Videographer", icon: "Video" },

  // Section 5: Motoring, Vehicle & Professional Services
  { name: "MOT & Mechanic", icon: "Car" },
  { name: "Mobile Tyre Fitting", icon: "Disc" },
  { name: "Car Valeting & Detailing", icon: "Sparkles" },
  { name: "Chartered Accountant & Tax", icon: "Calculator" },
  { name: "Bookkeeper & VAT Returns", icon: "Receipt" },
  { name: "Solicitor & Conveyancing", icon: "Scale" },
  { name: "Mortgage Broker & IFA", icon: "Landmark" },
  { name: "Estate Agent & Lettings", icon: "Building2" },
  { name: "Architect & Planning Permission", icon: "Compass" },
  { name: "Interior Designer", icon: "Lamp" },

  // Section 6: Health, Fitness, Pets & Events (Ends with 'More')
  { name: "Personal Trainer & Coach", icon: "Dumbbell" },
  { name: "Sports Massage & Physio", icon: "Activity" },
  { name: "Mobile Barber & Hairdresser", icon: "Scissors" },
  { name: "Dog Walker & Pet Sitter", icon: "PawPrint" },
  { name: "Private Tutor (GCSE & A-Levels)", icon: "GraduationCap" },
  { name: "Driving Instructor (DVSA)", icon: "Compass" },
  { name: "Private Chef & Catering", icon: "Utensils" },
  { name: "Event DJ & Audio Specialist", icon: "Headphones" },
  { name: "Commercial Photographer", icon: "Camera" },
  { name: "More", icon: "LayoutGrid" },
] as const;

const reviewsSample: Review[] = [
  {
    name: "Marcus Vance",
    rating: 5,
    when: "Yesterday",
    text: "Remarkable execution, delivered ahead of schedule with immaculate attention to detail.",
  },
  {
    name: "Sophia Sterling",
    rating: 5,
    when: "3 days ago",
    text: "Highest caliber professional I have worked with on Zifily. Truly outstanding.",
  },
  {
    name: "David K.",
    rating: 5,
    when: "1 week ago",
    text: "Clear communication, clean deliverables, and very collaborative.",
  },
  {
    name: "Elena Ward",
    rating: 4,
    when: "2 weeks ago",
    text: "Very reliable and knowledgeable. Sorted out our needs swiftly.",
  },
];

export const traders: Trader[] = [
  // 1. Web Developer
  {
    id: "alex-chen-dev",
    name: "Alex Chen",
    title: "Senior Full Stack & Cloud Developer",
    category: "Web Developer",
    rating: 4.98,
    reviews: 142,
    distance: 0.6,
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    years: 8,
    about:
      "Modern full-stack web engineer specializing in React, Next.js, Node.js, TypeScript, scalable cloud architecture, and lightning-fast APIs. Over 60 production web apps built.",
    badges: ["Top Rated Plus", "Zifily Verified", "React/Next Certified", "100% Job Success"],
    services: [
      {
        id: "custom-web-app",
        name: "Full Stack Web Application",
        desc: "End-to-end modern web app built with React, TypeScript and robust backend.",
        icon: "Code",
        price: "from £1,200",
      },
      {
        id: "api-backend",
        name: "API & Database Architecture",
        desc: "REST/GraphQL API design, database schemas, and microservice integration.",
        icon: "Database",
        price: "from £600",
      },
      {
        id: "speed-optimization",
        name: "Performance & Core Web Vitals",
        desc: "Lighthouse 95+ audit, page speed boost, caching and code splitting.",
        icon: "Zap",
        price: "from £350",
      },
    ],
    reviewList: reviewsSample,
    gallery: [
      { tag: "SaaS", hue: 210, label: "Analytics Dashboard" },
      { tag: "Fintech", hue: 240, label: "Trading Platform" },
      { tag: "E-Commerce", hue: 190, label: "Modern Checkout" },
    ],
  },

  // 2. Web Designer & UI/UX
  {
    id: "elena-rostova-design",
    name: "Elena Rostova",
    title: "Product & Web Designer",
    category: "Web Designer",
    rating: 4.96,
    reviews: 98,
    distance: 1.1,
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    years: 6,
    about:
      "Award-winning designer crafting minimalist, high-converting websites and digital product experiences in Figma and Framer. Focused on user psychology and brand elevation.",
    badges: ["Framer Expert", "Figma Certified", "D&AD Nominee", "Verified Pro"],
    services: [
      {
        id: "landing-page-design",
        name: "High-Converting Landing Page",
        desc: "Bespoke, typography-driven responsive design designed to turn visitors into buyers.",
        icon: "Layout",
        price: "from £750",
      },
      {
        id: "design-system",
        name: "Full Design System & UI Kit",
        desc: "Complete component library, tokens, dark/light modes and UX patterns.",
        icon: "Layers",
        price: "from £1,100",
      },
      {
        id: "prototype-wireframes",
        name: "Interactive Figma Prototype",
        desc: "Clickable high-fidelity desktop and mobile prototypes with micro-interactions.",
        icon: "Sparkles",
        price: "from £450",
      },
    ],
    reviewList: reviewsSample,
    gallery: [
      { tag: "Web Design", hue: 270, label: "Editorial Landing" },
      { tag: "Mobile UI", hue: 280, label: "Finance App Flow" },
    ],
  },

  // 3. Digital Marketing
  {
    id: "jordan-blake-marketing",
    name: "Jordan Blake",
    title: "Performance Marketing & Growth Lead",
    category: "Digital Marketing",
    rating: 4.92,
    reviews: 86,
    distance: 1.4,
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    years: 7,
    about:
      "Data-driven growth marketer scaling businesses through paid acquisition (Google Ads, Meta, LinkedIn), conversion rate optimization (CRO), and omni-channel funnel strategy.",
    badges: ["Google Premier Partner", "Meta Certified Media Buyer", "£5M+ Ad Spend Managed"],
    services: [
      {
        id: "ppc-campaigns",
        name: "PPC & Google Ads Management",
        desc: "Targeted search, performance max and display campaigns engineered for ROI.",
        icon: "TrendingUp",
        price: "from £500/mo",
      },
      {
        id: "paid-social",
        name: "Meta & TikTok Ad Campaigns",
        desc: "Full ad creative testing, high-converting copy, and audience retargeting.",
        icon: "Megaphone",
        price: "from £650/mo",
      },
    ],
    reviewList: reviewsSample,
    gallery: [
      { tag: "Growth", hue: 140, label: "4.8x ROAS Campaign" },
      { tag: "Analytics", hue: 160, label: "Attribution Setup" },
    ],
  },

  // 4. Graphic Designer
  {
    id: "maya-patel-graphic",
    name: "Maya Patel",
    title: "Brand Identity & Graphic Designer",
    category: "Graphic Designer",
    rating: 4.95,
    reviews: 114,
    distance: 0.9,
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    years: 9,
    about:
      "Specializing in enduring visual identity systems, vector brandmarks, editorial packaging, and distinctive brand aesthetics for forward-thinking enterprises.",
    badges: ["Master of Arts (Design)", "Red Dot Awarded", "Verified Expert"],
    services: [
      {
        id: "logo-identity",
        name: "Complete Brand Identity Suite",
        desc: "Logo mark, color palette, typography guidelines, vector assets and brand book.",
        icon: "Palette",
        price: "from £850",
      },
      {
        id: "marketing-collateral",
        name: "Social & Marketing Assets",
        desc: "Branded social media packs, pitch decks, banners and print materials.",
        icon: "Layers",
        price: "from £350",
      },
    ],
    reviewList: reviewsSample,
    gallery: [{ tag: "Branding", hue: 320, label: "Monogram Identity" }],
  },

  // 5. Dry Cleaning & Garment Care
  {
    id: "prestige-dry-cleaning",
    name: "Prestige Eco Garment Care",
    title: "Master Dry Cleaner & Fabric Conservator",
    category: "Dry Cleaning",
    rating: 4.97,
    reviews: 153,
    distance: 1.0,
    photo:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80",
    years: 12,
    about:
      "Premium non-toxic eco dry cleaning, stain removal, delicate silks, cashmere, wedding gown preservation, and bespoke suit pressing. Same-day collection and door delivery available.",
    badges: ["Guild of Cleaners Certified", "Eco-Clean Organic", "Doorstep Pickup & Return"],
    services: [
      {
        id: "suit-dry-clean",
        name: "2-Piece Suit & Jacket Care",
        desc: "Delicate non-toxic dry clean with hand-finishing and crease setting.",
        icon: "Shirt",
        price: "from £18",
      },
      {
        id: "dress-garment",
        name: "Silk & Evening Dress Cleaning",
        desc: "Specialized gentle solvent treatment for intricate garments, silks and beads.",
        icon: "Sparkles",
        price: "from £26",
      },
      {
        id: "coat-cleaning",
        name: "Winter Overcoat & Cashmere",
        desc: "Deep fabric conditioning, lint removal and moisture protection.",
        icon: "Layers",
        price: "from £22",
      },
    ],
    reviewList: reviewsSample,
    gallery: [
      { tag: "Suits", hue: 210, label: "Wool Suit Press" },
      { tag: "Silk", hue: 280, label: "Bridal Gown Finishing" },
    ],
  },

  // 6. Ironing & Laundry
  {
    id: "clara-ironing-service",
    name: "Clara's Express Ironing & Pressing",
    title: "Professional Ironing & Laundry Specialist",
    category: "Ironing & Laundry",
    rating: 4.93,
    reviews: 89,
    distance: 0.7,
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    years: 6,
    about:
      "Crisp, professional hand-ironing for business shirts, bed linens, trousers, and daily wear. Clothes returned hung or folded in protective covers.",
    badges: ["Steam Station Equipped", "Free Hanger Return", "24-48hr Turnaround"],
    services: [
      {
        id: "shirt-basket-ironing",
        name: "Shirt Bundle (10 Business Shirts)",
        desc: "Crisp collar & cuff press, hung on wire/wooden hangers.",
        icon: "Shirt",
        price: "from £20",
      },
      {
        id: "bedding-ironing",
        name: "Duvet & Sheet Press Service",
        desc: "Hotel-grade steam roller press for king/double sheets and pillowcases.",
        icon: "Sparkles",
        price: "from £15/set",
      },
      {
        id: "hourly-ironing",
        name: "Home Ironing Visit (2 Hours)",
        desc: "Direct in-home service using commercial iron and board.",
        icon: "Clock",
        price: "£36 (2 hrs)",
      },
    ],
    reviewList: reviewsSample,
    gallery: [{ tag: "Ironing", hue: 45, label: "Crisp Business Shirts" }],
  },

  // 7. Mobile App Dev
  {
    id: "sam-taylor-mobile",
    name: "Sam Taylor",
    title: "iOS & Android Cross-Platform Engineer",
    category: "Mobile App Dev",
    rating: 4.94,
    reviews: 79,
    distance: 2.0,
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    years: 6,
    about:
      "Building seamless native and cross-platform mobile apps for iOS and Android using React Native, Expo, and Swift. App Store and Play Store launch specialist.",
    badges: ["Apple Developer Program", "React Native Pro", "15+ Apps Published"],
    services: [
      {
        id: "mobile-mvp",
        name: "Mobile App MVP (iOS & Android)",
        desc: "Complete native-feel app built and packaged for both App Store and Google Play.",
        icon: "Smartphone",
        price: "from £1,800",
      },
      {
        id: "store-publishing",
        name: "App Store Submission & Review",
        desc: "Handling certificates, privacy manifests, guidelines compliance and submission.",
        icon: "ShieldCheck",
        price: "from £300",
      },
    ],
    reviewList: reviewsSample,
    gallery: [{ tag: "Mobile", hue: 200, label: "iOS Widget Flow" }],
  },

  // 8. AI & Automation
  {
    id: "kai-nakamura-ai",
    name: "Kai Nakamura",
    title: "AI Workflows & LLM Integration Specialist",
    category: "AI & Automation",
    rating: 4.99,
    reviews: 63,
    distance: 1.8,
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    years: 5,
    about:
      "Automating complex operations with autonomous agents, LLM integrations (Gemini, Claude, OpenAI), Zapier/Make orchestrations, and custom AI chat assistants.",
    badges: ["AI Systems Architect", "Python & Node Certified", "Zero-Latency Workflows"],
    services: [
      {
        id: "ai-assistant-integration",
        name: "Custom AI Assistant & Knowledge Base",
        desc: "RAG pipeline and intelligent agent trained on your proprietary docs.",
        icon: "Cpu",
        price: "from £900",
      },
      {
        id: "workflow-automation",
        name: "Zapier / Make Business Automation",
        desc: "Connect CRM, invoicing, email and support into zero-touch automated loops.",
        icon: "Sliders",
        price: "from £450",
      },
    ],
    reviewList: reviewsSample,
    gallery: [{ tag: "Automation", hue: 260, label: "Agent Architecture" }],
  },

  // 9. James Wilson (Plumbing & Heating)
  {
    id: "james-wilson",
    name: "James Wilson",
    title: "Plumbing & Heating Specialist",
    category: "Plumbing",
    rating: 4.9,
    reviews: 126,
    distance: 0.8,
    photo: james,
    years: 5,
    about:
      "Reliable and professional plumbing and heating services across London. From emergency repairs to full boiler installations. Gas Safe registered.",
    badges: ["Fully insured", "Gas Safe Registered", "5+ years experience"],
    services: [
      {
        id: "boiler-servicing",
        name: "Boiler Servicing",
        desc: "Keep your boiler safe and efficient",
        icon: "Flame",
        price: "from £80",
      },
      {
        id: "boiler-installation",
        name: "Boiler Installation",
        desc: "Energy efficient boiler installations",
        icon: "Box",
        price: "from £1,800",
      },
      {
        id: "plumbing-repairs",
        name: "Plumbing Repairs",
        desc: "Leaks, blockages, tap repairs and more",
        icon: "Wrench",
        price: "from £60",
      },
    ],
    reviewList: reviewsSample,
    gallery: [
      { tag: "Installations", hue: 220, label: "Combi boiler" },
      { tag: "Repairs", hue: 40, label: "Kitchen tap" },
    ],
  },

  // 10. Sarah Miller (House & Deep Cleaning)
  {
    id: "sarah-miller",
    name: "Sarah Miller",
    title: "Cleaning Specialist",
    category: "House Cleaning",
    rating: 4.8,
    reviews: 93,
    distance: 1.2,
    photo: sarah,
    years: 7,
    about:
      "Spotless home and end-of-tenancy cleaning with eco-friendly products. Trusted by hundreds of London households.",
    badges: ["Fully insured", "DBS checked", "7+ years experience"],
    services: [
      {
        id: "deep-clean",
        name: "Deep Clean",
        desc: "Top-to-bottom home clean",
        icon: "SprayCan",
        price: "from £120",
      },
      {
        id: "end-of-tenancy",
        name: "End of Tenancy",
        desc: "Get your deposit back",
        icon: "Key",
        price: "from £180",
      },
    ],
    reviewList: reviewsSample,
    gallery: [{ tag: "Bathrooms", hue: 200, label: "Deep Clean Detail" }],
  },

  // 11. David Lee (Electrical)
  {
    id: "david-lee",
    name: "David Lee",
    title: "NICEIC Electrician",
    category: "Electrical",
    rating: 4.7,
    reviews: 72,
    distance: 1.5,
    photo: david,
    years: 10,
    about:
      "NICEIC approved electrician. Rewiring, fuse boards, lighting, EV chargers and safety certificates.",
    badges: ["NICEIC approved", "Fully insured", "10+ years experience"],
    services: [
      {
        id: "electrical-repair",
        name: "Electrical Repair",
        desc: "Faults, sockets and switches",
        icon: "Zap",
        price: "from £70",
      },
      {
        id: "ev-charger",
        name: "EV Charger Install",
        desc: "Home charging points",
        icon: "PlugZap",
        price: "from £800",
      },
    ],
    reviewList: reviewsSample,
    gallery: [{ tag: "Electrical", hue: 50, label: "Fuse Board Upgrade" }],
  },

  // 12. Marcus Cole (Handyman & Repairs)
  {
    id: "marcus-handyman",
    name: "Marcus Cole",
    title: "Master Handyman & Maintenance",
    category: "Handyman",
    rating: 4.88,
    reviews: 84,
    distance: 1.1,
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    years: 11,
    about:
      "Expert furniture assembly, TV wall mounting, door adjustments, minor plumbing and electrical fixes. Fast, clean, reliable service.",
    badges: ["All Tools Provided", "DBS Checked", "Public Liability £2M"],
    services: [
      {
        id: "tv-mounting",
        name: "TV Wall Mounting & Cable Concealment",
        desc: "Secure masonry and plasterboard mounting for TVs up to 85 inches.",
        icon: "Wrench",
        price: "from £65",
      },
      {
        id: "flat-pack",
        name: "Flat-Pack Furniture Assembly",
        desc: "IKEA, Wayfair and designer furniture built cleanly and anchored.",
        icon: "Hammer",
        price: "from £45",
      },
    ],
    reviewList: reviewsSample,
    gallery: [{ tag: "Repairs", hue: 30, label: "Fitted Shelving" }],
  },
];

export const getTrader = (id: string) => traders.find((t) => t.id === id);
