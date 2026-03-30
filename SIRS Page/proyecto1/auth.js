document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    msg.textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("superstock_token", data.access_token);
      localStorage.setItem("superstock_username", username);

      const userInfo = await apiRequest("/usuarios/me");
      localStorage.setItem("superstock_rol", userInfo.rol);

      window.location.href = "pages/dashboard.html";
    } catch (error) {
      msg.textContent = error.message;
      msg.className = "message error";
    }
  });
});

