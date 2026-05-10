import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readSales } from "../Utils/SalesStore";
import { readProducts } from "../Utils/ProductStore";

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default function ProfitPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("today");

  const sales = useMemo(() => readSales(), []);
  const products = useMemo(() => readProducts(), []);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const d = getSaleDate(sale);
      if (!d) return false;
      return isInPeriod(d, period);
    });
  }, [sales, period]);

  const stats = useMemo(() => buildProfitStats(filteredSales), [filteredSales]);

  const topProducts = useMemo(
    () => buildTopProducts(filteredSales, products).slice(0, 6),
    [filteredSales, products]
  );

  const lowProfitProducts = useMemo(
    () => buildLowProfitProducts(filteredSales, products).slice(0, 6),
    [filteredSales, products]
  );

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-[1560px] px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-[30px] border border-white/80 bg-[#f7f7f7] p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
            {PERIODS.map((item) => {
              const active = period === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPeriod(item.key)}
                  className={[
                    "inline-flex items-center gap-2 rounded-[24px] px-6 py-3 text-[16px] font-semibold transition-all",
                    active
                      ? "bg-[#ff7a1a] text-white"
                      : "text-[#2f333a] hover:bg-[#fff4ec]",
                  ].join(" ")}
                >
                  <CalendarIcon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Sales"
            value={formatEGP(stats.totalSales)}
            icon={<CubeIcon />}
            iconWrap="bg-[#fff2e8] text-[#ff7a1a]"
          />
          <StatCard
            title="Total Cost"
            value={formatEGP(stats.totalCost)}
            icon={<DollarIcon />}
            iconWrap="bg-[#fff9e9] text-[#e6b934]"
          />
          <StatCard
            title="Total Profit"
            value={`${stats.totalProfit >= 0 ? "+" : ""}${formatEGP(stats.totalProfit)}`}
            valueClass={stats.totalProfit >= 0 ? "text-[#27ae60]" : "text-[#ef4444]"}
            icon={<TrendUpIcon />}
            iconWrap="bg-[#e7f4ec] text-[#27ae60]"
          />
          <StatCard
            title="Transactions"
            value={String(stats.transactions)}
            icon={<TransferIcon />}
            iconWrap="bg-[#f0f1f3] text-[#22262d]"
            action={
              <button
                type="button"
                onClick={() => navigate("/sales")}
                className="mt-3 text-[13px] font-semibold text-[#ff7a1a] hover:underline"
              >
                Open Sales
              </button>
            }
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <article className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <h2 className="mb-5 flex items-center gap-2 text-[22px] font-semibold text-[#20242b]">
              <CubeIcon className="h-6 w-6 text-[#27ae60]" />
              Top Products {period === "month" ? "This Month" : ""}
            </h2>

            <div className="space-y-4">
              {topProducts.length === 0 && (
                <EmptyState text="No data for selected period." />
              )}

              {topProducts.map((item, index) => (
                <div
                  key={`${item.key}-${index}`}
                  className="rounded-[18px] border border-[#d7d7d7] bg-[#f8f8f8] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[18px] font-medium text-[#242931]">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#ff7a1a] px-3 py-1 text-[13px] font-semibold text-white">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          item.productId
                            ? navigate(`/products/${item.productId}`)
                            : navigate("/products")
                        }
                        className="rounded-lg border border-[#ffd9bf] px-2.5 py-1 text-[12px] font-semibold text-[#ff7a1a] hover:bg-[#fff4ec]"
                      >
                        View
                      </button>
                    </div>
                  </div>

                  <div className="my-3 h-px bg-[#d8d8d8]" />

                  <div className="grid grid-cols-3 gap-3">
                    <MiniMetric label="Sold" value={`${item.sold} Unit`} />
                    <MiniMetric label="Revenue" value={formatShort(item.revenue)} />
                    <MiniMetric
                      label="Profit"
                      value={formatShort(item.profit)}
                      valueClass={item.profit >= 0 ? "text-[#27ae60]" : "text-[#ef4444]"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <h2 className="mb-5 flex items-center gap-2 text-[22px] font-semibold text-[#20242b]">
              <TrendDownIcon className="h-6 w-6 text-[#ef5d5d]" />
              Low Profit Products
            </h2>

            <div className="space-y-4">
              {lowProfitProducts.length === 0 && (
                <EmptyState text="No low-profit products in selected period." />
              )}

              {lowProfitProducts.map((item, index) => (
                <div
                  key={`${item.key}-${index}`}
                  className="rounded-[18px] border border-[#e8c54f] bg-[#faf8ec] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[18px] font-medium text-[#242931]">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#e8c54f] px-3 py-1 text-[13px] font-semibold text-white">
                        {Math.max(0, item.margin).toFixed(0)}%
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          item.productId
                            ? navigate(`/products/${item.productId}`)
                            : navigate("/products")
                        }
                        className="rounded-lg border border-[#eedca2] px-2.5 py-1 text-[12px] font-semibold text-[#9f7a00] hover:bg-[#fff9e7]"
                      >
                        View
                      </button>
                    </div>
                  </div>

                  <div className="my-3 h-px bg-[#e3cc7e]" />

                  <div className="grid grid-cols-3 gap-3">
                    <MiniMetric label="Stock" value={`${item.stock} Units`} />
                    <MiniMetric label="Revenue" value={formatEGP(item.revenue)} />
                    <MiniMetric label="Profit" value={formatEGP(item.profit)} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function buildProfitStats(sales) {
  let totalSales = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let transactions = 0;

  for (const sale of sales) {
    const status = String(sale?.status || "").toLowerCase();
    if (status === "returned" || status === "cancelled") continue;

    const items = normalizeItems(sale);
    const saleRevenue = n(
      sale.totalAmount ?? sale.totalSale ?? sale.total ?? sum(items.map((i) => i.revenue))
    );
    const saleCost = n(sale.totalCost ?? sale.cost ?? sum(items.map((i) => i.cost)));
    const saleProfit = n(sale.totalProfit ?? sale.profit ?? saleRevenue - saleCost);

    totalSales += saleRevenue;
    totalCost += saleCost;
    totalProfit += saleProfit;
    transactions += 1;
  }

  return { totalSales, totalCost, totalProfit, transactions };
}

function buildTopProducts(sales, products) {
  const map = new Map();

  for (const sale of sales) {
    const status = String(sale?.status || "").toLowerCase();
    if (status === "returned" || status === "cancelled") continue;

    for (const item of normalizeItems(sale)) {
      const key = item.key;
      const prev = map.get(key) || {
        key,
        name: item.name,
        productId: resolveProductId(item, products),
        sold: 0,
        revenue: 0,
        profit: 0,
        stock: item.stock ?? 0,
      };

      prev.sold += item.qty;
      prev.revenue += item.revenue;
      prev.profit += item.profit;
      map.set(key, prev);
    }
  }

  return [...map.values()].sort((a, b) => b.profit - a.profit || b.revenue - a.revenue);
}

function buildLowProfitProducts(sales, products) {
  const base = buildTopProducts(sales, products);
  return base
    .map((x) => ({
      ...x,
      margin: x.revenue > 0 ? (x.profit / x.revenue) * 100 : 0,
    }))
    .sort((a, b) => a.margin - b.margin || a.profit - b.profit);
}

function normalizeItems(sale) {
  const list = Array.isArray(sale?.items)
    ? sale.items
    : Array.isArray(sale?.products)
    ? sale.products
    : Array.isArray(sale?.lines)
    ? sale.lines
    : [];

  return list.map((item, idx) => {
    const qty = n(item.quantity ?? item.qty ?? 1, 1);
    const unitPrice = n(item.price ?? item.sellingPrice ?? item.unitPrice);
    const unitCost = n(item.costPrice ?? item.purchasePrice ?? item.unitCost);
    const revenue = n(item.total ?? item.totalAmount ?? qty * unitPrice);
    const cost = n(item.totalCost ?? item.cost ?? qty * unitCost);
    const profit = n(item.profit ?? revenue - cost);

    return {
      key: String(
        item.productId ??
          item.id ??
          item.productCode ??
          item.code ??
          item.productName ??
          item.name ??
          `item-${idx}`
      ),
      name: String(item.productName ?? item.name ?? "Product"),
      productId: item.productId ?? null,
      qty,
      revenue,
      cost,
      profit,
      stock: n(item.stock, 0),
      code: item.productCode ?? item.code ?? "",
    };
  });
}

function resolveProductId(item, products) {
  if (item.productId) return item.productId;
  const byCode = products.find(
    (p) => String(p.code).toLowerCase() === String(item.code).toLowerCase()
  );
  if (byCode) return byCode.id;

  const byName = products.find(
    (p) => String(p.name).toLowerCase() === String(item.name).toLowerCase()
  );
  return byName?.id || null;
}

function isInPeriod(date, period) {
  const now = new Date();

  if (period === "today") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  if (period === "week") {
    const start = new Date(now);
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return date >= start && date < end;
  }

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function getSaleDate(sale) {
  const raw = sale?.date ?? sale?.createdAt ?? sale?.soldAt ?? sale?.timestamp ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function n(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sum(arr) {
  return arr.reduce((acc, v) => acc + n(v), 0);
}

function formatEGP(value) {
  const number = n(value);
  return `${new Intl.NumberFormat("en-US").format(Math.round(number))} EGP`;
}

function formatShort(value) {
  const num = n(value);
  if (Math.abs(num) >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return `${Math.round(num)}`;
}

function StatCard({ title, value, icon, iconWrap, valueClass = "", action = null }) {
  return (
    <article className="rounded-[26px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
      <div className={`mb-4 inline-grid h-14 w-14 place-items-center rounded-2xl ${iconWrap}`}>
        {icon}
      </div>
      <p className="text-[15px] text-[#888e96]">{title}</p>
      <p className={`mt-2 text-[44px] leading-none font-semibold text-[#22262d] ${valueClass}`}>
        {value}
      </p>
      {action}
    </article>
  );
}

function MiniMetric({ label, value, valueClass = "" }) {
  return (
    <div>
      <p className="text-[14px] text-[#8c9097]">{label}</p>
      <p className={`mt-2 text-[18px] font-medium text-[#232830] ${valueClass}`}>{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#d7d7d7] bg-[#f8f8f8] p-8 text-center text-[14px] text-[#8a9098]">
      {text}
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

function CalendarIcon({ className = "h-5 w-5" }) {
  return (
    <IconSvg className={className}>
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M16 2v4M8 2v4M3 9h18" />
    </IconSvg>
  );
}
function CubeIcon({ className = "h-7 w-7" }) {
  return (
    <IconSvg className={className}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 3v9m8-4.5-8 4.5-8-4.5" />
    </IconSvg>
  );
}
function DollarIcon({ className = "h-7 w-7" }) {
  return (
    <IconSvg className={className}>
      <path d="M12 3v18" />
      <path d="M16 6.5A4 4 0 0 0 12 4c-2.2 0-4 1.4-4 3.2 0 1.7 1.3 2.6 4 3.3 2.7.6 4 1.5 4 3.2 0 1.8-1.8 3.3-4 3.3a4 4 0 0 1-4-2.5" />
    </IconSvg>
  );
}
function TrendUpIcon({ className = "h-7 w-7" }) {
  return (
    <IconSvg className={className}>
      <path d="m3 17 5-5 4 4 8-8" />
      <path d="M14 8h6v6" />
    </IconSvg>
  );
}
function TrendDownIcon({ className = "h-7 w-7" }) {
  return (
    <IconSvg className={className}>
      <path d="m3 7 5 5 4-4 8 8" />
      <path d="M14 16h6v-6" />
    </IconSvg>
  );
}
function TransferIcon({ className = "h-7 w-7" }) {
  return (
    <IconSvg className={className}>
      <path d="M4 7h14" />
      <path d="m14 3 4 4-4 4" />
      <path d="M20 17H6" />
      <path d="m10 13-4 4 4 4" />
    </IconSvg>
  );
}
