/**
 * SEO Types
 * SEO sistemi için TypeScript tip tanımlamaları
 */

// URL oluşturma parametreleri
export interface HotelUrlParams {
  hotelName: string;
  hotelId: string;
  cityName?: string;
}

export interface GuideUrlParams {
  guideName: string;
  guideId: string;
}

export interface PlaceUrlParams {
  placeName: string;
  placeId: string;
  cityName?: string;
}

export interface TourUrlParams {
  tourName: string;
  tourId: string;
}

export interface TransferUrlParams {
  transferName: string;
  transferId: string;
}

export interface BlogUrlParams {
  title: string;
  id: string;
  category?: string;
}

export interface VisaUrlParams {
  applicantName?: string;
  applicationId: string;
}

export interface CampaignUrlParams {
  campaignName: string;
  campaignId: string;
}

// Slug oluşturma seçenekleri
export interface SlugOptions {
  maxLength?: number;
  removeStopWords?: boolean;
  lowercase?: boolean;
}

// Metadata oluşturma parametreleri
export interface HotelMetadataParams {
  hotelName: string;
  cityName: string;
  stars?: number;
  description?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
}

export interface GuideMetadataParams {
  guideName: string;
  specialties?: string[];
  languages?: string[];
  experience?: number;
  rating?: number;
}

export interface TourMetadataParams {
  tourName: string;
  category?: string;
  duration?: number;
  description?: string;
  price?: number;
  mekkeNights?: number;
  medineNights?: number;
}

export interface PlaceMetadataParams {
  placeName: string;
  cityName: string;
  shortDescription?: string;
  category?: string;
}

export interface TransferMetadataParams {
  from: string;
  to: string;
  vehicleType?: string;
  price?: number;
}

export interface BlogMetadataParams {
  title: string;
  excerpt?: string;
  category?: string;
  publishDate?: string;
  author?: string;
  image?: string;
}

// Schema.org tipleri (daha esnek yapılar için Record kullanımı)
export type SchemaOrganization = Record<string, any>;

export interface SchemaHotel {
  '@type': 'Hotel';
  name: string;
  description: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressCountry: string;
    addressLocality?: string;
  };
  starRating?: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating?: number;
  };
  priceRange?: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  image?: string;
}

export interface SchemaTour {
  '@type': 'TouristTrip';
  name: string;
  description: string;
  touristType: string[];
  duration?: string;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability?: string;
  };
  image?: string;
}

export interface SchemaPlace {
  '@type': 'Place';
  name: string;
  description: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressCountry: string;
    addressLocality?: string;
  };
  additionalType?: string;
  image?: string;
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
}

export interface SchemaGuide {
  '@type': 'Person';
  name: string;
  description?: string;
  knowsLanguage?: string[];
  jobTitle: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
  };
  image?: string;
}

export interface SchemaArticle {
  '@type': 'Article';
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  image?: string;
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage?: {
    '@type': 'WebPage';
    '@id': string;
  };
  articleSection?: string;
}

// SEO anahtar kelime tipleri
export type SEOKeywordCategory = 'general' | 'mekke' | 'medine' | 'otel' | 'transfer' | 'rehber' | 'tur';

// Site bilgileri
export interface SiteInfo {
  name: string;
  title: string;
  description: string;
  url: string;
  ogImage: string;
  twitterHandle?: string;
}

// URL limitleri
export interface UrlLimits {
  maxSlugLength: number;
  maxUrlLength: number;
  maxTitleLength: number;
  maxDescriptionLength: number;
}
