// All copy and media below is taken from brightadvt.com. Edits are limited to
// grammar and rhythm; no new claims have been added.

export const contact = {
  phone: "90512 33310",
  phoneHref: "tel:+919051233310",
  email: "contact@brightadvt.com",
  offices: [
    { city: "Kolkata", note: "Head office" },
    { city: "Bengaluru", note: "Now open" },
  ],
};

export const hero = {
  lines: ["Advertising", "made simple"],
  sub: "Ads that brighten your brand and outshine the competition.",
  update: "We are now open in Bengaluru",
  channels: ["Print", "Outdoor", "Television", "Radio", "Social", "Transit"],
};

export const facts = [
  { value: 45, suffix: "+", text: "Years of experience" },
  { value: 210, suffix: "+", text: "Active customers" },
  { value: 1500, suffix: "+", text: "Campaigns executed" },
  { value: 6, suffix: "", text: "Channels under one roof" },
];

// Sectors are read off the client list above.
export const sectors = ["FMCG and food", "Banking", "Insurance", "Infrastructure and steel"];

export const clients = [
  { name: "Life Insurance Corporation of India", src: "logos/lic.webp", w: 480, h: 238 },
  { name: "SBI", src: "logos/sbi.webp", w: 480, h: 165 },
  { name: "ITC Limited", src: "logos/itc.webp", w: 230, h: 240 },
  { name: "Keventer", src: "logos/keventer.webp", w: 480, h: 173 },
  { name: "Sobisco", src: "logos/sobisco.webp", w: 163, h: 200 },
  { name: "Jindal Panther TMT Rebars", src: "logos/panther.webp", w: 480, h: 182 },
  { name: "Patanjali", src: "logos/patanjali.webp", w: 480, h: 116 },
];

export const reasons = [
  {
    title: "Competitive pricing",
    before: "We negotiate the ",
    mark: "best rates",
    after: " for your campaigns without compromising on quality or reach.",
  },
  {
    title: "Multi-channel campaigns",
    before: "We ",
    mark: "coordinate your campaigns",
    after: " across billboards, TV and newspapers to maximise impact for your budget.",
  },
  {
    title: "In-house brand creative team",
    before: "Our in-house creative team ",
    mark: "creates a distinctive brand identity",
    after: " that stands out in every ad.",
  },
];

export type Work = {
  id: string;
  client: string;
  medium: string;
  src: string;
  w: number;
  h: number;
  alt: string;
};

export const work: Work[] = [
  {
    id: "sbi",
    client: "SBI Card",
    medium: "Print campaign",
    src: "img/work-sbi.webp",
    w: 418,
    h: 598,
    alt: "SBI Card ‘Win every hour’ festive print advertisement with an hourglass full of gifts",
  },
  {
    id: "keventer",
    client: "Keventer",
    medium: "Print campaign",
    src: "img/work-keventer.webp",
    w: 420,
    h: 660,
    alt: "Keventer ‘A wide range that’ll bowl over the best’ print advertisement",
  },
  {
    id: "lic",
    client: "Life Insurance Corporation of India",
    medium: "Digital billboard",
    src: "img/work-lic.webp",
    w: 770,
    h: 400,
    alt: "LIC digital billboard on a large roadside hoarding",
  },
  {
    id: "itc",
    client: "ITC",
    medium: "Train and metro",
    src: "img/work-itc.webp",
    w: 600,
    h: 400,
    alt: "Sunfeast Farmlite Digestive branding wrapped across a metro train",
  },
  {
    id: "rollick",
    client: "Rollick Ice-cream",
    medium: "Social media",
    src: "img/work-rollick.webp",
    w: 225,
    h: 225,
    alt: "Rollick ‘Fights a lot, loves a lot more’ Raksha Bandhan social post",
  },
];

