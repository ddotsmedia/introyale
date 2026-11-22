// Standard legal page text for an interior design company in the UAE, aligned with the UAE Personal Data
// Protection Law (Federal Decree-Law No. 45 of 2021). A template: not legal advice and not yet reviewed by counsel.
// Stored in the CMS by seed-legal.ts and editable in /admin. No business facts are invented here.
export const REVIEW_NOTE =
  'OWNER REVIEW REQUIRED (admin-only, not shown on the site). Standard template aligned with the UAE PDPL (Federal Decree-Law 45 of 2021), not reviewed by legal counsel. Before relying on it, confirm: the legal entity name and registered address, how long enquiries are kept, which service providers process data (hosting, email, analytics), and the cookie and analytics position. Then edit the text here and keep this note until counsel has approved it.'

const CONTACT_LINE =
  'To exercise any of these rights or to ask a question, contact us using the details on our Contact page.'

export const LEGAL = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description:
      'How Introyale Interiors collects, uses and protects personal data, and the rights you have under UAE data protection law.',
    body: [
      'This policy explains how Introyale Interiors ("we", "us") handles personal data collected through this website, in line with the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021).',
      '1. What we collect',
      'When you send an enquiry or request a consultation we collect the details you give us: your name, email address, phone number, project type, location, budget range and any message or files you add. We also record technical data needed to keep the site secure and working, such as your IP address and browser type.',
      '2. Why we use it',
      'We use your details to respond to your enquiry, prepare proposals, schedule consultations, manage our projects and relationship with you, keep the website secure, and meet our legal obligations. We rely on your consent, on steps taken at your request before a contract, and on our legitimate interest in running a secure business.',
      '3. Who receives it',
      'Your data is accessed by our team and by service providers who help us run the website and our communications, such as hosting, email and analytics providers, under written terms that require them to protect it. We do not sell personal data. Where a provider is outside the UAE, we take steps so that your data stays protected as the law requires.',
      '4. How long we keep it',
      'We keep enquiry data only for as long as needed for the purposes above or as the law requires, and then delete or anonymise it.',
      '5. Your rights',
      'You may ask us to confirm whether we hold your personal data and to give you a copy, to correct it, to delete it, to restrict or object to its use, to move it to another provider, and to withdraw your consent at any time. Withdrawing consent does not affect earlier lawful use. You may also complain to the UAE Data Office.',
      CONTACT_LINE,
      '6. Security',
      'We protect personal data with access controls, encryption in transit, secured servers and regular backups. No online system is completely secure, so please do not send sensitive information that we have not asked for.',
      '7. Changes',
      'We may update this policy. The current version is always on this page.',
    ].join('\n\n'),
  },
  {
    slug: 'terms',
    title: 'Terms of Use',
    description: 'The terms that apply when you use the Introyale Interiors website.',
    body: [
      'By using this website you agree to these terms. If you do not agree, please do not use the site.',
      '1. About the site',
      'This website presents the interior design and fit-out work of Introyale Interiors. The information is for general guidance. It is not a quotation or an offer, and any engagement is agreed in a separate written contract.',
      '2. Intellectual property',
      'The text, images, drawings, logos and other material on this site belong to Introyale Interiors or its licensors and are protected by UAE copyright law. You may view the site and share its pages, but you may not copy, modify or use its material commercially without our written permission.',
      '3. Your use of the site',
      'You agree not to misuse the site, attempt to gain unauthorised access, introduce malicious code, or send false or unlawful content through our forms.',
      '4. Accuracy and availability',
      'We take care to keep the site accurate and available, but we give no guarantee that it is complete, current or uninterrupted. Project images are illustrative of the work shown.',
      '5. Links',
      'The site may link to other websites. We are not responsible for their content or privacy practices.',
      '6. Liability',
      'To the extent the law allows, Introyale Interiors is not liable for loss arising from your use of, or inability to use, this website.',
      '7. Governing law',
      'These terms are governed by the laws of the United Arab Emirates, and the competent UAE courts have jurisdiction, unless the law requires otherwise.',
      '8. Contact',
      'Questions about these terms can be sent to us using the details on our Contact page.',
    ].join('\n\n'),
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    description: 'How the Introyale Interiors website uses cookies and similar technologies.',
    body: [
      'Cookies are small files that a website stores in your browser. This page explains how we use them.',
      '1. Essential cookies',
      'The site uses only the storage it needs to work and stay secure, for example to protect forms against spam and to keep our staff signed in to the administration area. These do not need your consent.',
      '2. Analytics',
      'We measure visits with privacy-friendly analytics that do not set cookies on your device and do not build profiles of individual visitors.',
      '3. No advertising cookies',
      'We do not use advertising or cross-site tracking cookies.',
      '4. Your choices',
      'You can delete or block cookies in your browser settings. Blocking essential storage may stop some features, such as forms, from working.',
      '5. Changes',
      'If we add other cookies or tools we will update this page and ask for your consent where the law requires it.',
    ].join('\n\n'),
  },
  {
    slug: 'accessibility',
    title: 'Accessibility Statement',
    description:
      'Our commitment to an accessible Introyale Interiors website and how to report a barrier.',
    body: [
      'Introyale Interiors wants everyone to be able to use this website, including people who use assistive technology.',
      '1. Our standard',
      'We design and test the site to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. This includes keyboard navigation, visible focus, sufficient colour contrast, text alternatives for images, descriptive links and forms with clear labels and error messages. Each release is checked with automated accessibility tests.',
      '2. Known limits',
      'Some older images or documents may lack full descriptions. We are working to fix these as we find them.',
      '3. Tell us about a barrier',
      'If you have trouble using any part of the site, or need information in another format, please contact us using the details on our Contact page. We aim to respond within five working days and to offer an alternative way to get what you need.',
    ].join('\n\n'),
  },
]
