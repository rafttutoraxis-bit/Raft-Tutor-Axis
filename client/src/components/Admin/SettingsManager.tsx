import React, { useState, useEffect } from "react";
import { Settings, Save, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import Card from "../UI/Card";
import Button from "../UI/Button";
import { API_URL } from "../../config";

export default function SettingsManager() {
  const { settings, updateSettings, reloadSettings } = useSettings();
  const [formData, setFormData] = useState({
    siteName: "",
    supportPhone: "",
    supportEmail: "",
    registrationFee: 149,
    upiId: "",
    enableRegistration: true,
    enableAI: true,
    enableEmail: true,
    enableWhatsApp: true
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API_URL}${path}`;
  };

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName,
        supportPhone: settings.supportPhone,
        supportEmail: settings.supportEmail,
        registrationFee: settings.registrationFee,
        upiId: settings.upiId,
        enableRegistration: settings.enableRegistration,
        enableAI: settings.enableAI,
        enableEmail: settings.enableEmail,
        enableWhatsApp: settings.enableWhatsApp
      });
      if (settings.qrCodeUrl) {
        setQrPreview(settings.qrCodeUrl);
      }
    }
  }, [settings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: "" });

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, String(value));
      });
      if (qrFile) {
        form.append("qrCode", qrFile);
      }

      const success = await updateSettings(form);
      if (success) {
        setStatus({ type: "success", message: "System configurations updated successfully!" });
        reloadSettings();
      } else {
        throw new Error();
      }
    } catch {
      setStatus({ type: "error", message: "Failed to persist configuration adjustments on server." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="glass" hoverable={false} className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 border-b border-[#9bfc07]/10 pb-3 mb-6 select-none">
        <Settings className="w-5 h-5 text-[#9bfc07]" />
        <div>
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">
            Global Site Settings Control
          </h3>
          <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Configure branding, payments, and gateway toggles without editing code</p>
        </div>
      </div>

      {status.type && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-2.5 border ${
          status.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <span className="text-[10px] font-medium leading-normal">{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-white text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Site Branding Name</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={e => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] px-3.5 py-2.5 rounded-xl outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Teacher Registration Fee (₹)</label>
            <input
              type="number"
              value={formData.registrationFee}
              onChange={e => setFormData({ ...formData, registrationFee: Number(e.target.value) })}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] px-3.5 py-2.5 rounded-xl outline-none font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Merchant UPI Address</label>
            <input
              type="text"
              value={formData.upiId}
              onChange={e => setFormData({ ...formData, upiId: e.target.value })}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] px-3.5 py-2.5 rounded-xl outline-none font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Merchant UPI QR Image</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-[#110d22] border border-zinc-800 hover:border-[#9bfc07] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] text-zinc-400 font-medium select-none">
                <Upload className="w-3.5 h-3.5 text-[#9bfc07]" />
                <span>Upload QR JPG</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {qrPreview && (
                <img src={getFullUrl(qrPreview)} className="w-10 h-10 rounded border border-[#9bfc07]/25 shrink-0 object-contain" alt="QR Preview" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Helpline Phone Desk</label>
            <input
              type="text"
              value={formData.supportPhone}
              onChange={e => setFormData({ ...formData, supportPhone: e.target.value })}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] px-3.5 py-2.5 rounded-xl outline-none font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Support Desk Email</label>
            <input
              type="email"
              value={formData.supportEmail}
              onChange={e => setFormData({ ...formData, supportEmail: e.target.value })}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] px-3.5 py-2.5 rounded-xl outline-none"
              required
            />
          </div>
        </div>

        {/* Feature toggles */}
        <div className="space-y-4 pt-4 border-t border-zinc-800 select-none">
          <span className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2">Feature Control Gates</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3.5 bg-[#110d22]/55 rounded-xl border border-zinc-850 cursor-pointer">
              <span>Enable Public Registrations</span>
              <input
                type="checkbox"
                checked={formData.enableRegistration}
                onChange={e => setFormData({ ...formData, enableRegistration: e.target.checked })}
                className="w-4 h-4 accent-[#9bfc07] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#110d22]/55 rounded-xl border border-zinc-850 cursor-pointer">
              <span>Enable Gemini AI Insights</span>
              <input
                type="checkbox"
                checked={formData.enableAI}
                onChange={e => setFormData({ ...formData, enableAI: e.target.checked })}
                className="w-4 h-4 accent-[#9bfc07] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#110d22]/55 rounded-xl border border-zinc-850 cursor-pointer">
              <span>Enable Automatic Email Alerts</span>
              <input
                type="checkbox"
                checked={formData.enableEmail}
                onChange={e => setFormData({ ...formData, enableEmail: e.target.checked })}
                className="w-4 h-4 accent-[#9bfc07] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#110d22]/55 rounded-xl border border-zinc-850 cursor-pointer">
              <span>Enable WhatsApp Integration</span>
              <input
                type="checkbox"
                checked={formData.enableWhatsApp}
                onChange={e => setFormData({ ...formData, enableWhatsApp: e.target.checked })}
                className="w-4 h-4 accent-[#9bfc07] cursor-pointer"
              />
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={saving}
          className="w-full flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </Button>
      </form>
    </Card>
  );
}
