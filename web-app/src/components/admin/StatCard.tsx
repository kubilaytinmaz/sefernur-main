"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconColor = "text-emerald-600",
  iconBg = "bg-emerald-50",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.value >= 0 ? "text-emerald-600" : "text-red-500",
              )}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              <span className="text-gray-400">{trend.label}</span>
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-3", iconBg)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}
