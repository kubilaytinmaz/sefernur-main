"use client";

import type { BookingStep } from "@/types/hotel-booking";
import { BedDouble, Check, CreditCard } from "lucide-react";

interface BookingStepperProps {
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
}

const steps = [
  { id: "room" as BookingStep, label: "Oda Seçimi", icon: BedDouble },
  { id: "checkout" as BookingStep, label: "Bilgiler & Ödeme", icon: CreditCard },
];

export function BookingStepper({
  currentStep,
  onStepClick,
}: BookingStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white border-b border-slate-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentIndex;
            const isClickable = index < currentIndex && onStepClick;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-emerald-50 border-2 border-emerald-500"
                      : isCompleted
                        ? "bg-emerald-100 border-2 border-emerald-300 cursor-pointer hover:bg-emerald-200"
                        : "bg-slate-50 border-2 border-slate-200"
                  } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                >
                  {/* Icon/Number */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-emerald-500 text-white"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-slate-500">
                      Adım {index + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isActive
                          ? "text-emerald-700"
                          : isCompleted
                            ? "text-emerald-600"
                            : "text-slate-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex items-center mx-4">
                    <div
                      className={`h-0.5 w-12 sm:w-20 ${
                        isCompleted ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
