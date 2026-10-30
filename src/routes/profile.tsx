import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Bell,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  MessageSquare,
  QrCode,
  ShieldCheck,
  User,
  CalendarDays,
  Edit3,
  Sparkles,
  Monitor,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import { Shell } from "@/components/app-ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getTrader } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { toast } from "sonner";
import { auth, logOut } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { getThemePreference, applyTheme, getEffectiveTheme, type ThemeMode } from "@/lib/theme";
import { useEffect } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | Zifily" },
      {
        name: "description",
        content:
          "Manage your Zifily profile, verified reviews, saved specialists and account settings.",
      },
      { property: "og:title", content: "My Profile | Zifily" },
      { property: "og:description", content: "Manage your Zifily account and reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

type Panel = "info" | "saved" | null;

export function ProfilePage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const saved = useStore((s) => s.saved);
  const bookings = useStore((s) => s.bookings);
  const chats = useStore((s) => s.chats);
  const userRole = useStore((s) => s.userRole);
  const location = useStore((s) => s.location);

  const [panel, setPanel] = useState<Panel>(null);
  const [form, setForm] = useState(profile);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [themePref, setThemePref] = useState<ThemeMode>(() => getThemePreference());
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() => getEffectiveTheme());

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{
        preference: ThemeMode;
        effective: "light" | "dark";
      }>;
      if (customEvent.detail) {
        setThemePref(customEvent.detail.preference);
        setEffectiveTheme(customEvent.detail.effective);
      }
    };
    window.addEventListener("expertene-theme-changed", handleThemeChange);
    return () => window.removeEventListener("expertene-theme-changed", handleThemeChange);
  }, []);

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemePref(mode);
    applyTheme(mode);
    toast.success(
      mode === "system"
        ? "Switched to System Theme (Automatic)"
        : mode === "dark"
          ? "Switched to Dark Theme"
          : "Switched to Light Theme",
    );
  };

  const totalConversations = Object.keys(chats).length;

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success("Signed out of Zifily");
    } catch {
      toast("Session reset");
    }
    router.navigate({ to: "/auth" });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomAvatar(reader.result as string);
        toast.success("Profile photo updated");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-2xl px-4 pt-3 pb-12 sm:pt-6 space-y-4">
        {/* Profile Header with Settings Page Icon */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              My Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage your account and display preferences
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Log Out"
            title="Log Out"
            className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-black/10 bg-card text-muted-foreground hover:text-rose-600 hover:border-rose-500/50 hover:bg-rose-50 dark:border-white/10 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 active:scale-95 transition shadow-2xs group"
          >
            <LogOut className="h-4 w-4 transition group-hover:text-rose-600 dark:group-hover:text-rose-400" />
          </button>
        </div>

        {/* BIG PROFILE IMAGE SECTION */}
        <div className="flex flex-col items-center text-center rounded-3xl border border-black/10 bg-card p-6 shadow-xs dark:border-white/10 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-16 -left-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          {/* Big Profile Image with camera badge */}
          <div className="relative group mb-3">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden ring-4 ring-background shadow-md border-2 border-black/10 dark:border-white/15 bg-muted">
              {customAvatar ? (
                <img src={customAvatar} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-neutral-900 to-neutral-700 text-3xl sm:text-4xl font-extrabold text-white dark:from-neutral-100 dark:to-neutral-300 dark:text-black">
                  {profile.name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2) || "EX"}
                </div>
              )}
            </div>

            {/* Change photo button */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Change profile photo"
              className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-black text-white dark:bg-white dark:text-black shadow-lg hover:scale-105 active:scale-95 transition ring-2 ring-background"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* User Name & Verified Badge */}
          <div className="flex items-center gap-1.5 justify-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {profile.name}
            </h1>
            <CheckCircle2 className="h-5 w-5 fill-emerald-500 text-white shrink-0" />
          </div>

          <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>

          {/* Fixed Verified Account Badge */}
          <div className="mt-3 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-muted/60 px-3.5 py-1 text-[11px] font-bold text-foreground dark:border-white/15">
              {userRole === "provider" ? (
                <>
                  <Briefcase className="h-3.5 w-3.5 text-foreground" />
                  <span>Specialist Provider Account</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-foreground" />
                  <span>Client Account</span>
                </>
              )}
            </span>
          </div>

          {/* Quick Hub Navigation Button for Provider */}
          {userRole === "provider" && (
            <div className="mt-3 w-full space-y-2">
              <Link
                to="/provider/dashboard"
                className="flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black/90 active:scale-95 dark:bg-white dark:text-black shadow-sm"
              >
                <Briefcase className="h-4 w-4" />
                <span>Open Specialist Analytics Hub &rarr;</span>
              </Link>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <Link
                  to="/provider/calendar"
                  className="rounded-xl border border-black/10 py-1.5 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground dark:border-white/10"
                >
                  Calendar
                </Link>
                <Link
                  to="/provider/services"
                  className="rounded-xl border border-black/10 py-1.5 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground dark:border-white/10"
                >
                  Services
                </Link>
                <Link
                  to="/provider/intake"
                  className="rounded-xl border border-black/10 py-1.5 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground dark:border-white/10"
                >
                  Intake
                </Link>
              </div>
            </div>
          )}

          {/* Quick Metrics Bar Under Image */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-black/10 dark:divide-white/10 w-full pt-4 border-t border-black/10 dark:border-white/10">
            <Link
              to="/bookings"
              className="flex flex-col items-center hover:opacity-80 transition px-2"
            >
              <span className="text-base font-extrabold text-foreground">{bookings.length}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">Bookings</span>
            </Link>

            <button
              onClick={() => setPanel("saved")}
              className="flex flex-col items-center hover:opacity-80 transition px-2"
            >
              <span className="text-base font-extrabold text-foreground">{saved.length}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">Saved Pros</span>
            </button>

            <Link
              to="/messages"
              className="flex flex-col items-center hover:opacity-80 transition px-2"
            >
              <span className="text-base font-extrabold text-foreground">{totalConversations}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">Chats</span>
            </Link>
          </div>
        </div>

        {/* ALL DETAILS UNDER IT: Personal Information */}
        <div className="rounded-3xl border border-black/10 bg-card p-4 shadow-xs dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Personal Details
              </h2>
            </div>
            <button
              onClick={() => {
                setForm(profile);
                setPanel("info");
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-muted/30 p-3 border border-black/5 dark:border-white/5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</p>
              <p className="font-semibold text-foreground text-xs mt-0.5 truncate">
                {profile.name}
              </p>
            </div>

            <div className="rounded-2xl bg-muted/30 p-3 border border-black/5 dark:border-white/5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground text-xs mt-0.5 truncate">
                {profile.email}
              </p>
            </div>

            <div className="rounded-2xl bg-muted/30 p-3 border border-black/5 dark:border-white/5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Phone</p>
              <p className="font-semibold text-foreground text-xs mt-0.5 truncate">
                {profile.phone || "+44 7700 900123"}
              </p>
            </div>

            <div className="rounded-2xl bg-muted/30 p-3 border border-black/5 dark:border-white/5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Address</p>
              <p className="font-semibold text-foreground text-xs mt-0.5 truncate">
                {profile.address || "London, UK"}
              </p>
            </div>
          </div>
        </div>

        {/* ALL DETAILS UNDER IT: Location & Service Area */}
        <div className="rounded-3xl border border-black/10 bg-card p-4 shadow-xs dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Location & Coverage
              </h2>
            </div>
            <Link to="/location" className="text-xs font-bold text-foreground hover:underline">
              Change Map &rarr;
            </Link>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-muted/30 p-3 border border-black/5 dark:border-white/5 text-xs">
            <div>
              <p className="font-bold text-foreground">{location.address}</p>
              <p className="text-[11px] text-muted-foreground">
                Search radius: {location.radiusKm} km
              </p>
            </div>
            <Link
              to="/location"
              className="rounded-xl border border-black/15 bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted dark:border-white/15"
            >
              Update
            </Link>
          </div>
        </div>

        {/* Provider Hub (If provider mode active) */}
        {userRole === "provider" && (
          <div className="rounded-3xl border border-black/10 bg-card p-4 shadow-xs dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2 pb-1">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Provider Hub & Business
              </h2>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/5">
              <Link
                to="/provider/dashboard"
                className="flex items-center justify-between py-2.5 hover:bg-muted/30 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold">Specialist Analytics Dashboard</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/provider/qr"
                className="flex items-center justify-between py-2.5 hover:bg-muted/30 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold">Instant Business QR Code</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}

        {/* Settings & Appearance: System Default, Light, Dark (#202020 monochrome) */}
        <div
          id="theme-settings-section"
          className="rounded-3xl border border-black/10 bg-card p-4 shadow-xs dark:border-white/10 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-foreground" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Settings &amp; Theme Appearance
              </h2>
            </div>
            <span className="text-[11px] font-bold text-muted-foreground capitalize">
              Active: {themePref === "system" ? `System (${effectiveTheme})` : themePref}
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Configure appearance based on your device system theme or choose a permanent preference.
            Dark theme is strictly styled in pure black &amp; white typography on #202020.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleSelectTheme("system")}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition active:scale-95",
                themePref === "system"
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "border-black/10 bg-background hover:bg-muted text-foreground dark:border-white/10",
              )}
            >
              <Monitor className="h-5 w-5" />
              <div className="leading-tight">
                <p className="text-xs font-bold">System</p>
                <p className="text-[10px] opacity-75">Auto OS</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTheme("light")}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition active:scale-95",
                themePref === "light"
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "border-black/10 bg-background hover:bg-muted text-foreground dark:border-white/10",
              )}
            >
              <Sun className="h-5 w-5" />
              <div className="leading-tight">
                <p className="text-xs font-bold">Light</p>
                <p className="text-[10px] opacity-75">Day Mode</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTheme("dark")}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition active:scale-95",
                themePref === "dark"
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "border-black/10 bg-background hover:bg-muted text-foreground dark:border-white/10",
              )}
            >
              <Moon className="h-5 w-5" />
              <div className="leading-tight">
                <p className="text-xs font-bold">Dark</p>
                <p className="text-[10px] opacity-75">#202020 B&amp;W</p>
              </div>
            </button>
          </div>
        </div>

        {/* Account Menu & Support */}
        <div className="divide-y divide-black/10 rounded-3xl border border-black/10 bg-card dark:divide-white/10 dark:border-white/10 shadow-xs">
          <Link
            to="/notifications"
            className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-medium hover:bg-muted/40 transition"
          >
            <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 font-semibold text-foreground">Notifications & Alerts</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>

          <button
            onClick={() => toast("Direct client-to-expert settlement enabled on Zifily")}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-medium hover:bg-muted/40 transition"
          >
            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 font-semibold text-foreground text-left">
              Payment & Direct Settlement
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>

          <button
            onClick={() => toast("Zifily Concierge: support@zifily.com")}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-medium hover:bg-muted/40 transition"
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 font-semibold text-foreground text-left">
              Help & Concierge Support
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </div>
      </div>

      {/* Sheet for Editing Personal Details */}
      <Sheet open={panel !== null} onOpenChange={(o) => !o && setPanel(null)}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto rounded-t-3xl md:mx-auto md:max-w-lg no-scrollbar"
        >
          {panel === "info" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                actions.updateProfile(form);
                toast.success("Profile details saved");
                setPanel(null);
              }}
              className="space-y-3 p-2 text-xs"
            >
              <SheetHeader className="px-0">
                <SheetTitle className="text-sm font-bold">Edit Personal Details</SheetTitle>
              </SheetHeader>
              {(["name", "email", "phone", "address"] as const).map((k) => (
                <label key={k} className="block text-xs font-semibold capitalize">
                  {k}
                  <input
                    required
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-black/15 bg-background px-3 py-2 text-xs font-normal outline-none focus:border-black dark:border-white/15"
                  />
                </label>
              ))}
              <button
                type="submit"
                className="w-full rounded-xl bg-black py-2.5 font-bold text-xs text-white dark:bg-white dark:text-black active:scale-95 transition"
              >
                Save Changes
              </button>
            </form>
          )}

          {panel === "saved" && (
            <div className="p-2 text-xs">
              <SheetHeader className="px-0">
                <SheetTitle className="text-sm font-bold">
                  Saved Specialists ({saved.length})
                </SheetTitle>
              </SheetHeader>
              {saved.length === 0 && (
                <p className="py-6 text-center text-muted-foreground">No saved experts yet.</p>
              )}
              {saved.map((id) => {
                const tr = getTrader(id);
                return (
                  tr && (
                    <Link
                      key={id}
                      to="/trader/$id"
                      params={{ id }}
                      onClick={() => setPanel(null)}
                      className="flex items-center gap-3 py-2.5 border-b border-black/5 dark:border-white/5 hover:bg-muted/30 transition px-2 rounded-xl"
                    >
                      <img src={tr.photo} alt="" className="h-10 w-10 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate">{tr.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{tr.title}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Shell>
  );
}
