/**
 * Otel adresi yerelleştirme modülleri
 * 
 * Mekke ve Medine otellerinin adreslerini Türkçe ve
 * kullanıcı dostu formatlara dönüştürür.
 * 
 * @see plans/hotel-address-localization-plan.md
 */

// Adres formatlama fonksiyonları
export {
    formatCityOnly, formatHotelAddress,
    formatSimpleAddress, type FormattedAddress
} from './address-formatter';

// Bölge haritalama veri yapısı
export {
    ALL_REGIONS, findRegionInAddress,
    getRegionsByCity, MADINAH_REGIONS, MAKKAH_REGIONS, type RegionMapping
} from './location-mapping';

// Şehir isimleri Türkçeleştirme
export {
    CITY_NAMES_EN, CITY_NAMES_TR, formatCityName, getCityName,
    turkishifyCityName
} from './city-names';

