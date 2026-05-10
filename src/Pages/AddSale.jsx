import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readProducts } from "../Utils/ProductStore";
import { createSale } from "../Utils/SalesStore";

export default function AddSalePage() {
  const navigate = useNavigate();
  const [branch, setBranch] = useState("");
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentType, setPaymentType] = useState("cash");
  const [cart, setCart] = useState({});

  const products = readProducts();
  const branches = Array.from(new Set(products.map((p) => p.branch))).filter(Boolean);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }, [products, search]);

  const addToCart = (p) => {
    setCart((prev) => {
      const current = prev[p.id]?.qty || 0;
      if (current >= p.stock) return prev;
      return {
        ...prev,
        [p.id]: {
          productId: p.id,
          name: p.name,
          price: p.sellingPrice,
          cost: p.purchasePrice,
          qty: current + 1,
        },
      };
    });
  };

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const totalCost = cartItems.reduce((s, i) => s + i.cost * i.qty, 0);
  const total = Math.max(0, subtotal - Number(discount || 0) + Number(tax || 0));
  const profit = total - totalCost;

  const completeSale = () => {
    if (!branch) return alert("Select branch");
    if (!cartItems.length) return alert("Add at least one product");

    if (paymentType === "card") {
      navigate("/sales/card-payment", {
        state: {
          saleDraft: {
            branch,
            items: cartItems,
            discount: Number(discount || 0),
            tax: Number(tax || 0),
            paymentType: "card",
          },
        },
      });
      return;
    }

    const sale = createSale({
      branch,
      items: cartItems,
      discount: Number(discount || 0),
      tax: Number(tax || 0),
      paymentType,
    });

    if (sale) navigate(`../${sale.id}`);
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <h1 className="text-[34px] font-semibold">Add New Sale</h1>
        <p className="mt-2 text-[17px] text-[#8b9098]">Search And Add Products To Cart</p>

        <section className="mt-6 rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="h-15.5 w-full rounded-[20px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
          >
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Products By Name Or Code..."
              className="h-15.5 w-full rounded-[20px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
            />

            <div className="mt-4 space-y-3">
              {filteredProducts.map((p) => {
                const qty = cart[p.id]?.qty || 0;
                return (
                  <div key={p.id} className="flex items-center justify-between rounded-[20px] border border-[#d6d6d6] bg-[#f8f8f8] p-4">
                    <div>
                      <p className="text-[20px] font-semibold">{p.name}</p>
                      <p className="text-[15px] text-[#8b9097]">Stock: {p.stock} | Price: {p.sellingPrice} EGP</p>
                      {qty > 0 && <p className="text-[14px] text-[#27ae60]">In cart: {qty}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      className="h-12 w-12 rounded-full border border-[#d5d5d5] text-[28px] text-[#ff7a1a]"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <h2 className="text-[30px] font-semibold">Summary</h2>

            <Field label="Subtotal" value={`${subtotal.toLocaleString()} EGP`} />
            <EditableField label="Discount (EGP)" value={discount} onChange={setDiscount} />
            <EditableField label="Tax (EGP)" value={tax} onChange={setTax} />
            <Field label="Total" value={`${total.toLocaleString()} EGP`} />
            <Field
              label="Profit"
              value={`${profit >= 0 ? "+" : ""}${profit.toLocaleString()} EGP`}
              valueClassName={profit >= 0 ? "text-[#27ae60]" : "text-[#ef4444]"}
            />

            <label className="mt-3 block text-[16px] font-semibold">Payment Type</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="mt-2 h-14 w-full rounded-[18px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>

            <button
              type="button"
              onClick={completeSale}
              className="mt-5 w-full rounded-2xl bg-[#ff7a1a] px-5 py-4 text-[20px] font-semibold text-white"
            >
              Complete Sale
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, valueClassName = "" }) {
  return (
    <div className="mt-3 rounded-2xl border border-[#d3d3d3] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[16px] text-[#8b9097]">{label}</span>
        <span className={`text-[18px] font-semibold ${valueClassName}`}>{value}</span>
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange }) {
  return (
    <>
      <label className="mt-3 block text-[16px] font-semibold">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="mt-2 h-14 w-full rounded-[18px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
      />
    </>
  );
}
