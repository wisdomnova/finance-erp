"use client";

import React from "react";
import Link from "next/link";
import { useSystemState } from "@/lib/state";
import { PageHeader } from "@/components/ui";
import { IconChecks, IconPlus, IconTrendingUp, IconInbox, IconArrowUpRight } from "@tabler/icons-react";

export default function OverviewPage() {
  const { categories, actuals, fxTranches, settings, inbox, isHydrated } = useSystemState();

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="Overview" />
        <p className="text-sm text-zinc-555 font-medium">Loading portal state...</p>
      </div>
    );
  }

  // Calculate stats
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

  const remainingCashNaira = totalReceivedNaira - totalSpentNaira;

  const pendingL1Count = actuals.filter((a) => a.status === "pending_l1").length;
  const pendingL2Count = actuals.filter((a) => a.status === "pending_l2").length;
  const pendingL3Count = actuals.filter((a) => a.status === "pending_l3").length;
  const totalPendingCount = pendingL1Count + pendingL2Count + pendingL3Count;

  // Compute overall program budget utilization
  const totalUtilization = totalBudgetNaira > 0 ? (totalSpentNaira / totalBudgetNaira) * 100 : 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" />

      {/* Main KPI metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
            Program Budget
          </span>
          <span className="text-2xl font-bold text-zinc-950 block mt-2">
            ${totalBudgetUSD.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-500 font-medium block mt-1">
            ₦{totalBudgetNaira.toLocaleString()}
          </span>
        </div>

        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
            Funding Converted
          </span>
          <span className="text-2xl font-bold text-zinc-950 block mt-2">
            ${totalReceivedUSD.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-550 font-medium block mt-1">
            ₦{totalReceivedNaira.toLocaleString()}
          </span>
        </div>

        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
            Total Spent (Activated)
          </span>
          <span className="text-2xl font-bold text-emerald-600 block mt-2">
            ₦{totalSpentNaira.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-550 font-medium block mt-1">
            {totalUtilization.toFixed(1)}% Utilization rate
          </span>
        </div>

        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
            Net Cash Balance
          </span>
          <span className={`text-2xl font-bold block mt-2 ${remainingCashNaira < 0 ? "text-red-650" : "text-zinc-950"}`}>
            ₦{remainingCashNaira.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-550 font-medium block mt-1">
            Available in NGN account
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Quick Actions & Utilization */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Actions Panel */}
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
            <h3 className="text-base font-bold text-zinc-900 mb-4">
              Quick Operations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/entry"
                className="flex flex-col p-4 bg-zinc-50 hover:bg-brand/5 group rounded-xl border border-transparent hover:border-brand/20 transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-3">
                  <IconPlus size={16} />
                </div>
                <span className="text-sm font-bold text-zinc-900 group-hover:text-brand transition-colors">
                  Create Expenses
                </span>
                <span className="text-[10px] text-zinc-500 mt-1">
                  Add transactions to entry batch
                </span>
              </Link>

              <Link
                href="/approvals"
                className="flex flex-col p-4 bg-zinc-50 hover:bg-brand/5 group rounded-xl border border-transparent hover:border-brand/20 transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <IconChecks size={16} />
                </div>
                <span className="text-sm font-bold text-zinc-900 group-hover:text-brand transition-colors">
                  View Queue
                </span>
                {totalPendingCount > 0 ? (
                  <span className="text-[10px] text-brand font-bold mt-1">
                    {totalPendingCount} items awaiting sign-off
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 mt-1">
                    All transactions approved
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Budget category progress tracking */}
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Budget line utilization
              </h3>
              <Link
                href="/reports"
                className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover cursor-pointer"
              >
                Full report
                <IconArrowUpRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {categories.slice(0, 5).map((cat) => {
                const totalUSD = cat.items.reduce((s, i) => s + i.budgetUSD, 0);
                const totalNaira = totalUSD * settings.benchmarkRate;
                const catActuals = actuals.filter((act) => act.categoryCode === cat.code);
                const spentNaira = catActuals
                  .filter((act) => act.status === "activated")
                  .reduce((sum, act) => sum + act.amountNaira, 0);
                const percent = totalNaira > 0 ? (spentNaira / totalNaira) * 100 : 0;

                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-800 font-bold">{cat.name}</span>
                      <span className="text-zinc-550">
                        {percent.toFixed(0)}% (₦{spentNaira.toLocaleString()} / ₦{totalNaira.toLocaleString()})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-350"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Recent activity inbox */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <IconInbox size={18} className="text-brand" />
              <h3 className="text-base font-bold text-zinc-900">
                Program Inbox
              </h3>
            </div>

            {inbox.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No new messages or activity logs in your inbox.
              </div>
            ) : (
              <div className="space-y-3">
                {inbox.slice(0, 5).map((msg) => (
                  <div key={msg.id} className="bg-zinc-50 p-4 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-zinc-450 font-bold uppercase tracking-wider">
                      <span>{msg.type}</span>
                      <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h5 className="text-xs font-bold text-zinc-900">{msg.title}</h5>
                    <p className="text-xs text-zinc-550 leading-relaxed font-medium">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
