import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  CreditCard,
  Receipt,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import type { DashboardMetrics } from '../../types/index.js';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewProductModal: () => void;
  onOpenNewCustomerModal: () => void;
  onOpenNewExpenseModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenNewProductModal,
  onOpenNewCustomerModal,
  onOpenNewExpenseModal,
}) => {
  const { user, activeBusiness } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.getDashboard();
      setMetrics(data.metrics);
    } catch (e) {
      console.error('Error loading dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeBusiness?.id]);

  const currency = activeBusiness?.currencySymbol || 'AED ';

  // Greeting calculation
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const todayDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  if (loading || !metrics) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate highest day in weekly breakdown for SVG scaling
  const maxWeeklySale = Math.max(...metrics.weeklyBreakdown.map((b) => b.sales), 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner & Current Date */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg shadow-blue-900/10">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Store Online</span>
            <span>•</span>
            <span>{activeBusiness?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {greeting}, {user?.name?.split(' ')[0] || 'Store Owner'}!
          </h1>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{todayDateFormatted}</span>
          </p>
        </div>

        {/* Big POS Action Button in Hero */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('billing')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Receipt className="w-5 h-5" />
            <span>Launch POS Counter</span>
          </button>
        </div>
      </div>

      {/* Prominent Quick Actions Toolbar (Section 53) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
          <span>Quick Actions</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <button
            onClick={() => onNavigateTab('billing')}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
          >
            <Receipt className="w-4 h-4 text-blue-600" />
            <span>+ New Bill</span>
          </button>

          <button
            onClick={onOpenNewProductModal}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>+ Add Product</span>
          </button>

          <button
            onClick={onOpenNewCustomerModal}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>+ Add Customer</span>
          </button>

          <button
            onClick={onOpenNewExpenseModal}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span>+ Add Expense</span>
          </button>

          <button
            onClick={() => onNavigateTab('weekly-sales')}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Weekly Sales</span>
          </button>

          <button
            onClick={() => onNavigateTab('ai-assistant')}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Main KPI Metric Cards (Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Sales"
          value={`${currency}${metrics.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={metrics.todaySalesGrowth}
          trendLabel="vs yesterday"
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
          onClick={() => onNavigateTab('sales')}
        />

        <MetricCard
          title="Today's Net Profit"
          value={`${currency}${metrics.todayProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${metrics.todayOrders} orders processed`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          onClick={() => onNavigateTab('weekly-sales')}
        />

        <MetricCard
          title="Total Orders Today"
          value={metrics.todayOrders}
          subtitle={`Avg Order: ${currency}${metrics.todayAvgOrderValue.toFixed(2)}`}
          icon={<ShoppingCart className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
          onClick={() => onNavigateTab('sales')}
        />

        <MetricCard
          title="Low Stock Alert"
          value={metrics.lowStockCount}
          badge={metrics.lowStockCount > 0 ? 'Requires Action' : undefined}
          subtitle={`${metrics.totalProducts} total catalog items`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          onClick={() => onNavigateTab('inventory')}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Customers</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{metrics.totalCustomers}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active shopper profiles</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Outstanding Receivables</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {currency}{metrics.outstandingPayments.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Customer credit balance</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">This Week's Revenue</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {currency}{metrics.thisWeekSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              +{metrics.weeklyGrowth}% vs previous 7 days
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Chart & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales Chart (Sections 13 & 14) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Sales Breakdown</h3>
              <p className="text-xs text-slate-500">Day-by-day revenue and order volume for past 7 days</p>
            </div>
            <button
              onClick={() => onNavigateTab('weekly-sales')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Full Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
            {metrics.weeklyBreakdown.map((item, idx) => {
              const heightPercent = maxWeeklySale > 0 ? Math.max(12, Math.round((item.sales / maxWeeklySale) * 100)) : 10;
              const isToday = idx === metrics.weeklyBreakdown.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-semibold pointer-events-none whitespace-nowrap shadow-md">
                    {currency}{item.sales.toFixed(2)} ({item.orders} bills)
                  </div>

                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20'
                          : 'bg-slate-300 group-hover:bg-blue-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <div className="text-center">
                    <span className={`text-[11px] block font-bold ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>
                      {item.day}
                    </span>
                    <span className="text-[9px] text-slate-400 block">{item.date}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span>Today's Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-300" />
                <span>Previous Days</span>
              </div>
            </div>
            <span className="font-semibold text-slate-700">
              Total 7-Day Revenue: {currency}{metrics.thisWeekSales.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Live Audit & Recent Activities (Section 54) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Store Activity</h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Log</span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-72 divide-y divide-slate-50 pr-1">
            {metrics.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent actions recorded.</p>
            ) : (
              metrics.recentActivities.map((act) => (
                <div key={act.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{act.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{act.details}</p>
                  <span className="text-[10px] text-slate-400">By {act.userName}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices / Sales */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View All Bills
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 uppercase">
                <tr>
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Payment</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-bold text-blue-600">{sale.invoiceNumber}</td>
                    <td className="py-2.5 font-medium text-slate-800">{sale.customerName}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {currency}{sale.grandTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Low Stock Warning</h3>
              {metrics.lowStockProducts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {metrics.lowStockProducts.length} items
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Manage Stock
            </button>
          </div>

          {metrics.lowStockProducts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>All inventory is currently above minimum stock thresholds.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200/70"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{p.name}</p>
                    <p className="text-[10px] text-slate-500">
                      SKU: {p.sku} • Minimum required: {p.minStock} {p.unit}s
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-amber-700 block">
                      {p.currentStock} {p.unit}s left
                    </span>
                    <button
                      onClick={() => onNavigateTab('inventory')}
                      className="text-[10px] font-semibold text-blue-600 hover:underline"
                    >
                      Reorder Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
