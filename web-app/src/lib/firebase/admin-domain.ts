/**
 * Admin Panel – Firestore CRUD & aggregation functions
 *
 * Covers: Reservations, Users, Contact Messages, Visa Applications, Dashboard Stats
 */

import { AddressModel } from "@/types/address";
import { CampaignModel, CampaignType } from "@/types/campaign";
import { CarModel, CarType, FuelType, TransmissionType } from "@/types/car";
import { ContactMessageModel, ContactSubject } from "@/types/contact";
import { GuideModel } from "@/types/guide";
import { HotelCategory, HotelModel, RoomType } from "@/types/hotel";
import { PlaceCity, PlaceModel } from "@/types/place";
import { PromotionModel, PromotionTargetType } from "@/types/promotion";
import { ReservationModel, ReservationStatus, ReservationType } from "@/types/reservation";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/types/site-settings";
import { TourCategory, TourModel } from "@/types/tour";
import { TransferModel, VehicleAmenity, VehicleType } from "@/types/transfer";
import { rolesFromFirestore, rolesToFirestore, RoleType, UserModel } from "@/types/user";
import { VisaApplicationModel, VisaStatus } from "@/types/visa";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    QueryConstraint,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { db, storage } from "./config";
import { COLLECTIONS } from "./firestore";

// ─── helpers ───────────────────────────────────────────────────────────
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

async function fetchAll<T>(
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

// ─── mappers ───────────────────────────────────────────────────────────

function mapReservation(id: string, d: Record<string, unknown>): ReservationModel {
  return {
    id,
    userId: readString(d.userId),
    type: (readString(d.type) || "hotel") as ReservationType,
    itemId: readString(d.itemId),
    title: readString(d.title),
    subtitle: readString(d.subtitle) || undefined,
    imageUrl: readString(d.imageUrl) || undefined,
    startDate: asDate(d.startDate) ?? new Date(),
    endDate: asDate(d.endDate) ?? new Date(),
    quantity: readNumber(d.quantity) || 1,
    people: readNumber(d.people) || undefined,
    price: readNumber(d.price),
    currency: readString(d.currency) || "TRY",
    status: (readString(d.status) || "pending") as ReservationStatus,
    paymentOrderId: readString(d.paymentOrderId) || undefined,
    paymentStatus: (readString(d.paymentStatus) || undefined) as
      | "initiated"
      | "success"
      | "failed"
      | undefined,
    meta: d.meta as Record<string, unknown> | undefined,
    userPhone: readString(d.userPhone) || undefined,
    userEmail: readString(d.userEmail) || undefined,
    notes: readString(d.notes) || undefined,
    source: (readString(d.source) || undefined) as "web" | "mobile" | "admin" | undefined,
    adminNote: readString(d.adminNote) || undefined,
    createdAt: asDate(d.createdAt) ?? new Date(),
    updatedAt: asDate(d.updatedAt) ?? new Date(),
  };
}

function mapUser(id: string, d: Record<string, unknown>): UserModel {
  return {
    id,
    email: readString(d.email) || undefined,
    fullName: readString(d.fullName) || undefined,
    firstName: readString(d.firstName) || undefined,
    lastName: readString(d.lastName) || undefined,
    phoneNumber: readString(d.phoneNumber) || undefined,
    imageUrl: readString(d.imageUrl) || undefined,
    roles: rolesFromFirestore(d.roles),
    fcmToken: readString(d.fcmToken) || undefined,
    fcmTokens: readStringArray(d.fcmTokens) || undefined,
    metadata: d.metadata as Record<string, unknown> | undefined,
    referralCode: readString(d.referralCode) || undefined,
    createdAt: asDate(d.createdAt) ?? new Date(),
    updatedAt: asDate(d.updatedAt) ?? new Date(),
    lastSeen: asDate(d.lastSeen),
  };
}

function mapContactMessage(id: string, d: Record<string, unknown>): ContactMessageModel {
  return {
    id,
    name: readString(d.name),
    email: readString(d.email),
    phone: readString(d.phone),
    subject: (readString(d.subject) || "other") as ContactSubject,
    message: readString(d.message),
    isRead: d.isRead === true,
    adminNote: readString(d.adminNote) || undefined,
    repliedAt: asDate(d.repliedAt),
    createdAt: asDate(d.createdAt) ?? new Date(),
  };
}

function mapVisa(id: string, d: Record<string, unknown>): VisaApplicationModel {
  return {
    id,
    userId: readString(d.userId),
    firstName: readString(d.firstName),
    lastName: readString(d.lastName),
    passportNumber: readString(d.passportNumber),
    phone: readString(d.phone),
    email: readString(d.email),
    address: readString(d.address) || undefined,
    country: readString(d.country),
    city: readString(d.city),
    purpose: (readString(d.purpose) || "umre") as VisaApplicationModel["purpose"],
    departureDate: asDate(d.departureDate) ?? new Date(),
    returnDate: asDate(d.returnDate) ?? new Date(),
    fee: readNumber(d.fee),
    currency: readString(d.currency) || "TRY",
    status: (readString(d.status) || "received") as VisaStatus,
    createdAt: asDate(d.createdAt) ?? new Date(),
    updatedAt: asDate(d.updatedAt) ?? new Date(),
    estimatedCompletion: asDate(d.estimatedCompletion),
    requiredFileUrls: readStringArray(d.requiredFileUrls),
    additionalFileUrls: readStringArray(d.additionalFileUrls) || undefined,
    paymentReceiptUrl: readString(d.paymentReceiptUrl) || undefined,
    paymentNote: readString(d.paymentNote) || undefined,
    adminNote: readString(d.adminNote) || undefined,
    userNote: readString(d.userNote) || undefined,
    maritalStatus: readString(d.maritalStatus) || undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// RESERVATIONS
// ═══════════════════════════════════════════════════════════════════════

export interface ReservationFilters {
  status?: ReservationStatus;
  type?: ReservationType;
  source?: "web" | "mobile" | "admin";
  startAfter?: Date;
  startBefore?: Date;
  maxResults?: number;
}

export async function getAllReservations(
  filters?: ReservationFilters,
): Promise<ReservationModel[]> {
  const constraints: QueryConstraint[] = [];

  if (filters?.status) constraints.push(where("status", "==", filters.status));
  if (filters?.type) constraints.push(where("type", "==", filters.type));
  if (filters?.source) constraints.push(where("source", "==", filters.source));
  if (filters?.maxResults) constraints.push(limit(filters.maxResults));

  const items = await fetchAll(COLLECTIONS.RESERVATIONS, constraints, mapReservation);

  let filtered = items;
  if (filters?.startAfter) {
    filtered = filtered.filter((r) => r.startDate >= filters.startAfter!);
  }
  if (filters?.startBefore) {
    filtered = filtered.filter((r) => r.startDate <= filters.startBefore!);
  }

  return sortByCreatedAtDesc(filtered);
}

export async function getReservationById(id: string): Promise<ReservationModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.RESERVATIONS, id));
  if (!snap.exists()) return null;
  return mapReservation(snap.id, snap.data() as Record<string, unknown>);
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  adminNote?: string,
): Promise<void> {
  const ref = doc(db, COLLECTIONS.RESERVATIONS, id);
  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (adminNote !== undefined) updates.adminNote = adminNote;
  await updateDoc(ref, updates);
}

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  totalRevenue: number;
}

