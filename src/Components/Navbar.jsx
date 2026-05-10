import { useEffect, useMemo, useState } from "react";

const BASE_ITEMS = [
  { key: "home", label: "Home", href: "/home", icon: HomeIcon, showLabel: true },
  { key: "products", label: "Products", href: "/products", icon: CubeIcon },
  { key: "sales", label: "Sales", href: "/sales", icon: CartIcon },
  { key: "inventory", label: "Inventory", href: "/inventory", icon: TrashIcon },
  { key: "profit", label: "Profit", href: "/profit", icon: DollarIcon },
  { key: "employees", label: "Employees", href: "/employees", icon: UsersIcon },
  {
    key: "branches",
    label: "Branches",
    href: "/branches",
    icon: BranchIcon,
  },
  { key: "settings", label: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function Navbar({
  items,
  initialActiveKey = "home",
  onNavigate,
  routerNavigate,
  onAdminClick,
  adminHref = "/admin",
  showAdmin = false,
  adminLabel = "Admin",
}) {
  const navItems = useMemo(
    () => (Array.isArray(items) && items.length > 0 ? items : BASE_ITEMS),
    [items]
  );

  const [activeKey, setActiveKey] = useState(() => {
    if (typeof window === "undefined") return initialActiveKey;

    const currentPath = window.location.pathname;
    const matched = navItems.find((item) => item.href === currentPath);
    return matched?.key || initialActiveKey;
  });
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);

  const resolveDefaultNavigate = (href) => {
    if (!href || typeof window === "undefined") return;

    if (typeof routerNavigate === "function") {
      routerNavigate(href);
      return;
    }

    if (href.startsWith("#")) {
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      window.history.replaceState(null, "", href);
      return;
    }

    if (href !== window.location.pathname) {
      window.location.assign(href);
    }
  };

  const handleNavigate = (item) => {
    setActiveKey(item.key);

    if (onNavigate) {
      onNavigate(item);
      return;
    }

    resolveDefaultNavigate(item.href);
  };

  const handleAdmin = () => {
    if (onAdminClick) {
      onAdminClick();
      return;
    }

    resolveDefaultNavigate(adminHref);
  };

  useEffect(() => {
    const syncActiveItem = () => {
      const currentPath = window.location.pathname;
      const matched = navItems.find((item) => item.href === currentPath);
      setActiveKey(matched?.key || initialActiveKey);
    };

    window.addEventListener("popstate", syncActiveItem);
    return () => window.removeEventListener("popstate", syncActiveItem);
  }, [navItems, initialActiveKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastScrollY = window.scrollY;
    const threshold = 8;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;

      if (currentY <= 20) {
        setIsNavbarHidden(false);
        lastScrollY = currentY;
        return;
      }

      if (delta > threshold) setIsNavbarHidden(true);
      if (delta < -threshold) setIsNavbarHidden(false);

      lastScrollY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50/90 pt-6 pb-7 backdrop-blur-sm transition-transform duration-300 ease-out",
        isNavbarHidden ? "-translate-y-[120%] pointer-events-none" : "translate-y-0",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-290 px-4 sm:px-6">
        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <a
            href="/home"
            className="inline-flex items-center gap-2 justify-self-start text-[#ff7a1a]"
            aria-label="StoreFlow home"
          >
            <StoreIcon />
            <span className="text-[30px] font-bold leading-none tracking-[0.2px] sm:text-[34px]">
              Stor<em className="not-italic">eFlow</em>
            </span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="flex w-full items-center gap-1 overflow-x-auto rounded-[22px] border border-[#ff7a1a]/20 bg-white p-2 shadow-[0_10px_24px_rgba(13,18,25,0.08)] md:w-auto"
          >
            {navItems.map((item) => {
              const isActive = activeKey === item.key;
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  aria-label={item.label}
                  aria-current={isActive ? "page" : "false"}
                  onClick={() => handleNavigate(item)}
                  className={[
                    "group flex h-11 items-center overflow-hidden rounded-[14px] transition-all duration-300 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a]/60 focus-visible:ring-offset-2",
                    isActive
                      ? "w-27.5 justify-start gap-2 bg-linear-to-br from-[#ff8a32] to-[#ff7211] px-3 text-white shadow-[0_12px_30px_rgba(255,122,26,0.25)]"
                      : "w-11 justify-center text-[#ff7a1a] hover:-translate-y-0.5 hover:bg-[#fff2e8] active:translate-y-0 active:scale-95",
                  ].join(" ")}
                >
                  <span className={isActive ? "animate-[pulse_0.36s_ease-out]" : ""}>
                    <Icon />
                  </span>

                  {(item.showLabel || isActive) && (
                    <span
                      className={[
                        "whitespace-nowrap text-sm font-semibold transition-all duration-300",
                        isActive
                          ? "max-w-20 translate-x-0 opacity-100"
                          : "max-w-0 -translate-x-1 opacity-0",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {showAdmin ? (
            <button
              type="button"
              title={adminLabel}
              aria-label={adminLabel}
              onClick={handleAdmin}
              className="h-14 min-w-14 justify-self-end rounded-2xl border border-[#ff7a1a]/25 bg-white px-3 text-[#ff7a1a] shadow-[0_10px_24px_rgba(13,18,25,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fff8f2] hover:shadow-[0_12px_30px_rgba(255,122,26,0.2)] active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a]/60 focus-visible:ring-offset-2"
            >
              <span className="flex items-center gap-2">
                <AdminIcon />
                <span className="hidden text-xs font-semibold sm:inline">{adminLabel}</span>
              </span>
            </button>
          ) : (
            <div className="h-14 w-14 justify-self-end" />
          )}
        </div>
      </div>

      <div className="mt-4 h-0.5 w-full bg-linear-to-r from-[#ff9e5a]/30 via-[#ff7a1a] to-[#ff9e5a]/30 shadow-[0_2px_14px_rgba(255,122,26,0.28)]" />
    </header>
  );
}

function IconSvg({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9h18l-1.5 9A2 2 0 0 1 17.5 20H6.5a2 2 0 0 1-2-2L3 9Z" />
      <path d="M5.5 5h13L21 9H3l2.5-4Z" />
      <path d="M8 13v3m4-3v3m4-3v3" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <IconSvg>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
    </IconSvg>
  );
}

function CubeIcon() {
  return (
    <IconSvg>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 3v9m8-4.5-8 4.5-8-4.5" />
    </IconSvg>
  );
}

function CartIcon() {
  return (
    <IconSvg>
      <circle cx="9" cy="20" r="1.8" />
      <circle cx="18" cy="20" r="1.8" />
      <path d="M2.5 4h2.7l2.2 11h11.1l2.3-7.8H6.8" />
    </IconSvg>
  );
}

function TrashIcon() {
  return (
    <IconSvg>
      <path d="M3 6h18M7 6V4h10v2m-1 4v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-9" />
    </IconSvg>
  );
}

function DollarIcon() {
  return (
    <IconSvg>
      <path d="M12 3v18" />
      <path d="M16 6.5A4 4 0 0 0 12 4c-2.2 0-4 1.4-4 3.2 0 1.7 1.3 2.6 4 3.3 2.7.6 4 1.5 4 3.2 0 1.8-1.8 3.3-4 3.3a4 4 0 0 1-4-2.5" />
    </IconSvg>
  );
}

function UsersIcon() {
  return (
    <IconSvg>
      <path d="M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M16 12a2.9 2.9 0 1 0 0-5.8 2.9 2.9 0 0 0 0 5.8Z" />
      <path d="M2.5 20a5.5 5.5 0 0 1 11 0m3.2 0a4.2 4.2 0 0 1 4.8-3.9" />
    </IconSvg>
  );
}

function BranchIcon() {
  return (
    <IconSvg>
      <path d="M7 3v18m10-18v18" />
      <path d="M4 7h6m4 0h6M4 12h16M4 17h6m4 0h6" />
    </IconSvg>
  );
}

function SettingsIcon() {
  return (
    <IconSvg>
      <path d="m12 3.8 1 .2.6 2a6.2 6.2 0 0 1 1.9 1l2-.8.7.8-.9 1.9a6 6 0 0 1 .8 1.9l2 .5v1l-2 .6a6 6 0 0 1-.8 1.9l.9 1.9-.7.8-2-.8a6.2 6.2 0 0 1-1.9 1l-.6 2-1 .2-1-.2-.6-2a6.2 6.2 0 0 1-1.9-1l-2 .8-.7-.8.9-1.9a6 6 0 0 1-.8-1.9l-2-.6v-1l2-.5a6 6 0 0 1 .8-1.9L4.8 7l.7-.8 2 .8a6.2 6.2 0 0 1 1.9-1l.6-2 1-.2Z" />
      <path d="M12 15.1a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z" />
    </IconSvg>
  );
}

function AdminIcon() {
  return (
    <IconSvg>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </IconSvg>
  );
}
