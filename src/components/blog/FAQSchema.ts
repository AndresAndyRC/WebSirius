/**
 * FAQSchema.ts — Generates FAQPage JSON-LD structured data
 * Used by blog posts and FAQ pages for SEO.
 */

export interface FAQ {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
