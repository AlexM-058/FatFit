

export function setToken(token) {
  // If you want to manually set the token in cookies (not usually needed if backend sets it)
  if (token) {
    document.cookie = `token=${encodeURIComponent(token)}; path=/;`;

  }
}

export function getToken() {
  // Get JWT token from cookie (if needed)
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeToken() {
  // Remove JWT cookie (logout)
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export function isTokenValid() {
  // Check if token cookie exists
  return !!getToken();
}

export function getUser() {
  // Decode user info from JWT token in cookie
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
