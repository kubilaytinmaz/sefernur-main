"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-gray-500">
        Sayfa {currentPage} / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "min-w-[2rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                page === currentPage
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              {page}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
