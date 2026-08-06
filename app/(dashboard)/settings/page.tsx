"use client";

import React, { useState } from "react";
import { useSystemState } from "@/lib/state";
import { PageHeader, CustomInput } from "@/components/ui";
import { IconSettings, IconRefresh, IconCheck } from "@tabler/icons-react";

export default function SettingsPage() {
  const { settings, updateSettings, resetAllData, isHydrated } = useSystemState();

  const [benchmarkRate, setBenchmarkRate] = useState("");
  const [level1Name, setLevel1Name] = useState("");
  const [level2Name, setLevel2Name] = useState("");
  const [level3Name, setLevel3Name] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAddress, setBankAddress] = useState("");

  // Initialize values when hydrated
  React.useEffect(() => {
    if (isHydrated && settings) {
      setBenchmarkRate(String(settings.benchmarkRate));
      setLevel1Name(settings.level1Name);
      setLevel2Name(settings.level2Name);
      setLevel3Name(settings.level3Name);
      setBankName(settings.bankName);
      setBankAccount(settings.bankAccount);
      setBankAddress(settings.bankAddress);
    }
  }, [isHydrated, settings]);

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" />
        <p className="text-sm text-zinc-555 font-medium">Loading portal state...</p>
      </div>
    );
  }

  const handleSubmitSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      benchmarkRate: Number(benchmarkRate),
      level1Name,
      level2Name,
      level3Name,
      bankName,
      bankAccount,
      bankAddress,
    });
    alert("System settings saved successfully!");
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all mock databases (transactions, tranches, notifications) to default seeded values?")) {
      resetAllData();
      alert("Portal state reset successfully!");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
            <div className="mb-4">
              <h3 className="text-base font-bold text-zinc-900">
                System Parameters & Metadata
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Configure rates, organization workflows, and bank metadata used for invoicing and generated documents.
              </p>
            </div>

            <form onSubmit={handleSubmitSettings} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-brand uppercase tracking-wider">
                  Conversion & Exchange Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInput
                    label="Benchmark Rate (NGN/$)"
                    type="number"
                    required
                    value={benchmarkRate}
                    onChange={(e) => setBenchmarkRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <h4 className="text-xs font-bold text-brand uppercase tracking-wider">
                  Role Names & Workflow Customization
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CustomInput
                    label="Level 1 Reviewer"
                    required
                    value={level1Name}
                    onChange={(e) => setLevel1Name(e.target.value)}
                  />
                  <CustomInput
                    label="Level 2 Manager"
                    required
                    value={level2Name}
                    onChange={(e) => setLevel2Name(e.target.value)}
                  />
                  <CustomInput
                    label="Level 3 Director"
                    required
                    value={level3Name}
                    onChange={(e) => setLevel3Name(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <h4 className="text-xs font-bold text-brand uppercase tracking-wider">
                  Program Bank Account Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInput
                    label="Bank Name"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                  <CustomInput
                    label="Account Number"
                    required
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
                <CustomInput
                  label="Bank Branch Address"
                  required
                  value={bankAddress}
                  onChange={(e) => setBankAddress(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-100">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <IconCheck size={16} />
                  Save System Parameters
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Reset Utility */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
            <h3 className="text-base font-bold text-red-650">
              Danger Zone
            </h3>
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Restores initial budget limits and deletes all transaction data.
            </p>

            <button
              type="button"
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-2 border border-red-200 bg-white hover:bg-red-50 text-red-650 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <IconRefresh size={16} />
              Reset Portal Databases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
