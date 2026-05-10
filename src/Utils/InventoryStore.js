import { readProducts, writeProducts } from "./ProductStore";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function generateProductId(products) {
  let max = 0;
  for (const p of products) {
    const m = String(p.id || "").match(/(\d+)$/);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return `LP${String(max + 1).padStart(3, "0")}`;
}

export function addStockToProduct({ productId, branch, quantity }) {
  const all = readProducts();
  const qty = toNumber(quantity);
  if (qty <= 0) throw new Error("Quantity must be greater than 0.");

  const idx = all.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error("Product not found.");

  const current = all[idx];
  all[idx] = {
    ...current,
    branch: (branch || current.branch || "").trim(),
    stock: toNumber(current.stock) + qty,
  };

  writeProducts(all);
  return all[idx];
}

export function deductStockFromProduct({ productId, branch, quantity }) {
  const all = readProducts();
  const qty = toNumber(quantity);
  if (qty <= 0) throw new Error("Quantity must be greater than 0.");

  const idx = all.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error("Product not found.");

  const current = all[idx];
  const currentStock = toNumber(current.stock);
  if (qty > currentStock) throw new Error("Quantity is أكبر من المخزون الحالي.");

  all[idx] = {
    ...current,
    branch: (branch || current.branch || "").trim(),
    stock: currentStock - qty,
  };

  writeProducts(all);
  return all[idx];
}

export function transferProductStock({ productId, fromBranch, toBranch, quantity }) {
  const all = readProducts();
  const qty = toNumber(quantity);
  if (qty <= 0) throw new Error("Quantity must be greater than 0.");
  if (!toBranch || !toBranch.trim()) throw new Error("To Branch is required.");

  const srcIndex = all.findIndex((p) => p.id === productId);
  if (srcIndex === -1) throw new Error("Product not found.");

  const source = all[srcIndex];
  const srcStock = toNumber(source.stock);

  if (qty > srcStock) throw new Error("Quantity is أكبر من المخزون الحالي.");

  const normalizedFrom = (fromBranch || source.branch || "").trim();
  const normalizedTo = toBranch.trim();

  if (!normalizedFrom) throw new Error("From Branch is required.");
  if (normalizedFrom.toLowerCase() === normalizedTo.toLowerCase()) {
    throw new Error("From Branch و To Branch لازم يكونوا مختلفين.");
  }

  const updated = [...all];
  updated[srcIndex] = { ...source, branch: normalizedFrom, stock: srcStock - qty };

  const targetIndex = updated.findIndex(
    (p) =>
      p.id !== source.id &&
      String(p.code).toLowerCase() === String(source.code).toLowerCase() &&
      String(p.branch).toLowerCase() === normalizedTo.toLowerCase()
  );

  if (targetIndex >= 0) {
    updated[targetIndex] = {
      ...updated[targetIndex],
      stock: toNumber(updated[targetIndex].stock) + qty,
    };
  } else {
    updated.unshift({
      ...source,
      id: generateProductId(updated),
      branch: normalizedTo,
      stock: qty,
    });
  }

  writeProducts(updated);
  return true;
}
