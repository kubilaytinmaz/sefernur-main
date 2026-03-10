/**
 * SEO Merkezi Kütüphane
 * Tüm SEO fonksiyonlarını ve sabitlerini tek bir noktadan export eder
 */

// Slug Generator
export {
    createCategorySlug, createCitySlug, createSlug, createSlugFromWords, createSlugWithId, createUniqueSlug, extractBaseSlug, extractIdFromSlug, isValidSeoUrl, normalizeSlug, slugToTitle, turkishToEnglish
} from './slug-generator';

// URL Builder
export {
    createBlogUrl, createBookingUrl, createBreadcrumb, createCampaignUrl, createCanonicalUrl, createGuideUrl, createHotelUrl, createListingUrl, createPlaceUrl,
    createTourUrl,
    createTransferUrl, createVisaUrl, STATIC_PAGE_URLS,
    URL_REDIRECT_MAP
} from './url-builder';

// Metadata Generator
export {
    getAboutMetadata, getBlogMetadata,
    getCampaignMetadata, getCancellationMetadata, getContactMetadata, getCookiesMetadata, getErrorMetadata, getFaqMetadata, getGuideMetadata, getHomeMetadata,
    getHotelMetadata, getKvkkMetadata, getListingMetadata, getPlaceMetadata, getPrivacyMetadata, getSearchResultsMetadata, getTermsMetadata, getTourMetadata, getTransferMetadata, getVisaMetadata
} from './metadata-generator';

// Schema Generator
export {
    getAggregateRatingSchema, getArticleSchema,
    getBreadcrumbSchema, getEventSchema, getFAQSchema, getGuideSchema, getHotelSchema, getLocalBusinessSchema, getOrganizationSchema, getPlaceSchema, getProductSchema, getReviewSchema, getTourSchema, getVideoSchema, getWebSiteSchema
} from './schema-generator';

// Constants
export {
    CATEGORY_SLUGS, CITY_SLUGS, META_TEMPLATES, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, SCHEMA_BASE_URL,
    SCHEMA_LOGO_URL, SCHEMA_ORG_DESCRIPTION, SCHEMA_ORG_NAME, SEO_KEYWORDS, SITE_INFO, STOP_WORDS, TITLE_TEMPLATES, TOUR_SEO_KEYWORDS, TURKISH_CHAR_MAP, TWITTER_CARD_TYPE, URL_LIMITS, VEHICLE_SEO_KEYWORDS
} from './constants';

// Types
export type {
    BlogMetadataParams, BlogUrlParams, CampaignUrlParams, GuideMetadataParams, GuideUrlParams, HotelMetadataParams, HotelUrlParams, PlaceMetadataParams, PlaceUrlParams, SchemaArticle, SchemaGuide, SchemaHotel, SchemaOrganization, SchemaPlace, SchemaTour, SEOKeywordCategory,
    SiteInfo, SlugOptions, TourMetadataParams, TourUrlParams, TransferMetadataParams, TransferUrlParams, UrlLimits, VisaUrlParams
} from './types';

