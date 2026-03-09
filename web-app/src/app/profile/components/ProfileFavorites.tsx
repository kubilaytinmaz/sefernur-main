"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Card, CardContent } from "@/components/ui/Card";
import { getUserFavorites, removeFavorite } from "@/lib/firebase/domain";
import { useAuthStore } from "@/store/auth";
import { FavoriteTargetType, favoriteTypeLabels } from "@/types/favorite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, Heart, Star, Trash2 } from "lucide-react";
import { useState } from "react";

type TypeFilter = "all" | FavoriteTargetType;

export default function ProfileFavorites() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const favoritesQuery = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getUserFavorites(user?.id ?? ""),
  });

  const removeMutation = useMutation({
    mutationFn: async ({
      targetType,
      targetId,
    }: {
      targetType: FavoriteTargetType;
      targetId: string;
    }) => {
      if (!user?.id) throw new Error("User not found");
      return removeFavorite(user.id, targetType, targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });

  const favorites = favoritesQuery.data ?? [];
  const filtered =
    typeFilter === "all"
      ? favorites
      : favorites.filter((f) => f.targetType === typeFilter);

  // Get unique types that exist in data
  const availableTypes = Array.from(
    new Set(favorites.map((f) => f.targetType))
  );

  if (favoritesQuery.isLoading) {
    return <LoadingState title="Favoriler yükleniyor" description="Favori listesi hazırlanıyor..." />;
  }

  if (favoritesQuery.isError) {
    return (
      <ErrorState
        title="Favoriler alınamadı"
        description="Lütfen tekrar deneyin."
        onRetry={() => favoritesQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      {favorites.length > 0 && (
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
                  Tümü ({favorites.length})
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
                    {favoriteTypeLabels[type]} (
                    {favorites.filter((f) => f.targetType === type).length})
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
          title="Favori bulunamadı"
          description={
            typeFilter !== "all"
              ? "Bu kategoride favori bulunmuyor."
              : "Henüz favori eklenmedi. Oteller, turlar ve daha fazlasını favorilerinize ekleyebilirsiniz."
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((fav) => (
            <Card
              key={fav.id}
              className="overflow-hidden border-gray-100 group"
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-100">
                {fav.meta?.image ? (
                  <img
                    src={fav.meta.image}
                    alt={fav.meta.title ?? "Favori"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-hotel.jpg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                    <Heart className="w-8 h-8 text-emerald-200" />
                  </div>
                )}

                {/* Type Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700">
                  {favoriteTypeLabels[fav.targetType]}
                </span>

                {/* Remove Button */}
                <button
                  onClick={() =>
                    removeMutation.mutate({
                      targetType: fav.targetType,
                      targetId: fav.targetId,
                    })
                  }
                  disabled={removeMutation.isPending}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  title="Favorilerden kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {fav.meta?.title ?? "İsimsiz"}
                </h4>
                {fav.meta?.subtitle && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {fav.meta.subtitle}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  {fav.meta?.rating ? (
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {fav.meta.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-gray-400">
                    {fav.createdAt.toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center pt-2">
          Toplam {filtered.length} favori gösteriliyor
        </p>
      )}
    </div>
  );
}
