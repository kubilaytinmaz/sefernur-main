"use client";

import { TripPlanner } from "@/components/trip-planner/TripPlanner";
import { TripPlan } from "@/types/trip-planner";
import { useState } from "react";

export default function TripPlannerPage() {
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (plan: TripPlan) => {
    // TODO: Firebase'e kaydet
    console.log("Plan kaydedildi:", plan);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleExport = (plan: TripPlan) => {
    // PDF veya metin olarak dışa aktar
    const text = generatePlanText(plan);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.title || "sefer-plani"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (plan: TripPlan) => {
    const text = `${plan.title}\n${plan.destination} - ${plan.days.length} gün\n${plan.startDate?.toLocaleDateString('tr-TR')} - ${plan.endDate?.toLocaleDateString('tr-TR')}`;
    
    if (navigator.share) {
      navigator.share({
        title: plan.title,
        text: text,
      }).catch(() => {
        // Paylaşım iptal edildi
      });
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Saved Notification */}
      {savedNotification && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg animate-slide-in">
          Plan başarıyla kaydedildi!
        </div>
      )}

      <TripPlanner
        initialPlan={{
          title: "Umre Seyahati Planı",
          destination: "mekke",
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          travelers: 2,
          totalBudget: 15000,
        }}
        onSave={handleSave}
        onExport={handleExport}
        onShare={handleShare}
      />
    </div>
  );
}

function generatePlanText(plan: TripPlan): string {
  let text = `${plan.title}\n${"=".repeat(40)}\n\n`;
  text += `Destinasyon: ${plan.destination}\n`;
  text += `Tarih: ${plan.startDate?.toLocaleDateString('tr-TR')} - ${plan.endDate?.toLocaleDateString('tr-TR')}\n`;
  text += `Yolcu: ${plan.travelers} kişi\n\n`;

  plan.days.forEach((day) => {
    text += `--- Gün ${day.dayNumber}: ${day.date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })} ---\n`;
    
    if (day.activities.length === 0) {
      text += "  (Aktivite planlanmadı)\n";
    } else {
      day.activities.forEach((activity) => {
        text += `  ${activity.startTime}-${activity.endTime} | ${activity.title}`;
        if (activity.location.name) text += ` (${activity.location.name})`;
        if (activity.cost) text += ` - ${activity.cost} TL`;
        text += "\n";
        if (activity.description) text += `    ${activity.description}\n`;
      });
    }
    
    text += `  Gün Maliyeti: ${day.totalCost} TL\n\n`;
  });

  const totalCost = plan.days.reduce((sum, day) => sum + day.totalCost, 0);
  text += `${"=".repeat(40)}\n`;
  text += `Toplam Maliyet: ${totalCost} TL\n`;
  
  return text;
}
