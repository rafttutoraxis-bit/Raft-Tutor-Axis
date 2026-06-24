import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AdminPanel from "./components/AdminPanel";

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          mode="user"
        />
      </div>
    </div>
  );
}