// Expanded service copy. PLACEHOLDER detail written from the current site's
// claims (INS accreditation, own hoardings, own production house, Meta and
// Google certification, transit tenders); confirm the specifics with Bright.
export const services = [
  {
    id: "newspaper",
    name: "Newspaper",
    proof: "Accredited with the INS. We work with every newspaper.",
    lead: "INS accreditation means we book every newspaper directly: national dailies, regional editions and language papers.",
    points: ["Front page, jacket and premium positions, negotiated", "Artwork resized to each paper's specs and deadlines", "One plan and one invoice across every edition"],
  },
  {
    id: "billboards",
    name: "Billboards",
    proof: "Our own billboards, in prime locations across Eastern India.",
    lead: "We own hoardings in prime locations across Eastern India, and plan sites wherever else you need to be seen.",
    points: ["Sites chosen for traffic, visibility and audience", "Printing, mounting and upkeep handled by us", "Photo proof of every site once it is live"],
  },
  {
    id: "tv",
    name: "Television",
    proof: "Our own production house for TV commercials.",
    lead: "Our own production house takes a commercial from script to screen, then we plan and buy the airtime.",
    points: ["Script, storyboard and casting", "Shoot, edit and post-production in-house", "Channel and slot planning at negotiated rates"],
  },
  {
    id: "radio",
    name: "Radio",
    proof: "Scriptwriting and strategic media buying, handled end to end.",
    lead: "Scripts that sound right on air, and media buying that puts them in the slots your audience is listening to.",
    points: ["Scripts, jingles and voice casting", "Station and time-slot planning", "RJ mentions and on-ground tie-ins"],
  },
  {
    id: "social",
    name: "Social media",
    proof: "Certified by Meta and Google.",
    lead: "Certified by Meta and Google. We make the content and run the paid campaigns that put it in front of the right people.",
    points: ["Content calendars, posts and short video", "Paid campaigns on Meta and Google", "Regular reporting on reach and results"],
  },
  {
    id: "transit",
    name: "Train, bus and cab",
    proof: "Tender holders for ad spaces in trains and buses.",
    lead: "We hold tenders for ad space in trains and buses, so your brand travels through the city all day.",
    points: ["Train and metro wraps and panels", "Bus exteriors and interiors", "Cab branding for street-level reach"],
  },
] as const;

// How a campaign runs, written from the process the current site describes
// (industry deep dive, negotiated rates, in-house creative, multi-channel).
// PLACEHOLDER copy: confirm the wording with Bright.
export const process = [
  {
    title: "Brief and deep dive",
    text: "We start with your industry: market research into your sector, your audience and the competition.",
  },
  {
    title: "Strategy and media plan",
    text: "The right mix of newspaper, outdoor, TV, radio, social and transit for the budget you have.",
  },
  {
    title: "Creative, in-house",
    text: "Our creative team builds a distinctive brand identity and makes the ads, including TV in our own production house.",
  },
  {
    title: "Negotiate and book",
    text: "We negotiate the best rates and secure the space, from INS newspapers to our own hoardings.",
  },
  {
    title: "Launch and report",
    text: "Campaigns go live across every channel at once, and we report back on what they delivered.",
  },
];

export const voices = [
  {
    quote:
      "We have been working with Bright for over 35 years now. We are very happy with the quality of work and would highly recommend them.",
    name: "Harshil Agarwal",
    role: "Vice President, Sobisco Biscuits",
    src: "img/voice-sobisco.webp",
    w: 600,
    h: 400,
  },
  {
    quote:
      "Bright has helped us with multiple campaigns over the years. We keep coming back to them time and again.",
    name: "Srikanta Chowdhury",
    role: "Director, ITC",
    src: "img/voice-itc.webp",
    w: 318,
    h: 212,
  },
];

export const faqs = [
  {
    q: "What services do you offer?",
    a: [
      "We are a full-suite marketing company.",
      "From television ads to newspaper ads to billboards to social media campaigns, we do it all.",
    ],
  },
  {
    q: "What is your pricing model?",
    a: [
      "We offer flexible pricing models designed to meet diverse needs and budgets: project-based pricing for one-time projects, a monthly retainer for ongoing services, and performance-based pricing that aligns our compensation with the results we deliver.",
    ],
  },
  {
    q: "Do you tailor your strategies to different industries or clients?",
    a: [
      "Absolutely. Our approach begins with a deep dive into your industry.",
      "We conduct thorough market research to understand the nuances of your sector, and combine that insight with our marketing expertise to craft strategies that keep every campaign relevant and effective.",
    ],
  },
  {
    q: "Do you do campaigns across India?",
    a: [
      "Yes. We support campaigns all across India.",
      "We also have offices in Kolkata (HQ) and Bengaluru, in case you want to drop by and say hi.",
    ],
  },
];
