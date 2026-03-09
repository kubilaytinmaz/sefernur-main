import { BlogModel } from "@/types/blog";
import { CampaignModel } from "@/types/campaign";
import { FavoriteItem, FavoriteMeta, FavoriteTargetType } from "@/types/favorite";
import { GuideModel, ServiceAddress } from "@/types/guide";
import { PlaceCity, PlaceModel } from "@/types/place";
import { UserReview } from "@/types/review";
import { DailyProgram, TourModel } from "@/types/tour";
import { TransferModel, VehicleAmenity, VehicleType } from "@/types/transfer";
import { VisaApplicationModel } from "@/types/visa";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
    Timestamp,
    where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./config";

function asDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return ((value as { toDate: () => Date }).toDate as () => Date)();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function sortByCreatedAtDesc<T extends { createdAt?: Date }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt?.getTime() ?? 0;
    const bTime = b.createdAt?.getTime() ?? 0;
    return bTime - aTime;
  });
}

async function fetchCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  map: (id: string, data: Record<string, unknown>) => T,
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) =>
    map(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
}

export interface TransferListItem {
  id: string;
  vehicleType: string;
  price: number;
  capacity: number;
  company: string;
  isActive: boolean;
  fromAddress: string;
  toAddress: string;
  createdAt?: Date;
}

function mapTransferDoc(id: string, data: Record<string, unknown>): TransferModel {
  const fromAddressRaw = data.fromAddress;
  const toAddressRaw = data.toAddress;
  
  function parseAddress(raw: unknown): import("@/types/address").AddressModel {
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as Record<string, unknown>;
      return {
        address: readString(obj.address) || undefined,
        city: readString(obj.city) || undefined,
        country: readString(obj.country) || undefined,
        countryCode: readString(obj.countryCode) || undefined,
        state: readString(obj.state) || undefined,
        location: obj.location && typeof obj.location === "object"
          ? obj.location as import("@/types/address").LatLng
          : undefined,
      };
    }
    if (typeof raw === "string" && raw) {
      return { address: raw };
    }
    return { address: "-" };
  }

  const validVehicleTypes: VehicleType[] = ["sedan", "van", "bus", "vip", "jeep", "coster"];
  const rawVehicle = readString(data.vehicleType);
  const vehicleType: VehicleType = validVehicleTypes.includes(rawVehicle as VehicleType)
    ? (rawVehicle as VehicleType)
    : "sedan";

  return {
    id,
    vehicleType,
    vehicleName: readString(data.vehicleName),
    basePrice: readNumber(data.basePrice || data.price),
    capacity: readNumber(data.capacity || data.maxPassengers),
    luggageCapacity: readNumber(data.luggageCapacity),
    childSeatCount: readNumber(data.childSeatCount),
    amenities: readStringArray(data.amenities) as VehicleAmenity[],
    durationMinutes: readNumber(data.durationMinutes),
    company: readString(data.company),
    phone: readString(data.phone || data.contactPhone) || undefined,
    email: readString(data.email || data.contactEmail) || undefined,
    whatsapp: readString(data.whatsapp || data.contactWhatsapp) || undefined,
    rating: readNumber(data.rating),
    reviewCount: readNumber(data.reviewCount),
    images: readStringArray(data.images),
    isActive: readBoolean(data.isActive, true),
    isPopular: readBoolean(data.isPopular),
    fromAddress: parseAddress(fromAddressRaw),
    toAddress: parseAddress(toAddressRaw),
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

export interface CarListItem {
  id: string;
  brand: string;
  model: string;
  dailyPrice: number;
  seats: number;
  transmission: string;
  fuelType: string;
  images: string[];
  isActive: boolean;
  createdAt?: Date;
}

export interface GuideListItem {
  id: string;
  name: string;
  specialty: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  city: string;
  isActive: boolean;
  createdAt?: Date;
}

function readServiceAddresses(value: unknown): ServiceAddress[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      address: readString(item.address),
      city: readString(item.city),
      country: readString(item.country),
      state: readString(item.state),
    }));
}

