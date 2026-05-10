import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_OPTIONS = ["Cashier", "Admin", "Employee", "Manager"];
const BRANCH_OPTIONS = ["Main Branch", "Nasr City", "Alexandria", "El Shoroq"];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  role: "Employee",
  branch: "Main Branch",
  password: "",
};

export default function EmployeeFormPage({
  mode = "add",
  initialValues,
  title,
  subtitle = "Fill In The Employee Details",
  submitLabel,
  onSubmit,
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initialValues || {}) });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heading = title || (mode === "edit" ? "Edit Employee" : "Add New Employee");
  const primaryLabel = submitLabel || (mode === "edit" ? "Save Changes" : "Add Employee");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Required";
    if (!form.email.trim()) next.email = "Required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Invalid email";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.role.trim()) next.role = "Required";
    if (!form.branch.trim()) next.branch = "Required";

    if (mode === "add") {
      if (!form.password.trim()) next.password = "Required";
      if (form.password && form.password.length < 6) next.password = "Min 6 chars";
    } else if (form.password && form.password.length < 6) {
      next.password = "Min 6 chars";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !onSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role.trim(),
        branch: form.branch.trim(),
        password: form.password,
      });
      navigate("/employees");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-[#22262d]">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="grid h-14 w-14 place-items-center rounded-2xl border border-white bg-white text-[#ff7a1a] shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
            aria-label="Back"
          >
            <IconSvg>
              <path d="M15 18 9 12l6-6" />
            </IconSvg>
          </button>
        </div>

        <section className="rounded-[30px] border border-white/80  p-6 shadow-[0_12px_28px_rgba(17,24,39,0.09)] sm:p-8">
          <h1 className="text-[34px] font-semibold leading-tight text-[#1f242b]">{heading}</h1>
          <p className="mt-2 text-[17px] text-[#8b9098]">{subtitle}</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <InputField
              label="Full Name"
              required
              placeholder="Enter Full Name"
              value={form.fullName}
              error={errors.fullName}
              onChange={(v) => updateField("fullName", v)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Email Address"
                required
                type="email"
                placeholder="email@example.com"
                value={form.email}
                error={errors.email}
                onChange={(v) => updateField("email", v)}
              />
              <InputField
                label="Phone Number"
                required
                placeholder="+20 100 123 4567"
                value={form.phone}
                error={errors.phone}
                onChange={(v) => updateField("phone", v)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Role"
                required
                value={form.role}
                error={errors.role}
                options={ROLE_OPTIONS}
                onChange={(v) => updateField("role", v)}
              />
              <SelectField
                label="Branch"
                required
                value={form.branch}
                error={errors.branch}
                options={BRANCH_OPTIONS}
                onChange={(v) => updateField("branch", v)}
              />
            </div>

            <InputField
              label={mode === "edit" ? "New Password (Optional)" : "Initial Password"}
              required={mode === "add"}
              type="password"
              placeholder="Enter Initial Password"
              value={form.password}
              error={errors.password}
              onChange={(v) => updateField("password", v)}
            />

            <div className="grid gap-3 pt-1 sm:grid-cols-[2fr_1fr]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-[#ff7a1a] px-6 py-4 text-[17px] font-semibold text-white shadow-[0_12px_22px_rgba(255,122,26,0.28)] transition hover:-translate-y-0.5 disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : primaryLabel}
              </button>

              <button
                type="button"
                onClick={() => navigate("/employees")}
                className="rounded-2xl border border-[#d7d7d7] bg-white px-6 py-4 text-[17px] font-semibold text-[#252a31]"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

function InputField({ label, required = false, type = "text", placeholder, value, onChange, error }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[16px] font-semibold text-[#232830]">
        {label}
        {required && <span className="text-[#ef5f5f]"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "h-16 w-full rounded-[22px] border bg-[#f6f6f6] px-5 text-[16px] text-[#2c3037] outline-none transition",
          error
            ? "border-[#ef6666] focus:border-[#ef6666]"
            : "border-[#d3d3d3] focus:border-[#ff7a1a]/60",
        ].join(" ")}
      />
      {error && <p className="mt-1 text-xs text-[#ef6666]">{error}</p>}
    </label>
  );
}

function SelectField({ label, required, value, onChange, options, error }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[16px] font-semibold text-[#232830]">
        {label}
        {required && <span className="text-[#ef5f5f]"> *</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "h-16 w-full rounded-[22px] border bg-[#f6f6f6] px-5 text-[16px] text-[#2c3037] outline-none",
          error ? "border-[#ef6666]" : "border-[#d3d3d3]",
        ].join(" ")}
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-[#ef6666]">{error}</p>}
    </label>
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
