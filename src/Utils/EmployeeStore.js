const STORAGE_KEY = "storeflow_employees_v1";

const DEFAULT_EMPLOYEES = [
  {
    id: "EMP001",
    fullName: "Ahmed Hassan",
    email: "ahmed@retail.com",
    phone: "+20 100 123 4567",
    role: "Manager",
    branch: "Main Branch",
    status: "Active",
    password: "123456",
  },
  {
    id: "EMP002",
    fullName: "Sara Mohamed",
    email: "sara@retail.com",
    phone: "+20 111 234 5678",
    role: "Admin",
    branch: "Nasr City",
    status: "Active",
    password: "123456",
  },
  {
    id: "EMP003",
    fullName: "Omar Ali",
    email: "omar@retail.com",
    phone: "+20 109 456 7890",
    role: "Cashier",
    branch: "Alexandria",
    status: "Active",
    password: "123456",
  },
];

function safeWindow() {
  return typeof window !== "undefined";
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeRole(value) {
  const role = normalizeText(value).toLowerCase();
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  if (role === "cashier" || role === "csahier") return "Cashier";
  return "Employee";
}

function normalizeStatus(value) {
  const status = normalizeText(value).toLowerCase();
  return status === "active" ? "Active" : "Inactive";
}

function sanitizeEmployee(employee) {
  if (!employee || typeof employee !== "object") return null;

  const id = normalizeText(employee.id);
  const fullName = normalizeText(employee.fullName);
  const email = normalizeText(employee.email).toLowerCase();

  if (!id || !fullName || !email) return null;

  return {
    id,
    fullName,
    email,
    phone: normalizeText(employee.phone),
    role: normalizeRole(employee.role),
    branch: normalizeText(employee.branch),
    status: normalizeStatus(employee.status),
    password: normalizeText(employee.password),
  };
}

export function readEmployees() {
  if (!safeWindow()) return DEFAULT_EMPLOYEES.map(sanitizeEmployee).filter(Boolean);

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = DEFAULT_EMPLOYEES.map(sanitizeEmployee).filter(Boolean);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const fallback = DEFAULT_EMPLOYEES.map(sanitizeEmployee).filter(Boolean);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }

    const normalized = parsed.map(sanitizeEmployee).filter(Boolean);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const fallback = DEFAULT_EMPLOYEES.map(sanitizeEmployee).filter(Boolean);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

export function writeEmployees(employees) {
  if (!safeWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export function getEmployeeById(employeeId) {
  return readEmployees().find((e) => e.id === employeeId) || null;
}

export function createEmployee(payload) {
  const all = readEmployees();

  const next = sanitizeEmployee({
    id: generateEmployeeId(all),
    fullName: normalizeText(payload.fullName),
    email: normalizeText(payload.email).toLowerCase(),
    phone: normalizeText(payload.phone),
    role: normalizeRole(payload.role),
    branch: normalizeText(payload.branch),
    status: "Active",
    password: normalizeText(payload.password),
  });

  if (!next) return null;

  const updated = [next, ...all];
  writeEmployees(updated);
  return next;
}

export function updateEmployee(employeeId, payload) {
  const all = readEmployees();

  const updated = all.map((e) => {
    if (e.id !== employeeId) return e;

    const password = normalizeText(payload.password);
    return {
      ...e,
      fullName: normalizeText(payload.fullName || e.fullName),
      email: normalizeText(payload.email || e.email).toLowerCase(),
      phone: normalizeText(payload.phone || e.phone),
      role: normalizeRole(payload.role || e.role),
      branch: normalizeText(payload.branch || e.branch),
      password: password ? password : e.password,
    };
  });

  writeEmployees(updated);
  return updated.find((e) => e.id === employeeId) || null;
}

export function updateEmployeeStatus(employeeId, status) {
  const all = readEmployees();
  const updated = all.map((e) =>
    e.id === employeeId ? { ...e, status: normalizeStatus(status) } : e
  );
  writeEmployees(updated);
  return updated.find((e) => e.id === employeeId) || null;
}

export function deleteEmployee(employeeId) {
  const all = readEmployees();
  const updated = all.filter((e) => e.id !== employeeId);

  if (updated.length === all.length) return false;

  writeEmployees(updated);
  return true;
}

function generateEmployeeId(employees) {
  let max = 0;

  for (const e of employees) {
    const match = String(e.id || "").match(/(\d+)$/);
    if (!match) continue;

    const n = Number(match[1]);
    if (Number.isFinite(n)) max = Math.max(max, n);
  }

  return `EMP${String(max + 1).padStart(3, "0")}`;
}
