import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteEmployee, readEmployees, updateEmployeeStatus } from "../Utils/EmployeeStore";

function isActiveStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase() === "active";
}

function getStatusLabel(value) {
  return isActiveStatus(value) ? "Active" : "Inactive";
}

function getRoleLabel(value) {
  const role = String(value || "")
    .trim()
    .toLowerCase();

  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  if (role === "cashier" || role === "csahier") return "Cashier";
  return "Employee";
}

function getRoleColorClass(value) {
  const role = getRoleLabel(value).toLowerCase();

  if (role === "admin") return "text-[#ff7a1a]";
  if (role === "manager") return "text-[#4f46e5]";
  if (role === "cashier") return "text-[#0ea5e9]";
  return "text-[#252a31]";
}

export default function EmployeesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState(() => readEmployees());

  useEffect(() => {
    setEmployees(readEmployees());
  }, [location.pathname]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((e) => {
      return (
        String(e.fullName).toLowerCase().includes(q) ||
        String(e.role).toLowerCase().includes(q) ||
        String(e.email).toLowerCase().includes(q) ||
        String(e.phone).toLowerCase().includes(q) ||
        String(e.branch).toLowerCase().includes(q)
      );
    });
  }, [employees, query]);

  const toggleStatus = (employee) => {
    const next = isActiveStatus(employee.status) ? "Inactive" : "Active";
    const updated = updateEmployeeStatus(employee.id, next);
    if (!updated) return;

    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? updated : e)));
  };

  const handleDelete = (employee) => {
    const confirmDelete = window.confirm(`Delete ${employee.fullName}?`);
    if (!confirmDelete) return;

    const deleted = deleteEmployee(employee.id);
    if (!deleted) return;

    setEmployees((prev) => prev.filter((e) => e.id !== employee.id));
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/employees/add")}
            className="rounded-xl bg-[#ff7a1a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,122,26,0.28)] transition hover:-translate-y-0.5"
          >
            Add Employee
          </button>
        </div>

        <section className="rounded-[26px] border border-white/80 p-5 shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:p-6">
          <label
            htmlFor="employees-search"
            className="flex h-[66px] items-center gap-3 rounded-[22px] border border-[#d3d3d3] bg-[#f8f8f8] px-5"
          >
            <SearchIcon />
            <input
              id="employees-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Employees By Name, Role Or Email..."
              className="h-full w-full border-0 bg-transparent text-[15px] font-medium text-[#575b63] outline-none placeholder:font-normal placeholder:text-[#8c9098]"
            />
          </label>
        </section>

        <section className="mt-8 space-y-6">
          {filtered.map((employee) => {
            const roleLabel = getRoleLabel(employee.role);
            const roleClassName = getRoleColorClass(employee.role);

            return (
              <article
                key={employee.id}
                className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-[260px] items-center gap-4">
                    <div className="grid h-[88px] w-[88px] place-items-center rounded-[20px] border border-[#d5d5d5] text-[#8b8f96]">
                      <UserIcon />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-semibold text-[#252a31]">{employee.fullName}</h3>
                      <button
                        type="button"
                        onClick={() => toggleStatus(employee)}
                        className={`mt-2 rounded-full px-4 py-1 text-[14px] font-medium ${
                          isActiveStatus(employee.status)
                            ? "bg-[#e7f4ec] text-[#27ae60]"
                            : "bg-[#fff0f0] text-[#ef5d5d]"
                        }`}
                      >
                        {getStatusLabel(employee.status)}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/employees/edit/${employee.id}`)}
                      className="grid h-14 w-14 place-items-center rounded-2xl border border-white bg-white text-[#ff7a1a] shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
                      aria-label={`Edit ${employee.fullName}`}
                    >
                      <EditIcon />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(employee)}
                      className="grid h-14 w-14 place-items-center rounded-2xl border border-white bg-white text-[#ef5d5d] shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
                      aria-label={`Delete ${employee.fullName}`}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>

                <div className="my-5 h-px bg-[#d5d5d5]" />

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                  <Metric label="Email" value={employee.email} />
                  <Metric label="Phone" value={employee.phone} />
                  <Metric label="Branch" value={employee.branch} />
                  <Metric label="Role" value={roleLabel} valueClassName={roleClassName} />
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center text-sm text-[#8d929a]">
              No employees found.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, valueClassName = "" }) {
  return (
    <div>
      <p className="text-[15px] text-[#8b9097]">{label}</p>
      <p className={`mt-2 text-[18px] font-medium text-[#252a31] ${valueClassName}`}>{value}</p>
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

function UserIcon() {
  return (
    <IconSvg className="h-9 w-9">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </IconSvg>
  );
}

function EditIcon() {
  return (
    <IconSvg className="h-6 w-6">
      <path d="M12.4 5.6h-6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      <path d="m15.2 4.8 4 4-8.2 8.2-4.6.6.6-4.6 8.2-8.2Z" />
    </IconSvg>
  );
}

function DeleteIcon() {
  return (
    <IconSvg className="h-6 w-6">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
      <path d="M10 11v6M14 11v6" />
    </IconSvg>
  );
}
