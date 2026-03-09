"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Star } from "lucide-react";

/* ────────── Types ────────── */

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: string;
  relative_time_description: string;
}

interface GooglePlaceDetails {
  result: {
    reviews?: GoogleReview[];
    rating?: number;
    user_ratings_total?: number;
    url?: string;
  };
}

interface HotelReviewsProps {
  hotelId: string;
  hotelName: string;
  lat?: number;
  lng?: number;
  googleRating?: number;
  googleReviewCount?: number;
  googlePlaceId?: string;
}

/* ────────── Helpers ────────── */

function formatDate(timeDescription: string): string {
  // Google returns relative time like "2 months ago", "1 week ago"
  // We'll just return it as-is for now
  return timeDescription;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-red-100 text-red-700",
    "bg-orange-100 text-orange-700",
    "bg-amber-100 text-amber-700",
    "bg-green-100 text-green-700",
    "bg-emerald-100 text-emerald-700",
    "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

/* ────────── Sub-Components ────────── */

interface ReviewCardProps {
  review: GoogleReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  const initials = getInitials(review.author_name);
  const avatarColor = getAvatarColor(review.author_name);

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-sm font-bold shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{review.author_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">{formatDate(review.relative_time_description)}</span>
          </div>
        </div>
      </div>

      {/* Review Text */}
      {review.text && (
        <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">{review.text}</p>
      )}

      {!review.text && (
        <p className="text-sm text-slate-500 italic">Bu yorum için metin mevcut değil.</p>
      )}
    </div>
  );
}

interface RatingSummaryProps {
  rating: number;
  reviewCount: number;
  placeUrl?: string;
}

function RatingSummary({ rating, reviewCount, placeUrl }: RatingSummaryProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60">
      <div className="text-center">
        <p className="text-4xl font-bold text-amber-900">{rating.toFixed(1)}</p>
        <div className="flex items-center gap-0.5 justify-center mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-amber-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-amber-700 mt-1">{reviewCount} değerlendirme</p>
      </div>

      {placeUrl && (
        <a
          href={placeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-amber-200 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Google&apos;da gör
        </a>
      )}
    </div>
  );
}

/* ────────── Main Component ────────── */

export function HotelReviews({
  hotelId,
  hotelName,
  lat,
  lng,
  googleRating,
  googleReviewCount,
  googlePlaceId,
}: HotelReviewsProps) {
  // Fetch detailed reviews from Google Places API
  const { data: placeDetails, isLoading } = useQuery({
    queryKey: ["hotelReviews", hotelId, googlePlaceId],
    enabled: Boolean(googlePlaceId),
    queryFn: async () => {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (!apiKey || !googlePlaceId) return null;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=rating,reviews,url&key=${apiKey}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data as GooglePlaceDetails;
    },
  });

  const reviews = placeDetails?.result?.reviews || [];
  const rating = placeDetails?.result?.rating || googleRating;
  const reviewCount = placeDetails?.result?.user_ratings_total || googleReviewCount;
  const placeUrl = placeDetails?.result?.url;

  // If no reviews data available, show placeholder
  if (!rating && !isLoading) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-emerald-600" />
            Değerlendirmeler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">Henüz değerlendirme bilgisi mevcut değil.</p>
            <p className="text-xs text-slate-500 mt-1">Google Places&apos;tan bilgiler yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="w-5 h-5 text-emerald-600" />
          Değerlendirmeler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        {rating && reviewCount && (
          <RatingSummary rating={rating} reviewCount={reviewCount} placeUrl={placeUrl} />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600">Değerlendirmeler yükleniyor...</p>
          </div>
        )}

        {/* Reviews List */}
        {!isLoading && reviews.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-700">Son Değerlendirmeler</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {reviews.slice(0, 4).map((review, index) => (
                <ReviewCard key={index} review={review} />
              ))}
            </div>

            {reviews.length > 4 && placeUrl && (
              <a
                href={placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Tüm {reviews.length} değerlendirmeyi gör
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* No Reviews */}
        {!isLoading && reviews.length === 0 && rating && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-600">
              Bu otel için {rating.toFixed(1)} ortalama puan var ancak detaylı yorum mevcut değil.
            </p>
            {placeUrl && (
              <a
                href={placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                Google&apos;da incele
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
