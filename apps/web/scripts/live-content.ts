// Content extracted (read-only GET) from introyale.com for the one-time local import.
// Text follows the live site; edits are grammar only. Nothing here is invented: unknown details are left out.
// Image alt text is written from what each image shows.

export type ImageDef = { file: string; alt: string }

export const SOURCE = 'introyale.com'

export const FACTS: Record<string, { value: string; note: string }> = {
  address: {
    value:
      'Plot No. C-76, East 2-16, Showroom 03, Al Salam Street, Abu Dhabi, United Arab Emirates',
    note: 'Footer address on introyale.com',
  },
  phone: { value: '+971 52 77 54 585', note: 'Header and footer phone on introyale.com' },
  whatsapp: {
    value: '+971 52 77 54 585',
    note: 'WhatsApp link wa.me/+971527754585 on introyale.com',
  },
  email: { value: 'info@introyale.com', note: 'Header and footer email on introyale.com' },
  sales_email: { value: 'sales@introyale.com', note: 'Contact page on introyale.com' },
  years_in_business: { value: '10+', note: 'Achievements on introyale.com home page' },
  projects_completed: { value: '1050+', note: 'Achievements on introyale.com home page' },
  team_size: { value: '50+', note: 'Achievements on introyale.com home page' },
  awards_count: { value: '10+', note: 'Achievements on introyale.com home page' },
}

export const BUSINESS_HOURS = 'Saturday to Thursday, 9:00 AM to 5:00 PM. Friday: holiday.'

export const SITE = {
  name: 'Introyale Interiors',
  tagline: 'Interiors inspired by innovation.',
  ctaLabel: 'Start a project',
  ctaLink: '/start',
  footerCopy: '© Introyale Interiors. All rights reserved.',
  seoTitleTemplate: '%s · Introyale Interiors',
  seoDescription:
    'Introyale Interiors is a leading interior design company in the UAE for residential, commercial and hospitality & leisure projects.',
  facebook: 'https://www.facebook.com/introyale/',
}

/** Every image used by the import. `logo-*` files are derived from the embedded raster in logo.svg. */
export const IMAGES: ImageDef[] = [
  { file: 'logo-gold.png', alt: 'Introyale Interiors logo' },
  { file: 'logo-white.png', alt: 'Introyale Interiors logo in white' },
  {
    file: 'banner1.jpg',
    alt: 'Classic gilded sofa with turquoise curtains in a cream sitting room',
  },
  { file: 'banner2.jpg', alt: 'Living room with grey sofas, a stone fireplace and tall windows' },
  {
    file: 'banner3.jpg',
    alt: 'Spacious majlis with cream seating, navy curtains and warm ceiling light',
  },
  {
    file: 'banner4.jpg',
    alt: 'Living room with blue and cream sofas, a marble coffee table and a patterned blue rug',
  },
  {
    file: 'slider1.jpg',
    alt: 'Sitting room with carved wooden armchairs, drapes and a marble coffee table',
  },
  {
    file: 'slider2.jpg',
    alt: 'Restaurant with a round yellow tufted banquette around an olive tree',
  },
  {
    file: 'slider3.jpg',
    alt: 'Lounge with cream armchairs under a round pendant light and a timber ceiling',
  },
  {
    file: 'scroll.jpg',
    alt: 'Wide view of a lounge with cream armchairs, a round pendant light and a sea view',
  },
  { file: 'servicebg.jpg', alt: 'Bedroom with brown drapes, an upholstered bed and a sofa set' },
  { file: 'bookbg.jpg', alt: 'Overhead view of a desk with laptops, tablets and notebooks' },
  {
    file: 'rg1.jpg',
    alt: 'Bedroom with a tufted bed, geometric gold panelling and a mirrored coffee table',
  },
  { file: 'rg2.jpg', alt: 'Bay window with navy and cream curtains below a chandelier' },
  { file: 'rg3.jpg', alt: 'Two cream armchairs beside a sash window with a small side table' },
  {
    file: 'p1.jpg',
    alt: 'Living room with a cream sectional sofa, sliding glass doors and white shelving',
  },
  {
    file: 'p2.jpg',
    alt: 'Living room with ornate gilded sofas, armchairs and tall draped windows',
  },
  {
    file: 'p3.jpg',
    alt: 'Bedroom with a tufted bed, geometric gold panelling and curtained windows',
  },
  {
    file: 'p4.jpg',
    alt: 'Staircase landing with an ornate wrought iron balustrade and tall windows',
  },
  {
    file: 'p5.jpg',
    alt: 'Living room with burgundy sofas, round coffee tables and a patterned feature wall',
  },
  { file: 'p6.jpg', alt: 'Terrace lounge with dark wicker sofas and white cushions' },
  { file: 'p7.jpg', alt: 'Wicker dining chairs around a glass-topped table on a stone terrace' },
  { file: 'p8.jpg', alt: 'Café tables with wicker chairs and orange cushions' },
  {
    file: 'p9.jpg',
    alt: 'Dining furniture with orange cushions in a marble-floored foyer with tall windows',
  },
  {
    file: 'p10.jpg',
    alt: 'Waterfront terrace with wicker dining sets, patio heaters and umbrellas',
  },
  { file: 'p11.jpg', alt: 'Terrace seating with a sofa set and potted trees along a walkway' },
  { file: 'p12.jpg', alt: 'Entrance hall with an arched wooden double door and navy curtains' },
  { file: 'cg1.jpg', alt: 'Waterfront terrace dining area with wicker tables and chairs' },
  { file: 'cg2.jpg', alt: 'Outdoor pavilion with palm trees and terrace seating' },
  { file: 'cg3.jpg', alt: 'Terrace table with wicker chairs and green cushions beside the water' },
]

