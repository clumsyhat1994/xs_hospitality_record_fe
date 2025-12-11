import { jwtDecode } from "jwt-decode";

export function getToken() {
  return localStorage.getItem("authToken");
}

export function getCurrentUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = jwtDecode(token);
    return {
      username: payload.sub,
      departmentCode: payload.departmentCode,
      roles: payload.authorities || payload.roles || [],
      exp: payload.exp,
    };
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
}

export function isAdmin(user) {
  if (!user?.roles) return false;
  return user.roles.includes("ROLE_ADMIN") || user.roles.includes("ADMIN");
}
