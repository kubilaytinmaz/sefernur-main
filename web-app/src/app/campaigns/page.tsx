"use client";

import {
    EmptyState,
    ErrorState,
    LoadingState,
} from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getActiveCampaigns } from "@/lib/firebase/domain";
import { campaignTypeLabels, type CampaignModel } from "@/types/campaign";
import { useQuery } from "@tanstack/react-query";
import {
    Bus,
    Car,
    Gift,
    Hotel,
    Map,
    Sparkles,
    UserCheck,
} from "lucide-react";
import Image from "next/image";

const CAMPAIGN_TYPE_ICONS: Record<string, React.ReactNode> = {
  hotel: <Hotel className="w-4 h-4" />,
  car: <Car className="w-4 h-4" />,
  transfer: <Bus className="w-4 h-4" />,
  tour: <Map className="w-4 h-4" />,
  guide: <UserCheck className="w-4 h-4" />,
};

export default function CampaignsPage() {
  const {
    data: campaigns,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => getActiveCampaigns(),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <Badge className="bg-white/15 border-white/25 text-white mb-4">
            <Gift className="w-3.5 h-3.5 mr-1.5" />
            Fırsatlar
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold max-w-2xl leading-tight">
            Kampanyalar & İndirimler
          </h1>
          <p className="mt-3 text-emerald-100 max-w-xl text-lg">
            Umre yolculuğunuzu daha uygun hale getirecek güncel kampanyalarımızı
            keşfedin.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <LoadingState title="Kampanyalar yükleniyor" />
        ) : error ? (
          <ErrorState title="Kampanyalar yüklenemedi" />
        ) : !campaigns || (campaigns as CampaignModel[]).length === 0 ? (
          <EmptyState
            title="Şu an aktif kampanya bulunmuyor"
            description="Yeni kampanyalar eklendiğinde bu sayfada listelenecektir. Bildirim almak için bültenimize abone olun!"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(campaigns as CampaignModel[]).map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </section>

      {/* Info Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900">
              Özel fırsatlardan haberdar olun
            </h3>
            <p className="text-sm text-emerald-700 mt-1">
              Yeni kampanyalar ve erken rezervasyon fırsatlarından ilk siz
              haberdar olun. Sayfanın altındaki bülten formunu kullanarak abone
              olabilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: CampaignModel }) {
  const typeLabel = campaignTypeLabels[campaign.type] ?? campaign.type;
  const typeIcon = CAMPAIGN_TYPE_ICONS[campaign.type] ?? <Gift className="w-4 h-4" />;

  return (
    <Card className="overflow-hidden border-slate-200 hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="relative h-48 bg-slate-200">
        {campaign.imageUrl ? (
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
            <Gift className="w-10 h-10 text-emerald-400" />
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs gap-1">
            {typeIcon} {typeLabel}
          </Badge>
        </div>
        <h3 className="font-semibold text-slate-900 text-lg line-clamp-2">
          {campaign.title}
        </h3>
        <p className="text-sm text-slate-500 mt-1.5 line-clamp-3">
          {campaign.shortDescription}
        </p>
      </CardContent>
    </Card>
  );
}
