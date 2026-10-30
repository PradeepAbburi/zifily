import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Shell, TopBar } from "@/components/app-ui";
import { traders } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/edit")({
  head: () => ({
    meta: [
      { title: "Edit Business Profile | Zifily" },
      { name: "description", content: "Update your business name, description and service area." },
      { property: "og:title", content: "Edit Business Profile | Zifily" },
      { property: "og:description", content: "Update your business details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditProvider,
});

function EditProvider() {
  const business = useStore((s) => s.business);
  const router = useRouter();
  const [f, setF] = useState(business);
  const [photo, setPhoto] = useState(traders[0]!.photo);
  useEffect(() => setF(business), [business]);
  const save = () => {
    actions.updateBusiness(f);
    toast.success("Profile saved");
    router.history.back();
  };
  const field =
    "mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
  return (
    <Shell hideNav>
      <div className="mx-auto max-w-xl pb-10">
        <TopBar
          title="Edit Profile"
          right={
            <button
              onClick={save}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              Save
            </button>
          }
        />
        <div className="px-4 md:px-6">
          <label className="mx-auto flex w-fit cursor-pointer flex-col items-center">
            <span className="relative">
              <img src={photo} alt="" className="h-24 w-24 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                <Camera className="h-4 w-4" />
              </span>
            </span>
            <span className="mt-2 text-sm font-medium text-info">Change Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPhoto(URL.createObjectURL(file));
              }}
            />
          </label>
          <div className="mt-6 space-y-4 text-sm font-semibold">
            <label className="block">
              Business Name
              <input
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                className={field}
              />
            </label>
            <label className="block">
              Description
              <textarea
                rows={4}
                value={f.description}
                onChange={(e) => setF({ ...f, description: e.target.value })}
                className={field}
              />
            </label>
            <label className="block">
              Services Overview & Bio
              <textarea
                rows={3}
                value={f.overview || f.description}
                onChange={(e) =>
                  setF({ ...f, overview: e.target.value, description: e.target.value })
                }
                placeholder="Comprehensive overview of your expertise, certifications, and service philosophy..."
                className={field}
              />
            </label>
            <div className="block">
              <span className="text-sm font-semibold">Service Categories (Multiple Allowed)</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                Select the trade & digital domains you cover.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  "Gas Safe Engineer",
                  "Boiler Service & Repair",
                  "Sparks (Electrician)",
                  "Plumber & Drainage",
                  "Handyman & Odd Jobs",
                  "Painter & Decorator",
                  "Chippy (Carpenter & Joiner)",
                  "Web Developer",
                  "House & Domestic Cleaner",
                  "Roofer & Guttering",
                  "Locksmith & Security",
                ].map((catName) => {
                  const currentCats = f.categories || [f.category || "Electrician"];
                  const isSelected = currentCats.includes(catName);
                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => {
                        const updated = isSelected
                          ? currentCats.filter((c) => c !== catName)
                          : [...currentCats, catName];
                        setF({ ...f, categories: updated, category: updated[0] || f.category });
                      }}
                      className={cn(
                        "rounded-xl px-2.5 py-1 text-xs font-semibold border transition",
                        isSelected
                          ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-2xs"
                          : "bg-muted/30 text-muted-foreground border-black/10 hover:bg-muted dark:border-white/10",
                      )}
                    >
                      {catName}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block">
              Service Area
              <select
                value={f.area}
                onChange={(e) => setF({ ...f, area: e.target.value })}
                className={field + " bg-background"}
              >
                {[
                  "London (5 miles radius)",
                  "London (10 miles radius)",
                  "London (20 miles radius)",
                  "Greater London",
                ].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="block">
              Website (optional)
              <input
                type="url"
                value={f.website}
                onChange={(e) => setF({ ...f, website: e.target.value })}
                className={field}
              />
            </label>
          </div>
        </div>
      </div>
    </Shell>
  );
}
