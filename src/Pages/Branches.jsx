import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { readBranches } from "../Utils/BranchesStore";

export default function BranchesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [branches, setBranches] = useState(() => readBranches());

  useEffect(() => {
    setBranches(readBranches());
  }, [location.pathname]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return branches;

    return branches.filter((b) => {
      return (
        String(b.name).toLowerCase().includes(q) ||
        String(b.city).toLowerCase().includes(q) ||
        String(b.email).toLowerCase().includes(q) ||
        String(b.manager).toLowerCase().includes(q) ||
        String(b.phone).toLowerCase().includes(q)
      );
    });
  }, [branches, query]);

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/branches/add")}
            className="rounded-xl bg-[#ff7a1a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,122,26,0.28)] transition hover:-translate-y-0.5"
          >
            Add Branch
          </button>
        </div>

        <section className="rounded-[26px] border border-white/80 p-5 shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:p-6">
          <label
            htmlFor="branches-search"
            className="flex h-16.5 items-center gap-3 rounded-[22px] border border-[#d3d3d3] bg-[#f8f8f8] px-5"
          >
            <SearchIcon />
            <input
              id="branches-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Branches..."
              className="h-full w-full border-0 bg-transparent text-[15px] font-medium text-[#575b63] outline-none placeholder:text-[#8c9098]"
            />
          </label>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {filtered.map((branch) => (
            <article
              key={branch.id}
              className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-55 items-center gap-4">
                  <div className="grid h-22 w-22 place-items-center rounded-[20px] border border-[#d5d5d5] text-[#8b8f96]">
                    <BranchIcon />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-semibold text-[#252a31]">{branch.name}</h3>
                    <span
                      className={`mt-2 inline-block rounded-full px-4 py-1 text-[14px] font-medium ${
                        branch.status === "Active"
                          ? "bg-[#e7f4ec] text-[#27ae60]"
                          : "bg-[#ececec] text-[#555]"
                      }`}
                    >
                      {branch.status}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/branches/${branch.id}`)}
                  className="grid h-14 w-14 place-items-center rounded-2xl border border-white bg-white text-[#ff7a1a] shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
                  aria-label={`View ${branch.name}`}
                >
                  <EyeIcon />
                </button>
              </div>

              <div className="my-5 h-px bg-[#d5d5d5]" />

              <div className="grid grid-cols-2 gap-5">
                <Metric label="Address" value={branch.address} />
                <Metric label="Phone" value={branch.phone} />
                <Metric label="Manager" value={branch.manager} />
                <Metric label="Employees" value={String(branch.employeeCount)} />
                <Metric label="Products" value={String(branch.productCount)} />
                <Metric label="City" value={branch.city} />
              </div>
            </article>
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="mt-6 rounded-[28px] border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center text-sm text-[#8d929a]">
            No branches found.
          </div>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[15px] text-[#8b9097]">{label}</p>
      <p className="mt-2 text-[18px] font-medium text-[#252a31]">{value}</p>
    </div>
  );
}

function IconSvg({ children, className = "h-7 w-7" }) {
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
function SearchIcon() {
  return (
    <IconSvg className="h-7 w-7 shrink-0 text-[#8a8f97]">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </IconSvg>
  );
}
function BranchIcon() {
  return (
    <IconSvg className="h-9 w-9">
      <rect x="4" y="3" width="10" height="18" rx="2" />
      <path d="M14 8h4a2 2 0 0 1 2 2v11h-6" />
      <path d="M8 7h2M8 11h2M8 15h2" />
    </IconSvg>
  );
}
function EyeIcon() {
  return (
    <IconSvg className="h-6 w-6">
      <path d="M2 12s3.7-6 10-6 10 6 10 6-3.7 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </IconSvg>
  );
}
