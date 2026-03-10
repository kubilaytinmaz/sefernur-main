/**
 * SEO Schema Generator
 * Schema.org JSON-LD yapıları oluşturma fonksiyonları
 */

import { SCHEMA_BASE_URL, SCHEMA_LOGO_URL, SCHEMA_ORG_DESCRIPTION, SCHEMA_ORG_NAME } from './constants';
import type {
    SchemaArticle,
    SchemaGuide,
    SchemaHotel,
    SchemaOrganization,
    SchemaPlace,
    SchemaTour,
} from './types';

// ═══════════════════════════════════════════════════════
//  Organizasyon Schema
// ═══════════════════════════════════════════════════════

/**
 * Organizasyon için Schema.org JSON-LD oluşturur
 */
export function getOrganizationSchema(): SchemaOrganization {
  return {
    '@type': 'Organization',
    name: SCHEMA_ORG_NAME,
    url: SCHEMA_BASE_URL,
    logo: SCHEMA_LOGO_URL,
    description: SCHEMA_ORG_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-XXX-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: ['Turkish', 'English', 'Arabic'],
    },
    sameAs: [
      'https://facebook.com/sefernur',
      'https://instagram.com/sefernur',
      'https://twitter.com/sefernur',
      'https://www.youtube.com/@sefernur',
    ],
  };
}

// ═══════════════════════════════════════════════════════
//  Dinamik Sayfa Schema'ları
// ═══════════════════════════════════════════════════════

/**
 * Otel için Schema.org JSON-LD oluşturur
 */
export function getHotelSchema(params: {
  name: string;
  description: string;
  address: string;
  stars?: number;
  priceRange?: string;
  aggregateRating?: number;
  reviewCount?: number;
  image?: string;
}): SchemaHotel {
  const schema: SchemaHotel = {
    '@type': 'Hotel',
    name: params.name,
    description: params.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address,
      addressCountry: 'SA',
      addressLocality: 'Makkah',
    },
    starRating: {
      '@type': 'Rating',
      ratingValue: params.stars || 5,
      bestRating: 5,
    },
    priceRange: params.priceRange || '$$',
  };
  
  if (params.aggregateRating && params.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: params.aggregateRating,
      reviewCount: params.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  
  if (params.image) {
    schema.image = params.image;
  }
  
  return schema;
}

/**
 * Tur için Schema.org JSON-LD oluşturur
 */
export function getTourSchema(params: {
  name: string;
  description: string;
  duration?: string;
  price?: number;
  image?: string;
  offers?: {
    price: number;
    currency: string;
    availability: string;
  };
}): SchemaTour {
  const schema: SchemaTour = {
    '@type': 'TouristTrip',
    name: params.name,
    description: params.description,
    touristType: ['CulturalTrip', 'ReligiousTrip'],
  };
  
  if (params.duration) {
    schema.duration = params.duration;
  }
  
  if (params.price) {
    schema.offers = {
      '@type': 'Offer',
      price: params.price.toString(),
      priceCurrency: 'TRY',
      availability: params.offers?.availability || 'https://schema.org/InStock',
    };
  }
  
  if (params.image) {
    (schema as any).image = params.image;
  }
  
  return schema;
}

/**
 * Gezilecek yer için Schema.org JSON-LD oluşturur
 */
export function getPlaceSchema(params: {
  name: string;
  description: string;
  address: string;
  city?: string;
  category?: string;
  image?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}): SchemaPlace {
  const schema: SchemaPlace = {
    '@type': 'Place',
    name: params.name,
    description: params.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address,
      addressCountry: 'SA',
      addressLocality: params.city || 'Makkah',
    },
  };
  
  if (params.category) {
    schema.additionalType = params.category;
  }
  
  if (params.image) {
    schema.image = params.image;
  }
  
  if (params.coordinates) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: params.coordinates.lat,
      longitude: params.coordinates.lng,
    };
  }
  
  return schema;
}

/**
 * Rehber için Schema.org JSON-LD oluşturur
 */
export function getGuideSchema(params: {
  name: string;
  description?: string;
  languages?: string[];
  experience?: number;
  rating?: number;
  image?: string;
}): SchemaGuide {
  const schema: SchemaGuide = {
    '@type': 'Person',
    name: params.name,
    description: params.description || 'Profesyonel umre hac rehberi',
    knowsLanguage: params.languages || ['tr', 'ar', 'en'],
    jobTitle: 'Umre Hac Rehberi',
  };
  
  if (params.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: params.rating,
      reviewCount: 1,
      bestRating: 5,
    };
  }
  
  if (params.image) {
    schema.image = params.image;
  }
  
  return schema;
}

/**
 * Blog yazısı için Schema.org JSON-LD oluşturur
 */
