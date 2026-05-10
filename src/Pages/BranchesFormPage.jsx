import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  branchName: "",
  streetAddress: "",
  city: "",
  email: "",
  phone: "",
  branchManager: "",
};

export default function BranchFormPage({
  mode = "add",
  initialValues,
  title,
  subtitle = "Fill In The Branch Details",
  submitLabel,
  onSubmit,
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initialValues || {}) });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heading = title || (mode === "edit" ? "Edit Branch" : "Add New Branch");
  const primaryLabel = submitLabel || (mode === "edit" ? "Save Changes" : "Add Branch");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.branchName.trim()) next.branchName = "Required";
    if (!form.streetAddress.trim()) next.streetAddress = "Required";
    if (!form.city.trim()) next.city = "Required";
    if (!form.email.trim()) next.email = "Required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Invalid email";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.branchManager.trim()) next.branchManager = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !onSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        branchName: form.branchName.trim(),
        streetAddress: form.streetAddress.trim(),
        city: form.city.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        branchManager: form.branchManager.trim(),
      });
      navigate("/branches");
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
            onClick={() => navigate("/branches")}
            className="grid h-14 w-14 place-items-center rounded-2xl border border-white bg-white text-[#ff7a1a] shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
            aria-label="Back"
          >
            <IconSvg>
              <path d="M15 18 9 12l6-6" />
            </IconSvg>
          </button>
        </div>

        <section className="rounded-[30px] border border-white/80  p-6 shadow-[0_12px_28px_rgba(17,24,39,0.09)] sm:p-8">
          <h1 className="text-[34px] font-semibold text-[#1f242b]">{heading}</h1>
          <p className="mt-2 text-[17px] text-[#8b9098]">{subtitle}</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <InputField label="Branch Name" required value={form.branchName} error={errors.branchName} onChange={(v) => updateField("branchName", v)} placeholder="E.G., Downtown Branch" />
            <InputField label="Street Address" required value={form.streetAddress} error={errors.streetAddress} onChange={(v) => updateField("streetAddress", v)} placeholder="Enter Street Address" />
            <InputField label="City" required value={form.city} error={errors.city} onChange={(v) => updateField("city", v)} placeholder="Enter City" />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Email Address" required type="email" value={form.email} error={errors.email} onChange={(v) => updateField("email", v)} placeholder="branch@example.com" />
              <InputField label="Phone Number" required value={form.phone} error={errors.phone} onChange={(v) => updateField("phone", v)} placeholder="+20 100 123 4567" />
            </div>

            <InputField label="Branch Manager" required value={form.branchManager} error={errors.branchManager} onChange={(v) => updateField("branchManager", v)} placeholder="Enter Branch Manager Name" />

            <div className="grid gap-3 pt-1 sm:grid-cols-[2fr_1fr]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-[#ff7a1a] px-6 py-4 text-[17px] font-semibold text-white shadow-[0_12px_22px_rgba(255,122,26,0.28)]"
              >
                {isSubmitting ? "Saving..." : primaryLabel}
              </button>
              <button
                type="button"
                onClick={() => navigate("/branches")}
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
          "h-[64px] w-full rounded-[22px] border bg-[#f6f6f6] px-5 text-[16px] text-[#2c3037] outline-none",
          error ? "border-[#ef6666]" : "border-[#d3d3d3]",
        ].join(" ")}
      />
      {error && <p className="mt-1 text-xs text-[#ef6666]">{error}</p>}
    </label>
  );
}

function IconSvg({ children, className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
