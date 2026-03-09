"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import {
    activityTypeIcons,
    activityTypeLabels,
    SUGGESTED_ACTIVITIES,
    SuggestedActivity,
    TripActivity,
    TripDay,
    TripPlan,
} from "@/types/trip-planner";
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Clock,
    Download,
    MapPin,
    Plus,
    Save,
    Share2,
    Sparkles,
    Trash2
} from "lucide-react";
import { useCallback, useState } from "react";

/* ────────── Props ────────── */

export interface TripPlannerProps {
  initialPlan?: Partial<TripPlan>;
  onSave?: (plan: TripPlan) => void;
  onExport?: (plan: TripPlan) => void;
  onShare?: (plan: TripPlan) => void;
}

/* ────────── Main Component ────────── */

export function TripPlanner({ initialPlan, onSave, onExport, onShare }: TripPlannerProps) {
  const [plan, setPlan] = useState<Partial<TripPlan>>({
    title: initialPlan?.title || "",
    description: initialPlan?.description || "",
    destination: initialPlan?.destination || "mekke",
    startDate: initialPlan?.startDate || new Date(),
    endDate: initialPlan?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    travelers: initialPlan?.travelers || 1,
    totalBudget: initialPlan?.totalBudget,
    days: initialPlan?.days || [],
  });

  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{ dayId: string; activity: TripActivity } | null>(null);

  // Gün sayısını hesapla
  const dayCount = Math.ceil(
    (plan.endDate!.getTime() - plan.startDate!.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  // Günleri oluştur veya güncelle
  const ensureDays = useCallback(() => {
    const days: TripDay[] = [];
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(plan.startDate!);
      date.setDate(date.getDate() + i);
      
      const existingDay = plan.days?.find(d => 
        new Date(d.date).toDateString() === date.toDateString()
      );

      days.push(existingDay || {
        id: `day-${i}`,
        date,
        dayNumber: i + 1,
        activities: [],
        totalCost: 0,
      });
    }
    return days;
  }, [plan.startDate, plan.endDate, plan.days, dayCount]);

  const currentDays = ensureDays();

  // Toplam maliyeti hesapla
  const totalCost = currentDays.reduce((sum, day) => sum + day.totalCost, 0);

  // Gün genişletme/daraltma
  const toggleDay = (dayId: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) {
        next.delete(dayId);
      } else {
        next.add(dayId);
      }
      return next;
    });
  };

  // Aktivite ekleme
  const addActivity = (dayId: string, activity: TripActivity) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days?.map(day => {
        if (day.id === dayId) {
          const updatedActivities = [...day.activities, activity];
          return {
            ...day,
            activities: updatedActivities,
            totalCost: updatedActivities.reduce((sum, a) => sum + (a.cost || 0), 0),
          };
        }
        return day;
      }),
    }));
  };

  // Aktivite silme
  const removeActivity = (dayId: string, activityId: string) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days?.map(day => {
        if (day.id === dayId) {
          const updatedActivities = day.activities.filter(a => a.id !== activityId);
          return {
            ...day,
            activities: updatedActivities,
            totalCost: updatedActivities.reduce((sum, a) => sum + (a.cost || 0), 0),
          };
        }
        return day;
      }),
    }));
  };

  // Önerilen aktiviteyi ekle
  const addSuggestedActivity = (dayId: string, suggested: SuggestedActivity) => {
    const activity: TripActivity = {
      id: `activity-${Date.now()}`,
      type: suggested.type,
      title: suggested.title,
      description: suggested.description,
      location: suggested.location,
      startTime: "09:00",
      endTime: new Date(Date.now() + suggested.estimatedDuration * 60000).toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      duration: suggested.estimatedDuration,
      cost: suggested.estimatedCost,
      isBooked: false,
    };
    addActivity(dayId, activity);
  };

  // Planı kaydet
  const handleSave = () => {
    if (onSave && plan.title) {
      onSave({
        ...plan,
        days: currentDays,
      } as TripPlan);
    }
  };

  // Planı dışa aktar
  const handleExport = () => {
    if (onExport) {
      onExport({
        ...plan,
        days: currentDays,
      } as TripPlan);
    }
  };

  // Planı paylaş
  const handleShare = () => {
    if (onShare) {
      onShare({
        ...plan,
        days: currentDays,
      } as TripPlan);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-700" />
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
            Sefer Planlayıcı
          </Badge>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {plan.title || "Yeni Sefer Planı"}
        </h1>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span className="capitalize">{plan.destination === "mekke" ? "Mekke" : "Medine"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>
              {plan.startDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
              {" - "}
              {plan.endDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{dayCount} gün</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{plan.travelers} kişi</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Save className="w-4 h-4" />
          Kaydet
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Dışa Aktar
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Paylaş
        </Button>
        <Button
          onClick={() => setShowSuggestions(!showSuggestions)}
          variant="outline"
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Öneriler
        </Button>
      </div>

      {/* Budget Summary */}
      <Card className="mb-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 uppercase tracking-wider font-medium">
                Tahmini Toplam Maliyet
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">
                {formatTlUsdPairFromTl(totalCost)}
              </p>
            </div>
            {plan.totalBudget && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Bütçe</p>
                <p className="text-sm font-medium text-slate-700">
                  {formatTlUsdPairFromTl(plan.totalBudget)}
                </p>
                <p className={`text-xs mt-1 ${totalCost > plan.totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                  {totalCost > plan.totalBudget 
                    ? `Bütçe aşıldı: +${formatTlUsdPairFromTl(totalCost - plan.totalBudget)}`
                    : `Kalan: ${formatTlUsdPairFromTl(plan.totalBudget - totalCost)}`
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Activities */}
      {showSuggestions && (
        <Card className="mb-6 border-slate-200 bg-white">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Önerilen Aktiviteler
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {SUGGESTED_ACTIVITIES
                .filter(a => a.destination === plan.destination)
                .map((activity, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl">{activityTypeIcons[activity.type]}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-900 truncate">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{activity.estimatedDuration} dk</span>
                        {activity.estimatedCost && (
                          <span>• {formatTlUsdPairFromTl(activity.estimatedCost)}</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          const dayId = currentDays[0]?.id;
                          if (dayId) addSuggestedActivity(dayId, activity);
                        }}
                      >
                        <Plus className="w-3 h-3" />
                        Ekle
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Days */}
      <div className="space-y-4">
        {currentDays.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            isExpanded={expandedDays.has(day.id)}
            onToggle={() => toggleDay(day.id)}
            onAddActivity={(activity) => addActivity(day.id, activity)}
            onRemoveActivity={(activityId) => removeActivity(day.id, activityId)}
          />
        ))}
      </div>
    </div>
  );
}

/* ────────── Day Card Component ────────── */

interface DayCardProps {
  day: TripDay;
  isExpanded: boolean;
  onToggle: () => void;
  onAddActivity: (activity: TripActivity) => void;
  onRemoveActivity: (activityId: string) => void;
}

function DayCard({ day, isExpanded, onToggle, onAddActivity, onRemoveActivity }: DayCardProps) {
  const [newActivityType, setNewActivityType] = useState<TripActivity["type"]>("visit");

  const addNewActivity = () => {
    const activity: TripActivity = {
      id: `activity-${Date.now()}`,
      type: newActivityType,
      title: activityTypeLabels[newActivityType],
      location: { name: "" },
      startTime: "09:00",
      endTime: "10:00",
      duration: 60,
      cost: 0,
      isBooked: false,
    };
    onAddActivity(activity);
  };

  return (
    <Card className="border-slate-200 bg-white overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Gün {day.dayNumber}
            </h3>
            <p className="text-sm text-slate-500">
              {day.date.toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">{day.activities.length} aktivite</p>
            <p className="text-sm font-medium text-emerald-700">
              {formatTlUsdPairFromTl(day.totalCost)}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200 p-4">
          {/* Activities List */}
          {day.activities.length > 0 ? (
            <div className="space-y-3 mb-4">
              {day.activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onRemove={() => onRemoveActivity(activity.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              Henüz aktivite eklenmedi
            </div>
          )}

          {/* Add Activity */}
          <div className="flex gap-2">
            <select
              value={newActivityType}
              onChange={(e) => setNewActivityType(e.target.value as TripActivity["type"])}
              className="flex-1 h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(activityTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {activityTypeIcons[value as TripActivity["type"]]} {label}
                </option>
              ))}
            </select>
            <Button
              onClick={addNewActivity}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Ekle
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ────────── Activity Card Component ────────── */

interface ActivityCardProps {
  activity: TripActivity;
  onRemove: () => void;
}

function ActivityCard({ activity, onRemove }: ActivityCardProps) {
  return (
    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{activityTypeIcons[activity.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-medium text-slate-900">
                {activity.title}
              </h4>
              {activity.location.name && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {activity.location.name}
                </p>
              )}
            </div>
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{activity.startTime} - {activity.endTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{activity.duration} dk</span>
            </div>
            {activity.cost && activity.cost > 0 && (
              <div className="font-medium text-emerald-700">
                {formatTlUsdPairFromTl(activity.cost)}
              </div>
            )}
          </div>

          {activity.description && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2">
              {activity.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
