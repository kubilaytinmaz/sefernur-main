"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | Date;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  keyExtractor: (row: T) => string;
}

// ─── Component ────────────────────────────────────────────────────────
export function DataTable<T>({
  data,
  columns,
  onRowClick,
  emptyMessage = "Veri bulunamadı",
  className,
  keyExtractor,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("desc");
    }
  };

  const sortedData = (() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) => {
      const aVal = col.sortValue!(a);
      const bVal = col.sortValue!(b);
      let cmp = 0;
      if (aVal < bVal) cmp = -1;
      else if (aVal > bVal) cmp = 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  })();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-200 bg-white",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500",
                    col.sortable && "cursor-pointer select-none hover:text-gray-700",
                    col.className,
                  )}
                  onClick={() => handleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable &&
                      (sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors hover:bg-gray-50",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "whitespace-nowrap px-4 py-3 text-gray-700",
                        col.className,
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
