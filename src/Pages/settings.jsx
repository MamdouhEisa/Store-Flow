import { useMemo, useState } from "react";
import {
  readSettings,
  saveBusinessInfo,
  saveTaxCurrency,
  saveNotifications,
  saveLanguage,
  updatePassword,
} from "../Utils/SettingsStore";

const TABS = [
  { key: "business", label: "Business Info", icon: BusinessIcon },
  { key: "tax", label: "Tax & Currency", icon: DollarIcon },
  { key: "notifications", label: "Notifications", icon: BellIcon },
  { key: "language", label: "Language", icon: GlobeIcon },
  { key: "password", label: "Change Password", icon: LockIcon },
];

const CURRENCIES = ["USD", "EGP", "EUR", "SAR", "AED"];
const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "Arabic", dir: "rtl" },
];

export default function SettingsPage() {
  const initial = useMemo(() => readSettings(), []);
  const [activeTab, setActiveTab] = useState("business");
  const [msg, setMsg] = useState("");

  const [business, setBusiness] = useState(initial.businessInfo);
  const [tax, setTax] = useState(initial.taxCurrency);
  const [notifications, setNotifications] = useState(initial.notifications);
  const [languageCode, setLanguageCode] = useState(initial.language.code || "en");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const flash = (text) => {
    setMsg(text);
    window.setTimeout(() => setMsg(""), 2200);
  };

  const onSaveBusiness = (e) => {
    e.preventDefault();
    if (!business.businessName || !business.email || !business.phone || !business.address) {
      flash("Please fill all business fields.");
      return;
    }
    saveBusinessInfo(business);
    flash("Business info saved.");
  };

  const onSaveTax = (e) => {
    e.preventDefault();
    if (!tax.currency || tax.taxRate === "" || !tax.taxRegistrationNumber) {
      flash("Please fill all tax fields.");
      return;
    }
    saveTaxCurrency(tax);
    flash("Tax & currency saved.");
  };

  const onSaveNotifications = (e) => {
    e.preventDefault();
    saveNotifications(notifications);
    flash("Notification settings saved.");
  };

  const onSaveLanguage = (e) => {
    e.preventDefault();
    const selected = LANGUAGES.find((l) => l.code === languageCode) || LANGUAGES[0];
    saveLanguage(selected);

    document.documentElement.lang = selected.code;
    document.documentElement.dir = selected.dir;

    flash("Language saved. Reload page if needed.");
  };

  const onUpdatePassword = (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      flash("Please fill all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      flash("New password and confirm password do not match.");
      return;
    }

    const strong = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!strong.test(passwordForm.newPassword)) {
      flash("Password must be at least 8 characters and include letters and numbers.");
      return;
    }

    const result = updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (!result.ok) {
      flash(result.message);
      return;
    }

    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    flash("Password updated successfully.");
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <section className="mb-6 flex justify-center">
          <div className="inline-flex flex-wrap gap-2 rounded-[28px] border border-white/80  p-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "inline-flex items-center gap-2 rounded-[20px] px-5 py-2.5 text-[16px] font-semibold transition",
                    active ? "bg-[#ff7a1a] text-white" : "text-[#2f333a] hover:bg-[#fff4ec]",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {msg ? (
          <div className="mb-4 rounded-xl border border-[#ffd3b3] bg-[#fff4ea] px-4 py-3 text-sm font-medium text-[#ff7a1a]">
            {msg}
          </div>
        ) : null}

        <section className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:p-8">
          {activeTab === "business" && (
            <form onSubmit={onSaveBusiness} className="space-y-5">
              <InputField
                label="Business Name"
                value={business.businessName}
                onChange={(v) => setBusiness((p) => ({ ...p, businessName: v }))}
              />
              <InputField
                label="Email Address *"
                value={business.email}
                onChange={(v) => setBusiness((p) => ({ ...p, email: v }))}
                type="email"
              />
              <InputField
                label="Phone Number *"
                value={business.phone}
                onChange={(v) => setBusiness((p) => ({ ...p, phone: v }))}
              />
              <InputField
                label="Business Address *"
                value={business.address}
                onChange={(v) => setBusiness((p) => ({ ...p, address: v }))}
              />
              <SaveButton text="Save Changes" />
            </form>
          )}

          {activeTab === "tax" && (
            <form onSubmit={onSaveTax} className="space-y-5">
              <SelectField
                label="Currency"
                value={tax.currency}
                options={CURRENCIES}
                onChange={(v) => setTax((p) => ({ ...p, currency: v }))}
              />
              <InputField
                label="Tax Rate (%)"
                value={tax.taxRate}
                onChange={(v) => setTax((p) => ({ ...p, taxRate: v }))}
                type="number"
              />
              <InputField
                label="Tax Registration Number"
                value={tax.taxRegistrationNumber}
                onChange={(v) => setTax((p) => ({ ...p, taxRegistrationNumber: v }))}
              />
              <SaveButton text="Save Changes" />
            </form>
          )}

          {activeTab === "notifications" && (
            <form onSubmit={onSaveNotifications} className="space-y-4">
              <ToggleCard
                title="Low Stock Alerts"
                desc="Get Notified When Products Are Running Low"
                checked={notifications.lowStockAlerts}
                onChange={() =>
                  setNotifications((p) => ({ ...p, lowStockAlerts: !p.lowStockAlerts }))
                }
              />
              <ToggleCard
                title="Daily Sales Report"
                desc="Receive Daily Summary Of Sales And Profit"
                checked={notifications.dailySalesReport}
                onChange={() =>
                  setNotifications((p) => ({ ...p, dailySalesReport: !p.dailySalesReport }))
                }
              />
              <ToggleCard
                title="New Sales Notifications"
                desc="Get Notified For Each New Sale"
                checked={notifications.newSalesNotifications}
                onChange={() =>
                  setNotifications((p) => ({
                    ...p,
                    newSalesNotifications: !p.newSalesNotifications,
                  }))
                }
              />
              <SaveButton text="Save Changes" />
            </form>
          )}

          {activeTab === "language" && (
            <form onSubmit={onSaveLanguage} className="space-y-5">
              <SelectField
                label="Display Language"
                value={languageCode}
                options={LANGUAGES.map((l) => l.code)}
                labelsMap={Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label]))}
                onChange={(v) => setLanguageCode(v)}
              />
              <div className="rounded-2xl border border-[#d7d7d7] bg-[#f8f8f8] px-5 py-4 text-[15px] text-[#8b9098]">
                <span className="font-semibold text-[#e6b934]">Note:</span>{" "}
                Changing The Language Will Update All Interface Text.
              </div>
              <SaveButton text="Save Changes" />
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={onUpdatePassword} className="space-y-5">
              <InputField
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(v) => setPasswordForm((p) => ({ ...p, currentPassword: v }))}
              />
              <InputField
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))}
              />
              <InputField
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))}
              />
              <div className="rounded-2xl border border-[#d7d7d7] bg-[#f8f8f8] px-5 py-4 text-[15px] text-[#8b9098]">
                <span className="font-semibold text-[#e6b934]">Note:</span> Make sure password is at least 8 characters and includes letters and numbers.
              </div>
              <SaveButton text="Update Password" />
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function SaveButton({ text }) {
  return (
    <button
      type="submit"
      className="mt-2 h-[64px] w-full rounded-[22px] bg-[#ff7a1a] px-6 text-[18px] font-semibold text-white shadow-[0_12px_22px_rgba(255,122,26,0.28)] transition hover:-translate-y-0.5"
    >
      {text}
    </button>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[16px] font-semibold text-[#232830]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[62px] w-full rounded-[20px] border border-[#d3d3d3] bg-[#f6f6f6] px-5 text-[16px] text-[#2c3037] outline-none"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, labelsMap = {} }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[16px] font-semibold text-[#232830]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[62px] w-full rounded-[20px] border border-[#d3d3d3] bg-[#f6f6f6] px-5 text-[16px] text-[#2c3037] outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelsMap[option] || option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleCard({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#d7d7d7] bg-[#f8f8f8] px-6 py-5">
      <div>
        <p className="text-[18px] font-semibold text-[#252a31]">{title}</p>
        <p className="mt-1 text-[14px] text-[#8b9098]">{desc}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-10 w-20 rounded-full transition ${
          checked ? "bg-[#dff0e7]" : "bg-[#e2e2e2]"
        }`}
        aria-label={title}
      >
        <span
          className={`absolute top-1 h-8 w-8 rounded-full transition ${
            checked ? "right-1 bg-[#27ae60]" : "left-1 bg-[#8f8f8f]"
          }`}
        />
      </button>
    </div>
  );
}

function IconSvg({ children, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
function BusinessIcon(props) {
  return (
    <IconSvg {...props}>
      <rect x="4" y="3" width="10" height="18" rx="2" />
      <path d="M14 8h4a2 2 0 0 1 2 2v11h-6" />
      <path d="M8 7h2M8 11h2M8 15h2" />
    </IconSvg>
  );
}
function DollarIcon(props) {
  return (
    <IconSvg {...props}>
      <path d="M12 3v18" />
      <path d="M16 7a4 4 0 0 0-4-2 4 4 0 0 0 0 8 4 4 0 0 1 0 8 4 4 0 0 1-4-2" />
    </IconSvg>
  );
}
function BellIcon(props) {
  return (
    <IconSvg {...props}>
      <path d="M15 17H5a2 2 0 0 1-2-2c0-1.7 1.3-3 3-3V9a6 6 0 1 1 12 0v3c1.7 0 3 1.3 3 3a2 2 0 0 1-2 2h-4" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </IconSvg>
  );
}
function GlobeIcon(props) {
  return (
    <IconSvg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </IconSvg>
  );
}
function LockIcon(props) {
  return (
    <IconSvg {...props}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
    </IconSvg>
  );
}
