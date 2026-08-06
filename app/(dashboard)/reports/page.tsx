"use client";

import React from "react";
import { useSystemState } from "@/lib/state";
import { PageHeader } from "@/components/ui";
import { IconPrinter, IconDownload } from "@tabler/icons-react";

export default function ReportsPage() {
  const { categories, actuals, settings, isHydrated } = useSystemState();

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" />
        <p className="text-sm text-zinc-555 font-medium">Loading portal state...</p>
      </div>
    );
  }

  // Live spent metrics per category helper
  const getCategoryStats = (categoryCode: string, items: { id: string; budgetUSD: number }[]) => {
    const totalBudgetUSD = items.reduce((sum, item) => sum + item.budgetUSD, 0);
    const totalBudgetNaira = totalBudgetUSD * settings.benchmarkRate;

    const catActuals = actuals.filter((act) => act.categoryCode === categoryCode);
    const spentNaira = catActuals.filter((act) => act.status === "activated").reduce((sum, act) => sum + act.amountNaira, 0);
    const spentUSD = catActuals.filter((act) => act.status === "activated").reduce((sum, act) => sum + act.amountUSD, 0);
    const pendingNaira = catActuals.filter((act) => act.status !== "activated" && act.status !== "rejected").reduce((sum, act) => sum + act.amountNaira, 0);

    const remainingNaira = totalBudgetNaira - spentNaira;
    const remainingUSD = totalBudgetUSD - spentUSD;

    const utilization = totalBudgetNaira > 0 ? (spentNaira / totalBudgetNaira) * 100 : 0;

    return {
      budgetUSD: totalBudgetUSD,
      budgetNaira: totalBudgetNaira,
      spentNaira,
      spentUSD,
      pendingNaira,
      remainingNaira,
      remainingUSD,
      utilization,
    };
  };

  const getDeliveryFeeStats = () => {
    const totalActivated1to7 = actuals
      .filter((act) => act.status === "activated" && Number(act.categoryCode.split("-")[1]) <= 7)
      .reduce((sum, act) => sum + act.amountNaira, 0);

    const feeNaira = totalActivated1to7 * 0.06;
    const feeUSD = feeNaira / settings.benchmarkRate;

    return {
      budgetUSD: 0,
      budgetNaira: 0,
      spentNaira: feeNaira,
      spentUSD: feeUSD,
      pendingNaira: 0,
      remainingNaira: -feeNaira,
      remainingUSD: -feeUSD,
      utilization: 100,
    };
  };

  const reportRows = categories.map((cat) => {
    if (cat.isComputed) {
      const stats = getDeliveryFeeStats();
      return {
        id: cat.id,
        code: cat.code,
        name: cat.name,
        ...stats,
      };
    }
    const stats = getCategoryStats(cat.code, cat.items);
    return {
      id: cat.id,
      code: cat.code,
      name: cat.name,
      ...stats,
    };
  });

  const grandBudgetNaira = reportRows.reduce((sum, row) => sum + row.budgetNaira, 0);
  const grandBudgetUSD = reportRows.reduce((sum, row) => sum + row.budgetUSD, 0);
  const grandSpentNaira = reportRows.reduce((sum, row) => sum + row.spentNaira, 0);
  const grandSpentUSD = reportRows.reduce((sum, row) => sum + row.spentUSD, 0);
  const grandPendingNaira = reportRows.reduce((sum, row) => sum + row.pendingNaira, 0);
  const grandRemainingNaira = reportRows.reduce((sum, row) => sum + row.remainingNaira, 0);

  const grandUtilization = grandBudgetNaira > 0 ? (grandSpentNaira / grandBudgetNaira) * 100 : 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Reports" />

      {/* Overview Metric Row */}
      <div className="border border-zinc-200 bg-white p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">
            Overall Program Utilization
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-zinc-950">
              {grandUtilization.toFixed(1)}%
            </span>
            <span className="text-xs text-zinc-550 font-medium">
              spent of ₦{grandBudgetNaira.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500"
              style={{ width: `${Math.min(grandUtilization, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 border border-zinc-200 bg-white hover:bg-zinc-550 text-zinc-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <IconPrinter size={14} />
            Print Report
          </button>
          <button
            onClick={() => alert("Excel Export started (Simulated)")}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <IconDownload size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Budget Breakdown Table */}
      <div className="border border-zinc-200 bg-white rounded-2xl overflow-hidden">
        <div className="p-6">
          <h3 className="text-base font-bold text-zinc-900">
            Budget Utilization & Summary Sheet
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Category-level summaries showing budget, actual disbursements, and available remaining lines.
          </p>
        </div>

        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="font-bold text-zinc-500 bg-zinc-50 rounded-xl">
                <th className="p-3 rounded-l-xl">Category</th>
                <th className="p-3 text-right">Budget (USD)</th>
                <th className="p-3 text-right">Budget (NGN)</th>
                <th className="p-3 text-right">Spent (NGN)</th>
                <th className="p-3 text-right">Pending (NGN)</th>
                <th className="p-3 text-right">Remaining (NGN)</th>
                <th className="p-3 text-center rounded-r-xl">Utilization</th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              <tr className="h-2"></tr>
              {reportRows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-3">
                    <span className="font-semibold text-zinc-950 block">{row.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono font-bold">{row.code}</span>
                  </td>
                  <td className="p-3 text-right text-zinc-800">
                    {row.budgetUSD > 0 ? `$${row.budgetUSD.toLocaleString()}` : "-"}
                  </td>
                  <td className="p-3 text-right text-zinc-800 font-medium">
                    {row.budgetNaira > 0 ? `₦${row.budgetNaira.toLocaleString()}` : "-"}
                  </td>
                  <td className="p-3 text-right text-emerald-600 font-semibold">
                    ₦{row.spentNaira.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-orange-500 font-semibold">
                    {row.pendingNaira > 0 ? `₦${row.pendingNaira.toLocaleString()}` : "-"}
                  </td>
                  <td className="p-3 text-right font-bold text-zinc-950">
                    ₦{row.remainingNaira.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-semibold text-zinc-700 min-w-8 text-right">
                        {row.utilization.toFixed(0)}%
                      </span>
                      <div className="h-1.5 w-16 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full"
                          style={{ width: `${Math.min(row.utilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Grand Total Row */}
              <tr className="h-2"></tr>
              <tr className="bg-zinc-50 font-bold">
                <td className="p-3 rounded-l-xl text-zinc-950 text-xs">Grand Total</td>
                <td className="p-3 text-right text-xs text-zinc-950">${grandBudgetUSD.toLocaleString()}</td>
                <td className="p-3 text-right text-xs text-zinc-950">₦{grandBudgetNaira.toLocaleString()}</td>
                <td className="p-3 text-right text-xs text-emerald-600">₦{grandSpentNaira.toLocaleString()}</td>
                <td className="p-3 text-right text-xs text-orange-500">₦{grandPendingNaira.toLocaleString()}</td>
                <td className="p-3 text-right text-xs text-brand">₦{grandRemainingNaira.toLocaleString()}</td>
                <td className="p-3 text-center rounded-r-xl text-xs text-zinc-950">{grandUtilization.toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
