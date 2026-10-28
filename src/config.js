// Configuración pública del frontend (variables VITE_* en Vercel o en .env.local).
const env = import.meta.env;

export const CONFIG = {
  vslUrl: env.VITE_VSL_URL || "",
  vslPoster: env.VITE_VSL_POSTER || "",
  instagramUrl: env.VITE_INSTAGRAM_URL || "https://www.instagram.com/jaume.genovard",
  privacyUrl: env.VITE_PRIVACY_URL || "",
  showPending: (env.VITE_SHOW_PENDING ?? "true") !== "false",
};
