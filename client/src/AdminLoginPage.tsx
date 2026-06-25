import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AdminPanel from "./components/AdminPanel";

export default function AdminLoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Inject noindex, nofollow meta tag on all admin pages
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    let existed = true;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      existed = false;
    }
    const originalContent = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex,nofollow');
    if (!existed) {
      document.head.appendChild(meta);
    }

    return () => {
      if (meta) {
        if (originalContent) {
          meta.setAttribute('content', originalContent);
        } else {
          meta.remove();
        }
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === "Super Admin" || user.role === "Operations Manager") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#110d22] text-white flex flex-col justify-center items-center py-10">
      <div className="w-full max-w-7xl px-4 sm:px-6">
        <AdminPanel
          lang="en"
          onForceRefresh={() => {}}
          mode="admin"
        />
      </div>
    </div>
  );
}
