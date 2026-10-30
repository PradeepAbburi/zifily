export type ThemeMode = "system" | "light" | "dark";

const THEME_KEY = "expertene-theme-mode";

export function getThemePreference(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // fallback to system
  }
  return "system";
}

export function getEffectiveTheme(preference: ThemeMode = getThemePreference()): "light" | "dark" {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function applyTheme(preference: ThemeMode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, preference);
  } catch {
    // ignore
  }

  const effective = getEffectiveTheme(preference);
  if (effective === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  window.dispatchEvent(
    new CustomEvent("expertene-theme-changed", { detail: { preference, effective } }),
  );
}

export function initTheme() {
  if (typeof window === "undefined") return () => {};
  const pref = getThemePreference();
  applyTheme(pref);

  // Listen to system changes if in system mode
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemChange = () => {
    if (getThemePreference() === "system") {
      applyTheme("system");
    }
  };

  try {
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  } catch {
    return () => {};
  }
}
