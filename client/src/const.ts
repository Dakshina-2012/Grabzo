export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** Navigate to the native Grabzo sign-in/register screen. */
export const goToLogin = () => {
  window.location.href = "/";
};

// Compatibility alias for existing protected surfaces; this no longer opens OAuth.
export const startLogin = goToLogin;