function mapGuideDoc(id: string, data: Record<string, unknown>): GuideModel {
  const addressModel =
    (data.addressModel as { city?: unknown } | undefined) || {};
  const serviceAddresses = readServiceAddresses(data.serviceAddresses);

  // Legacy regions → serviceAddresses fallback
  if (serviceAddresses.length === 0 && Array.isArray(data.regions)) {
    const legacyRegions = readStringArray(data.regions);
    legacyRegions.forEach((r) =>
      serviceAddresses.push({ address: r, city: r, country: "", state: r }),
    );
  }

  const firstServiceCity =
    serviceAddresses.length > 0 ? serviceAddresses[0].city : "";

  return {
    id,
    name: readString(data.name) || "Rehber",
    bio: readString(data.bio || data.description),
    specialties: readStringArray(data.specialties || data.specialty),
    languages: readStringArray(data.languages),
    certifications: readStringArray(data.certifications),
    yearsExperience: readNumber(data.yearsExperience),
    dailyRate: readNumber(data.dailyRate || data.hourlyRate || data.price),
    company: readString(data.company) || undefined,
    phone: readString(data.phone || data.contactPhone) || undefined,
    email: readString(data.email || data.contactEmail) || undefined,
    whatsapp: readString(data.whatsapp || data.contactWhatsapp) || undefined,
    rating: readNumber(data.rating),
    reviewCount: readNumber(data.reviewCount),
    images: readStringArray(data.images),
    serviceAddresses,
    city:
      readString(addressModel.city) ||
      readString(data.city) ||
      firstServiceCity,
    isActive: readBoolean(data.isActive, true),
    isPopular: readBoolean(data.isPopular),
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

function readDailyProgram(value: unknown): DailyProgram[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      day: typeof item.day === "number" ? item.day : 0,
      title: typeof item.title === "string" ? item.title : "",
      description: typeof item.description === "string" ? item.description : "",
      activities: readStringArray(item.activities),
    }));
}

