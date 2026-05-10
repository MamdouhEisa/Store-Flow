const STORAGE_KEY = "storeflow_branches_v1";

const DEFAULT_BRANCHES = [
  {
    id: "BR001",
    name: "Nasr City",
    address: "34 Ahmed St, Nasr City",
    city: "Cairo",
    email: "nasr@retail.com",
    phone: "+20 2 1234 5678",
    manager: "Sara Mohamed",
    employeeCount: 12,
    productCount: 450,
    status: "Active",
  },
  {
    id: "BR002",
    name: "Alexandria",
    address: "15 Sea Rd, Alexandria",
    city: "Alexandria",
    email: "alex@retail.com",
    phone: "+20 3 1234 5678",
    manager: "Omar Ali",
    employeeCount: 9,
    productCount: 320,
    status: "Inactive",
  },
];

function safeWindow() {
  return typeof window !== "undefined";
}

function toText(v) {
  return String(v ?? "").trim();
}

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function readBranches() {
  if (!safeWindow()) return DEFAULT_BRANCHES;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANCHES));
    return DEFAULT_BRANCHES;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_BRANCHES;
    return parsed;
  } catch {
    return DEFAULT_BRANCHES;
  }
}

export function writeBranches(branches) {
  if (!safeWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
}

export function getBranchById(branchId) {
  return readBranches().find((b) => b.id === branchId) || null;
}

export function createBranch(payload) {
  const all = readBranches();

  const next = {
    id: generateBranchId(all),
    name: toText(payload.branchName),
    address: toText(payload.streetAddress),
    city: toText(payload.city),
    email: toText(payload.email).toLowerCase(),
    phone: toText(payload.phone),
    manager: toText(payload.branchManager),
    employeeCount: 0,
    productCount: 0,
    status: "Active",
  };

  const updated = [next, ...all];
  writeBranches(updated);
  return next;
}

export function updateBranch(branchId, payload) {
  const all = readBranches();

  const updated = all.map((b) => {
    if (b.id !== branchId) return b;

    return {
      ...b,
      name: toText(payload.branchName || b.name),
      address: toText(payload.streetAddress || b.address),
      city: toText(payload.city || b.city),
      email: toText(payload.email || b.email).toLowerCase(),
      phone: toText(payload.phone || b.phone),
      manager: toText(payload.branchManager || b.manager),
      employeeCount: toNumber(payload.employeeCount, b.employeeCount),
      productCount: toNumber(payload.productCount, b.productCount),
    };
  });

  writeBranches(updated);
  return updated.find((b) => b.id === branchId) || null;
}

export function toggleBranchStatus(branchId) {
  const all = readBranches();

  const updated = all.map((b) =>
    b.id === branchId
      ? { ...b, status: b.status === "Active" ? "Inactive" : "Active" }
      : b
  );

  writeBranches(updated);
  return updated.find((b) => b.id === branchId) || null;
}

function generateBranchId(branches) {
  let max = 0;

  for (const b of branches) {
    const match = String(b.id || "").match(/(\d+)$/);
    if (!match) continue;
    const n = Number(match[1]);
    if (Number.isFinite(n)) max = Math.max(max, n);
  }

  return `BR${String(max + 1).padStart(3, "0")}`;
}
