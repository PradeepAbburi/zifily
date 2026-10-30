import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Check, Sparkles } from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useStore, actions, type CustomService } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/services")({
  head: () => ({
    meta: [
      { title: "Your Services | Zifily" },
      {
        name: "description",
        content: "Manage your specialist service catalog, durations, and pricing.",
      },
    ],
  }),
  component: ProviderServicesPage,
});

export function ProviderServicesPage() {
  const router = useRouter();
  const userRole = useStore((s) => s.userRole);
  const custom = useStore((s) => s.providerCustomization);

  useEffect(() => {
    if (userRole !== "provider") {
      actions.setUserRole("provider");
    }
  }, [userRole]);

  // Initial services matching PDF Page 33 & 4
  const [services, setServices] = useState<
    Array<{
      id: string;
      name: string;
      duration: string;
      price: string;
      type: "Online" | "At location" | "Both";
    }>
  >([
    {
      id: "s-1",
      name: "Strategy call",
      duration: "30 min",
      price: "₹999",
      type: "Online",
    },
    {
      id: "s-2",
      name: "Home visit audit",
      duration: "60 min",
      price: "₹1,499",
      type: "At location",
    },
    {
      id: "s-3",
      name: "Website audit",
      duration: "2 days",
      price: "₹4,999",
      type: "Online",
    },
    {
      id: "s-4",
      name: "5-page website",
      duration: "2 weeks",
      price: "₹25,000",
      type: "Online",
    },
  ]);

  // Form state for adding service
  const [newServiceName, setNewServiceName] = useState("");
  const [newPrice, setNewPrice] = useState("₹999");
  const [newDuration, setNewDuration] = useState("30 min");
  const [serviceType, setServiceType] = useState<"Online" | "At location" | "Both">("Online");

  // Mobile full-page view state
  const [isAddingMobile, setIsAddingMobile] = useState(false);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      toast.error("Please enter service name");
      return;
    }

    const newSvc = {
      id: "s-" + Math.random().toString(36).slice(2, 7),
      name: newServiceName.trim(),
      duration: newDuration,
      price: newPrice.startsWith("₹") ? newPrice : `₹${newPrice}`,
      type: serviceType,
    };

    setServices([...services, newSvc]);

    // Also register in global store
    actions.addCustomService({
      name: newSvc.name,
      desc: `${newSvc.duration} · ${newSvc.type}`,
      price: newSvc.price,
      icon: "Sparkles",
      category: "Services",
    });

    setNewServiceName("");
    setNewPrice("₹999");
    setNewDuration("30 min");
    setIsAddingMobile(false);
    toast.success("Service added to your profile!");
  };

  const handleRemove = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast.success("Service removed");
  };

  // Full-page mobile form for "Add New Service" (without "+" icon/text)
  if (isAddingMobile) {
    return (
      <Shell hideNav hideBottomNav>
        <div className="mx-auto min-h-screen max-w-lg bg-background p-4 sm:p-6 pb-28">
          <div className="flex items-center gap-3 pb-3 border-b border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsAddingMobile(false)}
              aria-label="Back"
              className="grid h-10 w-10 place-items-center rounded-full border border-black/10 hover:bg-muted active:scale-95 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Add New Service</h1>
              <p className="text-xs text-muted-foreground">
                Configure offering, price and duration
              </p>
            </div>
          </div>

          <form onSubmit={handleAddService} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Service name</label>
              <input
                type="text"
                required
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="e.g. Website audit"
                className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-background px-4 text-sm font-medium outline-none focus:border-[#5B4DF5] dark:border-white/15"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Price</label>
                <input
                  type="text"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="₹999"
                  className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-background px-4 text-sm font-medium outline-none focus:border-[#5B4DF5] dark:border-white/15"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Duration</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-background px-4 text-sm font-medium outline-none focus:border-[#5B4DF5] dark:border-white/15"
                >
                  <option value="15 min">15 min</option>
                  <option value="30 min">30 min</option>
                  <option value="45 min">45 min</option>
                  <option value="60 min">60 min</option>
                  <option value="2 hours">2 hours</option>
                  <option value="1 day">1 day</option>
                  <option value="2 days">2 days</option>
                  <option value="2 weeks">2 weeks</option>
                </select>
              </div>
            </div>

            {/* Service Type Segmented Pills matching PDF Page 33 */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-muted-foreground">Delivery Format</label>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/40 p-1 border border-black/5 dark:border-white/5">
                {(["Online", "At location", "Both"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setServiceType(t)}
                    className={cn(
                      "rounded-xl py-2.5 text-xs font-bold transition active:scale-95",
                      serviceType === t
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-background/95 p-4 backdrop-blur-md dark:border-white/10">
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#5B4DF5] py-3.5 text-sm font-bold text-white transition hover:bg-[#4F46E5] active:scale-98 shadow-md"
              >
                Add New Service
              </button>
            </div>
          </form>
        </div>
      </Shell>
    );
  }

  // Page 33: Your services main view
  return (
    <Shell>
      <div className="mx-auto max-w-md md:max-w-xl pb-24 pt-2 md:pt-6 px-3 sm:px-4 space-y-6">
        {/* Header matching Page 33 with Add a new service button on top */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/provider/dashboard"
              aria-label="Back"
              className="grid h-10 w-10 place-items-center rounded-full border border-black/10 hover:bg-muted active:scale-95 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Your services</h1>
              <p className="text-xs text-muted-foreground">
                Review and manage your specialist offerings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingMobile(true)}
            className="flex items-center justify-center rounded-2xl bg-[#5B4DF5] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#4F46E5] active:scale-95 transition shadow-xs whitespace-nowrap"
          >
            Add a new service
          </button>
        </div>

        {/* Existing Services List matching Page 33 */}
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-3xl border border-black/10 bg-card p-4 sm:p-5 shadow-xs dark:border-white/10"
            >
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-foreground">{s.name}</h3>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                  {s.duration} · {s.price}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold tracking-tight",
                    s.type === "Online"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-2xs"
                      : "bg-[#EEF0FF] text-[#5B4DF5] border border-[#5B4DF5]/20 dark:bg-indigo-950 dark:text-indigo-300",
                  )}
                >
                  {s.type}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(s.id)}
                  aria-label="Remove service"
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