export async function getReservationStats(): Promise<ReservationStats> {
  const all = await getAllReservations();
  const stats: ReservationStats = {
    total: all.length,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    totalRevenue: 0,
  };
  for (const r of all) {
    stats[r.status]++;
    if (r.status === "confirmed" || r.status === "completed") {
      stats.totalRevenue += r.price;
    }
  }
  return stats;
}

// ═══════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════

export interface UserFilters {
  role?: RoleType;
  searchTerm?: string;
  maxResults?: number;
}

export async function getAllUsers(filters?: UserFilters): Promise<UserModel[]> {
  const constraints: QueryConstraint[] = [];

  if (filters?.role) constraints.push(where("roles", "array-contains", filters.role));
  if (filters?.maxResults) constraints.push(limit(filters.maxResults));

  const users = await fetchAll(COLLECTIONS.USERS, constraints, mapUser);

  let filtered = users;
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phoneNumber?.includes(term),
    );
  }

  return sortByCreatedAtDesc(filtered);
}

export async function getAdminUserById(userId: string): Promise<UserModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, userId));
  if (!snap.exists()) return null;
  return mapUser(snap.id, snap.data() as Record<string, unknown>);
}

export async function updateUserRole(userId: string, roles: RoleType[]): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    roles: rolesToFirestore(roles),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserStats(): Promise<{
  total: number;
  admins: number;
  moderators: number;
  agents: number;
  regularUsers: number;
  newThisMonth: number;
}> {
  const users = await getAllUsers();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    total: users.length,
    admins: users.filter((u) => u.roles.includes("admin")).length,
    moderators: users.filter((u) => u.roles.includes("moderator")).length,
    agents: users.filter((u) => u.roles.includes("agent")).length,
    regularUsers: users.filter(
      (u) => u.roles.length === 1 && u.roles[0] === "user",
    ).length,
    newThisMonth: users.filter((u) => u.createdAt >= monthStart).length,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// CONTACT MESSAGES
// ═══════════════════════════════════════════════════════════════════════

export interface MessageFilters {
  isRead?: boolean;
  subject?: ContactSubject;
  maxResults?: number;
}

export async function getAllContactMessages(
  filters?: MessageFilters,
): Promise<ContactMessageModel[]> {
  const constraints: QueryConstraint[] = [];

  if (filters?.isRead !== undefined) constraints.push(where("isRead", "==", filters.isRead));
  if (filters?.subject) constraints.push(where("subject", "==", filters.subject));
  if (filters?.maxResults) constraints.push(limit(filters.maxResults));

  const messages = await fetchAll(COLLECTIONS.CONTACT_MESSAGES, constraints, mapContactMessage);
  return sortByCreatedAtDesc(messages);
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CONTACT_MESSAGES, messageId), {
    isRead: true,
  });
}