/** 23 client logos (c1 to c23). Names are admin-only and unconfirmed. */
export const CLIENT_LOGOS = Array.from({ length: 23 }, (_, i) => `c${String(i + 1)}.jpg`)

export type SectorDef = {
  slug: string
  title: string
  seoTitle: string
  intro: string
  body: string[]
  hero: string
  banner: string
  dealIntro: string
  services: { title: string; slug: string; text: string }[]
  recentIntro: string
  /** Visual groups of the live gallery; each becomes one neutral project. */
  projects: string[][]
}

const BESPOKE =
  'Introyale Interiors is a revered interior design company that offers bespoke services. With expertise in hospitality & leisure, commercial and residential interior design, we develop innovative design solutions that perfectly blend the functional and aesthetic needs of our clients.'

export const SERVICES_INTRO = BESPOKE

export const SECTORS: SectorDef[] = [
  {
    slug: 'residential',
    title: 'Residential',
    seoTitle: 'Residential interior design in Abu Dhabi, UAE',
    intro:
      'Residential interior design focuses on villas, apartments and clubhouses. It is all about creating a livable space where a family can enjoy and relax.',
    body: [
      "Our finest designers and architects work closely together to create an aesthetic livable space for the clients. Our interior designers offer contemporary, traditional or modern and customized designs to the client's needs.",
      'We create a perfect blend of interiors and lifestyle in every space we design to bring happiness inside your home.',
      'Planning out the interior of a residential space is an extremely intimate process. With significant experience in completing a wide variety of luxurious residential projects, we handle every aspect from conception to completion. We create soothing and comfortable residential spaces with contemporary as well as traditional customized designs. Our technical experts carefully understand your dreams and ensure the delivery of a personalized, aesthetically appealing and livable home. With us, your options to customize your designs are limitless. Whatever your needs are, we make sure that your home looks exactly the way you want.',
    ],
    hero: 'rg3.jpg',
    banner: 'banner2.jpg',
    dealIntro:
      'We deal with luxury and budget-friendly residential interior design solutions. Our experts offer contemporary and customized designs for your homes.',
    services: [
      {
        title: 'Villas & Apartments',
        slug: 'villas-and-apartments',
        text: 'With years of experience and expertise, we offer luxury villas and apartments with a host of world class amenities.',
      },
      {
        title: 'Clubhouses',
        slug: 'clubhouses',
        text: 'Introyale Interiors brings you inspiring and innovative interior design solutions. We offer the finest quality array of clubhouses for our esteemed customers.',
      },
    ],
    recentIntro:
      'Our design experts bring you the latest interior design ideas and solutions to change the outlook of your home completely. Review our recent works of residential interior designs.',
    projects: [
      ['rg1.jpg', 'p3.jpg'],
      ['rg2.jpg', 'p12.jpg'],
      ['p2.jpg', 'p4.jpg', 'slider1.jpg'],
      ['p1.jpg', 'p5.jpg'],
      ['rg3.jpg'],
    ],
  },
  {
    slug: 'commercial',
    title: 'Commercial',
    seoTitle: 'Commercial interior design in Abu Dhabi, UAE',
    intro:
      'Commercial interior design plays a significant role in the success of a business. We deliver premier quality, ergonomic and comfortable commercial spaces that add value to your business and improve the space for the employees who spend time in it.',
    body: [
      'Our trained designers know how to space plan without sacrificing the aesthetics. We apply our architectural designs, creative ideas and technical knowledge to your commercial space, helping you create a successful business in the burgeoning market.',
      'Functional planning is the fundamental part of commercial interior design. Our technical experts and design specialists offer futuristic and elegant design solutions which make your space look great and organized. We create a perfect balance of your functional needs and aesthetic choices. We offer resolved and authentic designs to ensure a world class interior design service for your commercial space. Our technical experts completely understand your business requirements and space plan to set an ambience that motivates the employees and fosters innovation.',
    ],
    hero: 'scroll.jpg',
    banner: 'banner3.jpg',
    dealIntro:
      'We deal with luxury and budget-friendly commercial interior design solutions. Our experts offer authentic and professional designs for your office spaces.',
    services: [
      {
        title: 'Office fitouts & design',
        slug: 'office-fitouts-and-design',
        text: 'We provide our clients with distinctively designed office fitouts and comprehensive office interior designs.',
      },
      {
        title: 'Office furniture & carpets',
        slug: 'office-furniture-and-carpets',
        text: 'We choose the best when we choose the right design and appearance. Introyale Interiors provides a wide range of office furniture and carpets that perfectly blend the functional and aesthetic needs of our clients.',
      },
      {
        title: 'Window blinds & wallpapers',
        slug: 'window-blinds-and-wallpapers',
        text: 'Make wonders in your walls with our unique and exclusive range of wallpapers and extensive shades of blinds.',
      },
    ],
    recentIntro:
      'Our design experts bring you the latest interior design ideas and solutions to change the outlook of your office space completely. Review our recent works of commercial interior designs.',
    projects: [
      ['scroll.jpg', 'slider3.jpg'],
      ['cg1.jpg', 'cg2.jpg', 'cg3.jpg'],
    ],
  },
  {
    slug: 'hospitality-leisure',
    title: 'Hospitality & Leisure',
    seoTitle: 'Hospitality & leisure interior design in the UAE',
    intro:
      'Our architects and interior designers work together to create commercially viable designs. It is vital to create a unique hospitality & leisure interior design as it contributes to increased customer loyalty and helps to improve the business.',
    body: [
      'With many years of experience in interior architecture, we have designed a considerable number of successful ventures through our intelligent design solutions. Starting from concept design to project realization, we ensure luxury and bespoke finish. We offer full refurbishment, fit outs and reupholsteries to bring your hospitality & leisure space to life.',
      "When we design hospitality and leisure projects, our interior design specialists and team will align our expertise with the client's needs to create engaging designs. Understanding and interpreting the client's aesthetic and business needs is the fundamental part of our design process. Our experts design elegant and impressive solutions for our esteemed clients. Working across a wide range of prestigious projects, we are committed to delivering unique designs that emulate our clients' requirements. We ensure that our state of the art designs advance your revenue potential.",
    ],
    hero: 'slider2.jpg',
    banner: 'banner1.jpg',
    dealIntro:
      'We deal with luxury and budget-friendly hospitality & leisure interior design solutions. Our experts offer exclusive and appealing designs for your hospitality & leisure spaces.',
    services: [
      {
        title: 'Restaurant and café furniture',
        slug: 'restaurant-and-cafe-furniture',
        text: 'Dine in style with Introyale Interiors. We offer a wide range of restaurant and café furniture, customized to your design needs.',
      },
      {
        title: 'Guest room and outdoor furniture',
        slug: 'guest-room-and-outdoor-furniture',
        text: 'Give your guests a cosy and spectacular experience with our expertly crafted collections.',
      },
      {
        title: 'Upholsteries and cushions',
        slug: 'upholsteries-and-cushions',
        text: 'When it comes to where to buy classy upholstery and cushions, we are your one-stop solution.',
      },
      {
        title: 'Curtains and blinds',
        slug: 'curtains-and-blinds',
        text: 'Curtains and blinds add so much to the design of a space. We offer a range of shades and styles of curtains and blinds.',
      },
      {
        title: 'Carpets & parquets',
        slug: 'carpets-and-parquets',
        text: 'We deliver premium quality carpets and parquet floorings with world class finishing and style.',
      },
      {
        title: 'Wallpapers',
        slug: 'wallpapers',
        text: 'Immerse yourself in a world of aesthetic and magnificent wallpapers.',
      },
      {
        title: 'Fitouts & carpentry',
        slug: 'fitouts-and-carpentry',
        text: 'We provide bespoke services in carpentry and fitouts. We ensure that the project is completed to the highest standards.',
      },
      {
        title: 'Interior design',
        slug: 'interior-design',
        text: 'Our experts bring about appealing and enduring designs that transform your empty space into an embellishing one. Give a personalized touch to your dream space.',
      },
      {
        title: 'MEP & civil works',
        slug: 'mep-and-civil-works',
        text: 'We are bound and determined to provide highly efficient and accurate MEP and civil works.',
      },
      {
        title: 'Paintings',
        slug: 'paintings',
        text: 'Paintings have a life of their own. We offer an exclusive collection of paintings for our esteemed clients.',
      },
    ],
    recentIntro:
      'Our design experts bring you the latest interior design ideas and solutions to change the outlook of your hospitality & leisure space completely. Review our recent works of hospitality & leisure interior designs.',
    projects: [['slider2.jpg'], ['p7.jpg', 'p8.jpg', 'p9.jpg'], ['p6.jpg', 'p10.jpg', 'p11.jpg']],
  },
]

