/**
 * Popular Services API - Local JSON tabanlı CRUD
 * Firebase yerine local dosya sistemini kullanır
 * 
 * GET  /api/admin/popular-services         → Tüm servisleri getir
 * POST /api/admin/popular-services         → Yeni servis ekle
 * PUT  /api/admin/popular-services         → Servis güncelle
 * DELETE /api/admin/popular-services?id=xxx → Servis sil
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "popular-services.json");

interface PopularServiceData {
  id: string;
  type: "transfer" | "tour" | "guide";
  name: string;
  nameEn?: string;
  nameTr?: string;
  description: string;
  descriptionEn?: string;
  descriptionTr?: string;
  icon: string;
  distance?: { km: number; text: string };
  duration: { text: string; hours: number };
  price: { display: string; baseAmount: number; type: "per_km" | "per_person" | "fixed" };
  vehiclePrices?: {
    sedan?: number;
    van?: number;
    bus?: number;
    vip?: number;
    jeep?: number;
    coster?: number;
  };
  route?: { from: string; to: string; stops?: string[] };
  tourDetails?: {
    highlights: string[];
    includes: string[];
    minParticipants: number;
    maxParticipants: number;
    fullDescription?: string;
    stopsDescription?: { stopName: string; description: string }[];
  };
  isPopular: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface DataStore {
  services: PopularServiceData[];
  lastUpdated: string;
}

function readData(): DataStore {
  if (!existsSync(DATA_FILE)) {
    return { services: [], lastUpdated: new Date().toISOString() };
  }
  const raw = readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as DataStore;
}

function writeData(store: DataStore): void {
  store.lastUpdated = new Date().toISOString();
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function generateId(): string {
  return `ps-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// GET - Tüm servisleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const onlyPopular = searchParams.get("onlyPopular");
    const limitCount = searchParams.get("limit");

    const store = readData();
    let services = [...store.services];

    // Filtreler
    if (type) {
      services = services.filter((s) => s.type === type);
    }
    if (onlyPopular === "true") {
      services = services.filter((s) => s.isPopular);
    }

    // Sıralama (order'a göre)
    services.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Limit
    if (limitCount) {
      services = services.slice(0, parseInt(limitCount, 10));
    }

    return NextResponse.json({ services, total: services.length });
  } catch (error) {
    console.error("GET popular-services error:", error);
    return NextResponse.json({ error: "Veriler okunamadı" }, { status: 500 });
  }
}

// POST - Yeni servis ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = readData();

    const newService: PopularServiceData = {
      ...body,
      id: generateId(),
      order: body.order ?? store.services.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.services.push(newService);
    writeData(store);

    return NextResponse.json({ id: newService.id, service: newService });
  } catch (error) {
    console.error("POST popular-services error:", error);
    return NextResponse.json({ error: "Servis eklenemedi" }, { status: 500 });
  }
}

// PUT - Servis güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const store = readData();
    const index = store.services.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Servis bulunamadı" }, { status: 404 });
    }

    store.services[index] = {
      ...store.services[index],
      ...updates,
      id, // ID değişmesin
      updatedAt: new Date().toISOString(),
    };

    writeData(store);

    return NextResponse.json({ service: store.services[index] });
  } catch (error) {
    console.error("PUT popular-services error:", error);
    return NextResponse.json({ error: "Servis güncellenemedi" }, { status: 500 });
  }
}

// DELETE - Servis sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const store = readData();
    const index = store.services.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Servis bulunamadı" }, { status: 404 });
    }

    store.services.splice(index, 1);
    writeData(store);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE popular-services error:", error);
    return NextResponse.json({ error: "Servis silinemedi" }, { status: 500 });
  }
}