export async function addMessageAdminNote(
  messageId: string,
  note: string,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CONTACT_MESSAGES, messageId), {
    adminNote: note,
    repliedAt: serverTimestamp(),
  });
}

export async function getMessageStats(): Promise<{
  total: number;
  unread: number;
  todayCount: number;
}> {
  const messages = await getAllContactMessages();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return {
    total: messages.length,
    unread: messages.filter((m) => !m.isRead).length,
    todayCount: messages.filter((m) => m.createdAt >= todayStart).length,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// VISA APPLICATIONS
// ═══════════════════════════════════════════════════════════════════════

export interface VisaFilters {
  status?: VisaStatus;
  maxResults?: number;
}

export async function getAllVisaApplications(
  filters?: VisaFilters,
): Promise<VisaApplicationModel[]> {
  const constraints: QueryConstraint[] = [];

  if (filters?.status) constraints.push(where("status", "==", filters.status));
  if (filters?.maxResults) constraints.push(limit(filters.maxResults));

  const items = await fetchAll(COLLECTIONS.VISA_APPLICATIONS, constraints, mapVisa);
  return sortByCreatedAtDesc(items);
}

export async function getVisaApplicationById(
  id: string,
): Promise<VisaApplicationModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.VISA_APPLICATIONS, id));
  if (!snap.exists()) return null;
  return mapVisa(snap.id, snap.data() as Record<string, unknown>);
}

export async function updateVisaStatus(
  id: string,
  status: VisaStatus,
  adminNote?: string,
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (adminNote !== undefined) updates.adminNote = adminNote;
  await updateDoc(doc(db, COLLECTIONS.VISA_APPLICATIONS, id), updates);
}

export async function getVisaStats(): Promise<{
  total: number;
  received: number;
  processing: number;
  completed: number;
  rejected: number;
}> {
  const items = await getAllVisaApplications();
  return {
    total: items.length,
    received: items.filter((v) => v.status === "received").length,
    processing: items.filter((v) => v.status === "processing").length,
    completed: items.filter((v) => v.status === "completed").length,
    rejected: items.filter((v) => v.status === "rejected").length,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD / AGGREGATE STATS
// ═══════════════════════════════════════════════════════════════════════

export interface DashboardStats {
  reservations: ReservationStats;
  userCount: number;
  newUsersThisMonth: number;
  unreadMessages: number;
  visaTotal: number;
  visaProcessing: number;
  tourCount: number;
  hotelCount: number;
  transferCount: number;
  carCount: number;
  guideCount: number;
  placeCount: number;
  campaignCount: number;
  promotionCount: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [rStats, uStats, mStats, vStats, tourS, hotelS, transferS, carS, guideS, placeS, campaignS, promotionS] = await Promise.all([
    getReservationStats(),
    getUserStats(),
    getMessageStats(),
    getVisaStats(),
    getTourStats(),
    getHotelStats(),
    getTransferStats(),
    getCarStats(),
    getGuideStats(),
    getPlaceStats(),
    getCampaignStats(),
    getPromotionStats(),
  ]);

  return {
    reservations: rStats,
    userCount: uStats.total,
    newUsersThisMonth: uStats.newThisMonth,
    unreadMessages: mStats.unread,
    visaTotal: vStats.total,
    visaProcessing: vStats.processing,
    tourCount: tourS.total,
    hotelCount: hotelS.total,
    transferCount: transferS.total,
    carCount: carS.total,
    guideCount: guideS.total,
    placeCount: placeS.total,
    campaignCount: campaignS.total,
    promotionCount: promotionS.total,
  };
}

export interface MonthlyDataPoint {
  month: string; // "2025-01", "2025-02" etc.
  label: string; // "Oca", "Şub" etc.
  count: number;
  revenue: number;
}

const MONTH_LABELS_TR = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];

export async function getMonthlyReservationTrend(
  months = 6,
): Promise<MonthlyDataPoint[]> {
  const now = new Date();
  const all = await getAllReservations();

  const points: MonthlyDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = MONTH_LABELS_TR[d.getMonth()];

    const monthItems = all.filter((r) => {
      const rMonth = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
      return rMonth === key;
    });

    points.push({
      month: key,
      label,
      count: monthItems.length,
      revenue: monthItems
        .filter((r) => r.status === "confirmed" || r.status === "completed")
        .reduce((sum, r) => sum + r.price, 0),
    });
  }

  return points;
}