export const ABOUT = {
  heading: 'Introyale Interiors is a leading interior design company in the UAE',
  paragraphs: [
    'We specialize in interior architecture and provide premier quality interior design solutions to our customers across Hotel and Leisure, Residential and Commercial projects. Our trained executives enrich your space with comfortable and contemporary décor. From the initial planning of the fundamental layout to suggesting the most convenient and embellishing design that suits the space, we deliver a one-stop solution to interior design.',
    "Our proficient designers, architects and experts bring out creative and innovative interior design solutions which transform the outlook of your space as a whole. We are committed to developing unique and abiding design solutions with our exclusive signature collection to meet our clients' requirements.",
  ],
  quality: {
    eyebrow: 'Quality',
    heading: 'We offer the best quality',
    body: 'Be it a home or any other residential venture, an office or any other commercial design, we offer the best of our services. Our highly experienced team of architects, engineers and interior designers deliver complete solutions to our customers with the best quality assurance. We design superior quality interiors for every kind of budget and requirement.',
  },
  customers: {
    eyebrow: 'Customer satisfaction',
    heading: 'Committed to customers',
    body: 'Customers are our first priority. We are insistent on providing exceptional services to our clients. Right from the client brief to the final delivery, our customers will be intimated at every stage. Our dedicated customer care department provides authentic and impeccable services which help us maintain long-term relationships with our clients. Our joint effort and unparalleled customer services make us the most advisable interior design company in the UAE.',
  },
  vision: {
    eyebrow: 'Our vision, mission and plan of action',
    heading: "We think holistically to embrace our client's image",
    body: [
      "Introyale Interiors is committed to providing authentic interior design solutions for residential, commercial, hotel and leisure projects. It is our objective to deliver a truly ingenious space that exceeds our client's expectations.",
      'Our mission is to be a globally recognized interior design company that inspires and elevates our clients with enduring designs. We strive to build a strong and long-term client relationship based on trust, commitment and integrity.',
    ],
  },
}

