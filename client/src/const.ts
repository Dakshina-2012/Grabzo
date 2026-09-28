export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** Navigate to the native Grabzo sign-in/register screen. */
export const goToLogin = () => {
  // GitHub Pages serves the app from /Grabzo/, while Manus preview serves it
  // from /. Using Vite's base keeps auth buttons on the deployed app.
  window.location.href = import.meta.env.BASE_URL;
};

// Compatibility alias for existing protected surfaces; this no longer opens OAuth.
export const startLogin = goToLogin;