export async function getRecentReservations(
  max = 5,
): Promise<ReservationModel[]> {
  const all = await getAllReservations({ maxResults: 200 });
  return all.slice(0, max);
}

export async function getRecentMessages(
  max = 5,
): Promise<ContactMessageModel[]> {
  const all = await getAllContactMessages({ maxResults: 200 });
  return all.slice(0, max);
}

// ═══════════════════════════════════════════════════════════════════════
// ─── TOUR MANAGEMENT ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function mapTour(id: string, d: Record<string, unknown>): TourModel {
  return {
    id,
    title: readString(d.title),
    description: readString(d.description) || undefined,
    category: (readString(d.category) || undefined) as TourCategory | undefined,
    tags: readStringArray(d.tags),
    serviceAddresses: readStringArray(d.serviceAddresses),
    durationDays: readNumber(d.durationDays) || 1,
    startDate: asDate(d.startDate),
    endDate: asDate(d.endDate),
    program: Array.isArray(d.program) ? d.program as TourModel["program"] : undefined,
    basePrice: readNumber(d.basePrice),
    childPrice: readNumber(d.childPrice) || undefined,
    company: readString(d.company) || undefined,
    phone: readString(d.phone) || undefined,
    email: readString(d.email) || undefined,
    whatsapp: readString(d.whatsapp) || undefined,
    rating: readNumber(d.rating),
    reviewCount: readNumber(d.reviewCount),
    images: readStringArray(d.images),
    availability: d.availability as TourModel["availability"],
    isActive: d.isActive === true,
    isPopular: d.isPopular === true,
    favoriteUserIds: readStringArray(d.favoriteUserIds),
    addressModel: d.addressModel as AddressModel | undefined,
    serviceType: (readString(d.serviceType) || undefined) as TourModel["serviceType"],
    mekkeNights: readNumber(d.mekkeNights) || undefined,
    medineNights: readNumber(d.medineNights) || undefined,
    flightDepartureFrom: readString(d.flightDepartureFrom) || undefined,
    flightDepartureTo: readString(d.flightDepartureTo) || undefined,
    flightReturnFrom: readString(d.flightReturnFrom) || undefined,
    flightReturnTo: readString(d.flightReturnTo) || undefined,
    airline: readString(d.airline) || undefined,
    airlineLogo: readString(d.airlineLogo) || undefined,
    createdAt: asDate(d.createdAt),
    updatedAt: asDate(d.updatedAt),
  };
}

export async function getAllTours(opts?: { maxResults?: number }): Promise<TourModel[]> {
  const constraints: QueryConstraint[] = [];
  if (opts?.maxResults) constraints.push(limit(opts.maxResults));
  const items = await fetchAll(COLLECTIONS.TOURS, constraints, mapTour);
  return sortByCreatedAtDesc(items);
}

export async function getTourById(id: string): Promise<TourModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.TOURS, id));
  if (!snap.exists()) return null;
  return mapTour(snap.id, snap.data() as Record<string, unknown>);
}

export async function createTour(data: Omit<TourModel, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.TOURS), {
    ...data,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTour(id: string, data: Partial<TourModel>): Promise<void> {
  const { id: _id, createdAt: _ca, ...rest } = data;
  void _id; void _ca;
  await updateDoc(doc(db, COLLECTIONS.TOURS, id), {
    ...rest,
    startDate: rest.startDate ?? null,
    endDate: rest.endDate ?? null,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTour(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.TOURS, id));
}

export async function getTourStats(): Promise<{ total: number; active: number }> {
  const all = await getAllTours();
  return { total: all.length, active: all.filter((t) => t.isActive).length };
}

// ═══════════════════════════════════════════════════════════════════════
// ─── PLACE MANAGEMENT ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function mapPlace(id: string, d: Record<string, unknown>): PlaceModel {
  return {
    id,
    title: readString(d.title),
    shortDescription: readString(d.shortDescription),
    longDescription: readString(d.longDescription),
    city: (readString(d.city) || "mekke") as PlaceCity,
    images: readStringArray(d.images),
    isActive: d.isActive === true,
    createdBy: readString(d.createdBy),
    locationUrl: readString(d.locationUrl) || undefined,
    createdAt: asDate(d.createdAt),
    updatedAt: asDate(d.updatedAt),
  };
}

export async function getAllPlaces(opts?: { maxResults?: number }): Promise<PlaceModel[]> {
  const constraints: QueryConstraint[] = [];
  if (opts?.maxResults) constraints.push(limit(opts.maxResults));
  const items = await fetchAll(COLLECTIONS.PLACES, constraints, mapPlace);
  return sortByCreatedAtDesc(items);
}

export async function getPlaceById(id: string): Promise<PlaceModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.PLACES, id));
  if (!snap.exists()) return null;
  return mapPlace(snap.id, snap.data() as Record<string, unknown>);
}

