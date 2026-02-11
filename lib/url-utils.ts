// Helper utilities for URL normalization
export function normalizeFacebookUrl(raw?: string): string | null {
  const url = (raw || "").trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    // If already profile.php with id param, return normalized form
    if (u.pathname.includes("/profile.php")) {
      const id = u.searchParams.get("id");
      if (id) return `https://www.facebook.com/profile.php?id=${id}`;
    }

    // Match /user/{id} in the path (e.g. /groups/.../user/10000/...)
    const m = u.pathname.match(/\/user\/(\d+)/);
    if (m && m[1]) return `https://www.facebook.com/profile.php?id=${m[1]}`;

    // If an id query param exists, normalize to profile.php
    const idParam = u.searchParams.get("id");
    if (idParam) return `https://www.facebook.com/profile.php?id=${idParam}`;

    // Otherwise return the original url (no change)
    return url;
  } catch (e) {
    // If URL parsing fails, return the raw input
    return url;
  }
}
