import { useSyncExternalStore } from "react";

export type LocationData = {
  address: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  postcode?: string;
  mapUrl?: string;
};

export type Booking = {
  id: string;
  traderId: string;
  serviceId: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // "10:00"
  address: string;
  notes: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed" | "Rejected";
  price?: number;
  clientName?: string;
  clientPhone?: string;
  locationDetails?: {
    street?: string;
    city?: string;
    postcode?: string;
    lat?: number;
    lng?: number;
    accessNotes?: string;
  };
  intake?: {
    problemHeading?: string;
    problemDescription?: string;
    images?: string[];
    urgency?: string;
    accessNotes?: string;
  };
};
export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  at: number;
  read?: boolean;
  type?: "text" | "offer" | "image" | "file" | "booking" | "location" | "review_request";
  reviewRequest?: {
    traderId: string;
    traderName: string;
    status: "pending" | "submitted";
    submittedRating?: number;
    submittedText?: string;
  };
  mediaUrl?: string;
  mediaType?: "image" | "video" | "pdf" | "doc";
  fileName?: string;
  fileSize?: string;
  offerPrice?: string;
  offerStatus?: "pending" | "accepted" | "declined" | "countered";
  counterPrice?: string;
  reactions?: Record<string, number>;
  location?: LocationData;
  bookingDetails?: {
    bookingId?: string;
    serviceName: string;
    price?: number | string;
    date: string;
    time: string;
    address: string;
    clientName: string;
    clientPhone: string;
    notes?: string;
    locationDetails?: {
      street?: string;
      city?: string;
      postcode?: string;
      lat?: number;
      lng?: number;
      accessNotes?: string;
    };
  };
};
export type Business = {
  name: string;
  description: string;
  area: string;
  website: string;
  title?: string;
  category?: string;
  categories?: string[];
  overview?: string;
};
export type LocationSetting = {
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
};

export type PortfolioProject = {
  id: string;
  title: string;
  client: string;
  description: string;
  tag: string;
  banner?: string;
  link?: string;
  metrics?: string;
  date?: string;
  challenge?: string;
  solution?: string;
  deliverables?: string[];
};

export type DynamicReview = {
  id: string;
  traderId: string;
  name: string;
  rating: number;
  when: string;
  text: string;
  serviceTag?: string;
  verifiedBooking?: boolean;
  reply?: string;
  repliedAt?: string;
};

export type CustomService = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price: string;
  category?: string;
};

export type CaseStudyItem = {
  id: string;
  title: string;
  client: string;
  description: string;
  tag: string;
  banner?: string;
  challenge?: string;
  solution?: string;
  cost?: string;
  duration?: string;
  metrics?: string;
  deliverables?: string[];
};

export type GalleryPhoto = {
  id: string;
  url: string;
  label: string;
  tag: string;
};

export type CustomIntakeQuestion = {
  id: string;
  question: string;
  type: "text" | "select" | "boolean";
  required: boolean;
  options?: string[];
};

export type Organization = {
  id: string;
  name: string;
  regNumber: string;
  industry: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  logo?: string;
  description: string;
  memberTraderIds: string[];
  pendingInviteTraderIds: string[];
};

export type OrgInvitation = {
  id: string;
  orgId: string;
  orgName: string;
  orgIndustry: string;
  traderId: string;
  status: "pending" | "accepted" | "declined";
  sentAt: number;
};

export type StoreNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "booking" | "message" | "system" | "verified";
  isRead: boolean;
};

export type BookingFormField = {
  id: string;
  name: string;
  typeLabel: string;
  fieldType: "text" | "longtext" | "image" | "number" | "dropdown" | "date";
  required: boolean;
  enabled: boolean;
  placeholder?: string;
  options?: string[];
};

export type BookingIntakeConfig = {
  enabled: boolean;
  heading: string;
  subheading: string;
  problemHeading: string;
  problemPlaceholder: string;
  problemRequired: boolean;
  enableImageUpload: boolean;
  imageUploadHeading: string;
  imageUploadHelpText: string;
  urgencyPrompt: string;
  urgencyOptions: string[];
  enableAccessNotes: boolean;
  accessNotesHeading: string;
  customQuestions?: CustomIntakeQuestion[];
  formFields?: BookingFormField[];
};

export type ProviderCustomization = {
  showcaseMode: "portfolio" | "gallery";
  pricingMode: "hourly" | "fixed" | "quote";
  hourlyRate: string;
  enableInstantBooking: boolean;
  highlightBadges: string[];
  projects: PortfolioProject[];
  caseStudies?: CaseStudyItem[];
  galleryPhotos?: GalleryPhoto[];
  customServices?: CustomService[];
  intakeConfig: BookingIntakeConfig;
};

type State = {
  bookings: Booking[];
  chats: Record<string, Message[]>;
  saved: string[];
  pinnedChats: string[];
  blockedChats: string[];
  deletedChats: string[];
  profile: Profile;
  business: Business;
  location: LocationSetting;
  userRole: "client" | "provider" | "organization";
  providerCustomization: ProviderCustomization;
  typingStatus: Record<string, boolean>;
  reviews: Record<string, DynamicReview[]>;
  organizations: Organization[];
  orgInvitations: OrgInvitation[];
  activeOrgId?: string;
  reviewedProviders: string[];
  slotReservationModes: Record<string, Record<string, "online" | "offline_reserved" | "blocked">>;
  dailyOnlineLimits: Record<string, number>;
  customTimeSlots?: string[];
  notifications: StoreNotification[];
};

