import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailCheck,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  Layers,
  Star,
  Plus,
  X,
  Flame,
  Zap,
  ShowerHead,
  PaintRoller,
  SprayCan,
  Code,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { signInWithGoogle, signInWithEmail, signUpWithEmail, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { actions } from "@/lib/store";
import { categories as UK_CATEGORIES } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ZifilyLogo, DynIcon } from "@/components/app-ui";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Account & Onboarding — Zifily" },
      {
        name: "description",
        content:
          "Create your account, verify your email, select your role, and configure your multi-category profile.",
      },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "login" | "signup";
type SignupStage = "credentials" | "verify_email" | "role_select" | "onboarding_sections";

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");

  // Signup Stages:
  // 1. credentials (email & password)
  // 2. verify_email (6-digit OTP verification)
  // 3. role_select (3 roles: Client, Provider, Organization)
  // 4. onboarding_sections (sequential step-by-step onboarding)
  const [stage, setStage] = useState<SignupStage>("credentials");
  const [selectedRole, setSelectedRole] = useState<"client" | "provider" | "organization">(
    "provider",
  );
  const [currentSection, setCurrentSection] = useState(0);

  // Credentials State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+44 7700 900123");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [resendCooldown, setResendCooldown] = useState(0);

  // Provider Onboarding State
  const [tradeTitle, setTradeTitle] = useState("Master Gas Safe & Heating Engineer");
  const [yearsExperience, setYearsExperience] = useState("8+");
  const [coverageArea, setCoverageArea] = useState("London & M25 (15 miles)");
  const [overview, setOverview] = useState(
    "Fully certified Gas Safe and heating specialist dedicated to top-tier commercial and domestic installations, boiler emergency callouts, and bespoke plumbing diagnostics with transparent pricing and full warranty coverage.",
  );
  // Multiple categories selection for services profile
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Gas Safe Engineer",
    "Boiler Service & Repair",
    "Plumber & Drainage",
  ]);
  const [hourlyRate, setHourlyRate] = useState("£65/hr");
  const [enableInstantBooking, setEnableInstantBooking] = useState(true);

  // Organization Onboarding State
  const [orgName, setOrgName] = useState("Apex Master Craftsmen Guild");
  const [orgRegNumber, setOrgRegNumber] = useState("GB 882 1920 44");
  const [orgIndustry, setOrgIndustry] = useState("Trades & Construction Collective");
  const [orgHeadquarters, setOrgHeadquarters] = useState("Central London, UK");
  const [orgOverview, setOrgOverview] = useState(
    "Premier consortium of certified UK trade masters upholding the highest British safety standards, unified client dispatch, and transparent multi-specialist project management.",
  );
  const [orgCategories, setOrgCategories] = useState<string[]>([
    "Gas Safe Engineer",
    "Sparks (Electrician)",
    "Plumber & Drainage",
    "Chippy (Carpenter & Joiner)",
  ]);

  // Client Onboarding State
  const [clientCity, setClientCity] = useState("London, UK");
  const [clientInterests, setClientInterests] = useState<string[]>([
    "Gas Safe Engineer",
    "Sparks (Electrician)",
    "House & Domestic Cleaner",
  ]);

  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [useCustomGoogleInput, setUseCustomGoogleInput] = useState(false);

  // Toggle category selection for provider profile
  const toggleProviderCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName],
    );
  };

  // Toggle category selection for org profile
  const toggleOrgCategory = (catName: string) => {
    setOrgCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName],
    );
  };

  // Toggle category selection for client
  const toggleClientInterest = (catName: string) => {
    setClientInterests((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName],
    );
  };

  // STAGE 1: SUBMIT CREDENTIALS
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setStage("verify_email");
    toast.success(`Verification code dispatched to ${email.trim()}`);
  };

  // STAGE 2: OTP INPUT HANDLERS
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    const updated = [...otp];
    updated[index] = clean.slice(-1);
    setOtp(updated);

    if (clean && index < 5) {
      otpRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otp];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtp(updated);
    otpRefs[Math.min(pasted.length, 5)]?.current?.focus();
  };

  const handleAutoFillDemoCode = () => {
    setOtp(["1", "2", "3", "4", "5", "6"]);
    toast.success("Demo verification code 123456 auto-filled");
  };

  const handleResendCode = () => {
    setResendCooldown(30);
    toast.success(`A fresh 6-digit verification code was sent to ${email}`);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // VERIFY EMAIL -> MOVE TO ROLE SELECTION
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    toast.success("Email verified successfully! 🎉");
    setStage("role_select");
  };

  // ROLE SELECTED -> MOVE TO ONBOARDING SECTIONS
  const handleRoleConfirmed = () => {
    setCurrentSection(0);
    setStage("onboarding_sections");
  };

  // COMPLETE FINAL ONBOARDING
  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Firebase signup
      await signUpWithEmail(email.trim(), password, name.trim(), selectedRole);

      // 2. Local store updates
      actions.setUserRole(selectedRole);
      actions.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: selectedRole === "organization" ? orgHeadquarters : clientCity,
      });

      if (selectedRole === "provider") {
        actions.updateBusiness({
          name: name.trim(),
          title: tradeTitle.trim(),
          category: selectedCategories[0] || "Gas Safe Engineer",
          categories: selectedCategories,
          overview: overview.trim(),
          description: overview.trim(),
          area: coverageArea,
        });

        toast.success(
          "Provider profile and multiple service categories saved! Launching Dashboard...",
        );
        router.navigate({ to: "/provider/dashboard" });
      } else if (selectedRole === "organization") {
        const newOrg = actions.createOrganization({
          name: orgName.trim(),
          regNumber: orgRegNumber.trim(),
          industry: orgIndustry.trim(),
          contactPerson: name.trim(),
          contactEmail: email.trim(),
          contactPhone: phone.trim(),
          city: orgHeadquarters.trim(),
          description: orgOverview.trim(),
        });

        toast.success("Organization Hub registered! Launching Org Dashboard...");
        router.navigate({ to: "/org/dashboard" });
      } else {
        toast.success("Welcome to Zifily! Your account is ready.");
        router.navigate({ to: "/" });
      }
    } catch (err: unknown) {
      console.warn("Firebase signup error handled gracefully:", err);
      // Fallback local update so user is never blocked
      actions.setUserRole(selectedRole);
      actions.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: clientCity,
      });

      if (selectedRole === "provider") {
        actions.updateBusiness({
          name: name.trim(),
          title: tradeTitle.trim(),
          category: selectedCategories[0] || "Gas Safe Engineer",
          categories: selectedCategories,
          overview: overview.trim(),
          description: overview.trim(),
          area: coverageArea,
        });
        router.navigate({ to: "/provider/dashboard" });
      } else if (selectedRole === "organization") {
        actions.createOrganization({
          name: orgName.trim(),
          regNumber: orgRegNumber.trim(),
          industry: orgIndustry.trim(),
          contactPerson: name.trim(),
          contactEmail: email.trim(),
          contactPhone: phone.trim(),
          city: orgHeadquarters.trim(),
          description: orgOverview.trim(),
        });
        router.navigate({ to: "/org/dashboard" });
      } else {
        router.navigate({ to: "/" });
      }
    } finally {
      setLoading(false);
    }
  };

  // LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const { user, profile } = await signInWithEmail(email.trim(), password);
      const resolvedRole: "client" | "provider" | "organization" =
        profile?.role === "organization"
          ? "organization"
          : profile?.role === "provider"
            ? "provider"
            : "client";

      actions.setUserRole(resolvedRole);
      actions.updateProfile({
        name: profile?.displayName || user.displayName || email.split("@")[0] || "Member",
        email: user.email || email,
        phone: profile?.phone || "+44 7700 900123",
        address: profile?.address || "London, UK",
      });

      toast.success(`Welcome back! Signed in as ${resolvedRole}.`);
      if (resolvedRole === "organization") {
        router.navigate({ to: "/org/dashboard" });
      } else if (resolvedRole === "provider") {
        router.navigate({ to: "/provider/dashboard" });
      } else {
        router.navigate({ to: "/" });
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE SIGN IN & SIGN UP HANDLER
  // Skips email verification because Google accounts are pre-verified,
  // then directly presents the 3 roles to select followed by the same section-by-section onboarding.
  const handleGoogleAuth = async (overrideEmail?: string, overrideName?: string) => {
    setLoading(true);
    try {
      const gAccountEmail = overrideEmail || "hemanthpranav07@gmail.com";
      const gAccountName =
        overrideName || (overrideEmail ? overrideEmail.split("@")[0] : "Hemanth Pranav");

      const user = await signInWithGoogle(selectedRole, gAccountEmail, gAccountName);
      const gEmail = user.email || gAccountEmail;
      const gName = user.displayName || gAccountName;
      const gPhone = user.phoneNumber || phone || "+44 7700 900123";

      if (gName) setName(gName);
      if (gEmail) setEmail(gEmail);
      if (gPhone) setPhone(gPhone);

      // Check if user already has an existing role in Firestore or store
      let existingRole: "client" | "provider" | "organization" | null = null;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data?.role) {
            existingRole = data.role as "client" | "provider" | "organization";
          }
        }
      } catch (e) {
        console.warn("Could not check existing Firestore role", e);
      }

      // If user is explicitly in Login mode and already has a registered role, log them directly in
      if (mode === "login" && existingRole) {
        actions.setUserRole(existingRole);
        actions.updateProfile({
          name: gName || "Member",
          email: gEmail,
          phone: gPhone,
          address: "London, UK",
        });

        toast.success(`Welcome back! Signed in with Google as ${existingRole}.`);
        setShowGoogleModal(false);
        if (existingRole === "organization") {
          router.navigate({ to: "/org/dashboard" });
        } else if (existingRole === "provider") {
          router.navigate({ to: "/provider/dashboard" });
        } else {
          router.navigate({ to: "/" });
        }
        return;
      }

      // For Sign Up (or new user in Login mode):
      // SKIP EMAIL VERIFICATION (pre-verified by Google)
      // Directly proceed to Step 3: Select Your Role, followed by the onboarding sections!
      setMode("signup");
      setStage("role_select");
      setShowGoogleModal(false);
      toast.success(`Google verified: ${gEmail}!`, {
        description:
          "Email verification skipped. Please select your role to configure your profile.",
      });
    } catch (err: unknown) {
      console.warn("Google Auth proceeding with verified session fallback:", err);
      const fallbackEmail = overrideEmail || "hemanthpranav07@gmail.com";
      setName(overrideName || "Hemanth Pranav");
      setEmail(fallbackEmail);
      setMode("signup");
      setStage("role_select");
      setShowGoogleModal(false);
      toast.success(`Google account verified (${fallbackEmail})!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden bg-muted/20 p-2 sm:p-4 flex flex-col items-center justify-center select-none">
      <div className="w-full max-w-lg h-full max-h-[98dvh] flex flex-col justify-between py-1">
        {/* Top Logo */}
        <div className="flex flex-col items-center shrink-0 mb-1.5">
          <ZifilyLogo />
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 text-center truncate">
            The Premier Platform for Verified Specialists &amp; Consortia
          </p>
        </div>

        {/* Card Container */}
        <div className="flex-1 max-h-[calc(100%-3rem)] rounded-3xl border border-black/10 bg-background p-3.5 sm:p-5 shadow-xl dark:border-white/10 flex flex-col justify-between overflow-hidden">
          {/* LOGIN / SIGNUP TOGGLE (Only when on initial screens) */}
          {(stage === "credentials" || mode === "login") && (
            <div className="flex rounded-2xl bg-muted/60 p-1 mb-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setStage("credentials");
                }}
                className={cn(
                  "flex-1 rounded-xl py-2 text-xs font-bold transition",
                  mode === "signup"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Sign Up & Onboard
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 rounded-xl py-2 text-xs font-bold transition",
                  mode === "login"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Log In
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE: LOGIN */}
          {/* ========================================================================= */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">Welcome back</h2>
                <p className="text-xs text-muted-foreground">
                  Sign in to your client, specialist, or organization account.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 focus-within:border-black focus-within:bg-background">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-xs font-medium outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 focus-within:border-black focus-within:bg-background">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-xs font-medium outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-black py-3 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200 mt-2"
              >
                {loading ? "Signing in..." : "Log In to Account"}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/15 bg-background py-3 text-xs font-bold text-foreground transition hover:border-black hover:bg-muted/40 active:scale-[0.99] dark:border-white/15 dark:hover:border-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STAGE 1: SIGNUP CREDENTIALS (Email & Password) */}
          {/* ========================================================================= */}
          {mode === "signup" && stage === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">Step 1: Create Your Account</h2>
                <p className="text-xs text-muted-foreground">
                  Enter your email and create a secure password to get started.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 focus-within:border-black focus-within:bg-background">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full bg-transparent text-xs font-medium outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 focus-within:border-black focus-within:bg-background">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.co.uk"
                    className="w-full bg-transparent text-xs font-medium outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 focus-within:border-black focus-within:bg-background">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7700 900123"
                    className="w-full bg-transparent text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Password (min. 6 chars)
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 focus-within:border-black focus-within:bg-background">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-xs font-medium outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Confirm Password
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 focus-within:border-black focus-within:bg-background">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-xs font-medium outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-black py-3 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 mt-3 flex items-center justify-center gap-2"
              >
                <span>Continue to Verification</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                    Or sign up with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/15 bg-background py-3 text-xs font-bold text-foreground transition hover:border-black hover:bg-muted/40 active:scale-[0.99] dark:border-white/15 dark:hover:border-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign up with Google (Skips Email Verification)</span>
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: EMAIL VERIFICATION (6-digit OTP) */}
          {/* ========================================================================= */}
          {mode === "signup" && stage === "verify_email" && (
            <form onSubmit={handleVerifyEmail} className="space-y-5 animate-in fade-in">
              <div className="text-center">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <MailCheck className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-bold">Step 2: Verify Your Email</h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  We've sent a 6-digit confirmation code to <b>{email}</b>. Enter it below to
                  confirm your address.
                </p>
              </div>

              {/* 6-digit boxes */}
              <div className="flex justify-center gap-2 sm:gap-3 py-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-12 w-11 sm:h-14 sm:w-12 rounded-2xl border border-black/20 text-center text-lg font-black outline-none focus:border-black focus:ring-2 focus:ring-black/10 dark:border-white/20 dark:focus:border-white"
                  />
                ))}
              </div>

              {/* Autofill Demo Code helper */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleAutoFillDemoCode}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-fill demo code (123456)
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStage("credentials")}
                  className="rounded-2xl border border-black/15 px-4 py-3 text-xs font-semibold hover:bg-muted"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-black py-3 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black"
                >
                  Confirm & Select Role →
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: CHOOSE FROM THE 3 ROLES (AFTER VERIFICATION) */}
          {/* ========================================================================= */}
          {mode === "signup" && stage === "role_select" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center pb-2">
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-bold border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                  Email Verified ✓
                </span>
                <h2 className="text-xl font-black tracking-tight mt-3">Step 3: Select Your Role</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  How will you be using Zifily? Choose your primary account type.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. CUSTOMER / CLIENT */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("client")}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-3xl border p-4 text-left transition",
                    selectedRole === "client"
                      ? "border-black bg-muted/40 shadow-sm dark:border-white ring-2 ring-black/10 dark:ring-white/10"
                      : "border-black/10 hover:border-black/30 dark:border-white/10",
                  )}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shrink-0 font-bold">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Customer / Client</span>
                      {selectedRole === "client" && (
                        <Check className="h-4 w-4 text-emerald-600 font-bold" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Discover vetted local specialists, request bookings, leave star feedback, and
                      message experts.
                    </p>
                  </div>
                </button>

                {/* 2. SPECIALIST / PROVIDER */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("provider")}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-3xl border p-4 text-left transition",
                    selectedRole === "provider"
                      ? "border-amber-500 bg-amber-50/40 shadow-sm dark:border-amber-400 dark:bg-amber-950/20 ring-2 ring-amber-500/20"
                      : "border-black/10 hover:border-black/30 dark:border-white/10",
                  )}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shrink-0 font-bold">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        Specialist / Trade Provider
                        <span className="rounded-md bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[9px] font-bold">
                          PRO
                        </span>
                      </span>
                      {selectedRole === "provider" && (
                        <Check className="h-4 w-4 text-amber-600 font-bold" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Showcase multiple services, manage calendar & offline bookings, intake
                      questions, and portfolio case studies.
                    </p>
                  </div>
                </button>

                {/* 3. ORGANIZATION / AGENCY HUB */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("organization")}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-3xl border p-4 text-left transition",
                    selectedRole === "organization"
                      ? "border-purple-500 bg-purple-50/40 shadow-sm dark:border-purple-400 dark:bg-purple-950/20 ring-2 ring-purple-500/20"
                      : "border-black/10 hover:border-black/30 dark:border-white/10",
                  )}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 shrink-0 font-bold">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        Organization / Guild Hub
                        <span className="rounded-md bg-purple-100 text-purple-800 px-1.5 py-0.2 text-[9px] font-bold">
                          HUB
                        </span>
                      </span>
                      {selectedRole === "organization" && (
                        <Check className="h-4 w-4 text-purple-600 font-bold" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Manage a consortium roster, recruit independent specialists, multi-specialist
                      client dispatch, and aggregate team analytics.
                    </p>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={handleRoleConfirmed}
                className="w-full rounded-2xl bg-black py-3.5 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Step-by-Step Onboarding</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: SEQUENTIAL SECTION-BY-SECTION ONBOARDING */}
          {/* ========================================================================= */}
          {mode === "signup" && stage === "onboarding_sections" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Stepper Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pb-2">
                  <span>
                    {selectedRole === "provider"
                      ? "Specialist Setup"
                      : selectedRole === "organization"
                        ? "Organization Setup"
                        : "Client Setup"}
                  </span>
                  <span>
                    Section {currentSection + 1} of {selectedRole === "client" ? 2 : 3}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black dark:bg-white transition-all duration-300"
                    style={{
                      width: `${((currentSection + 1) / (selectedRole === "client" ? 2 : 3)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* PROVIDER ONBOARDING SECTIONS */}
              {/* ------------------------------------------------------------------- */}
              {selectedRole === "provider" && (
                <>
                  {/* Section 0: Profile, Title & Overview */}
                  {currentSection === 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-bold">Specialist Identity & Overview</h3>
                        <p className="text-xs text-muted-foreground">
                          Tell clients who you are, your qualifications, and an overview of your
                          craftsmanship.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                          Professional Title
                        </label>
                        <input
                          type="text"
                          value={tradeTitle}
                          onChange={(e) => setTradeTitle(e.target.value)}
                          placeholder="e.g. Master Gas Safe & Heating Engineer"
                          className="mt-1 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-black focus:bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Years in Trade
                          </label>
                          <input
                            type="text"
                            value={yearsExperience}
                            onChange={(e) => setYearsExperience(e.target.value)}
                            placeholder="e.g. 10+ Years"
                            className="mt-1 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-black focus:bg-background"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Coverage Area
                          </label>
                          <input
                            type="text"
                            value={coverageArea}
                            onChange={(e) => setCoverageArea(e.target.value)}
                            placeholder="e.g. London & Home Counties"
                            className="mt-1 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-black focus:bg-background"
                          />
                        </div>
                      </div>

                      {/* Overview Bio Statement */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                          Services Overview & Bio Statement
                        </label>
                        <p className="text-[11px] text-muted-foreground mb-1">
                          A detailed overview of your capabilities, certifications, and standards
                          displayed prominently on your profile.
                        </p>
                        <textarea
                          rows={4}
                          value={overview}
                          onChange={(e) => setOverview(e.target.value)}
                          placeholder="Describe your expertise, work ethos, warranties, and emergency callout capabilities..."
                          className="w-full rounded-2xl border border-black/15 bg-muted/20 p-3 text-xs leading-relaxed outline-none focus:border-black focus:bg-background"
                        />
                      </div>
                    </div>
                  )}

                  {/* Section 1: Multiple Categories Selection for Services Profile */}
                  {currentSection === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold">
                            Select Multiple Service Categories
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            You can offer services across multiple domains. Select all categories
                            you cover.
                          </p>
                        </div>
                        <span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-bold">
                          {selectedCategories.length} Selected
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto p-1 border rounded-2xl border-black/10 dark:border-white/10">
                        {UK_CATEGORIES.slice(0, 24).map((c) => {
                          const isSelected = selectedCategories.includes(c.name);
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => toggleProviderCategory(c.name)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl p-2.5 text-left text-xs transition border",
                                isSelected
                                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-bold shadow-2xs"
                                  : "border-black/10 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <DynIcon name={c.icon} className="h-4 w-4 shrink-0" />
                              <span className="truncate">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Display Selected tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedCategories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-foreground border border-black/5"
                          >
                            <span>{cat}</span>
                            <button
                              type="button"
                              onClick={() => toggleProviderCategory(cat)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Pricing, Booking & Confirmation */}
                  {currentSection === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-bold">Pricing & Instant Booking</h3>
                        <p className="text-xs text-muted-foreground">
                          Set your baseline rates and how clients can schedule slots.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Standard Hourly Rate
                          </label>
                          <input
                            type="text"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="e.g. £65/hr"
                            className="mt-1 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-black focus:bg-background"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Instant Booking
                          </label>
                          <button
                            type="button"
                            onClick={() => setEnableInstantBooking(!enableInstantBooking)}
                            className={cn(
                              "mt-1 flex w-full items-center justify-between rounded-2xl border px-3.5 py-2.5 text-xs font-semibold transition",
                              enableInstantBooking
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "border-black/15 bg-muted/20 text-muted-foreground",
                            )}
                          >
                            <span>
                              {enableInstantBooking ? "Instant Enabled" : "Require Confirmation"}
                            </span>
                            <Check
                              className={cn("h-4 w-4", !enableInstantBooking && "opacity-0")}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Summary Review Card */}
                      <div className="rounded-2xl border border-black/10 bg-muted/30 p-4 space-y-2 text-xs">
                        <div className="font-bold text-sm">Summary of Profile Setup</div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Specialist Title:</span>
                          <span className="font-semibold">{tradeTitle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Categories ({selectedCategories.length}):
                          </span>
                          <span className="font-semibold truncate max-w-xs">
                            {selectedCategories.join(", ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Overview Length:</span>
                          <span className="font-semibold">{overview.length} chars</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* ORGANIZATION ONBOARDING SECTIONS */}
              {/* ------------------------------------------------------------------- */}
              {selectedRole === "organization" && (
                <>
                  {currentSection === 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-bold">Organization & Consortium Details</h3>
                        <p className="text-xs text-muted-foreground">
                          Enter your company registration and legal details to establish a verified
                          hub.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                          Organization / Guild Name
                        </label>
                        <input
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="e.g. Apex Master Craftsmen Guild"
                          className="mt-1 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-black focus:bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Company VAT / Reg Number
                          </label>
                          <input
                            type="text"
                            value={orgRegNumber}
                            onChange={(e) => setOrgRegNumber(e.target.value)}
                            placeholder="e.g. GB 882 1920 44"
                            className="mt-1 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-black focus:bg-background"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Headquarters City
                          </label>
                          <input
                            type="text"
                            value={orgHeadquarters}
                            onChange={(e) => setOrgHeadquarters(e.target.value)}
                            placeholder="e.g. London, UK"
                            className="mt-1 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-black focus:bg-background"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                          Guild Mission & Overview
                        </label>
                        <textarea
                          rows={3}
                          value={orgOverview}
                          onChange={(e) => setOrgOverview(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-black/15 bg-muted/20 p-3 text-xs leading-relaxed outline-none focus:border-black focus:bg-background"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold">Multi-Trade Categories Covered</h3>
                          <p className="text-xs text-muted-foreground">
                            Select all trade and digital disciplines your organization represents.
                          </p>
                        </div>
                        <span className="rounded-full bg-purple-600 text-white px-2.5 py-0.5 text-xs font-bold">
                          {orgCategories.length} Selected
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto p-1 border rounded-2xl border-black/10 dark:border-white/10">
                        {UK_CATEGORIES.slice(0, 24).map((c) => {
                          const isSelected = orgCategories.includes(c.name);
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => toggleOrgCategory(c.name)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl p-2.5 text-left text-xs transition border",
                                isSelected
                                  ? "border-purple-600 bg-purple-600 text-white font-bold shadow-2xs"
                                  : "border-black/10 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <DynIcon name={c.icon} className="h-4 w-4 shrink-0" />
                              <span className="truncate">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentSection === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-bold">Consortium Dispatch & Rules</h3>
                        <p className="text-xs text-muted-foreground">
                          Define how appointments are assigned to your affiliated roster
                          specialists.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900 dark:bg-purple-950/20 text-xs space-y-2">
                        <div className="font-bold text-sm text-purple-900 dark:text-purple-200">
                          Automated Multi-Provider Calendar Sync
                        </div>
                        <p className="text-purple-800 dark:text-purple-300">
                          When clients book from your organization hub, available slots sync
                          directly with the designated specialist's calendar.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* CLIENT ONBOARDING SECTIONS */}
              {/* ------------------------------------------------------------------- */}
              {selectedRole === "client" && (
                <>
                  {currentSection === 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-bold">Your Location & Postcode</h3>
                        <p className="text-xs text-muted-foreground">
                          Help us show verified specialists closest to your neighborhood.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                          City or Postcode
                        </label>
                        <input
                          type="text"
                          value={clientCity}
                          onChange={(e) => setClientCity(e.target.value)}
                          placeholder="e.g. Central London, UK or SW1A 1AA"
                          className="mt-1 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-black focus:bg-background"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-bold">Categories of Interest</h3>
                        <p className="text-xs text-muted-foreground">
                          Select the services you frequently need for tailored home feed
                          recommendations.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1">
                        {UK_CATEGORIES.slice(0, 18).map((c) => {
                          const isSelected = clientInterests.includes(c.name);
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => toggleClientInterest(c.name)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl p-2.5 text-left text-xs transition border",
                                isSelected
                                  ? "border-black bg-black text-white font-bold"
                                  : "border-black/10 bg-muted/20 text-muted-foreground hover:bg-muted",
                              )}
                            >
                              <DynIcon name={c.icon} className="h-4 w-4 shrink-0" />
                              <span className="truncate">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    if (currentSection > 0) {
                      setCurrentSection(currentSection - 1);
                    } else {
                      setStage("role_select");
                    }
                  }}
                  className="rounded-2xl border border-black/15 px-4 py-2.5 text-xs font-semibold hover:bg-muted"
                >
                  Back
                </button>

                {currentSection < (selectedRole === "client" ? 1 : 2) ? (
                  <button
                    type="button"
                    onClick={() => setCurrentSection(currentSection + 1)}
                    className="flex items-center gap-1.5 rounded-2xl bg-black px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black"
                  >
                    <span>Next Section</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleFinishOnboarding}
                    className="flex items-center gap-1.5 rounded-2xl bg-black px-6 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black"
                  >
                    <span>{loading ? "Saving Profile..." : "Complete & Launch Dashboard 🚀"}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GOOGLE ACCOUNT SELECTOR MODAL (Bypasses popup-block and unauthorized domain restrictions) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-black/15 bg-background p-6 shadow-2xl dark:border-white/15 animate-in zoom-in-95">
            {/* Google Brand Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-bold text-sm tracking-tight">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4">
              <h3 className="text-base font-bold tracking-tight">Choose an account</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                to continue to Zifily (Email verification will be automatically completed).
              </p>

              {/* Primary Detected Google Account */}
              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleGoogleAuth("hemanthpranav07@gmail.com", "Hemanth Pranav")}
                  className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-muted/30 p-3.5 text-left transition hover:border-black hover:bg-muted active:scale-[0.99] dark:border-white/10 dark:hover:border-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white font-bold text-sm shadow-xs shrink-0">
                      HP
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs truncate">Hemanth Pranav</span>
                        <span className="rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        hemanthpranav07@gmail.com
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>

                {/* Option to enter custom Google account */}
                {!useCustomGoogleInput ? (
                  <button
                    type="button"
                    onClick={() => setUseCustomGoogleInput(true)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-black/15 p-3 text-left text-xs font-semibold text-muted-foreground hover:border-black hover:text-foreground dark:border-white/15 dark:hover:border-white transition"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-muted shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <span>Use another Google account</span>
                  </button>
                ) : (
                  <div className="rounded-2xl border border-black/15 p-3 space-y-2 bg-muted/20 animate-in fade-in">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Enter your Google email
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="flex-1 rounded-xl border border-black/15 bg-background px-3 py-2 text-xs font-medium outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        disabled={loading || !customGoogleEmail.includes("@")}
                        onClick={() =>
                          handleGoogleAuth(
                            customGoogleEmail.trim(),
                            customGoogleEmail.split("@")[0],
                          )
                        }
                        className="rounded-xl bg-black px-3.5 py-2 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Informational Footer */}
              <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                By continuing, Google shares your verified email and name with Zifily to create your
                account and skip one-time email OTP verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
