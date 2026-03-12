import { MessageSquare, Search, Star, User } from "lucide-react";
import { useState } from "react";

interface ReviewsTabProps {
  transferId: string;
}

// Mock review data (gerçek uygulamada Firebase'den gelecek)
interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  adminResponse?: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    userId: "u1",
    userName: "Ahmet Yılmaz",
    rating: 5,
    comment: "Çok temiz ve konforlu bir araçtı. Şoför çok nazikti. Kesinlikle tavsiye ederim.",
    createdAt: "2024-03-01T10:30:00",
    adminResponse: "Teşekkür ederiz!",
  },
  {
    id: "r2",
    userId: "u2",
    userName: "Fatma Kaya",
    rating: 4,
    comment: "Genel olarak memnun kaldık. Sadece biraz geç geldi.",
    createdAt: "2024-02-15T14:20:00",
  },
  {
    id: "r3",
    userId: "u3",
    userName: "Mehmet Demir",
    rating: 5,
    comment: "Harika bir deneyimdi. Araç tertemizdi ve çok rahat bir yolculuk yaptık.",
    createdAt: "2024-02-10T08:15:00",
  },
  {
    id: "r4",
    userId: "u4",
    userName: "Zeynep Arslan",
    rating: 3,
    comment: "Fiyata göre idare eder seviyedeydi.",
    createdAt: "2024-01-20T16:45:00",
  },
  {
    id: "r5",
    userId: "u5",
    userName: "Ali Öztürk",
    rating: 5,
    comment: "Her şey mükemmeldi. Tekrar tercih edeceğiz.",
    createdAt: "2024-01-05T09:00:00",
  },
];

export function ReviewsTab({ transferId }: ReviewsTabProps) {
  const [reviews] = useState<Review[]>(MOCK_REVIEWS);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminResponses, setAdminResponses] = useState<Record<string, string>>({});
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);

  // İstatistikler
  const totalReviews = reviews.length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage:
      reviews.length > 0
        ? Math.round((reviews.filter((r) => r.rating === stars).length / reviews.length) * 100)
        : 0,
  }));

  const filteredReviews = searchQuery
    ? reviews.filter(
        (r) =>
          r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.comment.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : reviews;

  const handleSaveResponse = (reviewId: string) => {
    const response = adminResponses[reviewId];
    if (response?.trim()) {
      // Firebase'e kaydetme yapılacak
      console.log("Yanıt kaydedildi:", reviewId, response);
    }
    setEditingResponseId(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Ortalama Puan</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Toplam Değerlendirme</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalReviews}</p>
        </div>
        <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-sm font-medium text-gray-500">Puan Dağılımı</p>
          <div className="space-y-2">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-2">
                <span className="w-8 text-right text-xs font-medium text-gray-600">
                  {dist.stars}
                </span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-gray-500">
                  {dist.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Değerlendirmelerde ara..."
        />
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">Henüz değerlendirme yok</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.userName}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600">{review.comment}</p>

              {/* Admin Response */}
              {review.adminResponse && editingResponseId !== review.id && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Admin Yanıtı</p>
                  <p className="mt-1 text-sm text-gray-700">{review.adminResponse}</p>
                </div>
              )}

              {/* Admin Response Input */}
              {editingResponseId === review.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={2}
                    value={adminResponses[review.id] || review.adminResponse || ""}
                    onChange={(e) =>
                      setAdminResponses((prev) => ({
                        ...prev,
                        [review.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Yanıtınızı yazın..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveResponse(review.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditingResponseId(null)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingResponseId(review.id)}
                  className="mt-3 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  {review.adminResponse ? "Yanıtı Düzenle" : "Yanıt Ekle"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
