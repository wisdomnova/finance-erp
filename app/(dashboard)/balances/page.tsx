"use client";

import React, { useState } from "react";
import { useSystemState, FxTranche, ActualEntry } from "@/lib/state";
import { PageHeader, CustomDropdown } from "@/components/ui";
import { IconSearch, IconTrendingUp, IconTrendingDown, IconWallet, IconCalendar } from "@tabler/icons-react";

export default function BalancesPage() {
  const { categories, actuals, fxTranches, settings, isHydrated } = useSystemState();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="Balances" />
        <p className="text-sm text-zinc-555 font-medium">Loading portal state...</p>
      </div>
    );
  }

  // Calculate totals
  const totalBudgetUSD = categories.reduce(
    (sum, cat) => sum + (cat.isComputed ? 0 : cat.items.reduce((s, i) => s + i.budgetUSD, 0)),
    0
  );
  const totalBudgetNaira = totalBudgetUSD * settings.benchmarkRate;

  const totalReceivedUSD = fxTranches.reduce((sum, tr) => sum + tr.amountUSD, 0);
  const totalReceivedNaira = fxTranches.reduce((sum, tr) => sum + tr.amountNaira, 0);

  const totalSpentNaira = actuals
    .filter((act) => act.status === "activated")
    .reduce((sum, act) => sum + act.amountNaira, 0);
  const totalSpentUSD = actuals
    .filter((act) => act.status === "activated")
    .reduce((sum, act) => sum + act.amountUSD, 0);

  const remainingCashNaira = totalReceivedNaira - totalSpentNaira;
  const remainingCashUSD = totalReceivedUSD - totalSpentUSD;

  const filteredActuals = actuals
    .filter((act) => act.status === "activated")
    .filter((act) => {
      const matchesSearch =
        act.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "" || act.categoryCode === categoryFilter;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="space-y-8">
      <PageHeader title="Balances" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider">
              Program Budget
            </span>
            <IconWallet size={18} className="text-brand" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-zinc-950 block">
              ${totalBudgetUSD.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-500 font-medium block mt-1">
              ₦{totalBudgetNaira.toLocaleString()} (Benchmark @ ₦{settings.benchmarkRate}/$)
            </span>
          </div>
        </div>

        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider">
              Total Funding Received
            </span>
            <IconTrendingUp size={18} className="text-emerald-600" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-zinc-950 block">
              ${totalReceivedUSD.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-550 font-medium block mt-1">
              ₦{totalReceivedNaira.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider">
              Current Net Balance
            </span>
            <IconTrendingDown size={18} className="text-brand" />
          </div>
          <div className="mt-4">
            <span className={`text-2xl font-bold block ${remainingCashNaira < 0 ? "text-red-650" : "text-zinc-950"}`}>
              ₦{remainingCashNaira.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-555 font-medium block mt-1">
              Estimated: ${remainingCashUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Cash Ledger & Flow Ledger */}
      <div className="border border-zinc-200 bg-white rounded-2xl overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              General Cash Ledger
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Journal of all activated program expenditures and financial outlays.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-48">
              <input
                type="text"
                placeholder="Search ledger..."
                className="w-full border border-zinc-200 bg-zinc-50 pl-8 pr-3 py-1.5 text-xs text-zinc-900 focus:border-brand focus:bg-white focus:outline-none rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>

            <div className="w-40">
              <CustomDropdown
                options={[
                  { value: "", label: "All Categories" },
                  ...categories.map((c) => ({ value: c.code, label: c.name })),
                ]}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-1.5 text-xs !bg-zinc-50 focus:!bg-white"
              />
            </div>
          </div>
        </div>

        {filteredActuals.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No transaction records matched the filters.
          </div>
        ) : (
          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="font-bold text-zinc-500 bg-zinc-550/10">
                  <th className="p-3 rounded-l-xl">Date</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Payee</th>
                  <th className="p-3 text-right">Amount (NGN)</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-right rounded-r-xl">USD Equiv.</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {/* Empty spacer row for spacing */}
                <tr className="h-2"></tr>
                {filteredActuals.map((act) => (
                  <tr key={act.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3 text-zinc-500">
                      {new Date(act.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-mono font-semibold text-zinc-800">
                      {act.id.slice(0, 10).toUpperCase()}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-zinc-950 block">{act.itemName}</span>
                      <span className="text-[10px] text-brand font-bold tracking-wider">{act.categoryCode}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-zinc-800 block font-medium">{act.payeeName || "Project Vendor"}</span>
                      <span className="text-[10px] text-zinc-500">{act.payeeBank || "-"} - {act.payeeAccount || "-"}</span>
                    </td>
                    <td className="p-3 text-right font-bold text-zinc-950">
                      ₦{act.amountNaira.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-zinc-500">
                      ₦{act.exRate.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-semibold text-zinc-850">
                      ${act.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FX Tranches Card Ledger */}
      <div className="border border-zinc-200 bg-white rounded-2xl overflow-hidden">
        <div className="p-6">
          <h3 className="text-base font-bold text-zinc-900">
            USD Funding Tranches (FX Inflow Ledger)
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Historical log of incoming dollar cash calls converted to Naira.
          </p>
        </div>

        <div className="px-6 pb-6 space-y-3">
          {fxTranches.map((tr) => (
            <div key={tr.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <IconCalendar size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-950">
                    {tr.memo || "FX Conversion Inflow"}
                  </h4>
                  <span className="text-xs text-zinc-500 block font-medium">
                    Converted on {new Date(tr.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-bold text-zinc-950 block">
                  +${tr.amountUSD.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-550 block font-medium">
                  ₦{tr.amountNaira.toLocaleString()} @ ₦{tr.exRate}/$
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
