/**
 * Applies the stored theme before first paint so the page never flashes light
 * then dark.
 *
 * Kept in its own module, rather than in the "use client" theme component, so
 * the server layout can import it as a real string instead of a client
 * reference.
 */
export const THEME_STORAGE_KEY = "dvmi-theme";

export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var dark = stored ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;
