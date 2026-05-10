import { useRef, useState } from "react";

const EMPTY_FORM = {
  productName: "",
  productCode: "",
  branch: "",
  purchasePrice: "",
  sellingPrice: "",
  initialStock: "",
  imageUrl: "",
};

export default function ProductFormPage({
  mode = "add",
  initialValues,
  submitLabel,
  title,
  subtitle = "Fill In The Product Details",
  onSubmit,
  onCancel,
  onBack,
  routerNavigate,
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initialValues || {}) });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialValues?.imageUrl || "");
  const fileRef = useRef(null);

  const heading = title || (mode === "edit" ? "Edit Product" : "Add New Product");
  const primaryLabel = submitLabel || (mode === "edit" ? "Save Changes" : "Add Product");

  const navigateTo = (path) => {
    if (!path) return;
    if (typeof routerNavigate === "function") {
      routerNavigate(path);
      return;
    }
    if (typeof window !== "undefined") window.location.assign(path);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.productName.trim()) next.productName = "Required";
    if (!form.productCode.trim()) next.productCode = "Required";
    if (!form.branch.trim()) next.branch = "Required";
    if (form.purchasePrice === "" || Number(form.purchasePrice) < 0) next.purchasePrice = "Invalid";
    if (form.sellingPrice === "" || Number(form.sellingPrice) < 0) next.sellingPrice = "Invalid";
    if (form.initialStock === "" || Number(form.initialStock) < 0) next.initialStock = "Invalid";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        productName: form.productName.trim(),
        productCode: form.productCode.trim(),
        branch: form.branch.trim(),
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        initialStock: Number(form.initialStock),
        imageUrl: previewUrl || "",
      };
      await onSubmit(payload);
      navigateTo("/products");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    navigateTo("/products");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigateTo("/products");
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen  text-[#22262d]">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleBack}
            className="grid h-14 w-14 place-items-center rounded-2xl border border-white bg-white text-[#ff7a1a] shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff8f2] active:translate-y-0 active:scale-95"
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
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-3xl border border-[#d2d2d2] bg-[#f6f6f6] p-6 transition-colors hover:bg-[#f2f2f2] sm:p-7"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="mx-auto h-42.5 max-w-full rounded-2xl object-contain"
                />
              ) : (
                <div className="grid place-items-center gap-2 text-[#90959d]">
                  <IconSvg className="h-16 w-16">
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <path d="m4 14 4-4a2 2 0 0 1 2.8 0L15 14" />
                    <path d="m13 12 2-2a2 2 0 0 1 2.8 0L20 12" />
                    <path d="M12 6v6m0-6 2.5 2.5M12 6 9.5 8.5" />
                  </IconSvg>
                  <span className="text-[16px] font-medium">Upload Product Image</span>
                </div>
              )}
            </button>

            <InputField
              label="Product Name"
              required
              placeholder="Enter Product Name"
              value={form.productName}
              error={errors.productName}
              onChange={(value) => updateField("productName", value)}
            />

            <InputField
              label="Product Code"
              required
              placeholder="Enter Product Code"
              value={form.productCode}
              error={errors.productCode}
              onChange={(value) => updateField("productCode", value)}
            />

            <InputField
              label="Branch"
              required
              placeholder="Enter Branch"
              value={form.branch}
              error={errors.branch}
              onChange={(value) => updateField("branch", value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Purchase Price (EGP)"
                type="number"
                required
                placeholder="0.00"
                value={form.purchasePrice}
                error={errors.purchasePrice}
                onChange={(value) => updateField("purchasePrice", value)}
              />

              <InputField
                label="Selling Price (EGP)"
                type="number"
                required
                placeholder="0.00"
                value={form.sellingPrice}
                error={errors.sellingPrice}
                onChange={(value) => updateField("sellingPrice", value)}
              />
            </div>

            <InputField
              label="Initial Stock"
              type="number"
              required
              placeholder="0"
              value={form.initialStock}
              error={errors.initialStock}
              onChange={(value) => updateField("initialStock", value)}
            />

            <div className="grid gap-3 pt-1 sm:grid-cols-[2fr_1fr]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-[#ff7a1a] px-6 py-4 text-[17px] font-semibold text-white shadow-[0_12px_22px_rgba(255,122,26,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ff7010] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : primaryLabel}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="rounded-2xl border border-[#d7d7d7] bg-white px-6 py-4 text-[17px] font-semibold text-[#252a31] shadow-[0_8px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff7a1a]/45 hover:text-[#ff7a1a]"
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

function InputField({
  label,
  required = false,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[16px] font-semibold text-[#232830]">
        {label}
        {required && <span className="text-[#ef5f5f]"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={[
          "h-16 w-full rounded-[22px] border bg-[#f6f6f6] px-5 text-[16px] text-[#2c3037] outline-none transition",
          error
            ? "border-[#ef6666] focus:border-[#ef6666] focus:ring-2 focus:ring-[#ef6666]/15"
            : "border-[#d3d3d3] focus:border-[#ff7a1a]/60 focus:ring-2 focus:ring-[#ff7a1a]/15",
        ].join(" ")}
      />
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