export function getArticleSchema(params: {
  title: string;
  description: string;
  publishDate: string;
  author: string;
  image?: string;
  category?: string;
}): SchemaArticle {
  return {
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    datePublished: params.publishDate,
    dateModified: params.publishDate,
    author: {
      '@type': 'Person',
      name: params.author,
    },
    image: params.image || SCHEMA_LOGO_URL,
    publisher: {
      '@type': 'Organization',
      name: SCHEMA_ORG_NAME,
      logo: {
        '@type': 'ImageObject',
        url: SCHEMA_LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SCHEMA_BASE_URL}/blog`,
    },
    ...(params.category && {
      articleSection: params.category,
    }),
  };
}

/**
 * Breadcrumb için Schema.org JSON-LD oluşturur
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SCHEMA_BASE_URL}${item.url}`,
    })),
  };
}

/**
 * FAQ sayfası için Schema.org JSON-LD oluşturur
 */
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Video için Schema.org JSON-LD oluşturur
 */
export function getVideoSchema(params: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  embedUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: params.name,
    description: params.description,
    thumbnailUrl: params.thumbnailUrl,
    uploadDate: params.uploadDate,
    duration: params.duration,
    embedUrl: params.embedUrl,
  };
}

/**
 * LocalBusiness için Schema.org JSON-LD oluşturur
 */
export function getLocalBusinessSchema(params: {
  name: string;
  description: string;
  telephone: string;
  email: string;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  openingHours?: string[];
  priceRange?: string;
}) {
  return {
    '@type': 'TravelAgency',
    name: params.name,
    description: params.description,
    telephone: params.telephone,
    email: params.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address.street,
      addressLocality: params.address.city,
      addressCountry: params.address.country,
      postalCode: params.address.postalCode,
    },
    openingHours: params.openingHours || [
      'Mo-Fr 09:00-18:00',
      'Sa 10:00-16:00',
    ],
    priceRange: params.priceRange || '$$',
    image: SCHEMA_LOGO_URL,
    url: SCHEMA_BASE_URL,
  };
}

/**
 * AggregateRating için Schema.org JSON-LD oluşturur
 */
export function getAggregateRatingSchema(params: {
  itemReviewed: string;
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}) {
  return {
    '@type': 'AggregateRating',
    itemReviewed: params.itemReviewed,
    ratingValue: params.ratingValue,
    reviewCount: params.reviewCount,
    bestRating: params.bestRating || 5,
    worstRating: params.worstRating || 1,
  };
}

/**
 * Review için Schema.org JSON-LD oluşturur
 */
export function getReviewSchema(params: {
  author: string;
  ratingValue: number;
  reviewBody: string;
  itemReviewed: string;
  datePublished: string;
}) {
  return {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: params.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: params.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: params.reviewBody,
    itemReviewed: {
      '@type': 'Thing',
      name: params.itemReviewed,
    },
    datePublished: params.datePublished,
  };
}

/**
   * WebSite için Schema.org JSON-LD oluşturur
   */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SCHEMA_BASE_URL,
    name: SCHEMA_ORG_NAME,
    description: SCHEMA_ORG_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SCHEMA_BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      'https://facebook.com/sefernur',
      'https://instagram.com/sefernur',
      'https://twitter.com/sefernur',
    ],
  };
}

/**
 * Product (otel/tur) için Schema.org JSON-LD oluşturur
 */
export function getProductSchema(params: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: string;
  brand?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  return {
    '@type': 'Product',
    name: params.name,
    description: params.description,
    image: params.image,
    offers: {
      '@type': 'Offer',
      price: params.price,
      priceCurrency: params.currency || 'TRY',
      availability: params.availability || 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: params.brand || SCHEMA_ORG_NAME,
      },
    },
    ...(params.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: params.aggregateRating.ratingValue,
        reviewCount: params.aggregateRating.reviewCount,
      },
    }),
  };
}

/**
 * Event (tur/aktivite) için Schema.org JSON-LD oluşturur
 */
export function getEventSchema(params: {
  name: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address: string;
  };
  description: string;
  image?: string;
  organizer?: string;
  offers?: {
    price: number;
    currency: string;
    availability: string;
  };
}) {
  return {
    '@type': 'Event',
    name: params.name,
    startDate: params.startDate,
    endDate: params.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: params.location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: params.location.address,
        addressCountry: 'SA',
      },
    },
    description: params.description,
    ...(params.image && { image: params.image }),
    ...(params.organizer && {
      organizer: {
        '@type': 'Organization',
        name: params.organizer,
      },
    }),
    ...(params.offers && {
      offers: {
        '@type': 'Offer',
        price: params.offers.price,
        priceCurrency: params.offers.currency,
        availability: params.offers.availability,
      },
    }),
  };
}
