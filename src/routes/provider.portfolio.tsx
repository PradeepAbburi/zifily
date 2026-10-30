import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Upload, Trash2, Plus, Check, X, Layers } from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useStore, actions, type GalleryPhoto } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/provider/portfolio")({
  head: () => ({
    meta: [
      { title: "Zif Cards & Work Portfolio | Expertene" },
      {
        name: "description",
        content: "Upload and manage your work portfolio photos and project gallery.",
      },
    ],
  }),
  component: ProviderPortfolioPage,
});

export function ProviderPortfolioPage() {
  const router = useRouter();
  const business = useStore((s) => s.business);

  // Gallery Photo Upload State
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    label: "",
    tag: "Recent Project",
  });

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.url.trim()) {
      toast.error("Please provide an image URL");
      return;
    }
    const photo: GalleryPhoto = {
      id: `gal-${Date.now()}`,
      url: newPhoto.url.trim(),
      label: newPhoto.label.trim() || "Work sample",
      tag: newPhoto.tag.trim() || "Showcase",
    };
    actions.addGalleryPhoto(photo);
    toast.success("Work photo added to your Zif cards!");
    setShowAddPhotoModal(false);
    setNewPhoto({
      url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      label: "",
      tag: "Recent Project",
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    actions.deleteGalleryPhoto(photoId);
    toast.success("Photo removed");
  };

  const galleryList = business.gallery || [];

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 md:py-8 space-y-6">
        {/* Header with Back button matching PDF pages - text under heading removed, button text hidden on mobile */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.history.back()}
              className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-background shadow-xs hover:bg-muted active:scale-95 transition dark:border-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Zif Cards
              </h1>
              <span className="rounded-full bg-[#5B4DF5]/10 text-[#5B4DF5] dark:bg-[#5B4DF5]/25 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                {galleryList.length}/12
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/provider/case-studies"
              className="rounded-2xl border border-black/15 bg-background p-2.5 sm:px-3.5 sm:py-2 text-xs font-bold hover:bg-muted active:scale-95 transition flex items-center gap-1.5"
              title="Case Studies"
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Case Studies</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowAddPhotoModal(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-[#5B4DF5] p-2.5 sm:px-4 sm:py-2 text-xs font-bold text-white transition hover:bg-[#4F46E5] active:scale-95 shadow-xs"
              title="Upload Photo"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Upload photo</span>
            </button>
          </div>
        </div>

        {/* Work Photos Grid directly (Upload work photos card removed as requested) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {galleryList.map((photo, idx) => (
            <div
              key={photo.id || idx}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-card shadow-2xs dark:border-white/10"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                <img
                  src={photo.url}
                  alt={photo.label}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {idx === 0 && (
                  <span className="absolute left-2 top-2 rounded-lg bg-black/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-xs">
                    Cover Photo
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600 shadow-md"
                  title="Delete photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-2.5 space-y-1">
                <p className="font-extrabold text-xs text-foreground truncate">{photo.label}</p>
                <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                  {photo.tag}
                </span>
              </div>
            </div>
          ))}

          {galleryList.length < 12 && (
            <button
              type="button"
              onClick={() => setShowAddPhotoModal(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/15 bg-muted/15 p-6 text-center hover:border-black/30 hover:bg-muted/30 transition aspect-square active:scale-95 dark:border-white/15 dark:hover:border-white/30"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-muted">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-foreground block">Add Photo</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {12 - galleryList.length} slots left
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* MODAL: ADD GALLERY PHOTO */}
      {showAddPhotoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowAddPhotoModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-black/10 bg-background p-5 sm:p-6 shadow-2xl dark:border-white/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
              <h3 className="font-black text-sm sm:text-base">Upload Work Photo</h3>
              <button
                type="button"
                onClick={() => setShowAddPhotoModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-foreground">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newPhoto.url}
                  onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 outline-none focus:border-black dark:border-white/15"
                />
              </div>

              {newPhoto.url && (
                <div className="h-32 w-full rounded-xl overflow-hidden bg-muted border border-black/10 dark:border-white/10">
                  <img
                    src={newPhoto.url}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-foreground">Photo Caption</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern living room renovation"
                    value={newPhoto.label}
                    onChange={(e) => setNewPhoto({ ...newPhoto, label: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 outline-none focus:border-black dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Tag / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Interior Design"
                    value={newPhoto.tag}
                    onChange={(e) => setNewPhoto({ ...newPhoto, tag: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 outline-none focus:border-black dark:border-white/15"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#5B4DF5] font-bold text-xs text-white hover:bg-[#4F46E5] active:scale-95 shadow-md transition"
                >
                  <Check className="h-4 w-4" />
                  <span>Add to Zif Cards</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
