(function themeBoot() {
  const root = document.documentElement;
  const key = "superstock_theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(key, theme);
  }

  const saved = localStorage.getItem(key);
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
  } else {
    applyTheme("light");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    function updateLabel() {
      const mode = root.getAttribute("data-theme");
      btn.textContent = mode === "dark" ? "Light" : "Dark";
    }

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
      updateLabel();
    });

    updateLabel();
  });
})();