const KEY = "tradely-state-v1";
const seedTimestamp = 1729600000000;
const initial: State = {
  bookings: [
    {
      id: "b-seed1",
      traderId: "sarah-miller",
      serviceId: "deep-clean",
      date: "2026-10-28",
      time: "14:00",
      address: "SW1A 1AA, London",
      notes: "",
      status: "Pending",
    },
    {
      id: "b-seed2",
      traderId: "david-lee",
      serviceId: "electrical-repair",
      date: "2026-10-02",
      time: "11:00",
      address: "SW1A 1AA, London",
      notes: "",
      status: "Completed",
    },
  ],
  chats: {
    "james-wilson": [
      {
        id: "m-seed1",
        from: "them",
        text: "Hi! Thanks for getting in touch. How can I help with your project?",
        at: seedTimestamp,
        read: true,
        type: "text",
      },
    ],
  },
  saved: ["james-wilson"],
  pinnedChats: [],
  blockedChats: [],
  deletedChats: [],
  typingStatus: {},
  profile: {
    name: "Alex Vance",
    email: "alex.vance@example.com",
    phone: "+44 7700 900123",
    address: "Central London, UK",
  },
  business: {
    name: "Zifily Digital & Trade Hub",
    description:
      "Premier verified specialists across digital marketing, web engineering, graphic design, and trusted physical trades.",
    area: "London (10 miles radius)",
    website: "https://zifily.com",
  },
  location: {
    address: "Central London, UK",
    lat: 51.5074,
    lng: -0.1278,
    radiusKm: 15,
  },
  userRole: "client",
  providerCustomization: {
    showcaseMode: "portfolio",
    pricingMode: "hourly",
    hourlyRate: "£75/hr",
    enableInstantBooking: true,
    highlightBadges: ["Verified Pro", "Top Rated 4.98", "Money-back Guarantee"],
    customServices: [
      {
        id: "svc-1",
        name: "Full Stack Web & Cloud Application",
        desc: "End-to-end bespoke React/Node/PostgreSQL software architecture and automated deployment.",
        icon: "Code",
        price: "£1,200",
        category: "Web Developer",
      },
      {
        id: "svc-2",
        name: "Performance Audit & Speed Optimization",
        desc: "Lighthouse 95+ audit, Core Web Vitals, CDN tuning, and query caching.",
        icon: "TrendingUp",
        price: "£450",
        category: "Web Developer",
      },
      {
        id: "svc-3",
        name: "API Integration & Cloud Migration",
        desc: "Microservice integration, AWS/GCP serverless lambdas, and REST/GraphQL gateways.",
        icon: "Database",
        price: "£850",
        category: "Web Developer",
      },
    ],
    galleryPhotos: [
      {
        id: "gal-1",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        label: "Fintech Real-Time Dashboard",
        tag: "Web Developer",
      },
      {
        id: "gal-2",
        url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        label: "Figma Component Design System",
        tag: "UI/UX Design",
      },
      {
        id: "gal-3",
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        label: "High-Converting D2C Checkout",
        tag: "E-Commerce",
      },
      {
        id: "gal-4",
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        label: "Smart Home Automated Wiring",
        tag: "Electrician",
      },
    ],
    caseStudies: [
      {
        id: "cs-1",
        title: "Commercial Grade Boiler Replacement & Smart Heat Pump",
        client: "St. John's Residences (Kensington, London)",
        description:
          "Replaced failing 15-year-old commercial boiler with hybrid A-rated heat pump and smart thermostatic zoned valves.",
        tag: "Boiler Service & Heating",
        banner:
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
        challenge:
          "Winter heating failures across 4 residential suites with erratic water pressure and excessive fuel bills.",
        solution:
          "Installed 42kW Worcester Bosch system with wireless multizone Hive balancing and magnetic sludge filters.",
        duration: "2 Days (Weekend Emergency)",
        cost: "£3,850",
        metrics: "34% lower energy consumption • Gas Safe certified • 10-year warranty",
        deliverables: [
          "Complete decommissioning and safe eco-disposal of old boiler",
          "Power-flush of all 18 radiators with chemical inhibitor",
          "Gas Safe CP12 compliance certification and insurance sign-off",
        ],
      },
      {
        id: "cs-2",
        title: "Luxury Bathroom Wetroom & Anti-Leak Waterproofing",
        client: "Vance Townhouse (Chelsea, London)",
        description:
          "Architectural transformation of a cramped Victorian bathroom into an Italian porcelain walk-in wetroom with rainfall shower.",
        tag: "Plumber & Drainage",
        banner:
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        challenge:
          "Sub-floor timber rot from long-term undetected micro-leaks behind legacy tile grouting.",
        solution:
          "Reinforced marine joists, installed Schluter-KERDI tanking membrane, and concealed thermostatic Grohe mixer valves.",
        duration: "5 Working Days",
        cost: "£5,400",
        metrics: "100% water-tight warranty • Underfloor heating calibrated to 24°C",
        deliverables: [
          "Sub-floor joist leveling and acoustic insulation",
          "Dual-circuit underfloor heating mat installation",
          "Full pressure test at 6 bar with acoustic leak inspection",
        ],
      },
    ],
    intakeConfig: {
      enabled: true,
      heading: "Project Brief & Intake Details",
      subheading:
        "Provide direct specifications and photos so the expert can review scope and arrive prepared.",
      problemHeading: "Describe the Issue or Project Scope",
      problemPlaceholder:
        "Please describe what you need done, existing issues, materials, or special technical requirements...",
      problemRequired: true,
      enableImageUpload: true,
      imageUploadHeading: "Upload Photos, Site Views or Mockups",
      imageUploadHelpText:
        "Upload photos of the current setup, sketches, or error screenshots (JPG, PNG, HEIC up to 25MB)",
      urgencyPrompt: "Required Timeline",
      urgencyOptions: [
        "Flexible (within 1-2 weeks)",
        "Standard (this week)",
        "Urgent (next 24-48 hours)",
        "Emergency / Immediate",
      ],
      enableAccessNotes: true,
      accessNotesHeading: "Access Instructions / Parking / Security",
      customQuestions: [
        {
          id: "cq-1",
          question: "Is there off-street parking or a visitor permit available?",
          type: "select",
          required: false,
          options: [
            "Free Driveway / Allocated Bay",
            "Resident Permit Provided",
            "Pay & Display Meter",
            "No Parking (Requires Van Drop)",
          ],
        },
        {
          id: "cq-2",
          question: "Approximate property age or building type?",
          type: "select",
          required: false,
          options: [
            "Victorian / Edwardian (Pre-1914)",
            "1930s-1970s Semi/Terrace",
            "Modern Build (Post-2000)",
            "Commercial / Office Unit",
          ],
        },
      ],
      formFields: [
        {
          id: "f-1",
          name: "Project name",
          typeLabel: "Short text",
          fieldType: "text",
          required: true,
          enabled: true,
          placeholder: "e.g. Studio website",
        },
        {
          id: "f-2",
          name: "What do you need?",
          typeLabel: "Long text",
          fieldType: "longtext",
          required: true,
          enabled: true,
          placeholder: "Goals, pages, deadline",
        },
        {
          id: "f-3",
          name: "Reference images",
          typeLabel: "Image upload, up to 3",
          fieldType: "image",
          required: false,
          enabled: true,
          placeholder: "Up to 3 images. Optional.",
        },
        {
          id: "f-4",
          name: "Budget range",
          typeLabel: "Dropdown, 4 options",
          fieldType: "dropdown",
          required: false,
          enabled: true,
          options: [
            "₹10,000 to ₹25,000",
            "₹25,000 to ₹50,000",
            "₹50,000 to ₹1,00,000",
            "₹1,00,000+",
          ],
        },
      ],
    },
    projects: [
      {
        id: "p-1",
        title: "Fintech SaaS Real-Time Analytics Terminal",
        client: "Apex Capital Partners (Mayfair, London)",
        description:
          "Engineered an institutional-grade trading dashboard with WebSocket price streaming, multi-pane chart analytics, and high-frequency order routing.",
        tag: "Web Developer",
        banner:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        link: "https://apex-capital-example.co.uk",
        metrics: "+140% user retention • sub-50ms latency • 99.99% uptime",
        date: "Completed October 2026",
        challenge:
          "The client's legacy analytical interface was bottlenecked by slow REST polling and heavy render cycles, causing noticeable UI freeze during market open surges.",
        solution:
          "Architected a reactive frontend stack using React, TypeScript, and WebGL rendering for candlesticks. Implemented multiplexed WebSocket streams with client-side delta compression.",
        deliverables: [
          "Low-latency real-time charting dashboard",
          "Enterprise Role-Based Access Control (RBAC)",
          "Automated test coverage with 96% branch pass rate",
          "Comprehensive design tokens and dark mode UX",
        ],
      },
    ],
  },
  reviews: {
    "james-wilson": [
      {
        id: "rev-seed-1",
        traderId: "james-wilson",
        name: "Marcus Sterling",
        rating: 5,
        when: "Yesterday",
        text: "Arrived right on time for boiler diagnostics. Found the faulty solenoid valve in 20 minutes and had the spare in his van. Immensely skilled and tidy professional.",
        serviceTag: "Gas Safe Boiler Repair",
        verifiedBooking: true,
      },
      {
        id: "rev-seed-2",
        traderId: "james-wilson",
        name: "Lady Eleanor Cavendish",
        rating: 5,
        when: "3 days ago",
        text: "Exceptional standard of craftsmanship. Issued all Gas Safe certificates on the spot through the app. Highly recommended across London.",
        serviceTag: "Annual Boiler Servicing",
        verifiedBooking: true,
      },
    ],
    "alex-chen-dev": [
      {
        id: "rev-seed-3",
        traderId: "alex-chen-dev",
        name: "Harrison Cross",
        rating: 5,
        when: "2 days ago",
        text: "Alex delivered our React dashboard ahead of schedule with zero bugs. Responsive, communicative, and truly top tier engineering.",
        serviceTag: "Full Stack Web Application",
        verifiedBooking: true,
      },
    ],
  },
  organizations: [
    {
      id: "org-apex-guild",
      name: "Apex Master Craftsmen & Engineering Guild",
      regNumber: "GB 921 448 012",
      industry: "Multi-Trade & Building Services",
      contactPerson: "Sir Arthur Sterling",
      contactEmail: "contracts@apexguild.co.uk",
      contactPhone: "+44 20 7946 0912",
      city: "Mayfair, London",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
      description:
        "Chartered consortium of vetted master tradesmen, certified gas engineers, NICEIC electricians, and high-end fitters serving Greater London and the Home Counties.",
      memberTraderIds: ["james-wilson", "david-lee", "thomas-wright"],
      pendingInviteTraderIds: ["sarah-miller", "oliver-hughes"],
    },
    {
      id: "org-london-digital",
      name: "London Premier Tech & Creative Agency Collective",
      regNumber: "GB 883 192 455",
      industry: "Digital, Web & Creative Services",
      contactPerson: "Clara Kensington",
      contactEmail: "hello@londondigitalguild.co.uk",
      contactPhone: "+44 20 7946 0884",
      city: "Shoreditch, London",
      logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
      description:
        "An elite alliance of award-winning UI/UX architects, senior full-stack web developers, digital performance marketers, and brand designers.",
      memberTraderIds: ["alex-chen-dev", "maya-lin-design"],
      pendingInviteTraderIds: ["liam-smith-seo"],
    },
  ],
  orgInvitations: [
    {
      id: "inv-seed-1",
      orgId: "org-apex-guild",
      orgName: "Apex Master Craftsmen & Engineering Guild",
      orgIndustry: "Multi-Trade & Building Services",
      traderId: "james-wilson",
      status: "accepted",
      sentAt: seedTimestamp - 86400000,
    },
    {
      id: "inv-seed-2",
      orgId: "org-london-digital",
      orgName: "London Premier Tech & Creative Agency Collective",
      orgIndustry: "Digital, Web & Creative Services",
      traderId: "james-wilson",
      status: "pending",
      sentAt: seedTimestamp - 3600000,
    },
  ],
  activeOrgId: "org-apex-guild",
  reviewedProviders: [],
  slotReservationModes: {},
  dailyOnlineLimits: {},
  customTimeSlots: [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ],
  notifications: [
    {
      id: "notif-1",
      title: "Booking Confirmed",
      description:
        "Your session with Alex Chen (Full Stack Developer) has been confirmed for tomorrow at 2:00 PM.",
      time: "10 mins ago",
      type: "booking",
      isRead: false,
    },
    {
      id: "notif-2",
      title: "New Message",
      description: "Elena Rostova sent you a design preview link for the landing page project.",
      time: "1 hour ago",
      type: "message",
      isRead: false,
    },
    {
      id: "notif-3",
      title: "Identity & Skills Verified",
      description:
        "Your Zifily professional badge is now active. You are now prioritized in search results.",
      time: "Yesterday",
      type: "verified",
      isRead: true,
    },
  ],
};

