/**
 * Transfer Lokasyonları Hook
 * Admin panelinden yönetilebilir lokasyonlar için React Query hooks
 */

import {
    createTransferLocation,
    deleteTransferLocation,
    getActiveTransferLocations,
    getAllTransferLocations,
    getLocationsByCity,
    getLocationsByType,
    getTransferLocationById,
    getTransferLocationStats,
    updateTransferLocation,
} from "@/lib/data/transfer-locations-data";
import type { LocationType, TransferLocationInput } from "@/types/transfer-location";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────
// QUERY HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Tüm lokasyonları getir
 */
export function useTransferLocations(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["transferLocations"],
    queryFn: getAllTransferLocations,
    staleTime: 5 * 60 * 1000, // 5 dakika
    enabled: options?.enabled,
  });
}

/**
 * Sadece aktif lokasyonları getir (frontend için)
 */
export function useActiveTransferLocations(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["transferLocations", "active"],
    queryFn: getActiveTransferLocations,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * ID'ye göre lokasyon getir
 */
export function useTransferLocation(id: string, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["transferLocation", id],
    queryFn: () => getTransferLocationById(id),
    enabled: options?.enabled && !!id,
  });
}

/**
 * Tipe göre lokasyonları getir
 */
export function useLocationsByType(type: LocationType, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["transferLocations", "type", type],
    queryFn: () => getLocationsByType(type),
    enabled: options?.enabled && !!type,
  });
}

/**
 * Şehire göre lokasyonları getir
 */
export function useLocationsByCity(city: string, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["transferLocations", "city", city],
    queryFn: () => getLocationsByCity(city),
    enabled: options?.enabled && !!city,
  });
}

/**
 * Lokasyon istatistiklerini getir
 */
export function useTransferLocationStats(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["transferLocationStats"],
    queryFn: getTransferLocationStats,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

// ─────────────────────────────────────────────────────────────
// MUTATION HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Yeni lokasyon ekle
 */
export function useCreateTransferLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferLocationInput) => createTransferLocation(data),
    onSuccess: () => {
      // İlgili tüm query'leri invalidate et
      queryClient.invalidateQueries({ queryKey: ["transferLocations"] });
      queryClient.invalidateQueries({ queryKey: ["transferLocationStats"] });
    },
  });
}

/**
 * Lokasyon güncelle
 */
export function useUpdateTransferLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransferLocationInput> }) =>
      updateTransferLocation(id, data),
    onSuccess: (_, variables) => {
      // İlgili tüm query'leri invalidate et
      queryClient.invalidateQueries({ queryKey: ["transferLocations"] });
      queryClient.invalidateQueries({ queryKey: ["transferLocation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["transferLocationStats"] });
    },
  });
}

/**
 * Lokasyon sil
 */
export function useDeleteTransferLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransferLocation(id),
    onSuccess: () => {
      // İlgili tüm query'leri invalidate et
      queryClient.invalidateQueries({ queryKey: ["transferLocations"] });
      queryClient.invalidateQueries({ queryKey: ["transferLocationStats"] });
    },
  });
}
