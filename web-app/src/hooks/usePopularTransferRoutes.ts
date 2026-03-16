/**
 * Popüler Transfer Rotaları Hook
 * Admin panelinden yönetilebilir popüler transfer rotaları için React Query hooks
 */

import {
    createPopularTransferRoute,
    deletePopularTransferRoute,
    getActivePopularTransferRoutes,
    getActiveTransferRoutes,
    getAllPopularTransferRoutes,
    getAllRoutesWithLocations,
    getPopularTransferRouteById,
    getPopularTransferRouteStats,
    getRouteWithLocations,
    updatePopularTransferRoute,
} from "@/lib/data/popular-transfer-routes-data";
import type { PopularTransferRouteInput } from "@/types/popular-transfer-route";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────
// QUERY HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Tüm popüler rotaları getir
 */
export function usePopularTransferRoutes(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["popularTransferRoutes"],
    queryFn: getAllPopularTransferRoutes,
    staleTime: 5 * 60 * 1000, // 5 dakika
    enabled: options?.enabled,
  });
}

/**
 * Sadece aktif ve popüler rotaları getir (frontend için)
 */
export function useActivePopularTransferRoutes(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["popularTransferRoutes", "active", "popular"],
    queryFn: getActivePopularTransferRoutes,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * Sadece aktif rotaları getir (tüm rotalar, popüler olmayan dahil)
 */
export function useActiveTransferRoutes(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["popularTransferRoutes", "active"],
    queryFn: getActiveTransferRoutes,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * ID'ye göre rota getir
 */
export function usePopularTransferRoute(id: string, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["popularTransferRoute", id],
    queryFn: () => getPopularTransferRouteById(id),
    enabled: options?.enabled && !!id,
  });
}

/**
 * Lokasyon bilgileriyle birlikte rota getir
 */
export function useRouteWithLocations(routeId: string, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["popularTransferRoute", routeId, "withLocations"],
    queryFn: () => getRouteWithLocations(routeId),
    enabled: options?.enabled && !!routeId,
  });
}

/**
 * Tüm rotaları lokasyon bilgileriyle birlikte getir
 */
export function useAllRoutesWithLocations(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["popularTransferRoutes", "withLocations"],
    queryFn: getAllRoutesWithLocations,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * Rota istatistiklerini getir
 */
export function usePopularTransferRouteStats(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["popularTransferRouteStats"],
    queryFn: getPopularTransferRouteStats,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

// ─────────────────────────────────────────────────────────────
// MUTATION HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Yeni popüler rota ekle
 */
export function useCreatePopularTransferRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PopularTransferRouteInput) => createPopularTransferRoute(data),
    onSuccess: () => {
      // İlgili tüm query'leri invalidate et
      queryClient.invalidateQueries({ queryKey: ["popularTransferRoutes"] });
      queryClient.invalidateQueries({ queryKey: ["popularTransferRouteStats"] });
    },
  });
}

/**
 * Popüler rota güncelle
 */
export function useUpdatePopularTransferRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PopularTransferRouteInput> }) =>
      updatePopularTransferRoute(id, data),
    onSuccess: (_, variables) => {
      // İlgili tüm query'leri invalidate et
      queryClient.invalidateQueries({ queryKey: ["popularTransferRoutes"] });
      queryClient.invalidateQueries({ queryKey: ["popularTransferRoute", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["popularTransferRouteStats"] });
    },
  });
}

/**
 * Popüler rota sil
 */
export function useDeletePopularTransferRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePopularTransferRoute(id),
    onSuccess: () => {
      // İlgili tüm query'leri invalidate et
      queryClient.invalidateQueries({ queryKey: ["popularTransferRoutes"] });
      queryClient.invalidateQueries({ queryKey: ["popularTransferRouteStats"] });
    },
  });
}
