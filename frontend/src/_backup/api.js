const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

/**
 * Fait un appel à l'API avec le token JWT si dispo
 * @param {boolean} [publicEndpoint] - Si true, ne redirige pas vers /login en cas de 401
 */
export async function apiFetch(path, options = {}) {
  try {
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!options.publicEndpoint) {
        window.location.href = "/login";
      }
      throw new Error("Session expirée");
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Erreur ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error("Impossible de joindre le serveur");
    }
    throw err;
  }
}
