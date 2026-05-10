import * as ProductStore from "../Utils/ProductStore";
import * as SalesStore from "../Utils/SalesStore";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Box,
  CircleDollarSign,
  Clock3,
  List,
  Plus,
  ShoppingCart,
  Users,
} from "lucide-react";



/* ================= COMPONENT ================= */


 
export default function HomePage() {

  const {
  TodayPerformance,
  MonthPerformance,
  InventoryAlerts,
  BranchPerformance,
  TopProducts,
  RecentActivity,
} = buildHomeMetrics(readProductsSafe(), readSalesSafe());

  const navigate = useNavigate();

  const branchRef = useRef(null);
  

  /* ================= NAV ================= */

  const routes = {
    addStock: "/inventory",
    products: "/products",
    sales: "/sales",
    profit: "/profit",
    addSale: "/sales/add",
    addProduct: "/products/add",
    branchPerformance: "/branches/performance",
  };

  const handleActionClick = (label) => {
    const map = {
      "Add Stock": routes.addStock,
      "All Products": routes.products,
      "View Sales": routes.sales,
      "View Profit": routes.profit,
      "Add Sale": routes.addSale,
      "Add Product": routes.addProduct,
    };

    if (map[label]) navigate(map[label]);
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    
  };
  

  /* ================= DATA ================= */

  const QuickActionsTop = [
    { label: "Add Stock", icon: Box, iconColor: "text-[#f2c94c]" },
    { label: "All Products", icon: List, iconColor: "text-[#1b1b1b]" },
    { label: "View Sales", icon: ShoppingCart, iconColor: "text-[#eb5757]" },
    { label: "View Profit", icon: CircleDollarSign, iconColor: "text-[#27ae60]" },
  ];

  const QuickActionsBottom = [
    { label: "Add Sale", icon: Plus },
    { label: "Add Product", icon: Box },
  ];

  
  /* ================= HELPERS ================= */
  

 function readProductsSafe() {
  if (typeof ProductStore.readProducts === "function") return ProductStore.readProducts();
  return [];
}

function readSalesSafe() {
  if (typeof SalesStore.readSales === "function") return SalesStore.readSales();
  if (typeof SalesStore.readInvoices === "function") return SalesStore.readInvoices();
  if (typeof SalesStore.readAllSales === "function") return SalesStore.readAllSales();
  return [];
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatMoney(value) {
  return `${Math.round(value).toLocaleString("en-US")} EGP`;
}

function formatShort(value) {
  const v = num(value);
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (abs >= 1_000) return `${Math.round(v / 1_000)}K`;
  return `${Math.round(v)}`;
}

function percentDelta(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function pctText(value) {
  const v = num(value);
  return `${v >= 0 ? "+" : ""}${v.toFixed(1).replace(".0", "")}%`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function normalizeSaleItem(item) {
  const qty = Math.max(1, num(item?.quantity ?? item?.qty, 1));
  const revenue = num(item?.total ?? item?.lineTotal, 0);
  const unitPrice = num(item?.price ?? item?.sellingPrice ?? item?.unitPrice, qty ? revenue / qty : 0);
  const unitCost = num(item?.cost ?? item?.purchasePrice ?? item?.buyPrice, 0);
  const fixedRevenue = revenue || unitPrice * qty;
  const profit = num(item?.profit, fixedRevenue - unitCost * qty);

  return {
    name: item?.name || item?.productName || item?.title || "Product",
    qty,
    revenue: fixedRevenue,
    profit,
  };
}

function normalizeSale(sale) {
  const date = new Date(
    sale?.createdAt || sale?.date || sale?.saleDate || sale?.time || 0
  );
  const rawStatus = String(sale?.status || sale?.state || "completed").toLowerCase();
  const status = rawStatus.includes("return") ? "returned" : "completed";
  const itemsRaw = Array.isArray(sale?.items) ? sale.items : Array.isArray(sale?.products) ? sale.products : [];
  const items = itemsRaw.map(normalizeSaleItem);

  const total = num(sale?.totalAmount ?? sale?.total ?? sale?.amount ?? sale?.grandTotal, 0);
  const itemsRevenue = items.reduce((a, i) => a + i.revenue, 0);
  const finalTotal = total || itemsRevenue;

  const cost = num(sale?.totalCost ?? sale?.cost ?? sale?.costAmount, 0);
  const itemsProfit = items.reduce((a, i) => a + i.profit, 0);
  const profit = num(sale?.profit, cost ? finalTotal - cost : itemsProfit);

  return {
    id: sale?.id || sale?.invoiceNumber || sale?.code || "INV-UNKNOWN",
    invoice: sale?.invoiceNumber || sale?.code || sale?.id || "INV",
    date,
    status,
    total: finalTotal,
    profit,
    branch: sale?.branch || sale?.branchName || "Main Branch",
    actor: sale?.employeeName || sale?.cashier || sale?.user || "System",
    items,
  };
}

function agoText(date, now = new Date()) {
  if (!date) return "No date";

  const d = new Date(date);
  if (isNaN(d)) return "Invalid date";

  const diffMin = Math.max(
    0,
    Math.floor((now.getTime() - d.getTime()) / 60000)
  );

  if (diffMin < 1) return "Now";
  if (diffMin < 60) return `${diffMin} Min Ago`;

  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} Hour Ago`;

  const days = Math.floor(h / 24);
  return `${days} Day Ago`;
}

function activityIcon(kind) {
  switch (kind) {
    case "sale":
      return {
        icon: ShoppingCart,
        wrap: "bg-[rgba(39,174,96,0.14)] text-[#27ae60]",
      };
    case "alert":
      return {
        icon: AlertTriangle,
        wrap: "bg-[rgba(235,87,87,0.14)] text-[#eb5757]",
      };
    default:
      return {
        icon: Users,
        wrap: "bg-[rgba(113,128,150,0.14)] text-[#717f96]",
      };
  }
}

function buildHomeMetrics(productsRaw, salesRaw) {
  const products = Array.isArray(productsRaw) ? productsRaw : [];
  const sales = (Array.isArray(salesRaw) ? salesRaw : []).map(normalizeSale);

  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const monthStart = startOfMonth(now);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const completed = sales.filter((s) => s.status === "completed");

  const todaySales = completed.filter((s) => s.date >= todayStart);
  const yesterdaySales = completed.filter((s) => s.date >= yesterdayStart && s.date < todayStart);

  const monthSales = completed.filter((s) => s.date >= monthStart);
  const prevMonthSales = completed.filter((s) => s.date >= prevMonthStart && s.date < monthStart);

  const sumTotal = (arr) => arr.reduce((a, s) => a + num(s.total), 0);
  const sumProfit = (arr) => arr.reduce((a, s) => a + num(s.profit), 0);

  const todayTotal = sumTotal(todaySales);
  const yesterdayTotal = sumTotal(yesterdaySales);
  const todayProfit = sumProfit(todaySales);
  const yesterdayProfit = sumProfit(yesterdaySales);

  const monthTotal = sumTotal(monthSales);
  const prevMonthTotal = sumTotal(prevMonthSales);
  const monthProfit = sumProfit(monthSales);
  const prevMonthProfit = sumProfit(prevMonthSales);

  const monthTx = monthSales.length;
  const prevMonthTx = prevMonthSales.length;

  const avgMonth = monthTx ? monthTotal / monthTx : 0;
  const prevAvgMonth = prevMonthTx ? prevMonthTotal / prevMonthTx : 0;

  const activeToday = new Set(todaySales.map((s) => s.actor).filter(Boolean)).size;

 const TodayPerformance = [
  {
    title: "Sales Today",
    value: formatMoney(todayTotal),
    badge: pctText(percentDelta(todayTotal, yesterdayTotal)),
    icon: CircleDollarSign,
    iconWrap: "bg-[rgba(255,125,45,0.14)] text-[#ff7d2d]",
  },
  {
    title: "Profit Today",
    value: formatMoney(todayProfit),
    badge: pctText(percentDelta(todayProfit, yesterdayProfit)),
    icon: CircleDollarSign,
    iconWrap: "bg-[rgba(39,174,96,0.14)] text-[#27ae60]",
  },
  {
    title: "Transactions",
    value: `${todaySales.length}`,
    badge: "...",
    icon: ShoppingCart,
    iconWrap: "bg-[rgba(242,201,76,0.2)] text-[#d9a106]",
  },
  {
    title: "Active Users",
    value: `${activeToday}`,
    badge: "Online",
    icon: Users,
    iconWrap: "bg-[rgba(255,125,45,0.14)] text-[#ff7d2d]",
  },
];

  const MonthPerformance = [
    {
      title: "Monthly Sales",
      value: formatMoney(monthTotal),
      delta: pctText(percentDelta(monthTotal, prevMonthTotal)),
      base: formatMoney(prevMonthTotal),
      deltaTone: percentDelta(monthTotal, prevMonthTotal) >= 0
        ? "text-[#27ae60] bg-[rgba(39,174,96,0.14)]"
        : "text-[#eb5757] bg-[rgba(235,87,87,0.14)]",
    },
    {
      title: "Monthly Profit",
      value: formatMoney(monthProfit),
      delta: pctText(percentDelta(monthProfit, prevMonthProfit)),
      base: formatMoney(prevMonthProfit),
      deltaTone: percentDelta(monthProfit, prevMonthProfit) >= 0
        ? "text-[#27ae60] bg-[rgba(39,174,96,0.14)]"
        : "text-[#eb5757] bg-[rgba(235,87,87,0.14)]",
    },
    {
      title: "Transactions",
      value: `${monthTx}`,
      delta: pctText(percentDelta(monthTx, prevMonthTx)),
      base: `${prevMonthTx}`,
      deltaTone: percentDelta(monthTx, prevMonthTx) >= 0
        ? "text-[#27ae60] bg-[rgba(39,174,96,0.14)]"
        : "text-[#eb5757] bg-[rgba(235,87,87,0.14)]",
    },
    {
      title: "Avg Transaction",
      value: formatMoney(avgMonth),
      delta: pctText(percentDelta(avgMonth, prevAvgMonth)),
      base: formatMoney(prevAvgMonth),
      deltaTone: percentDelta(avgMonth, prevAvgMonth) >= 0
        ? "text-[#27ae60] bg-[rgba(39,174,96,0.14)]"
        : "text-[#eb5757] bg-[rgba(235,87,87,0.14)]",
    },
  ];

  const InventoryAlerts = products
    .map((p) => {
      const min = Math.max(1, num(p.minStock ?? p.min, 10));
      const stock = Math.max(0, num(p.stock, 0));
      return { p, min, stock };
    })
    .filter((x) => x.stock <= x.min)
    .sort((a, b) => a.stock / a.min - b.stock / b.min)
    .slice(0, 3)
    .map(({ p, min, stock }) => ({
      name: p.name,
      stock: `${stock} Units`,
      min: `${min}`,
      branch: p.branch || "Main Branch",
      level: stock <= min * 0.5 ? "Critical" : "Low",
    }));

  const branches = Array.from(
    new Set([
      ...products.map((p) => p.branch).filter(Boolean),
      ...monthSales.map((s) => s.branch).filter(Boolean),
      ...prevMonthSales.map((s) => s.branch).filter(Boolean),
    ])
  );

  const BranchPerformance = branches.slice(0, 3).map((branch) => {
    const branchProducts = products.filter((p) => p.branch === branch);
    const stockValue = branchProducts.reduce(
      (a, p) => a + num(p.stock) * num(p.purchasePrice),
      0
    );

    const mSales = monthSales.filter((s) => s.branch === branch);
    const pSales = prevMonthSales.filter((s) => s.branch === branch);

    const mProfit = sumProfit(mSales);
    const pProfit = sumProfit(pSales);

    return {
      branch,
      stock: formatShort(stockValue),
      profit: formatShort(mProfit),
      orders: `${mSales.length}`,
      trend: mProfit >= pProfit ? "up" : "down",
    };
  });

  const topMap = new Map();
  monthSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!topMap.has(item.name)) {
        topMap.set(item.name, { name: item.name, sold: 0, revenue: 0, profit: 0 });
      }
      const row = topMap.get(item.name);
      row.sold += item.qty;
      row.revenue += item.revenue;
      row.profit += item.profit;
    });
  });

  const TopProducts = Array.from(topMap.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4)
    .map((x, idx) => ({
      name: x.name,
      sold: `${x.sold} Unit`,
      revenue: formatShort(x.revenue),
      profit: formatShort(x.profit),
      rank: `#${idx + 1}`,
    }));

  const RecentActivity = [...sales]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5)
    .map((s) => ({
      text:
        s.status === "returned"
          ? `Returned Sale #${s.invoice} - ${formatMoney(s.total)}`
          : `New Sale #${s.invoice} - ${formatMoney(s.total)}`,
      meta: `${agoText(s.date)} • ${s.actor}`,
      kind: s.status === "returned" ? "alert" : "sale",
    }));

  return {
    TodayPerformance,
    MonthPerformance,
    InventoryAlerts,
    BranchPerformance,
    TopProducts,
    RecentActivity,
  };
}


  /* ================= UI ================= */

  return (
    <div className="space-y-10">

      {/* ===== QUICK ACTIONS ===== */}
      <section>
       <h2 className="text-center text-2xl font-semibold ">Quick Actions</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {QuickActionsTop.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => handleActionClick(item.label)}
                className="flex items-center justify-center gap-3 rounded-2xl bg-white p-5 text-xl font-semibold shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Icon className={`h-6 w-6 ${item.iconColor}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {QuickActionsBottom.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => handleActionClick(item.label)}
                className="flex items-center justify-center gap-3 rounded-2xl bg-white p-5 text-xl font-semibold shadow transition hover:bg-orange-500 hover:text-white"
              >
                <Icon className="h-6 w-6" />
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== TODAY ===== */}
      <section>
        <h2 className="text-center text-3xl font-semibold">Today Performance</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TodayPerformance.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-4 shadow"
              >
                <div className="flex justify-between">
                  <span className={`rounded-xl p-2 ${item.iconWrap}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-green-600 text-sm">{item.badge}</span>
                </div>

                <p className="mt-2 text-gray-500">{item.title}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== MONTH ===== */}

      <section>
        <h2 className="text-center text-3xl font-semibold">This Month</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {MonthPerformance.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-4 shadow">
              <p className="text-gray-500">{item.title}</p>
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BRANCH + ALERTS ===== */}
      {/* ===== LAST SECTION ===== */}
<section className="grid gap-4 xl:grid-cols-2">

  {/* ================= BRANCH PERFORMANCE ================= */}
  <div className="rounded-3xl bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-2xl font-semibold">
        <Box className="h-6 w-6 text-[#1b1b1b]" />
        Branch Performance
      </h3>

      <button
        onClick={() => navigate("/branches")}
        className="text-sm font-semibold text-[#ff7d2d] hover:underline"
      >
        View All
      </button>
    </div>

    <div ref={branchRef} className="space-y-3">
      {BranchPerformance.map((item) => (
        <div
          key={item.branch}
          className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-lg font-semibold">{item.branch}</p>

            {item.trend === "up" ? (
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Stock</p>
              <p>{item.stock}</p>
            </div>
            <div>
              <p className="text-gray-500">Profit</p>
              <p className="text-green-600">{item.profit}</p>
            </div>
            <div>
              <p className="text-gray-500">Orders</p>
              <p>{item.orders}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* ================= RIGHT SIDE ================= */}

  <div className="space-y-4">

    {/* ===== TOP PRODUCTS ===== */}
    <div className="rounded-3xl bg-white p-5 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-2xl font-semibold">
          <ShoppingCart className="h-6 w-6 text-[#27ae60]" />
          Top Products
        </h3>

        <button 
          className="text-sm font-semibold text-[#ff7d2d] hover:underline"
          onClick={() => navigate("/products")}
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {TopProducts.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-zinc-200 p-3 transition hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.name}</p>

              <span className="rounded-full bg-[#ff7d2d] px-2 py-1 text-xs font-bold text-white">
                {item.rank}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-3 text-sm">
              <div>
                <p className="text-gray-500">Sold</p>
                <p>{item.sold}</p>
              </div>

              <div>
                <p className="text-gray-500">Revenue</p>
                <p>{item.revenue}</p>
              </div>

              <div>
                <p className="text-gray-500">Profit</p>
                <p className="text-green-600">{item.profit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>


    {/* ===== RECENT ACTIVITY ===== */}

    <div className="rounded-3xl bg-white p-5 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-2xl font-semibold">
          <Clock3 className="h-6 w-6 text-[#f2c94c]" />
          Recent Activity
        </h3>
      </div>

      <div className="space-y-3">
        {RecentActivity.map((item, index) => {
          const info = activityIcon(item.kind);
          const Icon = info.icon;

          return (
            <div
              key={index}
              className="flex gap-3 rounded-xl p-3 transition hover:bg-gray-50"
            >
              <span className={`rounded-xl p-2 ${info.wrap}`}>
                <Icon className="h-5 w-5" />
              </span>

              <div>
                <p className="font-medium">{item.text}</p>
                <p className="text-sm text-gray-500">{item.meta}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>

  </div>
</section>

    </div>
  );
}
