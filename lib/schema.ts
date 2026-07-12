import { BlogPostMeta, DEFAULT_BLOG_AUTHOR_URL } from './blog';
import { GITHUB_ORG_URL, GITHUB_REPO_URL, SITE_DESCRIPTION, SITE_URL, SITE_NAME } from './constants';

export type FAQItem = {
  question: string;
  answer: string;
};

export function generateSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/ytgify-logo.svg`,
        sameAs: [GITHUB_ORG_URL, GITHUB_REPO_URL, 'https://x.com/neonwatty'],
        founder: {
          '@type': 'Person',
          name: 'Jeremy Watt',
          url: 'https://neonwatty.com/',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        applicationCategory: 'MultimediaApplication',
        applicationSubCategory: 'GIF maker',
        operatingSystem: 'Google Chrome',
        browserRequirements: 'Requires Google Chrome with support for unpacked extensions',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        screenshot: `${SITE_URL}/og-image.png`,
        downloadUrl: `${SITE_URL}/downloads/ytgify-v1.0.19-chrome.zip`,
        softwareVersion: '1.0.19',
        author: { '@id': `${SITE_URL}/#organization` },
        featureList: [
          'Convert YouTube videos to GIF',
          'No-watermark GIF export',
          'Browser-only media processing',
          'Custom text overlays',
          'Frame rate and resolution controls',
        ],
      },
    ],
  };
}

export function generateVideoToGifSchema() {
  const url = `${SITE_URL}/video-to-gif`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${url}#application`,
        name: 'YTgify Video to GIF Converter',
        url,
        description:
          'A free, private browser tool for converting local MP4, MOV, and WebM video clips into downloadable animated GIFs.',
        applicationCategory: 'MultimediaApplication',
        applicationSubCategory: 'Video to GIF converter',
        operatingSystem: 'Any',
        browserRequirements: 'Requires a modern browser that can decode the selected local video format',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Local browser video processing',
          'MP4, MOV, and WebM input',
          'Clip trimming up to 10 seconds',
          'Optional top and bottom captions',
          '5, 10, and 15 FPS output',
          '240p, 360p, and 480p output',
          'No-watermark animated GIF download',
        ],
        provider: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name: 'How to convert a video to a GIF',
        totalTime: 'PT2M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Choose a local video',
            text: 'Select an MP4, MOV, or WebM file.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Edit the clip',
            text: 'Trim the moment and add optional captions.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Export the GIF',
            text: 'Create, preview, and download the animated GIF.',
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'YTgify', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Video to GIF Converter', item: url },
        ],
      },
    ],
  };
}

export function generateFAQSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function generateArticleSchema(post: BlogPostMeta & { content?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.thumbnail.startsWith('http') ? post.thumbnail : `${SITE_URL}${post.thumbnail}`,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: {
      '@type': 'Person',
      name: post.author,
      url: DEFAULT_BLOG_AUTHOR_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/ytgify-logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateBlogIndexSchema(posts: BlogPostMeta[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${SITE_NAME} Blog`,
    description: 'Tips, tutorials, and guides for creating GIFs from YouTube videos',
    url: `${SITE_URL}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
      })),
    },
  };
}
