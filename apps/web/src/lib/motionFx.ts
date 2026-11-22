// Every motion effect the public site can show. Each one has a switch in the "Motion settings" global (CMS), so
// editors can turn any effect, or all of them, on or off without a rebuild. Keys are used as data-fx tokens in CSS.
export const FX = [
  ['heroSlideshow', 'Hero slideshow (Ken Burns + crossfade)'],
  ['headlineReveal', 'Headline reveal and staggered hero text'],
  ['scrollCue', 'Animated scroll cue'],
  ['pageTransitions', 'Page transitions (View Transitions)'],
  ['header', 'Header: blur, shrink, hide on scroll down'],
  ['mobileMenu', 'Mobile menu: staggered links and image crossfade'],
  ['magnetic', 'Magnetic buttons with fill sweep'],
  ['imageReveals', 'Image reveals (clip-path wipe)'],
  ['parallax', 'Parallax depth'],
  ['headingReveals', 'Section heading masked reveal and drawing eyebrow'],
  ['statement', 'Statement: word-by-word colour fill'],
  ['countUp', 'Stats count-up with drawn underline'],
  ['processLine', 'Process connector line'],
  ['horizontalGallery', 'Pinned horizontal gallery'],
  ['curtain', 'Footer curtain reveal'],
  ['cards', 'Project cards: text slide-up and cursor bubble'],
  ['servicesFloat', 'Services: floating image following the cursor'],
  ['sectorPanels', 'Sector tiles: expanding panels'],
  ['marquee', 'Client logo marquee'],
  ['beforeAfterHint', 'Before/after handle hint'],
  ['blurUp', 'Blur-up image placeholders'],
  ['lightbox', 'Lightbox zoom, pan and swipe'],
  ['caseStudy', 'Case study: sticky image column and progress bar'],
  ['notFound', 'Animated 404'],
  ['formSteps', 'Form step transitions'],
  ['backToTop', 'Back-to-top button with progress ring'],
] as const

export type FxKey = (typeof FX)[number][0]
export const INTENSITIES = ['subtle', 'standard', 'expressive'] as const
export type Intensity = (typeof INTENSITIES)[number]
