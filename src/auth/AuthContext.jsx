import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "storeflow_users_v1";
const EMPLOYEES_KEY = "storeflow_employees_v1";
const SESSION_KEY = "storeflow_session_user";
const ADMIN_ROLES = ["admin", "superadmin"];

function normalizeRoleKey(roleValue) {
  return String(roleValue || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function hasAnyRole(currentRole, allowedRoles) {
  if (!allowedRoles) return true;

  const roleList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (roleList.length === 0) return true;

  const currentRoleKey = normalizeRoleKey(currentRole);
  return roleList.some((role) => normalizeRoleKey(role) === currentRoleKey);
}

function safeJsonParse(rawValue, fallbackValue) {
  try {
    const parsed = JSON.parse(rawValue);
    return parsed ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function readArrayFromStorage(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  const parsed = safeJsonParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

function normalizeRole(roleValue) {
  const role = String(roleValue || "").trim().toLowerCase();
  return role || "employee";
}

function normalizeStatus(statusValue) {
  const status = String(statusValue || "active").trim().toLowerCase();
  return status || "active";
}

function normalizeAccount(account) {
  if (!account || typeof account !== "object") return null;

  const email = String(account.email || "").trim().toLowerCase();
  if (!email) return null;

  return {
    id: account.id || String(Date.now()),
    name: String(account.name || account.fullName || "User").trim() || "User",
    phone: String(account.phone || "").trim(),
    email,
    password: String(account.password || ""),
    role: normalizeRole(account.role),
    status: normalizeStatus(account.status),
  };
}

function readSessionUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  const parsed = safeJsonParse(raw, null);
  const normalized = normalizeAccount(parsed);
  if (!normalized) return null;

  return {
    id: normalized.id,
    name: normalized.name,
    email: normalized.email,
    role: normalized.role,
    status: normalized.status,
  };
}

function buildAccountsList() {
  const users = readArrayFromStorage(USERS_KEY).map(normalizeAccount).filter(Boolean);
  const employees = readArrayFromStorage(EMPLOYEES_KEY).map(normalizeAccount).filter(Boolean);
  return {
    users,
    employees,
    all: [...users, ...employees],
  };
}

function createSessionFromAccount(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    status: account.status,
  };
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return String(Date.now());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sessionUser = readSessionUser();
    setUser(sessionUser);
    setIsReady(true);
  }, []);

  const login = ({ email, password }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "");

    if (!normalizedEmail || !normalizedPassword) {
      return { ok: false, message: "Email and password are required." };
    }

    const { all } = buildAccountsList();

    const matchedAccount = all.find(
      (account) =>
        account.email === normalizedEmail &&
        String(account.password || "") === normalizedPassword
    );

    if (!matchedAccount) {
      return { ok: false, message: "Invalid email or password." };
    }

    if (normalizeStatus(matchedAccount.status) !== "active") {
      return { ok: false, message: "This account is inactive." };
    }

    const nextSessionUser = createSessionFromAccount(matchedAccount);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSessionUser));
    setUser(nextSessionUser);

    return { ok: true, user: nextSessionUser };
  };

  const signup = ({ name, phone, email, password }) => {
    const normalizedName = String(name || "").trim();
    const normalizedPhone = String(phone || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "");

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return { ok: false, message: "Please fill in all required fields." };
    }

    const { users, all } = buildAccountsList();

    const emailExists = all.some((account) => account.email === normalizedEmail);
    if (emailExists) {
      return { ok: false, message: "Email already exists.", field: "email" };
    }

    const nextUser = {
      id: makeId(),
      name: normalizedName,
      phone: normalizedPhone,
      email: normalizedEmail,
      password: normalizedPassword,
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [nextUser, ...users];
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));

    const nextSessionUser = createSessionFromAccount(nextUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSessionUser));
    setUser(nextSessionUser);

    return { ok: true, user: nextSessionUser };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role || "guest",
      isAuthenticated: Boolean(user),
      isAdmin: hasAnyRole(user?.role, ADMIN_ROLES),
      hasRole: (roles) => hasAnyRole(user?.role, roles),
      isReady,
      login,
      signup,
      logout,
    }),
    [user, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
