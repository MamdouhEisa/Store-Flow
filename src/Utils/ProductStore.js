const STORAGE_KEY = "storeflow_products_v1";

const DEFAULT_PRODUCTS = [
  {
    id: "LP001",
    name: "Laptop HP",
    code: "LP001",
    branch: "Main Branch",
    purchasePrice: 8000,
    sellingPrice: 10000,
    stock: 15,
    imageUrl: "",
  },
  {
    id: "LP002",
    name: "Monitor Dell 24",
    code: "MN024",
    branch: "Nasr City",
    purchasePrice: 2500,
    sellingPrice: 3200,
    stock: 9,
    imageUrl: "",
  },
  {
    id: "LP003",
    name: "Keyboard Mechanical",
    code: "KB301",
    branch: "Alexandria",
    purchasePrice: 1200,
    sellingPrice: 1700,
    stock: 21,
    imageUrl: "",
  },
  {
    id: "LP004",
    name: "Mouse Logitech",
    code: "MS890",
    branch: "Main Branch",
    purchasePrice: 700,
    sellingPrice: 1050,
    stock: 12,
    imageUrl: "",
  },
];

function safeWindow() {
  return typeof window !== "undefined";
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readProducts() {
  if (!safeWindow()) return DEFAULT_PRODUCTS;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_PRODUCTS;
    return parsed;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function writeProducts(products) {
  if (!safeWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function getProductById(productId) {
  return readProducts().find((item) => item.id === productId) || null;
}

export function createProduct(payload) {
  const all = readProducts();
  const nextId = generateProductId(all);

  const nextProduct = {
    id: nextId,
    name: (payload.productName || "").trim(),
    code: (payload.productCode || "").trim() || nextId,
    branch: (payload.branch || "").trim(),
    purchasePrice: normalizeNumber(payload.purchasePrice),
    sellingPrice: normalizeNumber(payload.sellingPrice),
    stock: normalizeNumber(payload.initialStock),
    imageUrl: payload.imageUrl || "",
  };

  const updated = [nextProduct, ...all];
  writeProducts(updated);
  return nextProduct;
}

export function updateProduct(productId, payload) {
  const all = readProducts();
  const updated = all.map((item) => {
    if (item.id !== productId) return item;

    return {
      ...item,
      name: (payload.productName ?? item.name).trim(),
      code: (payload.productCode ?? item.code).trim(),
      branch: (payload.branch ?? item.branch).trim(),
      purchasePrice: normalizeNumber(payload.purchasePrice, item.purchasePrice),
      sellingPrice: normalizeNumber(payload.sellingPrice, item.sellingPrice),
      stock: normalizeNumber(payload.initialStock, item.stock),
      imageUrl: payload.imageUrl ?? item.imageUrl ?? "",
    };
  });

  writeProducts(updated);
  return updated.find((item) => item.id === productId) || null;
}

export function patchProduct(productId, patch) {
  const all = readProducts();
  const updated = all.map((item) =>
    item.id === productId
      ? {
          ...item,
          ...patch,
        }
      : item
  );
  writeProducts(updated);
  return updated.find((item) => item.id === productId) || null;
}

export function deleteProduct(productId) {
  const all = readProducts();
  const updated = all.filter((item) => item.id !== productId);

  if (updated.length === all.length) {
    return false;
  }

  writeProducts(updated);
  return true;
}

function generateProductId(products) {
  let max = 0;
  for (const product of products) {
    const match = String(product.id || "").match(/(\d+)$/);
    if (!match) continue;
    const n = Number(match[1]);
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  const next = max + 1;
  return `LP${String(next).padStart(3, "0")}`;
}
