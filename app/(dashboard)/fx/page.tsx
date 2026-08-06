"use client";

import React, { useState } from "react";
import { useSystemState } from "@/lib/state";
import { PageHeader, CustomInput } from "@/components/ui";
import { IconPlus, IconCalculator } from "@tabler/icons-react";

export default function FxPage() {
  const { fxTranches, addFxTranche, settings, isHydrated } = useSystemState();
  
  // Tranche Form State
  const [amountUSD, setAmountUSD] = useState("");
  const [exRate, setExRate] = useState(String(settings.benchmarkRate));
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Calculator State
  const [calcUSD, setCalcUSD] = useState("1000");
  const [calcRate, setCalcRate] = useState(String(settings.benchmarkRate));

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="Funds & FX" />
        <p className="text-sm text-zinc-555 font-medium">Loading portal state...</p>
      </div>
    );
  }

  const handleSubmitTranche = (e: React.FormEvent) => {
    e.preventDefault();
    const usd = Number(amountUSD);
    const rate = Number(exRate);
    if (!usd || !rate) return;

    addFxTranche({
      date,
      amountUSD: usd,
      exRate: rate,
      amountNaira: usd * rate,
      memo: memo || "FX Funding inflow",
    });

    setAmountUSD("");
    setMemo("");
    alert("New funding tranche recorded successfully!");
  };

  const totalUSD = fxTranches.reduce((sum, tr) => sum + tr.amountUSD, 0);
  const totalNaira = fxTranches.reduce((sum, tr) => sum + tr.amountNaira, 0);
  const averageExRate = totalUSD > 0 ? totalNaira / totalUSD : settings.benchmarkRate;

  const derivedNaira = Number(calcUSD) * Number(calcRate);

  return (
    <div className="space-y-8">
      <PageHeader title="Funds & FX" />

      {/* FX Stats Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">
            Total USD Funding
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950">
              ${totalUSD.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">
            Total Naira Value
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950">
              ₦{totalNaira.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
          <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">
            Weighted Average Rate
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand">
              ₦{averageExRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Calculator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Record Tranche Form */}
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
            <div className="mb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Record Funding Tranche
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Enter cash call details when incoming dollar funding has been converted to Naira.
              </p>
            </div>

            <form onSubmit={handleSubmitTranche} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="USD Amount"
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(e.target.value)}
                />
                <CustomInput
                  label="Conversion Rate (NGN/$)"
                  type="number"
                  required
                  placeholder="e.g. 1650"
                  value={exRate}
                  onChange={(e) => setExRate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="Value Date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <CustomInput
                  label="Memo Description"
                  placeholder="e.g. Tranche 2 Funding conversion"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <IconPlus size={16} />
                  Record Tranche
                </button>
              </div>
            </form>
          </div>

          {/* Quick FX Calculator */}
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
            <div className="mb-4 flex items-center gap-2">
              <IconCalculator size={18} className="text-brand" />
              <h3 className="text-base font-bold text-zinc-900">
                Conversion Calculator
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput
                label="USD Value"
                type="number"
                value={calcUSD}
                onChange={(e) => setCalcUSD(e.target.value)}
              />
              <CustomInput
                label="Rate"
                type="number"
                value={calcRate}
                onChange={(e) => setCalcRate(e.target.value)}
              />
            </div>

            <div className="mt-4 p-4 bg-zinc-50 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-500 uppercase tracking-wider">Estimated Naira Value</span>
              <span className="text-base font-bold text-zinc-950">
                ₦{(derivedNaira || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Historical List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-zinc-200 bg-white rounded-2xl overflow-hidden">
            <div className="p-5">
              <h3 className="text-base font-bold text-zinc-900">
                Conversion History
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Log of converted tranches and exchange rates.
              </p>
            </div>

            <div className="px-5 pb-5 space-y-3">
              {fxTranches.map((tr) => (
                <div key={tr.id} className="bg-zinc-50 p-4 rounded-xl space-y-2 hover:border-brand/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-500">
                      {new Date(tr.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-bold text-zinc-400 font-mono">
                      {tr.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900">{tr.memo}</h5>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs font-medium text-zinc-550">
                      ${tr.amountUSD.toLocaleString()} @ ₦{tr.exRate}
                    </span>
                    <span className="text-sm font-bold text-zinc-950">
                      ₦{tr.amountNaira.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