/** Process steps follow the sequence described in the live About page text. Marked [CONFIRM] in decisions-log. */
export const PROCESS_STEPS = [
  {
    title: 'Client brief',
    body: 'Our customer relationship manager reaches out to the client to understand their design needs.',
  },
  { title: 'Site and ideas', body: 'We explore the site and your design ideas with our experts.' },
  {
    title: 'Layout and design',
    body: 'From the initial planning of the fundamental layout to suggesting the most convenient and embellishing design that suits the space.',
  },
  {
    title: 'Customized solutions',
    body: 'Our dedicated and experienced team offers customized, peerless, one-stop solutions to transform your empty space into an embellishing one.',
  },
  {
    title: 'Delivery within budget',
    body: "We promise a hassle-free interior design consulting experience and timely delivery of the project within the client's budget.",
  },
  {
    title: 'Informed at every stage',
    body: 'Right from the client brief to the final delivery, our customers will be intimated at every stage.',
  },
]

export const HOME = {
  hero: {
    eyebrow: 'Welcome to Introyale Interiors',
    headline: 'Give your home an instant makeover with our exclusive signature collection',
    subhead:
      'Introyale Interiors is a leading interior design company in the UAE. We specialize in interior architecture and provide premier quality interior design solutions to our customers across Hotel and Leisure, Residential and Commercial projects.',
    primary: { label: 'Book Appointment', href: '/start' },
    secondary: { label: 'Explore our work', href: '/work' },
  },
  achievements: {
    eyebrow: 'Our achievements',
    heading: 'It has been a tremendous voyage for Introyale Interiors',
    body: 'We have successfully completed a number of challenging and exciting projects. We are honored to have been selected by so many prestigious companies and expect the same in the long run.',
    labels: {
      years_in_business: 'Years in business',
      projects_completed: 'Projects',
      team_size: 'Team members',
      awards_count: 'Awards',
    },
  },
  work: { eyebrow: 'Portfolio', heading: 'Recent works', viewAll: 'View all projects' },
  sectors: { eyebrow: 'Services we offer', heading: 'Interiors for every kind of space' },
  services: { eyebrow: 'What we deal with', heading: 'Our services', viewAll: 'See all services' },
  process: { eyebrow: 'Plan of action', heading: 'How we work' },
  clients: {
    eyebrow: 'Clients',
    heading: 'Our valuable clients',
    intro:
      "Inspired by our customers' demands and dreams, we offer a great deal of innovative interior designs and exclusive signature collection. Here are some of our happy clients.",
    viewAll: 'View all clients',
  },
  cta: {
    heading: 'Make your room highlighted, more elegant and much more cozy',
    text: 'Live the way you deserve with beautiful spaces.',
    button: { label: 'Get a quote', href: '/start' },
  },
}

