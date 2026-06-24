import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

export type UserRole = "Super Admin" | "Operations Manager" | "Teacher" | "Parent" | "School";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  refId: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (passwordData: any) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStoredAuth = () => {
    const storedUser = localStorage.getItem("rta_user");
    const storedToken = localStorage.getItem("rta_token") || localStorage.getItem("rta_admin_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    } else {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStoredAuth();
    
    // Listen to token changes/expiry triggered in API service
    const handleAuthChanged = () => {
      loadStoredAuth();
    };
    window.addEventListener("auth-changed", handleAuthChanged);
    return () => window.removeEventListener("auth-changed", handleAuthChanged);
  }, []);

  useEffect(() => {
    if (!user) return;

    const timeoutDuration = 15 * 60 * 1000; // 15 minutes of inactivity
    let timeoutId: any;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, timeoutDuration);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post("/api/auth/login", { email, password });
      if (data.success && data.token && data.user) {
        localStorage.setItem("rta_token", data.token);
        localStorage.setItem("rta_admin_token", data.token); // Backwards compatibility
        localStorage.setItem("rta_refresh_token", data.refreshToken);
        localStorage.setItem("rta_user", JSON.stringify(data.user));
        
        // Backward compatibility keys
        localStorage.setItem("rta_admin_email", data.user.email);
        localStorage.setItem("rta_admin_role", data.user.role);

        setUser(data.user);
        setToken(data.token);
        return true;
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
    return false;
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const data = await api.post("/api/auth/register", userData);
      if (data.success && data.token && data.user) {
        localStorage.setItem("rta_token", data.token);
        localStorage.setItem("rta_refresh_token", data.refreshToken);
        localStorage.setItem("rta_user", JSON.stringify(data.user));
        
        setUser(data.user);
        setToken(data.token);
        return true;
      }
    } catch (err) {
      console.error("Signup failed:", err);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("rta_token");
    localStorage.removeItem("rta_admin_token");
    localStorage.removeItem("rta_refresh_token");
    localStorage.removeItem("rta_user");
    localStorage.removeItem("rta_admin_email");
    localStorage.removeItem("rta_admin_role");
    setUser(null);
    setToken(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      const data = await api.post("/api/auth/forgot-password", { email });
      return { success: data.success, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to trigger password recovery" };
    }
  };

  const resetPassword = async (passwordData: any) => {
    try {
      const data = await api.post("/api/auth/reset-password", passwordData);
      return { success: data.success, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to reset password" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
