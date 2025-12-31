// AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setUser(buildUserFromToken(token));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("authToken", token);
    try {
      setUser(buildUserFromToken(token));
    } catch {
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAdmin: user?.isAdmin ?? false,
        departmentCode: user?.departmentCode ?? "",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

function buildUserFromToken(token) {
  const payload = jwtDecode(token);

  const expired = payload.exp && Date.now() >= payload.exp * 1000;
  if (expired) {
    localStorage.removeItem("authToken");
    return null;
  }

  const roles = payload.authorities ?? payload.roles ?? [];

  const isAdmin = roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");

  return {
    username: payload.sub,
    departmentCode: payload.department,
    roles,
    isAdmin,
    exp: payload.exp,
  };
}

function getToken() {
  return localStorage.getItem("authToken");
}
