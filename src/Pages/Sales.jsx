import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readSales } from "../Utils/SalesStore";

export default function SalesPage() {
  const navigate = useNavigate();
  const [statusFilter] = useState("All States");
  const statusMatch = statusFilter === "All States" || sale.status === statusFilter;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const sales = readSales();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sales.filter((s) => {
      const statusOk = status === "all" ? true : s.status === status;
      const searchOk =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.branch.toLowerCase().includes(q) ||
        new Date(s.createdAt).toLocaleString().toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [sales, query, status]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, s) => {
        acc.amount += s.totalAmount || 0;
        acc.profit += s.totalProfit || 0;
        return acc;
      },
      { amount: 0, profit: 0 }
    );
  }, [filtered]);

  const statusClass = (v) => {
    if (v === "completed") return "bg-[#e2f2ea] text-[#27ae60]";
    if (v === "returned") return "bg-[#f8e3e3] text-[#e65757]";
    return "bg-[#f2efe3] text-[#a18428]";
  };

  const statusLabel = (v) => {
    if (v === "completed") return "Completed";
    if (v === "returned") return "Returned";
    return "Partially Returned";
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-[1560px] px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("add")}
            className="rounded-xl bg-[#ff7a1a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,122,26,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ff7110]"
          >
            Add Sale
          </button>
          
        </div>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[26px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <p className="text-[16px] text-[#8b9097]">Total Sales Amount</p>
            <p className="mt-3 text-[26px] font-semibold">{totals.amount.toLocaleString()} EGP</p>
          </div>
          <div className="rounded-[26px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <p className="text-[16px] text-[#8b9097]">Total Profit</p>
            <p className="mt-3 text-[26px] font-semibold text-[#27ae60]">
              {totals.profit >= 0 ? "+" : ""}
              {totals.profit.toLocaleString()} EGP
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[26px] border border-white/80 p-5 shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:p-6">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Invoice ID Or Branch..."
              className="h-[62px] rounded-[20px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-[62px] rounded-[20px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
            >
              <option value="all">All States</option>
              <option value="completed">Completed</option>
              <option value="returned">Returned</option>
              <option value="partial_return">Partial Returned</option>
            </select>
          </div>
        </section>

        <section className="mt-8 space-y-6">
          {filtered.map((sale) => (
            <article
              key={sale.id}
              className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-[34px] font-semibold leading-none">{sale.id}</h3>
                  <p className="mt-2 text-[15px] text-[#8a8f97]">
                    {new Date(sale.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-[14px] font-medium ${statusClass(sale.status)}`}>
                    {statusLabel(sale.status)}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`${sale.id}`)}
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-white bg-white text-[#ff7a1a] shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
                  >
                    👁
                  </button>
                </div>
              </div>

              <div className="my-5 h-px bg-[#d5d5d5]" />

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <Metric label="Branch" value={sale.branch} />
                <Metric label="Total Amount" value={`${sale.totalAmount.toLocaleString()} EGP`} />
                <Metric
                  label="Profit"
                  value={`${sale.totalProfit >= 0 ? "+" : ""}${sale.totalProfit.toLocaleString()} EGP`}
                  valueClassName={sale.totalProfit >= 0 ? "text-[#27ae60]" : "text-[#ef4444]"}
                />
                <Metric label="Profit Margin" value={`${sale.profitMargin.toFixed(1)}%`} />
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center text-sm text-[#8d929a]">
              No sales found.
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
