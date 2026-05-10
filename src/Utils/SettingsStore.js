const STORAGE_KEY = "storeflow_settings_v1";

const DEFAULT_SETTINGS = {
  businessInfo: {
    businessName: "RetailPro Store",
    email: "info@retailpro.com",
    phone: "+20 100 123 4567",
    address: "123 Main Street, Cairo, Egypt",
  },
  taxCurrency: {
    currency: "USD",
    taxRate: "14",
    taxRegistrationNumber: "TAX123456789",
  },
  notifications: {
    lowStockAlerts: false,
    dailySalesReport: false,
    newSalesNotifications: true,
  },
  language: {
    code: "en",
    label: "English",
    dir: "ltr",
  },
  security: {
    password: "12345678",
  },
};

function safeWindow() {
  return typeof window !== "undefined";
}

function toText(v) {
  return String(v ?? "").trim();
}

function mergeDeep(current, partial) {
  const next = { ...current };

  for (const key of Object.keys(partial)) {
    const value = partial[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      next[key] = { ...(current[key] || {}), ...value };
    } else {
      next[key] = value;
    }
  }

  return next;
}

export function readSettings() {
  if (!safeWindow()) return DEFAULT_SETTINGS;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    return mergeDeep(DEFAULT_SETTINGS, parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings) {
  if (!safeWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function updateSettings(partial) {
  const current = readSettings();
  const next = mergeDeep(current, partial);
  writeSettings(next);
  return next;
}

export function saveBusinessInfo(payload) {
  return updateSettings({
    businessInfo: {
      businessName: toText(payload.businessName),
      email: toText(payload.email).toLowerCase(),
      phone: toText(payload.phone),
      address: toText(payload.address),
    },
  });
}

export function saveTaxCurrency(payload) {
  return updateSettings({
    taxCurrency: {
      currency: toText(payload.currency),
      taxRate: toText(payload.taxRate),
      taxRegistrationNumber: toText(payload.taxRegistrationNumber),
    },
  });
}

export function saveNotifications(payload) {
  return updateSettings({
    notifications: {
      lowStockAlerts: !!payload.lowStockAlerts,
      dailySalesReport: !!payload.dailySalesReport,
      newSalesNotifications: !!payload.newSalesNotifications,
    },
  });
}

export function saveLanguage(payload) {
  return updateSettings({
    language: {
      code: toText(payload.code || "en"),
      label: toText(payload.label || "English"),
      dir: toText(payload.dir || "ltr"),
    },
  });
}

export function updatePassword({ currentPassword, newPassword }) {
  const settings = readSettings();
  if (toText(currentPassword) !== toText(settings.security.password)) {
    return { ok: false, message: "Current password is incorrect." };
  }

  updateSettings({
    security: { password: toText(newPassword) },
  });

  return { ok: true };
}
