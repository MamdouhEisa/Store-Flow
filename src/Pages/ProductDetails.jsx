import { useMemo, useState } from "react";
import { getProductById, patchProduct } from "../Utils/ProductStore";

export default function ProductDetailsPage({ productId, routerNavigate }) {
  const resolvedId = useMemo(() => {
    if (productId) return productId;
    if (typeof window === "undefined") return "";
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }, [productId]);

  const [product, setProduct] = useState(() => getProductById(resolvedId));

  const navigateTo = (path) => {
    if (!path) return;
    if (typeof routerNavigate === "function") {
      routerNavigate(path);
      return;
    }
    if (typeof window !== "undefined") window.location.assign(path);
  };

  const setStock = (value) => {
    if (!product) return;
    const safe = Math.max(0, value);
    const updated = patchProduct(product.id, { stock: safe });
    if (updated) setProduct(updated);
  };

  const handleTransferStock = () => {
    if (!product) return;
    const qtyText = window.prompt("Transfer quantity?", "1");
    const qty = Number(qtyText);
    if (!Number.isFinite(qty) || qty <= 0) return;
    setStock(product.stock - qty);
  };

  if (!product) {
    return (
      <div className="min-h-screen px-4 py-8 text-[#23262b] sm:px-8">
        <div className="mx-auto max-w-215 rounded-3xl border border-dashed border-[#d3d3d3]  p-10 text-center">
          <p className="text-base text-[#80858d]">Product not found.</p>
          <button
            type="button"
            onClick={() => navigateTo("/products")}
            className="mt-4 rounded-xl bg-[#ff7a1a] px-5 py-2 text-sm font-semibold text-white"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const profit = product.sellingPrice - product.purchasePrice;
  const stockState =
    product.stock <= 0 ? "Out of stock" : product.stock <= 5 ? "Low stock level" : "Stock Level Good";

  const currentStock = product.stock;
  const stockInfo = {
    valueClass: product.stock <= 0 ? "text-[#ef4444]" : product.stock <= 5 ? "text-[#f59e0b]" : "text-[#27ae60]",
    boxClass: product.stock <= 0 ? "bg-[#fef2f2] text-[#991b1b]" : product.stock <= 5 ? "bg-[#fffbeb] text-[#92400e]" : "bg-[#f0fdf4] text-[#166534]",
    text: stockState
  };

  return (
    <div className="min-h-screen  text-[#22262d] bg-white">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-semibold leading-tight text-[#20242b] max-md:text-[28px]">
              {product.name}
            </h1>
            <p className="mt-2 text-[17px] text-[#888d95] max-md:text-[15px]">Product Code: {product.code}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo(`/products/edit/${product.id}`)}
              className="inline-flex h-14 items-center gap-2 rounded-3xl border border-white  px-5 text-[16px] font-semibold text-[#ff7a1a] shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fff8f2]"
            >
              <EditIcon />
              Edit Product
            </button>

            <button
              type="button"
              onClick={() => navigateTo("/products")}
              className="grid h-14 w-14 place-items-center rounded-3xl border border-white  text-[#ff7a1a] shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fff8f2]"
              aria-label="Back"
            >
              <BackIcon />
            </button>
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-2">
          <InfoCard title="Product Information" icon={<CubeIcon />} iconColor="text-[#ff7a1a]">
            <InfoRow label="Product Name" value={product.name} />
            <InfoRow label="Product Code" value={product.code} />
            <InfoRow label="Branch" value={product.branch} />
          </InfoCard>

          <InfoCard title="Pricing" icon={<DollarIcon />} iconColor="text-[#27ae60]">
            <InfoRow label="Purchase Price" value={`${product.purchasePrice} EGP`} />
            <InfoRow label="Selling Price" value={`${product.sellingPrice} EGP`} />
            <InfoRow
              label="Profit Per Unit"
              value={`${profit >= 0 ? "+" : ""}${profit} EGP`}
              valueClassName={profit >= 0 ? "text-[#27ae60]" : "text-[#ef4444]"}
            />
          </InfoCard>
        </section>

        <section className="mt-5 rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
  <h2 className="mb-4 flex items-center gap-2 text-[30px] font-semibold text-[#20242b] max-md:text-[22px]">
    <StockIcon className="text-[#e6b934]" />
    Stock Information
  </h2>

  <div className="rounded-[20px] border border-[#d3d3d3] p-4">
    <div className="flex items-center justify-between text-[15px]">
      <span className="text-[#8b9097]">Current Stock</span>
      <span className={`text-[18px] font-semibold ${stockInfo.valueClass}`}>
        {currentStock} Units
      </span>
    </div>
  </div>

  <div className={`mt-4 rounded-2xl px-4 py-3 text-[15px] font-medium ${stockInfo.boxClass}`}>
    {stockInfo.text}
  </div>
</section>


        <section className="mt-5 rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
          <h2 className="mb-4 flex items-center gap-2 text-[30px] font-semibold text-[#20242b] max-md:text-[22px]">
            <ActionsIcon className="text-[#ff7a1a]" />
            Quick Actions
          </h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setStock(product.stock + 1)}
              className="rounded-2xl bg-[#28b463] px-4 py-4 text-[16px] font-semibold text-white shadow-[0_8px_16px_rgba(40,180,99,0.26)] transition hover:-translate-y-0.5"
            >
              + Add Stock
            </button>

            <button
              type="button"
              onClick={() => setStock(product.stock - 1)}
              className="rounded-2xl bg-[#e95757] px-4 py-4 text-[16px] font-semibold text-white shadow-[0_8px_16px_rgba(233,87,87,0.25)] transition hover:-translate-y-0.5"
            >
              - Deduct Stock
            </button>

            <button
              type="button"
              onClick={handleTransferStock}
              className="rounded-2xl border border-[#d4d4d4] bg-white px-4 py-4 text-[16px] font-semibold text-[#22262d] shadow-[0_8px_16px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:border-[#ff7a1a]/40 hover:text-[#ff7a1a]"
            >
              Transfer Stock
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoCard({ title, icon, iconColor, children }) {
  return (
    <article className="rounded-[28px] border border-white/80  p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
      <h2 className="mb-4 flex items-center gap-2 text-[30px] font-semibold text-[#20242b] max-md:text-[22px]">
        <span className={iconColor}>{icon}</span>
        {title}
      </h2>
      <div className="rounded-[20px] border border-[#d3d3d3]  px-4 py-2">{children}</div>
    </article>
  );
}

function InfoRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between border-b border-[#d5d5d5] py-3 last:border-b-0">
      <span className="text-[15px] text-[#8b9097]">{label}</span>
      <span className={`text-[16px] font-medium text-[#232830] ${valueClassName}`}>{value}</span>
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

function CubeIcon() {
  return (
    <IconSvg>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 3v9m8-4.5-8 4.5-8-4.5" />
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

function StockIcon({ className = "" }) {
  return (
    <IconSvg className={`h-7 w-7 ${className}`}>
      <path d="m3 17 5-5 4 4 8-8" />
      <path d="M14 8h6v6" />
    </IconSvg>
  );
}

function ActionsIcon({ className = "" }) {
  return (
    <IconSvg className={`h-7 w-7 ${className}`}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </IconSvg>
  );
}

function EditIcon() {
  return (
    <IconSvg>
      <path d="M12.4 5.6h-6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      <path d="m15.2 4.8 4 4-8.2 8.2-4.6.6.6-4.6 8.2-8.2Z" />
    </IconSvg>
  );
}

function BackIcon() {
  return (
    <IconSvg>
      <path d="M15 18 9 12l6-6" />
    </IconSvg>
  );
}
