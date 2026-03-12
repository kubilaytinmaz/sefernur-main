import { TransferModel } from "@/types/transfer";
import { ArrowDown, ArrowUp, Image as ImageIcon, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";

interface ImagesTabProps {
  transfer: Partial<TransferModel>;
  onUpdate: (updates: Partial<TransferModel>) => void;
}

export function ImagesTab({ transfer, onUpdate }: ImagesTabProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const images = transfer.images || [];
  const mainImageIndex = images.findIndex((img) => img === (transfer as any).mainImage) ?? 0;

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;

    const url = newImageUrl.trim();
    const updates: Partial<TransferModel> = { images: [...images, url] };
    if (images.length === 0) {
      (updates as any).mainImage = url;
    }
    onUpdate(updates);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const mainImage = (transfer as any).mainImage;
    const updates: Partial<TransferModel> = { images: newImages };

    // Eğer silinen görsel ana görselse, yeni bir ana görsel belirle
    if (mainImage === images[index]) {
      (updates as any).mainImage = newImages[0] || undefined;
    }

    onUpdate(updates);
  };

  const handleSetMainImage = (index: number) => {
    onUpdate({
      mainImage: images[index],
    } as any);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onUpdate({ images: newImages });
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onUpdate({ images: newImages });
  };

  const handleBulkAdd = () => {
    const urls = newImageUrl
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    if (urls.length === 0) return;

    const updates: Partial<TransferModel> = { images: [...images, ...urls] };
    if (images.length === 0) {
      (updates as any).mainImage = urls[0];
    }
    onUpdate(updates);
    setNewImageUrl("");
  };

  return (
    <div className="space-y-6">
      {/* Add New Image */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Görsel Ekle</h3>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Görsel URL'si
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="https://example.com/image.jpg"
              />
              <button
                onClick={handleAddImage}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Ekle
              </button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Çoklu Ekleme (Her satıra bir URL)
            </label>
            <textarea
              rows={4}
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
            />
            <button
              onClick={handleBulkAdd}
              className="mt-2 flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Tümünü Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Images List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Görseller ({images.length})
          </h3>
          {images.length > 0 && (
            <span className="text-sm text-gray-500">
              Ana görsel: {mainImageIndex + 1}. sıra
            </span>
          )}
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12">
            <ImageIcon className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-600">Henüz görsel eklenmemiş</p>
            <p className="text-sm text-gray-500">Yukarıdaki alandan URL ekleyebilirsiniz</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedIndex !== null && draggedIndex !== index) {
                    const newImages = [...images];
                    const [removed] = newImages.splice(draggedIndex, 1);
                    newImages.splice(index, 0, removed);
                    onUpdate({ images: newImages });
                    setDraggedIndex(null);
                  }
                }}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                  index === mainImageIndex
                    ? "border-emerald-500 ring-2 ring-emerald-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Image */}
                <div className="aspect-video w-full bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={`Görsel ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3EHata%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Main Badge */}
                {index === mainImageIndex && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white">
                    <Star className="h-3 w-3 fill-white" />
                    Ana Görsel
                  </div>
                )}

                {/* Actions */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="rounded bg-white/90 p-1.5 text-gray-700 hover:bg-white disabled:opacity-50"
                      title="Yukarı taşı"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === images.length - 1}
                      className="rounded bg-white/90 p-1.5 text-gray-700 hover:bg-white disabled:opacity-50"
                      title="Aşağı taşı"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {index !== mainImageIndex && (
                      <button
                        onClick={() => handleSetMainImage(index)}
                        className="rounded bg-emerald-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                        title="Ana görsel yap"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="rounded bg-red-600 p-1.5 text-white hover:bg-red-700"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Index Badge */}
                <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-blue-900">İpuçları</h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>• İlk görsel varsayılan olarak ana görsel olarak ayarlanır</li>
          <li>• Görselleri sürükleyerek sıralayabilirsiniz</li>
          <li>• Ana görsel, listelerde ve detay sayfalarında gösterilir</li>
          <li>• Önerilen görsel boyutu: 1920x1080 piksel</li>
          <li>• Önerilen format: JPG veya PNG</li>
        </ul>
      </div>
    </div>
  );
}