export async function createPlace(data: Omit<PlaceModel, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.PLACES), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePlace(id: string, data: Partial<PlaceModel>): Promise<void> {
  const { id: _id, createdAt: _ca, ...rest } = data;
  void _id; void _ca;
  await updateDoc(doc(db, COLLECTIONS.PLACES, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePlace(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.PLACES, id));
}

export async function getPlaceStats(): Promise<{ total: number; active: number }> {
  const all = await getAllPlaces();
  return { total: all.length, active: all.filter((p) => p.isActive).length };
}

// ═══════════════════════════════════════════════════════════════════════
// ─── CAMPAIGN MANAGEMENT ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function mapCampaign(id: string, d: Record<string, unknown>): CampaignModel {
  return {
    id,
    title: readString(d.title),
    shortDescription: readString(d.shortDescription) || readString(d.description),
    longDescription: readString(d.longDescription),
    imageUrl: readString(d.imageUrl),
    type: (readString(d.type) || readString(d.campaignType) || "hotel") as CampaignType,
    isActive: d.isActive === true,
    createdBy: readString(d.createdBy),
    savedByUserIds: readStringArray(d.savedByUserIds),
    createdAt: asDate(d.createdAt),
    updatedAt: asDate(d.updatedAt),
  };
}

export async function getAllCampaigns(opts?: { maxResults?: number }): Promise<CampaignModel[]> {
  const constraints: QueryConstraint[] = [];
  if (opts?.maxResults) constraints.push(limit(opts.maxResults));
  const items = await fetchAll(COLLECTIONS.CAMPAIGNS, constraints, mapCampaign);
  return sortByCreatedAtDesc(items);
}

export async function getCampaignById(id: string): Promise<CampaignModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.CAMPAIGNS, id));
  if (!snap.exists()) return null;
  return mapCampaign(snap.id, snap.data() as Record<string, unknown>);
}

export async function createCampaign(data: Omit<CampaignModel, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.CAMPAIGNS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCampaign(id: string, data: Partial<CampaignModel>): Promise<void> {
  const { id: _id, createdAt: _ca, ...rest } = data;
  void _id; void _ca;
  await updateDoc(doc(db, COLLECTIONS.CAMPAIGNS, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCampaign(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CAMPAIGNS, id));
}

export async function getCampaignStats(): Promise<{ total: number; active: number }> {
  const all = await getAllCampaigns();
  return { total: all.length, active: all.filter((c) => c.isActive).length };
}

// ═══════════════════════════════════════════════════════════════════════
// ─── TRANSFER MANAGEMENT ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function parseAddressField(val: unknown): AddressModel {
  if (typeof val === "string") {
    return { address: val, city: "", country: "", state: "" };
  }
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    return {
      address: readString(obj.address),
      city: readString(obj.city),
      country: readString(obj.country),
      state: readString(obj.state),
    };
  }
  return { address: "", city: "", country: "", state: "" };
}

function mapTransfer(id: string, d: Record<string, unknown>): TransferModel {
  return {
    id,
    fromAddress: parseAddressField(d.fromAddress),
    toAddress: parseAddressField(d.toAddress),
    vehicleType: (readString(d.vehicleType) || "sedan") as VehicleType,
    vehicleName: readString(d.vehicleName),
    capacity: readNumber(d.capacity),
    luggageCapacity: readNumber(d.luggageCapacity),
    childSeatCount: readNumber(d.childSeatCount),
    amenities: readStringArray(d.amenities) as VehicleAmenity[],
    basePrice: readNumber(d.basePrice),
    durationMinutes: readNumber(d.durationMinutes),
    company: readString(d.company),
    phone: readString(d.phone) || undefined,
    email: readString(d.email) || undefined,
    whatsapp: readString(d.whatsapp) || undefined,
    rating: readNumber(d.rating),
    reviewCount: readNumber(d.reviewCount),
    images: readStringArray(d.images),
    availability: d.availability as TransferModel["availability"],
    isActive: d.isActive === true,
    isPopular: d.isPopular === true,
    favoriteUserIds: readStringArray(d.favoriteUserIds),
    createdAt: asDate(d.createdAt),
    updatedAt: asDate(d.updatedAt),
  };
}