let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...initial,
        ...parsed,
        reviews: {
          ...initial.reviews,
          ...(parsed.reviews || {}),
        },
        organizations: parsed.organizations?.length ? parsed.organizations : initial.organizations,
        orgInvitations: parsed.orgInvitations?.length
          ? parsed.orgInvitations
          : initial.orgInvitations,
        customTimeSlots: parsed.customTimeSlots?.length
          ? parsed.customTimeSlots
          : initial.customTimeSlots,
        notifications:
          Array.isArray(parsed.notifications) && parsed.notifications.length
            ? parsed.notifications
            : initial.notifications,
        providerCustomization: {
          ...initial.providerCustomization,
          ...(parsed.providerCustomization || {}),
          intakeConfig: {
            ...initial.providerCustomization.intakeConfig,
            ...(parsed.providerCustomization?.intakeConfig || {}),
            formFields:
              parsed.providerCustomization?.intakeConfig?.formFields ||
              initial.providerCustomization.intakeConfig.formFields,
          },
          customServices:
            parsed.providerCustomization?.customServices ||
            initial.providerCustomization.customServices,
          galleryPhotos:
            parsed.providerCustomization?.galleryPhotos ||
            initial.providerCustomization.galleryPhotos,
          caseStudies:
            parsed.providerCustomization?.caseStudies || initial.providerCustomization.caseStudies,
        },
      };
    }
  } catch (err) {
    console.warn("Could not load state from localStorage", err);
  }
}

