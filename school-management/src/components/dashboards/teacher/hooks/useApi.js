// useApi.js — Lightweight fetch helper for the Teacher Dashboard.
// Accepts baseUrl + token as arguments rather than reading from globals,
// which makes it easy to test and re-use without side-effects.

/**
 * Generic API request helper.
 *
 * @param {string} baseUrl  - e.g. "http://localhost:3000"
 * @param {string} token    - JWT access token
 * @param {string} method   - HTTP method ("GET" | "POST" | "PATCH" | "DELETE")
 * @param {string} path     - URL path starting with "/"
 * @param {object} [body]   - Optional JSON body (for POST / PATCH)
 * @returns {Promise<any>}
 */
export async function api(baseUrl, token, method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${baseUrl}${path}`, config);

  // Handle empty responses (e.g. 204 No Content)
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const msg =
      (Array.isArray(data?.message) ? data.message.join(", ") : data?.message) ||
      data?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}
