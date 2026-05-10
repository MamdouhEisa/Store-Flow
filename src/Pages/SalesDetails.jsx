import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSaleById, returnFullSale, returnSaleItem } from "../Utils/SalesStore";



export default function SaleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(() => getSaleById(id));
  const [selectedProductId, setSelectedProductId] = useState("");


  const handleReturnFull = () => {
  const ok = window.confirm("Are you sure you want to return full invoice?");
  if (!ok) return;

  const updated = returnFullSale(id);
  if (!updated) {
    alert("Invoice not found");
    return;
  }

  navigate("/sales");
};



  useEffect(() => {
    if (sale?.items?.length) setSelectedProductId(sale.items[0].productId);}, [sale?.id]);

  if (!sale) {
    return (
      <div className="min-h-screen p-8">
        <button onClick={() => navigate("/sales")} className="rounded bg-[#ff7a1a] px-4 py-2 text-white">
          Back
        </button>
      </div>
    );
  }

  const statusClass =
    sale.status === "completed"
      ? "bg-[#e2f2ea] text-[#27ae60]"
      : sale.status === "returned"
      ? "bg-[#f8e3e3] text-[#e65757]"
      : "bg-[#f2efe3] text-[#a18428]";

  const statusLabel =
    sale.status === "completed" ? "Completed" : sale.status === "returned" ? "Returned" : "Partial Returned";


  const handleReturnItem = () => {
    if (!selectedProductId) return;
    const updated = returnSaleItem(sale.id, selectedProductId);
    if (updated) setSale(updated);
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-[1560px] px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-semibold">{sale.id}</h1>
            <p className="mt-2 text-[17px] text-[#8b9098]">{new Date(sale.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-4 py-2 text-[16px] ${statusClass}`}>{statusLabel}</span>
            <button
              onClick={() => navigate("/sales")}
              className="rounded-xl border border-white bg-white px-4 py-2 text-[#ff7a1a]"
            >
              Back
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Card title="Total Sale" value={`${sale.totalAmount.toLocaleString()} EGP`} />
          <Card title="Total Cost" value={`${sale.totalCost.toLocaleString()} EGP`} />
          <Card
            title="Total Profit"
            value={`${sale.totalProfit >= 0 ? "+" : ""}${sale.totalProfit.toLocaleString()} EGP`}
            valueClassName={sale.totalProfit >= 0 ? "text-[#27ae60]" : "text-[#ef4444]"}
          />
        </section>

        <section className="mt-5 rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
          <h2 className="text-[30px] font-semibold">Sale Information</h2>
          <div className="mt-4 rounded-[20px] border border-[#d3d3d3] p-4">
            <Row label="Invoice Number" value={sale.id} />
            <Row label="Date & Time" value={new Date(sale.createdAt).toLocaleString()} />
            <Row label="Branch" value={sale.branch} />
            <Row label="Payment Type" value={String(sale.paymentType || "cash").toUpperCase()} />
            <Row label="Profit Margin" value={`${sale.profitMargin.toFixed(1)}%`} />
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
          <h2 className="text-[30px] font-semibold">Product</h2>
          <div className="mt-4 overflow-x-auto rounded-[20px] border border-[#d3d3d3]">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#d3d3d3]">
                  <th className="p-4 text-left">Invoice Number</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4 text-left">Profit</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => {
                  const total = item.price * item.qty;
                  const profit = (item.price - item.cost) * item.qty;
                  return (
                    <tr key={item.productId} className="border-b border-[#ececec] last:border-b-0">
                      <td className="p-4">{item.name}</td>
                      <td className="p-4">{item.qty}</td>
                      <td className="p-4">{item.price.toLocaleString()} EGP</td>
                      <td className="p-4">{total.toLocaleString()} EGP</td>
                      <td className="p-4 text-[#27ae60]">
                        {profit >= 0 ? "+" : ""}
                        {profit.toLocaleString()} EGP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={handleReturnFull}
              className="rounded-2xl bg-[#e95757] px-5 py-4 text-[18px] font-semibold text-white"
            >
              Return Full Invoice
            </button>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="rounded-2xl border border-[#d3d3d3] px-4 py-3"
              >
                {sale.items.map((i) => (
                  <option key={i.productId} value={i.productId}>
                    {i.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleReturnItem}
                className="rounded-2xl border border-[#d3d3d3] bg-white px-5 py-3 text-[18px] font-semibold"
              >
                Return Item
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Card({ title, value, valueClassName = "" }) {
  return (
    <div className="rounded-[26px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
      <p className="text-[16px] text-[#8b9097]">{title}</p>
      <p className={`mt-3 text-[26px] font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[#d5d5d5] py-3 last:border-b-0">
      <span className="text-[15px] text-[#8b9097]">{label}</span>
      <span className="text-[16px] font-medium">{value}</span>
    </div>
  );
}