export async function getAllTransfers(opts?: { maxResults?: number }): Promise<TransferModel[]> {
  const constraints: QueryConstraint[] = [];
  if (opts?.maxResults) constraints.push(limit(opts.maxResults));
  const items = await fetchAll(COLLECTIONS.TRANSFERS, constraints, mapTransfer);
  return sortByCreatedAtDesc(items);
}

export async function getTransferById(id: string): Promise<TransferModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.TRANSFERS, id));
  if (!snap.exists()) return null;
  return mapTransfer(snap.id, snap.data() as Record<string, unknown>);
}

export async function createTransfer(data: Omit<TransferModel, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.TRANSFERS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTransfer(id: string, data: Partial<TransferModel>): Promise<void> {
  const { id: _id, createdAt: _ca, ...rest } = data;
  void _id; void _ca;
  await updateDoc(doc(db, COLLECTIONS.TRANSFERS, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTransfer(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.TRANSFERS, id));
}

export async function getTransferStats(): Promise<{ total: number; active: number }> {
  const all = await getAllTransfers();
  return { total: all.length, active: all.filter((t) => t.isActive).length };
}

// ═══════════════════════════════════════════════════════════════════════
// ─── HOTEL MANAGEMENT ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function mapHotel(id: string, d: Record<string, unknown>): HotelModel {
  return {
    id,
    name: readString(d.name),
    description: readString(d.description) || undefined,
    images: readStringArray(d.images),
    addressModel: d.addressModel as AddressModel | undefined,
    phone: readString(d.phone) || undefined,
    email: readString(d.email) || undefined,
    website: readString(d.website) || undefined,
    whatsapp: readString(d.whatsapp) || undefined,
    roomTypes: Array.isArray(d.roomTypes) ? d.roomTypes as RoomType[] : undefined,
    amenities: readStringArray(d.amenities),
    rating: readNumber(d.rating),
    reviewCount: readNumber(d.reviewCount),
    category: (readString(d.category) || undefined) as HotelCategory | undefined,
    availability: d.availability as HotelModel["availability"],
    isActive: d.isActive === true,
    isPopular: d.isPopular === true,
    favoriteUserIds: readStringArray(d.favoriteUserIds),
    createdAt: asDate(d.createdAt),
    updatedAt: asDate(d.updatedAt),
  };
}

export async function getAllHotels(opts?: { maxResults?: number }): Promise<HotelModel[]> {
  const constraints: QueryConstraint[] = [];
  if (opts?.maxResults) constraints.push(limit(opts.maxResults));
  const items = await fetchAll(COLLECTIONS.HOTELS, constraints, mapHotel);
  return sortByCreatedAtDesc(items);
}

export async function getHotelById(id: string): Promise<HotelModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.HOTELS, id));
  if (!snap.exists()) return null;
  return mapHotel(snap.id, snap.data() as Record<string, unknown>);
}

export async function createHotel(data: Omit<HotelModel, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.HOTELS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateHotel(id: string, data: Partial<HotelModel>): Promise<void> {
  const { id: _id, createdAt: _ca, ...rest } = data;
  void _id; void _ca;
  await updateDoc(doc(db, COLLECTIONS.HOTELS, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteHotel(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.HOTELS, id));
}

export async function getHotelStats(): Promise<{ total: number; active: number }> {
  const all = await getAllHotels();
  return { total: all.length, active: all.filter((h) => h.isActive).length };
}

// ═══════════════════════════════════════════════════════════════════════
// ─── CAR MANAGEMENT ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function mapCar(id: string, d: Record<string, unknown>): CarModel {
  return {
    id,
    brand: readString(d.brand),
    model: readString(d.model),
    type: (readString(d.type) || "economy") as CarType,
    transmission: (readString(d.transmission) || "automatic") as TransmissionType,
    fuelType: (readString(d.fuelType) || "petrol") as FuelType,
    seats: readNumber(d.seats) || 5,
    company: readString(d.company),
    phone: readString(d.phone) || undefined,
    email: readString(d.email) || undefined,
    whatsapp: readString(d.whatsapp) || undefined,
    addressModel: d.addressModel as AddressModel | undefined,
    dailyPrice: readNumber(d.dailyPrice),
    discountedDailyPrice: readNumber(d.discountedDailyPrice) || undefined,
    rating: readNumber(d.rating),
    reviewCount: readNumber(d.reviewCount),
    favoriteUserIds: readStringArray(d.favoriteUserIds),
    images: readStringArray(d.images),
    availability: d.availability as CarModel["availability"],
    isActive: d.isActive === true,
    isPopular: d.isPopular === true,
    createdAt: asDate(d.createdAt),
    updatedAt: asDate(d.updatedAt),
  };
}

export async function getAllCars(opts?: { maxResults?: number }): Promise<CarModel[]> {
  const constraints: QueryConstraint[] = [];
  if (opts?.maxResults) constraints.push(limit(opts.maxResults));
  const items = await fetchAll(COLLECTIONS.CARS, constraints, mapCar);
  return sortByCreatedAtDesc(items);
}

export async function getCarById(id: string): Promise<CarModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.CARS, id));
  if (!snap.exists()) return null;
  return mapCar(snap.id, snap.data() as Record<string, unknown>);
}