export const CONTACT = {
  banner: 'Interiors inspired by innovation.',
  heading: 'Get in touch with us',
  intro:
    'We are here to help you. To get a quote and employ our services or to leave feedback, do contact us. Our team will soon get back to you.',
  formHeading: 'Would you mind dropping in a line?',
  formIntro:
    "Fill in the form and tell us more about you. We'll get back to you within 24 hours from the receipt of your details. Feel free to ask questions, make sales queries and more.",
}

export const CLIENTS_PAGE = {
  heading: 'Our clients',
  intro:
    "Inspired by our customers' demands and dreams, we offer a great deal of innovative interior designs and exclusive signature collection. Here are some of our happy clients.",
}

export const START = {
  heading: 'Book a free consultation',
  intro:
    'We ensure that you get the perfect design for your space. Book a free consultation with our expert interior designer.',
}

export const SEO = {
  home: {
    title: 'Interior design company in UAE | Introyale Interiors',
    description:
      'Introyale Interiors is a leading interior design company in the UAE for residential, commercial and hospitality & leisure projects.',
  },
  studio: {
    title: 'About Introyale Interiors',
    description:
      'A leading interior design company in the UAE specializing in interior architecture for hospitality & leisure, residential and commercial projects.',
  },
  process: {
    title: 'Our process | Introyale Interiors',
    description:
      'From the client brief to the final delivery: how Introyale Interiors plans, designs and delivers interiors within the client budget.',
  },
  clients: {
    title: 'Our clients | Introyale Interiors',
    description:
      'Hotels, developers and organisations that have worked with Introyale Interiors in the UAE.',
  },
  contact: {
    title: 'Contact Introyale Interiors, Abu Dhabi',
    description:
      'Contact Introyale Interiors in Abu Dhabi to get a quote, book a free consultation or leave feedback.',
  },
  work: {
    title: 'Projects | Introyale Interiors',
    description:
      'Residential, commercial and hospitality & leisure interior design projects by Introyale Interiors in the UAE.',
  },
  thanks: {
    title: 'Thank you | Introyale Interiors',
    description: 'Your request has been received by Introyale Interiors.',
  },
  start: {
    title: 'Book a free consultation | Introyale Interiors',
    description:
      'Book a free consultation with an expert interior designer at Introyale Interiors, Abu Dhabi.',
  },
}

export const THANKS = {
  heading: 'Thank you',
  text: 'Thank you for the message. Our team will connect with you shortly.',
}

export const WORK = { eyebrow: 'Portfolio', headline: 'Create. Update. Renovate.' }

export const CLOSING_CTA = {
  heading: 'Get your free expert consultancy',
  buttonLabel: 'Contact now',
  buttonHref: '/contact',
}

export const CONSENT_TEXT = 'I agree that Introyale Interiors may contact me about this enquiry.'
