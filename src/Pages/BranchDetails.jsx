import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBranchById } from "../Utils/BranchesStore";
import { readEmployees } from "../Utils/EmployeeStore";
import { readProducts } from "../Utils/ProductStore";
import { readSales } from "../Utils/SalesStore";

const DEFAULT_MIN_STOCK = 10;
const CRITICAL_STOCK = 5;

export default function BranchDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const branch = useMemo(() => getBranchById(id), [id]);
  const employees = useMemo(() => readEmployees(), []);
  const products = useMemo(() => readProducts(), []);
  const sales = useMemo(() => readSales(), []);

  const branchEmployees = useMemo(() => {
    if (!branch) return [];
    return employees.filter((e) => sameBranch(e.branch, branch.name));
  }, [employees, branch]);

  const branchProducts = useMemo(() => {
    if (!branch) return [];
    return products.filter((p) => sameBranch(p.branch, branch.name));
  }, [products, branch]);

  const monthSalesForBranch = useMemo(() => {
    if (!branch) return [];
    return sales.filter((sale) => {
      const d = getSaleDate(sale);
      if (!d || !isCurrentMonth(d)) return false;
      if (isReturnedStatus(sale.status)) return false;
      return sameBranch(sale.branch, branch.name);
    });
  }, [sales, branch]);

  const monthPerf = useMemo(() => calcSalesSummary(monthSalesForBranch), [monthSalesForBranch]);

  const monthBenchmarks = useMemo(() => {
    const map = new Map();

    for (const sale of sales) {
      const d = getSaleDate(sale);
      if (!d || !isCurrentMonth(d)) continue;
      if (isReturnedStatus(sale.status)) continue;

      const b = normalize(sale.branch) || "unknown";
      const prev = map.get(b) || { sales: 0, profit: 0, transactions: 0 };
      const totals = getSaleTotals(sale);

      prev.sales += totals.sales;
      prev.profit += totals.profit;
      prev.transactions += 1;

      map.set(b, prev);
    }

    return [...map.values()];
  }, [sales]);

  const maxSales = useMemo(
    () => Math.max(1, monthPerf.sales, ...monthBenchmarks.map((x) => x.sales)),
    [monthPerf.sales, monthBenchmarks]
  );
  const maxProfit = useMemo(
    () => Math.max(1, Math.abs(monthPerf.profit), ...monthBenchmarks.map((x) => Math.abs(x.profit))),
    [monthPerf.profit, monthBenchmarks]
  );
  const maxTransactions = useMemo(
    () => Math.max(1, monthPerf.transactions, ...monthBenchmarks.map((x) => x.transactions)),
    [monthPerf.transactions, monthBenchmarks]
  );

  const salesProgress = percent(monthPerf.sales, maxSales);
  const profitProgress = percent(Math.abs(monthPerf.profit), maxProfit);
  const txProgress = percent(monthPerf.transactions, maxTransactions);

  const topProducts = useMemo(() => {
    return buildTopProducts(monthSalesForBranch, branchProducts).slice(0, 4);
  }, [monthSalesForBranch, branchProducts]);

  const alerts = useMemo(() => {
    return branchProducts
      .map((p) => {
        const stock = n(p.stock);
        const minStock = n(p.minStock, DEFAULT_MIN_STOCK);

        return {
          ...p,
          stock,
          minStock,
          level: stock <= CRITICAL_STOCK ? "Critical" : "Low",
        };
      })
      .filter((p) => p.stock <= p.minStock)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3);
  }, [branchProducts]);

  const employeeCount = branchEmployees.length > 0 ? branchEmployees.length : n(branch?.employeeCount);
  const productCount = branchProducts.length > 0 ? branchProducts.length : n(branch?.productCount);

  if (!branch) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-215 rounded-3xl border border-dashed border-[#d3d3d3]  p-10 text-center">
          <p className="text-base text-[#80858d]">Branch not found.</p>
          <button
            type="button"
            onClick={() => navigate("/branches")}
            className="mt-4 rounded-xl bg-[#ff7a1a] px-5 py-2 text-sm font-semibold text-white"
          >
            Back to branches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[38px] font-semibold leading-tight text-[#1f242b]">{branch.name} Branch</h1>
            <span
              className={`mt-2 inline-block rounded-full px-4 py-1 text-[14px] font-medium ${
                branch.status === "Active"
                  ? "bg-[#e7f4ec] text-[#27ae60]"
                  : "bg-[#ececec] text-[#5d6168]"
              }`}
            >
              {branch.status || "Inactive"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/branches/edit/${branch.id}`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white bg-white px-5 py-3 text-[18px] font-semibold text-[#ff7a1a] shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
            >
              <EditIcon className="h-5 w-5" />
              Edit Branch
            </button>

            <button
              type="button"
              onClick={() => navigate("/branches")}
              className="grid h-14 w-14 place-items-center rounded-2xl border border-white bg-white text-[#ff7a1a] shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
              aria-label="Back"
            >
              <BackIcon />
            </button>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <TopStatCard title="Employees" value={String(employeeCount)} icon={<UsersIcon />} iconClass="bg-[#fff9e8] text-[#e6b934]" />
          <TopStatCard title="Products" value={String(productCount)} icon={<CubeIcon />} iconClass="bg-[#fff2e8] text-[#ff7a1a]" />
          <TopStatCard title="Monthly Sales" value={formatCompactEGP(monthPerf.sales)} icon={<TrendIcon />} iconClass="bg-[#e7f4ec] text-[#27ae60]" valueClass="text-[#27ae60]" />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <article className="rounded-[26px] border border-white/80  p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <h2 className="mb-4 flex items-center gap-2 text-[22px] font-semibold text-[#20242b]">
              <BranchIcon className="text-[#ff7a1a] w-8" />
              Branch Information
            </h2>

            <div className="rounded-[18px] border border-[#d7d7d7] bg-[#f8f8f8] px-4 py-2">
              <InfoRow label="Address" value={branch.address} />
              <InfoRow label="Phone" value={branch.phone} />
              <InfoRow label="Manager" value={branch.manager} />
              <InfoRow label="Products" value={String(productCount)} />
            </div>
          </article>

          <article className="rounded-[26px] border border-white/80  p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <h2 className="mb-4 flex items-center gap-2 text-[22px] font-semibold text-[#20242b]">
              <TrendIcon className="text-[#27ae60] w-8" />
              Performance Summary
            </h2>

            <ProgressRow
              label="Total Sales (This Month)"
              value={formatEGP(monthPerf.sales)}
              progress={salesProgress}
              barClass="bg-[#ff7a1a]"
            />
            <ProgressRow
              label="Total Profit (This Month)"
              value={`${monthPerf.profit >= 0 ? "+" : ""}${formatEGP(monthPerf.profit)}`}
              valueClass={monthPerf.profit >= 0 ? "text-[#27ae60]" : "text-[#ef5d5d]"}
              progress={profitProgress}
              barClass="bg-[#27ae60]"
            />
            <ProgressRow
              label="Total Transactions"
              value={`${monthPerf.transactions} Sales`}
              progress={txProgress}
              barClass="bg-[#e6b934]"
            />
          </article>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <article className="rounded-[26px] border border-white/80  p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <h2 className="mb-4 flex items-center gap-2 text-[22px] font-semibold text-[#20242b]">
              <CubeIcon className="text-[#27ae60] w-8" />
              Top Products This Month
            </h2>

            <div className="space-y-3">
              {topProducts.length === 0 && <EmptyState text="No sales this month for this branch." />}

              {topProducts.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    item.productId ? navigate(`/products/${item.productId}`) : navigate("/products")
                  }
                  className="w-full rounded-2xl border border-[#d7d7d7] bg-[#f8f8f8] p-4 text-left"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[18px] font-medium text-[#232830]">{item.name}</p>
                    <span className="rounded-full bg-[#ff7a1a] px-3 py-1 text-[13px] font-semibold text-white">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="my-2 h-px bg-[#d8d8d8]" />
                  <div className="grid grid-cols-3 gap-3">
                    <SmallField label="Sold" value={`${item.sold} Unit`} />
                    <SmallField label="Revenue" value={formatCompactEGP(item.revenue)} />
                    <SmallField label="Profit" value={formatCompactEGP(item.profit)} valueClass="text-[#27ae60]" />
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-[26px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[22px] font-semibold text-[#20242b]">
                <AlertIcon className="text-[#ef5d5d] w-6" />
                Inventory Alerts
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/inventory?branch=${encodeURIComponent(branch.name)}`)}
                className="text-[15px] font-semibold text-[#ff7a1a] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 && <EmptyState text="No inventory alerts in this branch." />}

              {alerts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/products/${item.id}`)}
                  className={`w-full rounded-2xl border p-4 text-left ${
                    item.level === "Critical"
                      ? "border-[#ef5d5d] bg-[#fff4f4]"
                      : "border-[#e8c54f] bg-[#fffaf0]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[18px] font-medium text-[#232830]">{item.name}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-[13px] font-semibold ${
                        item.level === "Critical"
                          ? "bg-[#ef5d5d] text-white"
                          : "bg-[#e8c54f] text-white"
                      }`}
                    >
                      {item.level}
                    </span>
                  </div>
                  <div className="my-2 h-px bg-[#e0c56a]" />
                  <div className="grid grid-cols-3 gap-3">
                    <SmallField label="Stock" value={`${item.stock} Units`} valueClass="text-[#ef5d5d]" />
                    <SmallField label="Min" value={String(item.minStock)} />
                    <SmallField label="Branch" value={item.branch} />
                  </div>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-[26px] border border-white/80  p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[22px] font-semibold text-[#20242b]">
              <UsersIcon className="text-[#ff7a1a] w-8" />
              Branch Staff
            </h2>
            <button
              type="button"
              onClick={() => navigate(`/employees?branch=${encodeURIComponent(branch.name)}`)}
              className="rounded-full border border-[#d8d8d8] bg-white px-4 py-2 text-[15px] font-semibold text-[#2c3037]"
            >
              Manage Staff
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {branchEmployees.length === 0 && <EmptyState text="No staff in this branch yet." />}

            {branchEmployees.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => navigate(`/employees/edit/${emp.id}`)}
                className="rounded-2xl border border-[#d7d7d7] bg-[#f8f8f8] p-4 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[18px] font-medium text-[#232830]">{emp.fullName}</p>
                    <p className="text-[14px] text-[#7f858d]">{emp.role}</p>
                  </div>
                  <span
                    className={`rounded-full px-4 py-1 text-[14px] font-medium ${
                      emp.status === "Active"
                        ? "bg-[#e7f4ec] text-[#27ae60]"
                        : "bg-[#ececec] text-[#5d6168]"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function TopStatCard({ title, value, icon, iconClass, valueClass = "" }) {
  return (
    <article className="rounded-[22px] border border-white/80 bg-[#f7f7f7] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
      <div className={`mb-3 inline-grid h-12 w-12 place-items-center rounded-xl ${iconClass}`}>{icon}</div>
      <p className="text-[15px] text-[#8b9097]">{title}</p>
      <p className={`mt-2 text-[20px] font-semibold text-[#232830] ${valueClass}`}>{value}</p>
    </article>
  );
}

function ProgressRow({ label, value, progress, barClass, valueClass = "" }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[15px] text-[#7f858d]">{label}</p>
        <p className={`text-[15px] font-medium text-[#232830] ${valueClass}`}>{value}</p>
      </div>
      <div className="h-3 rounded-full bg-[#ececec]">
        <div className={`h-3 rounded-full ${barClass}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
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

function SmallField({ label, value, valueClass = "" }) {
  return (
    <div>
      <p className="text-[14px] text-[#8b9097]">{label}</p>
      <p className={`mt-1 text-[16px] font-medium text-[#232830] ${valueClass}`}>{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d7d7d7] bg-[#f8f8f8] p-6 text-center text-[14px] text-[#8b9097]">
      {text}
    </div>
  );
}

function sameBranch(a, b) {
  return normalize(a) === normalize(b);
}

function normalize(v) {
  return String(v ?? "").trim().toLowerCase();
}

function n(v, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function percent(current, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

function isCurrentMonth(date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function isReturnedStatus(status) {
  const s = normalize(status);
  return s === "returned" || s === "cancelled" || s === "canceled";
}

function getSaleDate(sale) {
  const raw = sale?.date ?? sale?.createdAt ?? sale?.soldAt ?? sale?.timestamp ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeSaleItems(sale) {
  const list = Array.isArray(sale?.items)
    ? sale.items
    : Array.isArray(sale?.products)
    ? sale.products
    : Array.isArray(sale?.lines)
    ? sale.lines
    : [];

  return list.map((item, idx) => {
    const qty = n(item.quantity ?? item.qty ?? 1, 1);
    const price = n(item.price ?? item.sellingPrice ?? item.unitPrice);
    const costPrice = n(item.costPrice ?? item.purchasePrice ?? item.unitCost);
    const revenue = n(item.total ?? item.totalAmount ?? qty * price);
    const cost = n(item.totalCost ?? item.cost ?? qty * costPrice);
    const profit = n(item.profit ?? revenue - cost);

    return {
      key: String(item.productId ?? item.id ?? item.productCode ?? item.code ?? item.name ?? `item-${idx}`),
      productId: item.productId ?? null,
      name: String(item.productName ?? item.name ?? "Product"),
      code: String(item.productCode ?? item.code ?? "").trim(),
      sold: qty,
      revenue,
      cost,
      profit,
    };
  });
}

function getSaleTotals(sale) {
  const items = normalizeSaleItems(sale);
  const sales = n(
    sale.totalAmount ??
      sale.totalSale ??
      sale.total ??
      items.reduce((acc, i) => acc + i.revenue, 0)
  );
  const cost = n(
    sale.totalCost ??
      sale.cost ??
      items.reduce((acc, i) => acc + i.cost, 0)
  );
  const profit = n(sale.totalProfit ?? sale.profit ?? sales - cost);

  return { sales, cost, profit };
}

function calcSalesSummary(sales) {
  let salesValue = 0;
  let cost = 0;
  let profit = 0;
  let transactions = 0;

  for (const s of sales) {
    const totals = getSaleTotals(s);
    salesValue += totals.sales;
    cost += totals.cost;
    profit += totals.profit;
    transactions += 1;
  }

  return { sales: salesValue, cost, profit, transactions };
}

function buildTopProducts(sales, branchProducts) {
  const byCode = new Map(branchProducts.map((p) => [normalize(p.code), p]));
  const byName = new Map(branchProducts.map((p) => [normalize(p.name), p]));
  const map = new Map();

  for (const sale of sales) {
    for (const item of normalizeSaleItems(sale)) {
      const codeKey = normalize(item.code);
      const nameKey = normalize(item.name);
      const matched = byCode.get(codeKey) || byName.get(nameKey);

      const key = codeKey || nameKey || item.key;
      const prev = map.get(key) || {
        key,
        productId: matched?.id ?? item.productId ?? null,
        name: matched?.name ?? item.name,
        sold: 0,
        revenue: 0,
        profit: 0,
      };

      prev.sold += item.sold;
      prev.revenue += item.revenue;
      prev.profit += item.profit;

      map.set(key, prev);
    }
  }

  return [...map.values()].sort((a, b) => b.profit - a.profit || b.revenue - a.revenue);
}

function formatEGP(value) {
  const num = Math.round(n(value));
  return `${new Intl.NumberFormat("en-US").format(num)} EGP`;
}

function formatCompactEGP(value) {
  const num = n(value);
  const abs = Math.abs(num);

  if (abs >= 1000) {
    return `${Math.round(num / 1000)}K EGP`;
  }

  return `${Math.round(num)} EGP`;
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

function BackIcon() {
  return (
    <IconSvg>
      <path d="M15 18 9 12l6-6" />
    </IconSvg>
  );
}

function EditIcon({ className = "h-6 w-6" }) {
  return (
    <IconSvg className={className}>
      <path d="M12.4 5.6h-6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      <path d="m15.2 4.8 4 4-8.2 8.2-4.6.6.6-4.6 8.2-8.2Z" />
    </IconSvg>
  );
}

function BranchIcon({ className = "h-6 w-6 text-[#ff7a1a]" }) {
  return (
    <IconSvg className={className}>
      <rect x="4" y="3" width="10" height="18" rx="2" />
      <path d="M14 8h4a2 2 0 0 1 2 2v11h-6" />
      <path d="M8 7h2M8 11h2M8 15h2" />
    </IconSvg>
  );
}

function UsersIcon({ className = "h-6 w-6" }) {
  return (
    <IconSvg className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconSvg>
  );
}

function CubeIcon({ className = "h-6 w-6" }) {
  return (
    <IconSvg className={className}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 3v9m8-4.5-8 4.5-8-4.5" />
    </IconSvg>
  );
}

function TrendIcon({ className = "h-6 w-6" }) {
  return (
    <IconSvg className={className}>
      <path d="m3 17 5-5 4 4 8-8" />
      <path d="M14 8h6v6" />
    </IconSvg>
  );
}

function AlertIcon({ className = "h-6 w-6" }) {
  return (
    <IconSvg className={className}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </IconSvg>
  );
}
