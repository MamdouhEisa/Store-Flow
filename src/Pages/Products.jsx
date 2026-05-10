import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProduct, readProducts } from "../Utils/ProductStore";

export default function ProductsPage({ routerNavigate }) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState(() => readProducts());

  const filteredProducts = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return products;

    return products.filter((product) => {
      const byName = product.name.toLowerCase().includes(text);
      const byCode = product.code.toLowerCase().includes(text);
      const byBranch = product.branch.toLowerCase().includes(text);
      return byName || byCode || byBranch;
    });
  }, [products, query]);

  const navigateTo = (path) => {
    if (typeof routerNavigate === "function") {
      routerNavigate(path);
      return;
    }
    navigate(path);
  };

  const handleDeleteProduct = (product) => {
    const confirmDelete = window.confirm(`Delete "${product.name}"?`);
    if (!confirmDelete) return;

    const wasDeleted = deleteProduct(product.id);
    if (!wasDeleted) return;

    setProducts((current) => current.filter((item) => item.id !== product.id));
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => navigateTo("add")}
            className="rounded-xl bg-[#ff7a1a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,122,26,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ff7110] active:translate-y-0 active:scale-95"
          >
            Add Product
          </button>
        </div>

        <section className="rounded-[26px] border border-white/80 p-5 shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:p-6">
          <label
            htmlFor="products-search"
            className="flex h-16.5 items-center gap-3 rounded-[22px] border border-[#d3d3d3]  px-5"
          >
            <SearchIcon />
            <input
              id="products-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Products By Name Or Code..."
              className="h-full w-full border-0 bg-transparent text-[16px] font-medium text-[#575b63] outline-none placeholder:font-normal placeholder:text-[#8c9098]"
            />
          </label>
        </section>

        <section className="mt-8 space-y-6">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-60 items-center gap-4">
                  <div className="grid h-18 w-18 place-items-center rounded-[20px] border border-[#d5d5d5] text-[#8b8f96]">
                    <CubeIcon />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-[#252a31]">{product.name}</h3>
                    <p className="mt-1 text-[16px] text-[#8a8f97]">Code: {product.code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#27ae60] px-3 py-1 text-[15px] font-medium text-white">
                    Stock: {product.stock}
                  </span>

                  <ActionButton
                    label={`Edit ${product.name}`}
                    onClick={() => navigateTo(`edit/${product.id}`)}
                  >
                    <EditIcon />
                  </ActionButton>

                  <ActionButton
                    label={`Delete ${product.name}`}
                    onClick={() => handleDeleteProduct(product)}
                    className="text-[#ef4444] hover:bg-[#fff5f5]"
                  >
                    <DeleteIcon />
                  </ActionButton>

                  <ActionButton
                    label={`View ${product.name}`}
                    onClick={() => navigateTo(`${product.id}`)}
                  >
                    <EyeIcon />
                  </ActionButton>
                </div>
              </div>

              <div className="my-5 h-px " />

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <Metric label="Branch" value={product.branch} />
                <Metric label="Purchase Price" value={`${product.purchasePrice} EGP`} />
                <Metric label="Selling Price" value={`${product.sellingPrice} EGP`} />
                <Metric
                  label="Profit/Unit"
                  value={`${product.sellingPrice - product.purchasePrice >= 0 ? "+" : ""}${product.sellingPrice - product.purchasePrice} EGP`}
                  valueClassName={`${product.sellingPrice - product.purchasePrice >= 0 ? "text-[#27ae60]" : "text-[#ef4444]"}`}
                />
              </div>
            </article>
          ))}

          {filteredProducts.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-[#d3d3d3]  p-10 text-center text-sm text-[#8d929a]">
              No products found.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ActionButton({ children, label, onClick, className = "" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid h-12 w-12 place-items-center rounded-2xl border border-white bg-white text-[#ff7a1a] shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff8f2] active:translate-y-0 active:scale-95 ${className}`}
    >
      {children}
    </button>
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

function CubeIcon() {
  return (
    <IconSvg className="h-8 w-8">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 3v9m8-4.5-8 4.5-8-4.5" />
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

function EyeIcon() {
  return (
    <IconSvg className="h-6 w-6">
      <path d="M2 12s3.7-6 10-6 10 6 10 6-3.7 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </IconSvg>
  );
}

function DeleteIcon() {
  return (
    <IconSvg className="h-6 w-6">
      <path d="M4.5 6.5h15" />
      <path d="M8.5 6.5V5A1.5 1.5 0 0 1 10 3.5h4A1.5 1.5 0 0 1 15.5 5v1.5" />
      <path d="m7 6.5 1 12a1.5 1.5 0 0 0 1.5 1.4h5a1.5 1.5 0 0 0 1.5-1.4l1-12" />
      <path d="M10 10v6M14 10v6" />
    </IconSvg>
  );
}
