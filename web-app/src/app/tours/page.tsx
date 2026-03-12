import { UpcomingUmrahTours } from "@/components/tours/UpcomingUmrahTours";
import { Badge } from "@/components/ui/Badge";
import { Building2 } from "lucide-react";

export default function ToursPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,#065f4620,transparent_50%),radial-gradient(circle_at_80%_20%,#0891b220,transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              Umre Turları
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
            Umre Turları
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl text-lg">
            UmreDunyasi güvencesiyle yaklaşan umre turlarını keşfedin.
          </p>
        </div>
      </section>

      {/* UmreDunyasi Yaklaşan Umre Turları Widget */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UpcomingUmrahTours
          limit={12}
          showTitle={false}
          showViewAll={true}
          className="py-8"
        />
      </div>
    </div>
  );
}