export async function createCar(data: Omit<CarModel, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.CARS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCar(id: string, data: Partial<CarModel>): Promise<void> {
  const { id: _id, createdAt: _ca, ...rest } = data;
  void _id; void _ca;
  await updateDoc(doc(db, COLLECTIONS.CARS, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCar(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CARS, id));
}

export async function getCarStats(): Promise<{ total: number; active: number }> {
  const all = await getAllCars();
  return { total: all.length, active: all.filter((c) => c.isActive).length };
}

// ═══════════════════════════════════════════════════════════════════════
// ─── GUIDE MANAGEMENT ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function mapGuide(id: string, d: Record<string, unknown>): GuideModel {
  return {
    id,
    name: readString(d.name),
    bio: readString(d.bio),
    specialties: readStringArray(d.specialties),
    languages: readStringArray(d.languages),
    certifications: readStringArray(d.certifications),
    yearsExperience: readNumber(d.yearsExperience),
    dailyRate: readNumber(d.dailyRate),
    company: readString(d.company) || undefined,
    phone: readString(d.phone) || undefined,
    email: readString(d.email) || undefined,
    whatsapp: readString(d.whatsapp) || undefined,
    rating: readNumber(d.rating),
    reviewCount: readNumber(d.reviewCount),
    images: readStringArray(d.images),
    serviceAddresses: Array.isArray(d.serviceAddresses)
      ? (d.serviceAddresses as GuideModel["serviceAddresses"])
      : [],
    city: readString(d.city),
    isActive: d.isActive === true,
    isPopular: d.isPopular === true,
    createdAt: asDate(d.createdAt),
    updatedAt: asDate(d.updatedAt),
  };
}

export async function getAllGuides(opts?: { maxResults?: number }): Promise<GuideModel[]> {
  const constraints: QueryConstraint[] = [];
  if (opts?.maxResults) constraints.push(limit(opts.maxResults));
  const items = await fetchAll(COLLECTIONS.GUIDES, constraints, mapGuide);
  return sortByCreatedAtDesc(items);
}

export async function getGuideById(id: string): Promise<GuideModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.GUIDES, id));
  if (!snap.exists()) return null;
  return mapGuide(snap.id, snap.data() as Record<string, unknown>);
}

export async function createGuide(data: Omit<GuideModel, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.GUIDES), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGuide(id: string, data: Partial<GuideModel>): Promise<void> {
  const { id: _id, createdAt: _ca, ...rest } = data;
  void _id; void _ca;
  await updateDoc(doc(db, COLLECTIONS.GUIDES, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGuide(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.GUIDES, id));
}

export async function getGuideStats(): Promise<{ total: number; active: number }> {
  const all = await getAllGuides();
  return { total: all.length, active: all.filter((g) => g.isActive).length };
}

// ═══════════════════════════════════════════════════════════════════════
// ─── PROMOTION MANAGEMENT ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function mapPromotion(id: string, d: Record<string, unknown>): PromotionModel {
  return {
    id,
    title: readString(d.title),
    subtitle: readString(d.subtitle),
    description: readString(d.description) || undefined,
    targetType: (readString(d.targetType) || "hotel") as PromotionTargetType,
    discountPercent: readNumber(d.discountPercent),
    discountCode: readString(d.discountCode) || undefined,
    gradientStartColor: readString(d.gradientStartColor) || "#6366f1",
    gradientEndColor: readString(d.gradientEndColor) || "#8b5cf6",
    badgeText: readString(d.badgeText) || undefined,
    badgeColor: readString(d.badgeColor) || undefined,
    isActive: d.isActive === true,
    startDate: asDate(d.startDate),
    endDate: asDate(d.endDate),
    priority: readNumber(d.priority),
    createdAt: asDate(d.createdAt),
    updatedAt: asDate(d.updatedAt),
  };
}