export function setState(fn: (s: State) => State) {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Could not save state to localStorage", err);
  }
  listeners.forEach((l) => l());
}

export function hydrateStore() {
  load();
  listeners.forEach((l) => l());
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(state),
    () => sel(initial),
  );
}

export const actions = {
  addBooking(b: Omit<Booking, "id" | "status"> & { status?: Booking["status"] }) {
    const id = "b-" + Math.random().toString(36).slice(2, 8);
    const status: Booking["status"] = b.status || "Pending";
    setState((s) => ({ ...s, bookings: [{ ...b, id, status }, ...s.bookings] }));
    return id;
  },
  acceptBooking(id: string) {
    let booking: Booking | undefined;
    setState((s) => {
      const updated = s.bookings.map((b) => {
        if (b.id === id) {
          booking = { ...b, status: "Confirmed" };
          return booking;
        }
        return b;
      });
      return { ...s, bookings: updated };
    });

    if (booking) {
      if (typeof window !== "undefined") {
        import("./firebase")
          .then(({ updateBookingStatusInFirestore }) => {
            updateBookingStatusInFirestore(id, "Confirmed");
          })
          .catch(() => {});
      }

      const updateMsg = `✅ Booking Request Accepted! The appointment on ${booking.date} at ${booking.time} has been confirmed by the specialist.`;
      actions.send(booking.traderId, {
        text: updateMsg,
        type: "booking",
        bookingDetails: {
          bookingId: booking.id,
          serviceName: booking.serviceId,
          price: booking.price,
          date: booking.date,
          time: booking.time,
          address: booking.address,
          clientName: booking.clientName || "Client",
          clientPhone: booking.clientPhone || "",
          notes: "Confirmed by Specialist",
        },
      });
    }
  },
  rejectBooking(id: string, reason?: string) {
    let booking: Booking | undefined;
    setState((s) => {
      const updated = s.bookings.map((b) => {
        if (b.id === id) {
          booking = { ...b, status: "Rejected" };
          return booking;
        }
        return b;
      });
      return { ...s, bookings: updated };
    });

    if (booking) {
      if (typeof window !== "undefined") {
        import("./firebase")
          .then(({ updateBookingStatusInFirestore }) => {
            updateBookingStatusInFirestore(id, "Rejected");
          })
          .catch(() => {});
      }

      const updateMsg = `❌ Booking Request Declined. The specialist is unable to accept this booking slot.${reason ? ` Reason: ${reason}` : " Please select an alternative date or discuss in chat."}`;
      actions.send(booking.traderId, {
        text: updateMsg,
        type: "text",
      });
    }
  },
  cancelBooking(id: string, cancelledBy: "client" | "provider" = "client") {
    let booking: Booking | undefined;
    setState((s) => {
      const updated = s.bookings.map((b) => {
        if (b.id === id) {
          booking = { ...b, status: "Cancelled" };
          return booking;
        }
        return b;
      });
      return { ...s, bookings: updated };
    });

    if (booking) {
      if (typeof window !== "undefined") {
        import("./firebase")
          .then(({ updateBookingStatusInFirestore }) => {
            updateBookingStatusInFirestore(id, "Cancelled");
          })
          .catch(() => {});
      }

      const actor = cancelledBy === "provider" ? "specialist" : "client";
      const updateMsg = `⚠️ Booking Cancelled. The appointment for ${booking.serviceId} on ${booking.date} at ${booking.time} has been cancelled by the ${actor}.`;
      actions.send(booking.traderId, {
        text: updateMsg,
        type: "text",
      });
    }
  },
  send(traderId: string, payload: string | Partial<Message>) {
    const msgId = "m-" + Math.random().toString(36).slice(2, 9);
    const newMsg: Message =
      typeof payload === "string"
        ? { id: msgId, from: "me", text: payload, at: Date.now(), read: false, type: "text" }
        : {
            id: msgId,
            from: "me",
            text: payload.text || "",
            at: Date.now(),
            read: false,
            type: payload.type || "text",
            mediaUrl: payload.mediaUrl,
            mediaType: payload.mediaType,
            fileName: payload.fileName,
            fileSize: payload.fileSize,
            offerPrice: payload.offerPrice,
            offerStatus: payload.offerStatus,
            counterPrice: payload.counterPrice,
            location: payload.location,
            bookingDetails: payload.bookingDetails,
          };

    setState((s) => ({
      ...s,
      chats: {
        ...s.chats,
        [traderId]: [...(s.chats[traderId] ?? []), newMsg],
      },
    }));

    // Provider marks message as read after 700ms
    setTimeout(() => {
      setState((s) => ({
        ...s,
        chats: {
          ...s.chats,
          [traderId]: (s.chats[traderId] ?? []).map((m) =>
            m.id === msgId ? { ...m, read: true } : m,
          ),
        },
      }));
    }, 700);

    // Trigger real-time typing indicator
    setTimeout(() => {
      if (state.blockedChats.includes(traderId)) return;
      actions.setTypingStatus(traderId, true);
    }, 400);

    // Realistic reply
    setTimeout(() => {
      actions.setTypingStatus(traderId, false);
      if (state.blockedChats.includes(traderId)) return;

      const isOffer = typeof payload !== "string" && payload.type === "offer";
      const isLocation = typeof payload !== "string" && payload.type === "location";
      const replyMsgId = "m-" + Math.random().toString(36).slice(2, 9);
      let reply: Message;

      if (isOffer) {
        reply = {
          id: replyMsgId,
          from: "them",
          text: `Thanks for the offer of ${payload.offerPrice}! I accept your proposed rate. Let's finalize the start date.`,
          at: Date.now(),
          read: true,
          type: "text",
        };
      } else if (isLocation) {
        const addr = payload.location?.address || "your location";
        reply = {
          id: replyMsgId,
          from: "them",
          text: `📍 Got your location! ${addr} is well within my regular service coverage. I can arrive equipped for the job. Would you like to schedule an appointment?`,
          at: Date.now(),
          read: true,
          type: "text",
        };
      } else {
        const replies = [
          "Sounds great! That works for me. When would you like to start?",
          "Thanks for getting in touch! I've reviewed your request and can take this on.",
          "Perfect, I've noted down all details. Let's lock this in!",
          "Great! Do you have any specific files or timeline in mind?",
        ];
        reply = {
          id: replyMsgId,
          from: "them",
          text:
            replies[Math.floor(Math.random() * replies.length)] ??
            "Thanks! I will review and reply shortly.",
          at: Date.now(),
          read: true,
          type: "text",
        };
      }

      setState((s) => ({
        ...s,
        chats: {
          ...s.chats,
          [traderId]: [...(s.chats[traderId] ?? []), reply],
        },
      }));
    }, 1800);
  },
  setTypingStatus(traderId: string, isTyping: boolean) {
    setState((s) => ({
      ...s,
      typingStatus: {
        ...s.typingStatus,
        [traderId]: isTyping,
      },
    }));
  },
  respondToOffer(
    traderId: string,
    msgId: string,
    status: "accepted" | "declined" | "countered",
    counterPrice?: string,
  ) {
    setState((s) => ({
      ...s,
      chats: {
        ...s.chats,
        [traderId]: (s.chats[traderId] ?? []).map((m) =>
          m.id === msgId ? { ...m, offerStatus: status, counterPrice } : m,
        ),
      },
    }));
  },
  toggleReaction(traderId: string, msgId: string, emoji: string) {
    setState((s) => {
      const thread = s.chats[traderId] ?? [];
      const updatedThread = thread.map((m) => {
        if (m.id !== msgId) return m;
        const current = { ...(m.reactions || {}) };
        const currentCount = current[emoji] || 0;
        if (currentCount > 0) {
          // If already reacted with this emoji, toggle it by incrementing or keeping active
          current[emoji] = currentCount + 1;
        } else {
          current[emoji] = 1;
        }
        return { ...m, reactions: current };
      });
      return {
        ...s,
        chats: {
          ...s.chats,
          [traderId]: updatedThread,
        },
      };
    });
  },
  togglePinChat(traderId: string) {
    setState((s) => {
      const isPinned = s.pinnedChats.includes(traderId);
      return {
        ...s,
        pinnedChats: isPinned
          ? s.pinnedChats.filter((id) => id !== traderId)
          : [...s.pinnedChats, traderId],
      };
    });
  },
  toggleBlockChat(traderId: string) {
    setState((s) => {
      const isBlocked = s.blockedChats.includes(traderId);
      return {
        ...s,
        blockedChats: isBlocked
          ? s.blockedChats.filter((id) => id !== traderId)
          : [...s.blockedChats, traderId],
      };
    });
  },
  deleteChatForMe(traderId: string) {
    setState((s) => ({
      ...s,
      deletedChats: [...new Set([...s.deletedChats, traderId])],
      chats: {
        ...s.chats,
        [traderId]: [],
      },
    }));
  },
  markChatAsRead(traderId: string) {
    setState((s) => ({
      ...s,
      chats: {
        ...s.chats,
        [traderId]: (s.chats[traderId] ?? []).map((m) => ({ ...m, read: true })),
      },
    }));
  },
  toggleSaved(id: string) {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
    }));
  },
  updateProfile(p: Profile) {
    setState((s) => ({ ...s, profile: p }));
  },
  updateBusiness(b: Partial<Business>) {
    setState((s) => ({ ...s, business: { ...s.business, ...b } }));
  },
  setLocation(loc: LocationSetting) {
    setState((s) => ({ ...s, location: loc }));
  },
  setUserRole(role: "client" | "provider" | "organization") {
    setState((s) => ({ ...s, userRole: role }));
  },
  setActiveOrgId(orgId: string) {
    setState((s) => ({ ...s, activeOrgId: orgId }));
  },
  hasUserReviewed(traderId: string): boolean {
    return !!state.reviewedProviders?.includes(traderId);
  },
  addReview(
    traderId: string,
    review: { name: string; rating: number; text: string; serviceTag?: string },
  ) {
    if (state.reviewedProviders?.includes(traderId)) {
      return null;
    }
    const revId = "rev-" + Math.random().toString(36).slice(2, 9);
    const newRev: DynamicReview = {
      id: revId,
      traderId,
      name: review.name || state.profile?.name || "Client",
      rating: review.rating,
      when: "Just now",
      text: review.text,
      serviceTag: review.serviceTag,
      verifiedBooking: true,
    };
    setState((s) => ({
      ...s,
      reviewedProviders: [...(s.reviewedProviders || []), traderId],
      reviews: {
        ...s.reviews,
        [traderId]: [newRev, ...(s.reviews[traderId] || [])],
      },
    }));
    return newRev;
  },
  sendReviewCard(traderId: string, traderName?: string) {
    const id = "m-rev-" + Math.random().toString(36).slice(2, 8);
    const msg: Message = {
      id,
      from: "them",
      text: "Please leave your rating and review for this service:",
      at: Date.now(),
      type: "review_request",
      reviewRequest: {
        traderId,
        traderName: traderName || "Specialist Provider",
        status: "pending",
      },
    };
    setState((s) => ({
      ...s,
      chats: {
        ...s.chats,
        [traderId]: [...(s.chats[traderId] || []), msg],
      },
    }));
    return msg;
  },
  submitChatReview(traderId: string, msgId: string, rating: number, text: string) {
    // 1. Submit review
    this.addReview(traderId, {
      name: state.profile?.name || "Client",
      rating,
      text,
      serviceTag: "Verified Appointment",
    });

    // 2. Mark chat card as submitted
    setState((s) => {
      const chatList = s.chats[traderId] || [];
      const updatedChat = chatList.map((m) => {
        if (m.id === msgId && m.reviewRequest) {
          return {
            ...m,
            reviewRequest: {
              ...m.reviewRequest,
              status: "submitted" as const,
              submittedRating: rating,
              submittedText: text,
            },
          };
        }
        return m;
      });
      return {
        ...s,
        chats: {
          ...s.chats,
          [traderId]: updatedChat,
        },
      };
    });
  },
  toggleSlotReservation(date: string, time: string) {
    setState((s) => {
      const dateModes = s.slotReservationModes?.[date] || {};
      const current = dateModes[time] || "online";
      // Cycle: online -> offline_reserved -> blocked -> online
      const nextMode =
        current === "online"
          ? "offline_reserved"
          : current === "offline_reserved"
            ? "blocked"
            : "online";

      return {
        ...s,
        slotReservationModes: {
          ...s.slotReservationModes,
          [date]: {
            ...dateModes,
            [time]: nextMode,
          },
        },
      };
    });
  },
  setDailyOnlineLimit(date: string, limit: number) {
    setState((s) => ({
      ...s,
      dailyOnlineLimits: {
        ...s.dailyOnlineLimits,
        [date]: limit,
      },
    }));
  },
  addOfflineBooking(b: {
    traderId: string;
    serviceId: string;
    date: string;
    time: string;
    address?: string;
    notes?: string;
    price?: number | string;
    clientName: string;
    clientPhone?: string;
  }) {
    const id = "b-off-" + Math.random().toString(36).slice(2, 8);
    const booking: Booking = {
      id,
      traderId: b.traderId,
      serviceId: b.serviceId,
      date: b.date,
      time: b.time,
      address: b.address || "Client Address (Walk-in / Phone)",
      notes: b.notes ? `[Offline/Walk-in]: ${b.notes}` : "[Offline Booking]",
      status: "Confirmed",
      price:
        typeof b.price === "number"
          ? b.price
          : Number(String(b.price || "").replace(/[^\d.]/g, "")) || 95,
      clientName: b.clientName,
      clientPhone: b.clientPhone || "+44 7700 900123",
    };
    setState((s) => ({
      ...s,
      bookings: [booking, ...s.bookings],
    }));
    return booking;
  },
  addCustomService(s: Omit<CustomService, "id">) {
    const id = "svc-" + Math.random().toString(36).slice(2, 7);
    const newService: CustomService = { ...s, id };
    setState((st) => ({
      ...st,
      providerCustomization: {
        ...st.providerCustomization,
        customServices: [...(st.providerCustomization.customServices || []), newService],
      },
    }));
    return newService;
  },
  updateCustomService(id: string, updates: Partial<CustomService>) {
    setState((st) => ({
      ...st,
      providerCustomization: {
        ...st.providerCustomization,
        customServices: (st.providerCustomization.customServices || []).map((s) =>
          s.id === id ? { ...s, ...updates } : s,
        ),
      },
    }));
  },
  deleteCustomService(id: string) {
    setState((st) => ({
      ...st,
      providerCustomization: {
        ...st.providerCustomization,
        customServices: (st.providerCustomization.customServices || []).filter((s) => s.id !== id),
      },
    }));
  },
  addCaseStudy(cs: Omit<CaseStudyItem, "id">) {
    const id = "cs-" + Math.random().toString(36).slice(2, 7);
    const newCS: CaseStudyItem = { ...cs, id };
    setState((st) => ({
      ...st,
      providerCustomization: {
        ...st.providerCustomization,
        caseStudies: [newCS, ...(st.providerCustomization.caseStudies || [])],
      },
    }));
    return newCS;
  },
  deleteCaseStudy(id: string) {
    setState((st) => ({
      ...st,
      providerCustomization: {
        ...st.providerCustomization,
        caseStudies: (st.providerCustomization.caseStudies || []).filter((c) => c.id !== id),
      },
    }));
  },
  addGalleryPhoto(p: Omit<GalleryPhoto, "id">) {
    const id = "gal-" + Math.random().toString(36).slice(2, 7);
    const newPhoto: GalleryPhoto = { ...p, id };
    setState((st) => ({
      ...st,
      providerCustomization: {
        ...st.providerCustomization,
        galleryPhotos: [newPhoto, ...(st.providerCustomization.galleryPhotos || [])],
      },
    }));
    return newPhoto;
  },
  deleteGalleryPhoto(id: string) {
    setState((st) => ({
      ...st,
      providerCustomization: {
        ...st.providerCustomization,
        galleryPhotos: (st.providerCustomization.galleryPhotos || []).filter((p) => p.id !== id),
      },
    }));
  },
  createOrganization(org: Omit<Organization, "id" | "memberTraderIds" | "pendingInviteTraderIds">) {
    const id = "org-" + Math.random().toString(36).slice(2, 8);
    const newOrg: Organization = {
      ...org,
      id,
      memberTraderIds: [],
      pendingInviteTraderIds: [],
    };
    setState((s) => ({
      ...s,
      organizations: [newOrg, ...s.organizations],
      activeOrgId: id,
    }));
    return newOrg;
  },
  inviteProviderToOrg(orgId: string, traderId: string) {
    setState((s) => {
      const org = s.organizations.find((o) => o.id === orgId);
      if (!org) return s;
      if (org.memberTraderIds.includes(traderId) || org.pendingInviteTraderIds.includes(traderId)) {
        return s;
      }
      const updatedOrg = {
        ...org,
        pendingInviteTraderIds: [...org.pendingInviteTraderIds, traderId],
      };
      const newInvite: OrgInvitation = {
        id: "inv-" + Math.random().toString(36).slice(2, 8),
        orgId,
        orgName: org.name,
        orgIndustry: org.industry,
        traderId,
        status: "pending",
        sentAt: Date.now(),
      };
      return {
        ...s,
        organizations: s.organizations.map((o) => (o.id === orgId ? updatedOrg : o)),
        orgInvitations: [newInvite, ...s.orgInvitations],
      };
    });
  },
  respondToOrgInvite(inviteId: string, status: "accepted" | "declined") {
    setState((s) => {
      const inv = s.orgInvitations.find((i) => i.id === inviteId);
      if (!inv) return s;
      const updatedInv = { ...inv, status };
      const updatedOrgs = s.organizations.map((o) => {
        if (o.id === inv.orgId) {
          const newPending = o.pendingInviteTraderIds.filter((id) => id !== inv.traderId);
          const newMembers =
            status === "accepted" && !o.memberTraderIds.includes(inv.traderId)
              ? [...o.memberTraderIds, inv.traderId]
              : o.memberTraderIds;
          return {
            ...o,
            pendingInviteTraderIds: newPending,
            memberTraderIds: newMembers,
          };
        }
        return o;
      });
      return {
        ...s,
        orgInvitations: s.orgInvitations.map((i) => (i.id === inviteId ? updatedInv : i)),
        organizations: updatedOrgs,
      };
    });
  },
  updateProviderCustomization(c: Partial<ProviderCustomization>) {
    setState((s) => ({
      ...s,
      providerCustomization: { ...s.providerCustomization, ...c },
    }));
  },
  updateIntakeConfig(cfg: Partial<BookingIntakeConfig>) {
    setState((s) => ({
      ...s,
      providerCustomization: {
        ...s.providerCustomization,
        intakeConfig: {
          ...s.providerCustomization.intakeConfig,
          ...cfg,
        },
      },
    }));
  },
};

