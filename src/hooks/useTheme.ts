const STORAGE_KEY = "topperformers-theme";

export const applyLightTheme = () => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark");
  root.classList.add("light");
  root.style.colorScheme = "light";
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private browsing or blocked storage: nothing to clear.
  }
};
