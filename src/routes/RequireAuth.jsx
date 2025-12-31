import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const checkTokenValidity = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (e) {
    console.error("Invalid token", e);
    return false;
  }
};

const RequireAuth = ({ children }) => {
  return checkTokenValidity() ? children : <Navigate to="/login" />;
};

export default RequireAuth;
