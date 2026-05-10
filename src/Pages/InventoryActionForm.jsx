import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../Utils/ProductStore";
import { addStockToProduct, deductStockFromProduct, transferProductStock } from "../Utils/InventoryStore";

const CONFIG = {
  add: {
    title: "Add Stock",
    subtitle: "Increase Product Inventory",
    submit: "Add Stock",
    submitClass: "bg-[#28b463] text-white",
  },
  deduct: {
    title: "Deduct Stock",
    subtitle: "Reduce Product Inventory",
    submit: "Deduct Stock",
    submitClass: "bg-[#e95757] text-white",
  },
  transfer: {
    title: "Transfer Stock",
    subtitle: "Move Products Between Branches",
    submit: "Transfer Stock",
    submitClass: "bg-[#ff7a1a] text-white",
  },
};

export default function InventoryActionForm({ mode = "add" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const product = useMemo(() => getProductById(id), [id]);

  const [form, setForm] = useState({
    branch: product?.branch || "",
    fromBranch: product?.branch || "",
    toBranch: "",
    quantity: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[860px] rounded-3xl border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center">
          <p className="text-base text-[#80858d]">Product not found.</p>
          <button onClick={() => navigate("/inventory")} className="mt-4 rounded-xl bg-[#ff7a1a] px-5 py-2 text-sm font-semibold text-white">
            Back to inventory
          </button>
        </div>
      </div>
    );
  }

  const cfg = CONFIG[mode];
  const stock = Number(product.stock) || 0;
  const stockState = stock <= 0 ? "Out of stock" : stock <= 5 ? "Low stock level" : "Stock Level Good";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const qty = Number(form.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Enter valid quantity أكبر من صفر.");
      return;
    }

    try {
      setBusy(true);
      if (mode === "add") {
        addStockToProduct({ productId: product.id, branch: form.branch, quantity: qty });
      } else if (mode === "deduct") {
        deductStockFromProduct({ productId: product.id, branch: form.branch, quantity: qty });
      } else {
        transferProductStock({
          productId: product.id,
          fromBranch: form.fromBranch,
          toBranch: form.toBranch,
          quantity: qty,
        });
      }
      navigate("/inventory");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen text-[#22262d]">
      <main className="mx-auto w-full max-w-[1560px] px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/inventory")}
            className="grid h-14 w-14 place-items-center rounded-2xl border border-white bg-white text-[#ff7a1a] shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
          >
            <IconSvg><path d="M15 18 9 12l6-6" /></IconSvg>
          </button>
        </div>

        <h1 className="text-[42px] font-semibold text-[#1f242b]">{cfg.title}</h1>
        <p className="mt-2 text-[17px] text-[#8b9098]">{cfg.subtitle}</p>

        <section className="mt-6 rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
          <h2 className="mb-4 text-[30px] font-semibold">About Product</h2>
          <div className="rounded-[20px] border border-[#d3d3d3] bg-[#f8f8f8] px-4 py-2">
            <InfoRow label="Product Name" value={product.name} />
            <InfoRow label="Product Code" value={product.code} />
            <InfoRow label="Branch" value={product.branch} />
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
          <h2 className="mb-4 text-[30px] font-semibold">Stock Information</h2>
          <div className="rounded-[20px] border border-[#d3d3d3] bg-[#f8f8f8] p-4">
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-[#8b9097]">Current Stock</span>
              <span className="text-[18px] font-semibold">{product.stock} Units</span>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-[#e6f3ec] px-4 py-3 text-[15px] font-medium text-[#27ae60]">{stockState}</div>
        </section>

        <section className="mt-5 rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== "transfer" && (
              <InputField label="Branch" required value={form.branch} onChange={(v) => setForm((p) => ({ ...p, branch: v }))} />
            )}

            {mode === "transfer" && (
              <>
                <InputField label="From Branch" required value={form.fromBranch} onChange={(v) => setForm((p) => ({ ...p, fromBranch: v }))} />
                <InputField label="To Branch" required value={form.toBranch} onChange={(v) => setForm((p) => ({ ...p, toBranch: v }))} />
              </>
            )}

            <InputField
              label={mode === "add" ? "Quantity To Add" : mode === "deduct" ? "Quantity To Deduct" : "Quantity To Transfer"}
              required
              type="number"
              value={form.quantity}
              onChange={(v) => setForm((p) => ({ ...p, quantity: v }))}
              placeholder="0"
            />

            <InputField
              label="Reason/Note"
              value={form.note}
              onChange={(v) => setForm((p) => ({ ...p, note: v }))}
              placeholder="Optional note"
            />

            {error && <p className="text-sm text-[#ef5f5f]">{error}</p>}

            <div className="grid gap-3 pt-1 sm:grid-cols-[2fr_1fr]">
              <button type="submit" disabled={busy} className={`rounded-2xl px-6 py-4 text-[17px] font-semibold shadow ${cfg.submitClass}`}>
                {busy ? "Saving..." : cfg.submit}
              </button>
              <button
                type="button"
                onClick={() => navigate("/inventory")}
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

function InputField({ label, required = false, type = "text", value, onChange, placeholder = "" }) {
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
        className="h-[60px] w-full rounded-[18px] border border-[#d3d3d3] bg-[#f6f6f6] px-5 text-[16px] outline-none"
      />
    </label>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[#d5d5d5] py-3 last:border-b-0">
      <span className="text-[15px] text-[#8b9097]">{label}</span>
      <span className="text-[16px] font-medium text-[#232830]">{value}</span>
    </div>
  );
}

function IconSvg({ children, className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