export async function getAllPromotions(opts?: { maxResults?: number }): Promise<PromotionModel[]> {
  const constraints: QueryConstraint[] = [];
  if (opts?.maxResults) constraints.push(limit(opts.maxResults));
  const items = await fetchAll(COLLECTIONS.PROMOTIONS, constraints, mapPromotion);
  return sortByCreatedAtDesc(items);
}

export async function getPromotionById(id: string): Promise<PromotionModel | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.PROMOTIONS, id));
  if (!snap.exists()) return null;
  return mapPromotion(snap.id, snap.data() as Record<string, unknown>);
}

export async function createPromotion(data: Omit<PromotionModel, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.PROMOTIONS), {
    ...data,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePromotion(id: string, data: Partial<PromotionModel>): Promise<void> {
  const { id: _id, createdAt: _ca, ...rest } = data;
  void _id; void _ca;
  await updateDoc(doc(db, COLLECTIONS.PROMOTIONS, id), {
    ...rest,
    startDate: rest.startDate ?? null,
    endDate: rest.endDate ?? null,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePromotion(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.PROMOTIONS, id));
}

export async function getPromotionStats(): Promise<{ total: number; active: number }> {
  const all = await getAllPromotions();
  return { total: all.length, active: all.filter((p) => p.isActive).length };
}

// ─── Site Settings ──────────────────────────────────────────────────────
const SETTINGS_DOC = "main";

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_DOC));
    if (!snap.exists()) return { ...DEFAULT_SITE_SETTINGS };
    const data = snap.data();
    return {
      phone: readString(data.phone) || DEFAULT_SITE_SETTINGS.phone,
      whatsapp: readString(data.whatsapp) || DEFAULT_SITE_SETTINGS.whatsapp,
      email: readString(data.email) || DEFAULT_SITE_SETTINGS.email,
      address: readString(data.address) || DEFAULT_SITE_SETTINGS.address,
      fullAddress: readString(data.fullAddress) || DEFAULT_SITE_SETTINGS.fullAddress,
      addressDetail: readString(data.addressDetail) || DEFAULT_SITE_SETTINGS.addressDetail,
      addressNote: readString(data.addressNote) || DEFAULT_SITE_SETTINGS.addressNote,
      brandName: readString(data.brandName) || DEFAULT_SITE_SETTINGS.brandName,
      brandSubtitle: readString(data.brandSubtitle) || DEFAULT_SITE_SETTINGS.brandSubtitle,
      tagline: readString(data.tagline) || DEFAULT_SITE_SETTINGS.tagline,
      aboutText: readString(data.aboutText) || DEFAULT_SITE_SETTINGS.aboutText,
      copyrightYear: readString(data.copyrightYear) || DEFAULT_SITE_SETTINGS.copyrightYear,
      workingHours: {
        weekdays: readString(data.workingHours?.weekdays) || DEFAULT_SITE_SETTINGS.workingHours.weekdays,
        saturday: readString(data.workingHours?.saturday) || DEFAULT_SITE_SETTINGS.workingHours.saturday,
        sunday: readString(data.workingHours?.sunday) || DEFAULT_SITE_SETTINGS.workingHours.sunday,
      },
      socialLinks: {
        facebook: readString(data.socialLinks?.facebook),
        twitter: readString(data.socialLinks?.twitter),
        instagram: readString(data.socialLinks?.instagram),
        youtube: readString(data.socialLinks?.youtube),
      },
      mapCoordinates: {
        lat: typeof data.mapCoordinates?.lat === "number" ? data.mapCoordinates.lat : DEFAULT_SITE_SETTINGS.mapCoordinates.lat,
        lng: typeof data.mapCoordinates?.lng === "number" ? data.mapCoordinates.lng : DEFAULT_SITE_SETTINGS.mapCoordinates.lng,
      },
      logoUrl: readString(data.logoUrl),
      updatedAt: asDate(data.updatedAt),
    };
  } catch (err) {
    console.error("getSiteSettings error:", err);
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<void> {
  const { updatedAt: _ua, ...rest } = data;
  void _ua;
  await setDoc(doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_DOC), {
    ...rest,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function uploadSiteLogo(file: File): Promise<string> {
  const { ref: storageRef, uploadBytes: upload, getDownloadURL: getUrl } = await import("firebase/storage");
  const ext = file.name.split(".").pop() ?? "png";
  const fileRef = storageRef(storage, `site/logo.${ext}`);
  await upload(fileRef, file, { contentType: file.type });
  return getUrl(fileRef);
}