function mapTourDoc(id: string, data: Record<string, unknown>): TourModel {
  return {
    id,
    title: readString(data.title) || "İsimsiz Tur",
    description: readString(data.description),
    category: data.category as TourModel["category"],
    tags: readStringArray(data.tags),
    serviceAddresses: readStringArray(data.serviceAddresses),
    durationDays: readNumber(data.durationDays),
    basePrice: readNumber(data.basePrice),
    childPrice: readNumber(data.childPrice) || undefined,
    company: readString(data.company),
    phone: readString(data.phone),
    email: readString(data.email),
    whatsapp: readString(data.whatsapp),
    images: readStringArray(data.images),
    rating: readNumber(data.rating),
    reviewCount: readNumber(data.reviewCount),
    isActive: readBoolean(data.isActive, true),
    isPopular: readBoolean(data.isPopular),
    startDate: asDate(data.startDate),
    endDate: asDate(data.endDate),
    program: readDailyProgram(data.program),
    serviceType: (readString(data.serviceType) || undefined) as TourModel["serviceType"],
    mekkeNights: readNumber(data.mekkeNights) || undefined,
    medineNights: readNumber(data.medineNights) || undefined,
    flightDepartureFrom: readString(data.flightDepartureFrom) || undefined,
    flightDepartureTo: readString(data.flightDepartureTo) || undefined,
    flightReturnFrom: readString(data.flightReturnFrom) || undefined,
    flightReturnTo: readString(data.flightReturnTo) || undefined,
    airline: readString(data.airline) || undefined,
    airlineLogo: readString(data.airlineLogo) || undefined,
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

export async function getActiveTours(limitCount = 80): Promise<TourModel[]> {
  return fetchCollection<TourModel>(
    "tours",
    [where("isActive", "==", true), orderBy("createdAt", "desc"), limit(limitCount)],
    mapTourDoc,
  );
}

export async function getTourById(tourId: string): Promise<TourModel | null> {
  const docRef = doc(db, "tours", tourId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return mapTourDoc(docSnap.id, docSnap.data() as Record<string, unknown>);
}

export async function getActiveTransfers(
  limitCount = 100,
): Promise<TransferModel[]> {
  const snapshot = await getDocs(collection(db, "transfers"));
  const mapped = snapshot.docs.map((docSnap) =>
    mapTransferDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );

  return sortByCreatedAtDesc(mapped)
    .filter((item) => item.isActive !== false)
    .slice(0, limitCount);
}

export async function getTransferById(transferId: string): Promise<TransferModel | null> {
  const docRef = doc(db, "transfers", transferId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return mapTransferDoc(docSnap.id, docSnap.data() as Record<string, unknown>);
}

export async function getActiveCars(limitCount = 100): Promise<CarListItem[]> {
  const snapshot = await getDocs(collection(db, "cars"));
  const mapped = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    return {
      id: docSnap.id,
      brand: readString(data.brand),
      model: readString(data.model),
      dailyPrice: readNumber(data.dailyPrice || data.pricePerDay || data.price),
      seats: readNumber(data.seats || data.capacity || data.passengerCapacity),
      transmission: readString(data.transmission || data.transmissionType),
      fuelType: readString(data.fuelType || data.fuel),
      images: readStringArray(data.images),
      isActive: readBoolean(data.isActive, true),
      createdAt: asDate(data.createdAt),
    } as CarListItem;
  });

  return sortByCreatedAtDesc(mapped)
    .filter((item) => item.isActive !== false)
    .slice(0, limitCount);
}

export async function getActiveGuides(
  limitCount = 100,
): Promise<GuideModel[]> {
  const snapshot = await getDocs(collection(db, "guides"));
  const mapped = snapshot.docs.map((docSnap) =>
    mapGuideDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );

  return sortByCreatedAtDesc(mapped)
    .filter((item) => item.isActive !== false)
    .slice(0, limitCount);
}

export async function getGuideById(guideId: string): Promise<GuideModel | null> {
  const docRef = doc(db, "guides", guideId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return mapGuideDoc(docSnap.id, docSnap.data() as Record<string, unknown>);
}

function mapVisaDoc(id: string, data: Record<string, unknown>): VisaApplicationModel {
  return {
    id,
    userId: readString(data.userId),
    firstName: readString(data.firstName),
    lastName: readString(data.lastName),
    passportNumber: readString(data.passportNumber),
    phone: readString(data.phone),
    email: readString(data.email),
    address: readString(data.address),
    country: readString(data.country),
    city: readString(data.city),
    purpose: (readString(data.purpose) || "umre") as VisaApplicationModel["purpose"],
    departureDate: asDate(data.departureDate) || new Date(),
    returnDate: asDate(data.returnDate) || new Date(),
    fee: readNumber(data.fee),
    currency: readString(data.currency) || "SAR",
    status: (readString(data.status) || "received") as VisaApplicationModel["status"],
    requiredFileUrls: readStringArray(data.requiredFileUrls),
    additionalFileUrls: readStringArray(data.additionalFileUrls),
    paymentReceiptUrl: readString(data.paymentReceiptUrl),
    paymentNote: readString(data.paymentNote),
    adminNote: readString(data.adminNote),
    userNote: readString(data.userNote),
    maritalStatus: readString(data.maritalStatus),
    estimatedCompletion: asDate(data.estimatedCompletion),
    createdAt: asDate(data.createdAt) || new Date(),
    updatedAt: asDate(data.updatedAt) || new Date(),
  };
}

export async function getUserVisaApplications(
  userId: string,
): Promise<VisaApplicationModel[]> {
  return fetchCollection<VisaApplicationModel>(
    "visaApplications",
    [where("userId", "==", userId), orderBy("createdAt", "desc"), limit(100)],
    (id, data) => mapVisaDoc(id, data),
  );
}

export async function getVisaApplicationById(visaId: string): Promise<VisaApplicationModel | null> {
  const docRef = doc(db, "visaApplications", visaId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return mapVisaDoc(docSnap.id, docSnap.data() as Record<string, unknown>);
}

/* ────────── Visa File Upload ────────── */

export async function uploadVisaFile(
  userId: string,
  file: File,
  type: string,
): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `visaApplications/${userId}/${Date.now()}_${type}.${ext}`;
  const storageRef = ref(storage, path);
  const snap = await uploadBytes(storageRef, file, {
    contentType: file.type || "application/octet-stream",
  });
  return getDownloadURL(snap.ref);
}

/* ────────── Create Visa Application ────────── */

export interface CreateVisaInput {
  userId: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  phone: string;
  email: string;
  address?: string;
  maritalStatus?: string;
  country: string;
  city: string;
  purpose: string;
  departureDate: Date;
  returnDate: Date;
  fee: number;
  currency?: string;
  userNote?: string;
  requiredFileUrls: string[];
  additionalFileUrls: string[];
  paymentReceiptUrl?: string;
}

export async function createVisaApplication(input: CreateVisaInput): Promise<string> {
  const now = new Date();
  const data: Record<string, unknown> = {
    userId: input.userId,
    firstName: input.firstName,
    lastName: input.lastName,
    passportNumber: input.passportNumber,
    phone: input.phone,
    email: input.email,
    country: input.country,
    city: input.city,
    purpose: input.purpose,
    departureDate: input.departureDate.toISOString(),
    returnDate: input.returnDate.toISOString(),
    fee: input.fee,
    currency: input.currency || "USD",
    status: "received",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    requiredFileUrls: input.requiredFileUrls,
    additionalFileUrls: input.additionalFileUrls,
  };
  if (input.address) data.address = input.address;
  if (input.maritalStatus) data.maritalStatus = input.maritalStatus;
  if (input.userNote) data.userNote = input.userNote;
  if (input.paymentReceiptUrl) data.paymentReceiptUrl = input.paymentReceiptUrl;

  const docRef = await addDoc(collection(db, "visaApplications"), data);
  return docRef.id;
}

// ==================== FAVORITES ====================

export async function getUserFavorites(userId: string): Promise<FavoriteItem[]> {
  const q = query(
    collection(db, "favorites"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      targetType: data.targetType,
      targetId: data.targetId,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
      meta: data.meta ?? {},
    } as FavoriteItem;
  });
  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function addFavorite(
  userId: string,
  targetType: FavoriteTargetType,
  targetId: string,
  meta: FavoriteMeta
): Promise<void> {
  const docId = `${userId}_${targetType}_${targetId}`;
  const { setDoc, doc: firestoreDoc } = await import("firebase/firestore");
  await setDoc(firestoreDoc(db, "favorites", docId), {
    userId,
    targetType,
    targetId,
    createdAt: Timestamp.now(),
    meta,
  });
}

export async function removeFavorite(
  userId: string,
  targetType: FavoriteTargetType,
  targetId: string
): Promise<void> {
  const docId = `${userId}_${targetType}_${targetId}`;
  await deleteDoc(doc(db, "favorites", docId));
}

// ==================== REVIEWS ====================

export async function getUserReviews(userId: string): Promise<UserReview[]> {
  const q = query(
    collection(db, "reviews"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      serviceId: data.serviceId,
      serviceType: data.serviceType,
      serviceName: data.serviceName,
      rating: data.rating,
      comment: data.comment,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
      updatedAt: data.updatedAt
        ? data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : new Date(data.updatedAt)
        : undefined,
    } as UserReview;
  });
  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ==================== PROFILE IMAGE ====================

export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `users/${userId}/avatar_${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

// ==================== CAMPAIGNS ====================

function mapCampaignDoc(id: string, data: Record<string, unknown>): CampaignModel {
  return {
    id,
    title: readString(data.title),
    shortDescription: readString(data.shortDescription) || readString(data.description),
    longDescription: readString(data.longDescription) || readString(data.details) || readString(data.description),
    imageUrl: readString(data.imageUrl),
    type: (readString(data.type) || readString(data.campaignType) || "tour") as CampaignModel["type"],
    isActive: readBoolean(data.isActive, true),
    createdBy: readString(data.createdBy),
    savedByUserIds: readStringArray(data.savedByUserIds),
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

export async function getActiveCampaigns(limitCount = 10): Promise<CampaignModel[]> {
  const snapshot = await getDocs(collection(db, "campaigns"));
  const mapped = snapshot.docs.map((docSnap) =>
    mapCampaignDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
  return sortByCreatedAtDesc(mapped)
    .filter((item) => item.isActive !== false)
    .slice(0, limitCount);
}

// ==================== PLACES ====================

function mapPlaceDoc(id: string, data: Record<string, unknown>): PlaceModel {
  return {
    id,
    title: readString(data.title),
    shortDescription: readString(data.shortDescription),
    longDescription: readString(data.longDescription),
    city: (readString(data.city) || "mekke") as PlaceCity,
    images: readStringArray(data.images),
    isActive: readBoolean(data.isActive, true),
    createdBy: readString(data.createdBy),
    locationUrl: readString(data.locationUrl) || undefined,
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

export async function getPlacesByCity(city: PlaceCity, limitCount = 10): Promise<PlaceModel[]> {
  const snapshot = await getDocs(collection(db, "places"));
  const mapped = snapshot.docs.map((docSnap) =>
    mapPlaceDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
  return mapped
    .filter((item) => item.isActive !== false && item.city === city)
    .slice(0, limitCount);
}

export async function getActivePlaces(limitCount = 50): Promise<PlaceModel[]> {
  const snapshot = await getDocs(collection(db, "places"));
  const mapped = snapshot.docs.map((docSnap) =>
    mapPlaceDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
  return mapped
    .filter((item) => item.isActive !== false)
    .slice(0, limitCount);
}

export async function getPlaceById(placeId: string): Promise<PlaceModel | null> {
  const docRef = doc(db, "places", placeId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return mapPlaceDoc(docSnap.id, docSnap.data() as Record<string, unknown>);
}

// ==================== BLOGS ====================

function mapBlogDoc(id: string, data: Record<string, unknown>): BlogModel {
  return {
    id,
    title: readString(data.title),
    content: readString(data.content),
    summary: readString(data.summary) || undefined,
    imageUrl: readString(data.imageUrl),
    category: (readString(data.category) || "genel") as BlogModel["category"],
    authorName: readString(data.authorName) || undefined,
    authorImageUrl: readString(data.authorImageUrl) || undefined,
    tags: readStringArray(data.tags),
    readTimeMinutes: readNumber(data.readTimeMinutes) || undefined,
    isActive: readBoolean(data.isActive, true),
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

export async function getActiveBlogs(limitCount = 10): Promise<BlogModel[]> {
  const snapshot = await getDocs(collection(db, "blogs"));
  const mapped = snapshot.docs.map((docSnap) =>
    mapBlogDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
  return sortByCreatedAtDesc(mapped)
    .filter((item) => item.isActive !== false)
    .slice(0, limitCount);
}

// ==================== TOP REVIEWS (Homepage) ====================

export async function getTopReviews(limitCount = 6): Promise<UserReview[]> {
  const snapshot = await getDocs(collection(db, "reviews"));
  const items = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      serviceId: data.serviceId,
      serviceType: data.serviceType,
      serviceName: data.serviceName,
      rating: data.rating,
      comment: data.comment,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
      updatedAt: data.updatedAt
        ? data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : new Date(data.updatedAt)
        : undefined,
    } as UserReview;
  });
  // Return top-rated reviews with comments
  return items
    .filter((r) => r.rating >= 4 && r.comment && r.comment.length > 10)
    .sort((a, b) => b.rating - a.rating || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limitCount);
}

// ==================== REFERRALS ====================

export async function getUserReferralEarnings(userId: string) {
  const q = query(
    collection(db, "referralEarnings"),
    where("referrerId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
    };
  });
}
