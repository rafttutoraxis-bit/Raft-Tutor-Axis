import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
import AdminPage from "./AdminPage";
import AdminLoginPage from "./AdminLoginPage";
import LoginPage from "./LoginPage";
import ProtectedRoute from "./components/UI/ProtectedRoute";

import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <HelmetProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/about" element={<App />} />
                <Route path="/services" element={<App />} />
                <Route path="/register" element={<App />} />
                <Route path="/founders" element={<App />} />
                <Route path="/contact" element={<App />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={["Super Admin", "Operations Manager"]}>
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            </BrowserRouter>
          </HelmetProvider>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
