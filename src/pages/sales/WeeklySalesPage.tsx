import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';

export const WeeklySalesPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const [data, setData] = useState<{
    thisWeekSales: number;
    lastWeekSales: number;
    weeklyGrowth: number;
    weeklyBreakdown: Array<{
      day: string;
      date: string;
      sales: number;
      orders: number;
      profit: number;
      expenses: number;
    }>;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const currency = activeBusiness?.currencySymbol || 'AED ';

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const res = await api.getWeeklySales();
        setData(res);
      } catch (e) {
        console.error('Failed to load weekly sales', e);
      } finally {
        setLoading(false);
      }
    };
    fetchWeekly();
  }, [activeBusiness?.id]);

  if (loading || !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const isGrowthPositive = data.weeklyGrowth >= 0;
  const maxSale = Math.max(...data.weeklyBreakdown.map((d) => d.sales), 50);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Sales Analytics & Growth</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Weekly Sales Performance</h1>
          <p className="text-xs text-slate-500">
            Real transactional comparison between This Week and Last Week calculated directly from your ledger.
          </p>
        </div>
      </div>

      {/* Growth Comparison Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">This Week's Revenue</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {currency}{data.thisWeekSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Rolling 7-day revenue total</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Last Week's Revenue</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {currency}{data.lastWeekSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Previous 7-day comparison baseline</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Weekly Growth Rate</p>
          <div className="flex items-center gap-2 mt-1">
            <h3
              className={`text-2xl font-extrabold ${
                isGrowthPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isGrowthPositive ? '+' : ''}{data.weeklyGrowth}%
            </h3>
            {isGrowthPositive ? (
              <span className="p-1 rounded-full bg-emerald-100 text-emerald-800">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1 rounded-full bg-rose-100 text-rose-800">
                <ArrowDownRight className="w-4 h-4" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Compared to preceding weekly period</p>
        </div>
      </div>

      {/* Interactive Bar Chart Visualization */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">7-Day Revenue & Profit Comparison</h3>
        <p className="text-xs text-slate-500 mb-6">Hover over any day to see order count and calculated profit</p>

        <div className="h-72 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
          {data.weeklyBreakdown.map((item, idx) => {
            const heightPercent = maxSale > 0 ? Math.max(10, Math.round((item.sales / maxSale) * 100)) : 10;
            const profitPercent = item.sales > 0 ? Math.round((item.profit / item.sales) * 100) : 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] p-2 rounded-xl font-medium pointer-events-none whitespace-nowrap shadow-xl z-10 text-center">
                  <p className="font-bold">{item.day} ({item.date})</p>
                  <p className="text-blue-300">Sales: {currency}{item.sales.toFixed(2)}</p>
                  <p className="text-emerald-300">Profit: {currency}{item.profit.toFixed(2)}</p>
                  <p className="text-slate-300">Bills: {item.orders}</p>
                </div>

                <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <div className="text-center">
                  <span className="text-xs block font-bold text-slate-800">{item.day}</span>
                  <span className="text-[10px] text-slate-400 block">{item.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day-by-Day Comprehensive Breakdown Table (Section 14) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Day-by-Day Accounting Summary</h3>
          <p className="text-xs text-slate-500">
            Metrics include Total Sales, Orders Processed, Gross Profit, Operating Expenses, and Average Order Value (AOV).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-semibold text-slate-400 bg-slate-50/60 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Day & Date</th>
                <th className="py-3 px-4">Sales Revenue</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Average Order (AOV)</th>
                <th className="py-3 px-4">Gross Profit</th>
                <th className="py-3 px-4">Operating Expenses</th>
                <th className="py-3 px-4 text-right">Net Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.weeklyBreakdown.map((row, idx) => {
                const aov = row.orders > 0 ? row.sales / row.orders : 0;
                const margin = row.sales > 0 ? ((row.profit - row.expenses) / row.sales) * 100 : 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span>{row.day}</span>
                      <span className="text-slate-400 font-normal ml-1 text-[11px]">({row.date})</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-600">
                      {currency}{row.sales.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{row.orders} bills</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {currency}{aov.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      {currency}{row.profit.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {currency}{row.expenses.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          margin >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
