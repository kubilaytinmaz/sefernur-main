"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { useState } from "react";

/* ────────── Types ────────── */

interface CancellationRule {
  fromDate: string;
  toDate?: string;
  percentage?: string;
  nights?: string;
  amount?: string;
  currency?: string;
}

interface CancellationPolicyProps {
  isRefundable?: boolean;
  cancellationRules?: CancellationRule[];
  checkIn: string;
}

/* ────────── Helpers ────────── */

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function parseRuleDescription(rule: CancellationRule): string {
  if (rule.percentage) {
    const pct = Number(rule.percentage);
    if (pct === 0) return "Ücretsiz iptal";
    if (pct === 100) return "Tam tutar iadesi yapılamaz";
    return `Toplam tutarın %${pct} kesintisi uygulanır`;
  }
  if (rule.nights) {
    return `${rule.nights} gecelik tutar kesintisi uygulanır`;
  }
  if (rule.amount && rule.currency) {
    return `${rule.amount} ${rule.currency} kesintisi uygulanır`;
  }
  return "İptal kesintisi uygulanır";
}

function isFreeCancellation(rules: CancellationRule[]): boolean {
  if (!rules || rules.length === 0) return false;
  // Check if first rule is free cancellation
  const firstRule = rules[0];
  return firstRule.percentage === "0" || firstRule.percentage === "0.00";
}

/* ────────── Main Component ────────── */

export function CancellationPolicy({
  isRefundable = true,
  cancellationRules,
  checkIn,
}: CancellationPolicyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasRules = cancellationRules && cancellationRules.length > 0;
  const freeCancel = hasRules && isFreeCancellation(cancellationRules);

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center justify-between w-full text-left cursor-pointer"
        >
          <CardTitle className="flex items-center gap-2 text-lg">
            {isRefundable ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-orange-600" />
            )}
            İptal Politikası
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Quick summary */}
        <div className="mt-2">
          {isRefundable ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">
                {freeCancel ? "Ücretsiz iptal mümkün" : "İade edilebilir"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">İade kısıtlı</span>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Collapsible Content */}
      {isOpen && (
        <CardContent className="pt-0 space-y-4">
          {/* Cancellation Rules */}
          {hasRules && (
            <div className="space-y-3 mt-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">İptal Kuralları</p>
              <div className="space-y-2">
                {cancellationRules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">{parseRuleDescription(rule)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(rule.fromDate)} tarihinden itibaren
                        {rule.toDate && ` - ${formatDate(rule.toDate)} tarihine kadar`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No specific rules */}
          {!hasRules && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                {isRefundable
                  ? "Belirli tarih aralıklarına göre iptal koşulları uygulanır. Detaylı bilgi için rezervasyon onayına bakınız."
                  : "Bu oda seçeneği için iade yapılamaz. Rezervasyonu iptal etmeniz durumunda tam tutar tahsil edilir."}
              </p>
            </div>
          )}

          {/* General Info */}
          <div className="rounded-lg bg-blue-50 border border-blue-200/60 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 space-y-1">
                <p className="font-medium">Genel İptal Bilgisi</p>
                <p>
                  İptal ve iade koşulları seçilen oda tipine ve tarih aralığına göre değişiklik gösterebilir. 
                  Giriş tarihiniz: <strong>{formatDate(checkIn)}</strong>
                </p>
                <p>
                  Rezervasyon onaylandıktan sonra detaylı iptal koşulları e-posta adresinize gönderilir.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
