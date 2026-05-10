import { getProductById, patchProduct } from "./ProductStore";

const STORAGE_KEY = "storeflow_sales_v1";


export function patchSale(saleId, patch) {
  const all = readSales();
  const updated = all.map((sale) =>
    sale.id === saleId || sale.invoiceNumber === saleId
      ? { ...sale, ...patch }
      : sale
  );
  writeSales(updated);
  return (
    updated.find((sale) => sale.id === saleId || sale.invoiceNumber === saleId) || null
  );
}

export function returnFullSale(saleId) {
  return patchSale(saleId, {
    status: "Returned",
    returnType: "full",
    returnedAt: new Date().toISOString(),
  });
}


const DEFAULT_SALES = [
  {
    id: "INV-001",
    createdAt: "2024-12-01T10:30:00",
    branch: "Nasr City",
    status: "completed",
    paymentType: "cash",
    discount: 0,
    tax: 0,
    items: [
      { productId: "LP001", name: "Laptop HP", qty: 1, price: 10000, cost: 8000 },
      { productId: "LP002", name: "Monitor Dell 24", qty: 1, price: 3200, cost: 2500 },
    ],
  },
  {
    id: "INV-002",
    createdAt: "2024-12-02T09:15:00",
    branch: "Main Branch",
    status: "returned",
    paymentType: "cash",
    discount: 0,
    tax: 0,
    items: [{ productId: "LP003", name: "Keyboard Mechanical", qty: 1, price: 1700, cost: 1200 }],
  },
];

const n = (v, d = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : d;
};

const calcTotals = (items, discount = 0, tax = 0) => {
  const subtotal = items.reduce((s, i) => s + n(i.price) * n(i.qty), 0);
  const totalCost = items.reduce((s, i) => s + n(i.cost) * n(i.qty), 0);
  const totalAmount = Math.max(0, subtotal - n(discount) + n(tax));
  const totalProfit = totalAmount - totalCost;
  const profitMargin = totalAmount > 0 ? (totalProfit / totalAmount) * 100 : 0;
  return { subtotal, totalCost, totalAmount, totalProfit, profitMargin };
};

const enrichSale = (sale) => {
  const totals = calcTotals(sale.items || [], sale.discount || 0, sale.tax || 0);
  return { ...sale, ...totals };
};

const safeWindow = () => typeof window !== "undefined";

export function readSales() {
  if (!safeWindow()) return DEFAULT_SALES.map(enrichSale);

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = DEFAULT_SALES.map(enrichSale);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_SALES.map(enrichSale);
    return parsed.map(enrichSale);
  } catch {
    return DEFAULT_SALES.map(enrichSale);
  }
}

export function writeSales(sales) {
  if (!safeWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sales.map(enrichSale)));
}

export function getSaleById(id) {
  return readSales().find((s) => s.id === id) || null;
}

const generateInvoiceId = (sales) => {
  let max = 0;
  for (const sale of sales) {
    const m = String(sale.id || "").match(/(\d+)$/);
    if (!m) continue;
    max = Math.max(max, Number(m[1]) || 0);
  }
  return `INV-${String(max + 1).padStart(3, "0")}`;
};

export function createSale(payload) {
  const all = readSales();
  const items = (payload.items || [])
    .filter((i) => n(i.qty) > 0)
    .map((i) => ({
      productId: i.productId,
      name: i.name,
      qty: n(i.qty),
      price: n(i.price),
      cost: n(i.cost),
    }));

  if (!items.length) return null;

  const sale = enrichSale({
    id: generateInvoiceId(all),
    createdAt: payload.createdAt || new Date().toISOString(),
    branch: payload.branch || "Main Branch",
    status: "completed",
    paymentType: payload.paymentType || "cash",
    discount: n(payload.discount),
    tax: n(payload.tax),
    items,
  });

  writeSales([sale, ...all]);

  // deduct stock
  items.forEach((item) => {
    const product = getProductById(item.productId);
    if (!product) return;
    patchProduct(item.productId, { stock: Math.max(0, n(product.stock) - n(item.qty)) });
  });

  return sale;
}


export function returnSaleItem(saleId, productId) {
  const all = readSales();
  let updatedSale = null;

  const next = all.map((sale) => {
    if (sale.id !== saleId) return sale;

    const item = sale.items.find((i) => i.productId === productId);
    if (!item) {
      updatedSale = sale;
      return sale;
    }

    const product = getProductById(item.productId);
    if (product) {
      patchProduct(item.productId, { stock: n(product.stock) + n(item.qty) });
    }

    const remainingItems = sale.items.filter((i) => i.productId !== productId);
    const status = remainingItems.length === 0 ? "returned" : "partial_return";

    updatedSale = enrichSale({ ...sale, items: remainingItems, status });
    return updatedSale;
  });

  writeSales(next);
  return updatedSale;
}

export function readInvoices() {
  return readSales();
}

export function readAllSales() {
  return readSales();
}
