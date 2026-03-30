const API_BASE = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("superstock_token");
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function ensureSession() {
  if (!localStorage.getItem("superstock_token")) {
    window.location.href = "../index.html";
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = "Error de servidor";
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch (error) {
      detail = "No se pudo procesar la respuesta";
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

