"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Card, CardContent } from "@/components/ui/Card";
import { getUserReviews } from "@/lib/firebase/domain";
import { useAuthStore } from "@/store/auth";
import { ReviewServiceType, reviewTypeLabels } from "@/types/review";
import { useQuery } from "@tanstack/react-query";
import { Filter, MessageSquare, Star } from "lucide-react";
import { useState } from "react";

type TypeFilter = "all" | ReviewServiceType;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProfileReviews() {
  const { user } = useAuthStore();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const reviewsQuery = useQuery({
    queryKey: ["reviews", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getUserReviews(user?.id ?? ""),
  });

  const reviews = reviewsQuery.data ?? [];

  const filtered =
    typeFilter === "all"
      ? reviews
      : reviews.filter((r) => r.serviceType === typeFilter);

  const availableTypes = Array.from(
    new Set(reviews.map((r) => r.serviceType))
  );

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (reviewsQuery.isLoading) {
    return <LoadingState title="Yorumlar yükleniyor" description="Değerlendirmeleriniz hazırlanıyor..." />;
  }

  if (reviewsQuery.isError) {
    return (
      <ErrorState
        title="Yorumlar alınamadı"
        description="Lütfen tekrar deneyin."
        onRetry={() => reviewsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      {reviews.length > 0 && (
        <Card className="border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {avgRating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(avgRating)} />
                <p className="text-xs text-gray-500 mt-1">
                  {reviews.length} değerlendirme
                </p>
              </div>
              <div className="h-16 w-px bg-gray-100" />
              <div className="flex flex-wrap gap-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(
                    (r) => Math.round(r.rating) === star
                  ).length;
                  const pct =
                    reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3">{star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-4">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {reviews.length > 0 && (
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Kategori:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    typeFilter === "all"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Tümü ({reviews.length})
                </button>
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      typeFilter === type
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {reviewTypeLabels[type]} (
                    {reviews.filter((r) => r.serviceType === type).length})
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Yorum bulunamadı"
          description={
            typeFilter !== "all"
              ? "Bu kategoride yorum bulunmuyor."
              : "Henüz değerlendirme yapmadınız."
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((review) => (
            <Card key={review.id} className="border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {review.serviceName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-gray-50 text-xs text-gray-500 font-medium">
                        {reviewTypeLabels[review.serviceType]}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    {review.comment && (
                      <div className="mt-3 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {review.createdAt.toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center pt-2">
          Toplam {filtered.length} yorum gösteriliyor
        </p>
      )}
    </div>
  );
}
