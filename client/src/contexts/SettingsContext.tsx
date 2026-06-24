import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

export interface SystemSettingsData {
  siteName: string;
  logoUrl: string;
  supportPhone: string;
  supportEmail: string;
  registrationFee: number;
  upiId: string;
  qrCodeUrl: string;
  enableRegistration: boolean;
  enableAI: boolean;
  enableEmail: boolean;
  enableWhatsApp: boolean;
}

interface SettingsContextType {
  settings: SystemSettingsData;
  loading: boolean;
  reloadSettings: () => Promise<void>;
  updateSettings: (formData: FormData) => Promise<boolean>;
}

const defaultSettings: SystemSettingsData = {
  siteName: "Raft Tutor Axis",
  logoUrl: "",
  supportPhone: "+91 62053 55760",
  supportEmail: "support@rafttutoraxis.com",
  registrationFee: 149,
  upiId: "6205355760-3@ybl",
  qrCodeUrl: "",
  enableRegistration: true,
  enableAI: true,
  enableEmail: true,
  enableWhatsApp: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const reloadSettings = async () => {
    try {
      const data = await api.get("/api/settings");
      if (data && Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to load settings from server:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadSettings();
  }, []);

  const updateSettings = async (formData: FormData): Promise<boolean> => {
    try {
      const data = await api.post("/api/admin/settings", formData);
      if (data?.success && data?.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
        return true;
      }
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
    return false;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, reloadSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};