export function fmtTime(t: string) {
  if (!t) return "";
  const isPM = /pm/i.test(t);
  const isAM = /am/i.test(t);
  const parts = clean.split(":").map(Number);
  let h = parts[0] || 0;
  const m = parts[1] || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function timeRange(t: string) {
  if (!t) return "";
  const clean = t.replace(/\s*(am|pm)/gi, "").trim();
  const [h = 0, m = 0] = clean.split(":").map(Number);
  const endH = (h + 1) % 24;
  return `${fmtTime(t)} – ${fmtTime(`${endH}:${m}`)}`;
}
export function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getTraderRatingInfo(
  traderId: string,
  baseRating: number,
  baseReviewsCount: number,
  userReviews: DynamicReview[] = [],
) {
  if (!userReviews.length) {
    return {
      rating: Number(baseRating.toFixed(2)),
      reviewsCount: baseReviewsCount,
      reviews: userReviews,
    };
  }

  const userSum = userReviews.reduce((acc, r) => acc + r.rating, 0);
  const totalSum = baseRating * baseReviewsCount + userSum;
  const totalCount = baseReviewsCount + userReviews.length;
  const avg = totalSum / totalCount;

  return {
    rating: Number(avg.toFixed(2)),
    reviewsCount: totalCount,
    reviews: userReviews,
  };
}

export function isSlotBooked(
  allBookings: Booking[],
  traderId: string,
  date: string,
  time: string,
): boolean {
  return allBookings.some(
    (b) =>
      b.traderId === traderId &&
      b.date === date &&
      b.time === time &&
      b.status !== "Cancelled" &&
      b.status !== "Rejected",
  );
}
