"use client";

import React, { useState } from "react";
import { useSystemState, Category, SubItem } from "@/lib/state";
import { PageHeader, CustomInput, CustomDropdown } from "@/components/ui";
import { IconTrash, IconPlus, IconFolderOpen, IconChevronDown, IconChevronRight } from "@tabler/icons-react";

interface BatchRow {
  itemId: string;
  itemName: string;
  categoryCode: string;
  amountNaira: string;
  exRate: string;
  docType: string;
  docName: string;
  payeeName: string;
  payeeBank: string;
  payeeAccount: string;
}

export default function DataEntryPage() {
  const { categories, addActualEntry, settings, actuals, isHydrated } = useSystemState();
  const [batch, setBatch] = useState<BatchRow[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "1": true,
  });

  if (!isHydrated) {
    return (
      <div>
        <PageHeader title="Data Entry" />
        <p className="text-sm text-zinc-500 font-medium">Loading portal state...</p>
      </div>
    );
  }

  const DOC_TYPES = [
    { value: "Receipt", label: "Receipt" },
    { value: "Invoice", label: "Invoice" },
    { value: "LPO", label: "L.P.O (Local Purchase Order)" },
    { value: "Payroll summary", label: "Payroll Summary" },
    { value: "Proof of payment", label: "Proof of Payment" },
    { value: "Delivery Note", label: "Delivery Note" },
    { value: "Contract agreement", label: "Contract Agreement" },
  ];

  const selectableItems = categories
    .filter((cat) => !cat.isComputed && cat.id !== "8" && cat.id !== "9")
    .flatMap((cat) =>
      cat.items.map((item) => ({
        value: item.id,
        label: `${cat.code} - ${item.code} ${item.name}`,
        itemName: item.name,
        categoryCode: cat.code,
      }))
    );

  const handleAddToBatch = (itemId: string) => {
    if (batch.some((row) => row.itemId === itemId)) return;
    const matched = selectableItems.find((item) => item.value === itemId);
    if (!matched) return;

    setBatch([
      ...batch,
      {
        itemId,
        itemName: matched.itemName,
        categoryCode: matched.categoryCode,
        amountNaira: "",
        exRate: String(settings.benchmarkRate),
        docType: "Invoice",
        docName: "",
        payeeName: "",
        payeeBank: "",
        payeeAccount: "",
      },
    ]);
  };

  const handleRemoveFromBatch = (itemId: string) => {
    setBatch(batch.filter((row) => row.itemId !== itemId));
  };

  const handleUpdateBatchRow = (itemId: string, field: keyof BatchRow, value: string) => {
    setBatch(
      batch.map((row) => {
        if (row.itemId === itemId) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  const handleFileChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpdateBatchRow(itemId, "docName", file.name);
    }
  };

  const isBatchValid =
    batch.length > 0 &&
    batch.every(
      (row) =>
        row.amountNaira &&
        Number(row.amountNaira) > 0 &&
        row.exRate &&
        Number(row.exRate) > 0 &&
        row.docName
    );

  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBatchValid) return;

    const entriesToSubmit = batch.map((row) => {
      const naira = Number(row.amountNaira);
      const rate = Number(row.exRate);
      return {
        itemId: row.itemId,
        itemName: row.itemName,
        categoryCode: row.categoryCode,
        amountNaira: naira,
        exRate: rate,
        amountUSD: naira / rate,
        docType: row.docType,
        docName: row.docName,
        payeeName: row.payeeName,
        payeeBank: row.payeeBank,
        payeeAccount: row.payeeAccount,
      };
    });

    addActualEntry(entriesToSubmit);
    setBatch([]);
    alert("Batch expenses submitted successfully to Level 1 review queue!");
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getDeliveryFeeStats = () => {
    const totalActivated = actuals
      .filter((act) => act.status === "activated" && Number(act.categoryCode.split("-")[1]) <= 7)
      .reduce((sum, act) => sum + act.amountNaira, 0);

    const feeNaira = totalActivated * 0.06;
    const feeUSD = feeNaira / settings.benchmarkRate;
    return { naira: feeNaira, usd: feeUSD };
  };

  const deliveryFee = getDeliveryFeeStats();

  const getItemStats = (itemId: string, budgetUSD: number) => {
    const itemActuals = actuals.filter((act) => act.itemId === itemId);
    const activatedNaira = itemActuals
      .filter((act) => act.status === "activated")
      .reduce((sum, act) => sum + act.amountNaira, 0);
    const pendingNaira = itemActuals
      .filter((act) => act.status !== "activated" && act.status !== "rejected")
      .reduce((sum, act) => sum + act.amountNaira, 0);

    const budgetNaira = budgetUSD * settings.benchmarkRate;
    const remainingNaira = budgetNaira - activatedNaira;

    return {
      budgetNaira,
      activatedNaira,
      pendingNaira,
      remainingNaira,
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Data Entry" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Batch Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl">
            <div className="mb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Create Entry Batch
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Select budget lines to populate your payment and document upload batch.
              </p>
            </div>

            <div className="mb-6">
              <CustomDropdown
                options={[
                  { value: "", label: "Choose a budget line item to add..." },
                  ...selectableItems.filter((opt) => !batch.some((b) => b.itemId === opt.value)),
                ]}
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddToBatch(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>

            {batch.length === 0 ? (
              <div className="border border-dashed border-zinc-200 rounded-xl p-12 text-center text-zinc-400 text-sm">
                No items in the current batch. Select a budget line above or click "+ Add" on the budget list to start.
              </div>
            ) : (
              <form onSubmit={handleSubmitBatch} className="space-y-6">
                <div className="space-y-4">
                  {batch.map((row) => (
                    <div
                      key={row.itemId}
                      className="border border-zinc-200 p-5 rounded-xl bg-zinc-50 relative space-y-4 hover:border-brand/40 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveFromBatch(row.itemId)}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-red-650 transition-colors cursor-pointer"
                      >
                        <IconTrash size={16} />
                      </button>

                      <div className="pr-8">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                          {row.categoryCode}
                        </span>
                        <h4 className="text-sm font-semibold text-zinc-900 mt-0.5">
                          {row.itemName}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <CustomInput
                          label="Amount (NGN)"
                          type="number"
                          required
                          placeholder="e.g. 500000"
                          value={row.amountNaira}
                          onChange={(e) => handleUpdateBatchRow(row.itemId, "amountNaira", e.target.value)}
                        />
                        <CustomInput
                          label="Exchange Rate"
                          type="number"
                          required
                          value={row.exRate}
                          onChange={(e) => handleUpdateBatchRow(row.itemId, "exRate", e.target.value)}
                        />
                        <CustomDropdown
                          label="Document Type"
                          options={DOC_TYPES}
                          value={row.docType}
                          onChange={(e) => handleUpdateBatchRow(row.itemId, "docType", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <CustomInput
                          label="Payee Name (Optional)"
                          value={row.payeeName}
                          placeholder="e.g. John Doe"
                          onChange={(e) => handleUpdateBatchRow(row.itemId, "payeeName", e.target.value)}
                        />
                        <CustomInput
                          label="Payee Bank (Optional)"
                          value={row.payeeBank}
                          placeholder="e.g. GTB"
                          onChange={(e) => handleUpdateBatchRow(row.itemId, "payeeBank", e.target.value)}
                        />
                        <CustomInput
                          label="Payee Account (Optional)"
                          value={row.payeeAccount}
                          placeholder="e.g. 0123456789"
                          onChange={(e) => handleUpdateBatchRow(row.itemId, "payeeAccount", e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                          Attachment (Receipt/Invoice)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-4 py-2 border border-zinc-200 bg-white rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer transition-colors">
                            <IconFolderOpen size={14} />
                            Choose File
                            <input
                              type="file"
                              className="hidden"
                              required={!row.docName}
                              onChange={(e) => handleFileChange(row.itemId, e)}
                            />
                          </label>
                          <span className="text-xs text-zinc-555 font-medium">
                            {row.docName || "No file attached (Required)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!isBatchValid}
                    className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-6 py-3 rounded-xl disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    Submit Batch ({batch.length} {batch.length === 1 ? "Item" : "Items"})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Hierarchy List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-zinc-200 bg-white rounded-2xl overflow-hidden">
            <div className="p-5">
              <h3 className="text-base font-bold text-zinc-900">
                Budget Hierarchy
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                View budget status and click "+" to add to batch.
              </p>
            </div>

            <div className="space-y-1">
              {categories.map((cat) => {
                const isExpanded = expandedCategories[cat.id];

                return (
                  <div key={cat.id} className="w-full">
                    {/* Category Title */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <IconChevronDown size={16} className="text-brand" />
                        ) : (
                          <IconChevronRight size={16} className="text-zinc-400" />
                        )}
                        <span className="text-xs font-bold text-zinc-400">{cat.code}</span>
                        <span className="text-sm font-bold text-zinc-800">{cat.name}</span>
                      </div>
                    </button>

                    {/* Category Items */}
                    {isExpanded && (
                      <div className="bg-zinc-50/50 px-4 pb-4 space-y-2.5">
                        {cat.items.map((item) => {
                          if (cat.isComputed) {
                            return (
                              <div key={item.id} className="py-3 flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-mono text-zinc-400">{item.code}</span>
                                    <h5 className="text-xs font-semibold text-zinc-800 truncate">{item.name}</h5>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 mt-0.5">
                                    6% of activated actuals 1-7
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-bold text-zinc-900 block">
                                    ₦{deliveryFee.naira.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 block">
                                    ${deliveryFee.usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          const stats = getItemStats(item.id, item.budgetUSD);
                          const isItemInBatch = batch.some((b) => b.itemId === item.id);

                          return (
                            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-mono text-zinc-400">{item.code}</span>
                                  <h5 className="text-xs font-semibold text-zinc-800 truncate">{item.name}</h5>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-455">
                                  <span>Budget: ${item.budgetUSD.toLocaleString()}</span>
                                  {stats.activatedNaira > 0 && (
                                    <span className="text-emerald-600 font-medium">Spent: ₦{stats.activatedNaira.toLocaleString()}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">
                                    Remaining
                                  </span>
                                  <span className={`text-xs font-bold ${stats.remainingNaira < 0 ? "text-red-650" : "text-zinc-800"}`}>
                                    ₦{stats.remainingNaira.toLocaleString()}
                                  </span>
                                </div>

                                {cat.id !== "8" && cat.id !== "9" && (
                                  <button
                                    type="button"
                                    disabled={isItemInBatch}
                                    onClick={() => handleAddToBatch(item.id)}
                                    className="flex items-center justify-center h-7 w-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-brand disabled:opacity-40 transition-colors cursor-pointer"
                                    title="Add to batch"
                                  >
                                    <IconPlus size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
