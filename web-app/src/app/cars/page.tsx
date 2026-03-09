"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Clock3, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CarsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/30">
          <CardContent className="p-10 md:p-14 text-center">
            <Badge className="mx-auto bg-amber-500/20 text-amber-200 border border-amber-300/30">
              <Clock3 className="w-3.5 h-3.5 mr-1" />
              Geçici Olarak Pasif
            </Badge>
            <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight">
              Araç Kiralama Çok Yakında
            </h1>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Bu bölümü yeni bir deneyimle yeniden kurguluyoruz. Şimdilik transfer,
              tur ve rehber servislerimiz aktif olarak devam ediyor.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              <Button size="md" className="bg-emerald-600 hover:bg-emerald-500">
                <Link href="/transfers" className="flex items-center gap-2">
                  Transferlere Git
                </Link>
              </Button>
              <Button variant="outline" size="md" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/tours" className="flex items-center gap-2">
                  Turları İncele
                </Link>
              </Button>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              Güncelleme sonrası bu sayfa tekrar aktif olacak.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
