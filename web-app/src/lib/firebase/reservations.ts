import { ReservationModel } from "@/types/reservation";
import {
    addDoc,
    collection,
    getDocs,
    query,
    Timestamp,
    where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { cloudFunctions, db } from "./config";
import { COLLECTIONS, dateToTimestamp, timestampToDate } from "./firestore";

type ReservationInput = Omit<ReservationModel, "id" | "createdAt" | "updatedAt">;

export async function createReservation(input: ReservationInput): Promise<string> {
  const now = new Date();
  const docRef = await addDoc(collection(db, COLLECTIONS.RESERVATIONS), {
    ...input,
    createdAt: dateToTimestamp(now),
    updatedAt: dateToTimestamp(now),
  });

  return docRef.id;
}

export async function getUserReservations(userId: string): Promise<ReservationModel[]> {
  const reservationsQuery = query(
    collection(db, COLLECTIONS.RESERVATIONS),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(reservationsQuery);
  const items = snapshot.docs.map((reservationDoc) => {
    const data = reservationDoc.data();
    return {
      id: reservationDoc.id,
      ...(data as Omit<ReservationModel, "id" | "createdAt" | "updatedAt">),
      createdAt: timestampToDate(data.createdAt as Timestamp),
      updatedAt: timestampToDate(data.updatedAt as Timestamp),
      startDate: timestampToDate(data.startDate as Timestamp),
      endDate: timestampToDate(data.endDate as Timestamp),
    };
  });
  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function finalizeReservationPayment(
  paymentOrderId: string,
  isSuccess: boolean,
  responseCode?: string,
  bankMessage?: string,
): Promise<{ updated: boolean; message: string }> {
  const callable = httpsCallable(cloudFunctions, "setReservationPaymentStatus");
  const result = await callable({
    paymentOrderId,
    isSuccess,
    responseCode: responseCode || "",
    bankMessage: bankMessage || "",
  });

  const data = result.data as { updated?: boolean; message?: string };
  return {
    updated: data.updated === true,
    message: data.message || "İşlem tamamlandı",
  };
}
