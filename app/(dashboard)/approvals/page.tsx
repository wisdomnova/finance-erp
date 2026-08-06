"use client";

import React, { useState } from "react";
import { useSystemState, ActualEntry } from "@/lib/state";
import { PageHeader, CustomTextArea, CustomCheckbox } from "@/components/ui";
import { IconCheck, IconX, IconMessage, IconFileDescription, IconDownload, IconPrinter } from "@tabler/icons-react";

export default function ApprovalsPage() {
  const { actuals, updateActualEntry, settings, isHydrated } = useSystemState();
  const [activeTab, setActiveTab] = useState<"level1" | "level2" | "level3">("level1");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [previewDoc, setPreviewDoc] = useState<ActualEntry | null>(null);
  
  // L3 selection for bank instruction
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [generatedLetter, setGeneratedLetter] = useState<{
    reference: string;
    date: string;
    items: ActualEntry[];
    totalNaira: number;
  } | null>(null);

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader title="Approvals" />
        <p className="text-sm text-zinc-550 font-medium">Loading portal state...</p>
      </div>
    );
  }

  // Filter actuals based on the active approval queue tab
  const getFilteredQueue = () => {
    switch (activeTab) {
      case "level1":
        return actuals.filter((act) => act.status === "pending_l1");
      case "level2":
        return actuals.filter((act) => act.status === "pending_l2");
      case "level3":
        return actuals.filter((act) => act.status === "pending_l3");
      default:
        return [];
    }
  };

  const queue = getFilteredQueue();

  const handleApprove = (entry: ActualEntry) => {
    const now = new Date().toISOString();
    let nextStatus: ActualEntry["status"] = "activated";
    let actionName = "Activated";
    let reviewerName = settings.level3Name;

    if (entry.status === "pending_l1") {
      nextStatus = "pending_l2";
      actionName = "Approved L1";
      reviewerName = settings.level1Name;
    } else if (entry.status === "pending_l2") {
      nextStatus = "pending_l3";
      actionName = "Approved L2";
      reviewerName = settings.level2Name;
    }

    const updatedHistory = [...entry.history, { action: actionName, by: reviewerName, timestamp: now }];
    updateActualEntry(entry.id, {
      status: nextStatus,
      history: updatedHistory,
    });
  };

  const handleReject = (entry: ActualEntry) => {
    const now = new Date().toISOString();
    let reviewerName = settings.level1Name;
    if (entry.status === "pending_l2") reviewerName = settings.level2Name;
    if (entry.status === "pending_l3") reviewerName = settings.level3Name;

    const updatedHistory = [...entry.history, { action: "Rejected", by: reviewerName, timestamp: now }];
    updateActualEntry(entry.id, {
      status: "rejected",
      history: updatedHistory,
    });
  };

  const handleAddComment = (entryId: string, authorRole: string, authorName: string) => {
    const text = commentInputs[entryId]?.trim();
    if (!text) return;

    const entry = actuals.find((act) => act.id === entryId);
    if (!entry) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: authorName,
      role: authorRole,
      text,
      timestamp: new Date().toISOString(),
    };

    updateActualEntry(entryId, {
      comments: [...entry.comments, newComment],
    });

    setCommentInputs({ ...commentInputs, [entryId]: "" });
  };

  // Toggle item selection in L3
  const handleToggleSelectItem = (id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // L3 Approve & Generate payment instruction letter
  const handleGeneratePaymentInstruction = () => {
    const selectedList = actuals.filter((act) => selectedItems[act.id] && act.status === "pending_l3");
    if (selectedList.length === 0) return;

    const totalNaira = selectedList.reduce((sum, item) => sum + item.amountNaira, 0);
    const referenceNum = `BANK-PYMT-${Date.now().toString().slice(-6)}`;
    const now = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Update statuses to activated
    const timestamp = new Date().toISOString();
    selectedList.forEach((item) => {
      updateActualEntry(item.id, {
        status: "activated",
        history: [
          ...item.history,
          {
            action: `Approved L3 & Paid (Ref: ${referenceNum})`,
            by: settings.level3Name,
            timestamp,
          },
        ],
      });
    });

    setGeneratedLetter({
      reference: referenceNum,
      date: now,
      items: selectedList,
      totalNaira,
    });

    // Reset selection state
    setSelectedItems({});
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Approvals" />

      {/* Queue Selection Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 pb-px">
        {[
          { id: "level1", label: settings.level1Name, count: actuals.filter((a) => a.status === "pending_l1").length },
          { id: "level2", label: settings.level2Name, count: actuals.filter((a) => a.status === "pending_l2").length },
          { id: "level3", label: settings.level3Name, count: actuals.filter((a) => a.status === "pending_l3").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setGeneratedLetter(null);
            }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-brand text-brand font-semibold"
                : "border-transparent text-zinc-550 hover:text-zinc-900"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-brand/10 text-brand text-xs font-semibold px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* L3 Batch Payment Action Bar */}
      {activeTab === "level3" && queue.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-zinc-200 bg-white rounded-xl">
          <div className="text-sm font-medium text-zinc-700">
            {Object.values(selectedItems).filter(Boolean).length} of {queue.length} items selected for payment instruction.
          </div>
          <button
            onClick={handleGeneratePaymentInstruction}
            disabled={Object.values(selectedItems).filter(Boolean).length === 0}
            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60 transition-colors cursor-pointer"
          >
            <IconPrinter size={16} />
            Approve & Generate Payment Instruction
          </button>
        </div>
      )}

      {/* Instruction Letter Display Panel */}
      {generatedLetter && (
        <div className="border border-zinc-200 bg-white p-8 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Generated Letter</span>
              <h3 className="text-lg font-bold text-zinc-950">Payment Instruction</h3>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <IconPrinter size={14} />
              Print / Save PDF
            </button>
          </div>

          {/* Letter Template */}
          <div className="border border-zinc-200 p-8 bg-zinc-50/50 rounded-xl space-y-6 text-sm text-zinc-800 font-sans max-w-3xl mx-auto">
            <div className="text-right space-y-1">
              <span className="font-semibold text-zinc-950 block">Reference: {generatedLetter.reference}</span>
              <span className="text-zinc-500 block">Date: {generatedLetter.date}</span>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-zinc-950 block">The Bank Manager</span>
              <span className="block">{settings.bankName}</span>
              <span className="block text-zinc-550">{settings.bankAddress}</span>
            </div>

            <div className="font-bold text-zinc-950 border-b border-zinc-200 pb-2">
              SUBJECT: PAYMENT INSTRUCTION FOR APPROVED PROJECT DISBURSEMENTS
            </div>

            <p className="leading-relaxed">
              Please execute payments from our project account number <span className="font-semibold text-zinc-950">{settings.bankAccount}</span> to the beneficiaries detailed in the schedule below, being approved expenses under the ISSAM project:
            </p>

            <table className="w-full border-collapse border border-zinc-200 text-xs text-left">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-250">
                  <th className="p-2.5 font-bold border border-zinc-200">Budget Line</th>
                  <th className="p-2.5 font-bold border border-zinc-200">Payee Account Details</th>
                  <th className="p-2.5 font-bold border border-zinc-200 text-right">Amount (NGN)</th>
                </tr>
              </thead>
              <tbody>
                {generatedLetter.items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-200">
                    <td className="p-2.5 border border-zinc-200">
                      <span className="font-semibold block">{item.itemName}</span>
                      <span className="text-zinc-500 font-mono">{item.categoryCode}</span>
                    </td>
                    <td className="p-2.5 border border-zinc-200">
                      <span className="font-semibold block">{item.payeeName || "Project Vendor"}</span>
                      <span className="text-zinc-500">{item.payeeBank || "Bank Details Pending"} - {item.payeeAccount || "-"}</span>
                    </td>
                    <td className="p-2.5 border border-zinc-200 text-right font-semibold">
                      ₦{item.amountNaira.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-zinc-50 font-bold">
                  <td colSpan={2} className="p-2.5 border border-zinc-200 text-right">Total Amount:</td>
                  <td className="p-2.5 border border-zinc-200 text-right text-brand">
                    ₦{generatedLetter.totalNaira.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="leading-relaxed pt-2">
              Thank you for your prompt execution of these instructions.
            </p>

            <div className="pt-6 grid grid-cols-2 gap-8 border-t border-zinc-200">
              <div className="space-y-4">
                <div className="h-10 border-b border-zinc-250 border-dashed"></div>
                <div>
                  <span className="font-semibold text-zinc-950 block">Authorized Signatory 1</span>
                  <span className="text-xs text-zinc-500">Project Coordinator</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-10 border-b border-zinc-250 border-dashed"></div>
                <div>
                  <span className="font-semibold text-zinc-950 block">Authorized Signatory 2</span>
                  <span className="text-xs text-zinc-500">Director of Finance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Queue Items */}
      {queue.length === 0 ? (
        <div className="border border-zinc-200 bg-white rounded-2xl p-12 text-center text-zinc-500 text-sm">
          No transactions currently awaiting review in this queue.
        </div>
      ) : (
        <div className="space-y-6">
          {queue.map((entry) => (
            <div
              key={entry.id}
              className="border border-zinc-200 bg-white p-6 rounded-2xl flex flex-col lg:flex-row gap-6 items-start"
            >
              {/* Checkbox (Level 3 Batch Selection only) */}
              {activeTab === "level3" && (
                <div className="pt-1.5 self-start shrink-0">
                  <CustomCheckbox
                    checked={!!selectedItems[entry.id]}
                    onChange={() => handleToggleSelectItem(entry.id)}
                  />
                </div>
              )}

              {/* Transaction Main Details */}
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                      {entry.categoryCode}
                    </span>
                    <h4 className="text-base font-bold text-zinc-950 mt-0.5">
                      {entry.itemName}
                    </h4>
                    <span className="block text-xs text-zinc-500 mt-1 font-medium">
                      Submitted on {new Date(entry.submittedAt).toLocaleDateString()} at {new Date(entry.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold text-zinc-950 block">
                      ₦{entry.amountNaira.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-550 block font-medium">
                      USD {entry.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} @ ₦{entry.exRate}/$
                    </span>
                  </div>
                </div>

                {/* Meta details row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50 p-4 rounded-xl text-xs text-zinc-700">
                  <div>
                    <span className="font-bold text-zinc-450 block mb-0.5">PAYEE DETAILS</span>
                    <span className="font-semibold text-zinc-900 block">{entry.payeeName || "No payee name specified"}</span>
                    <span className="text-zinc-500 block">{entry.payeeBank || "No bank"} - {entry.payeeAccount || "No account"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-450 block mb-0.5">VERIFICATION</span>
                    <span className="font-semibold text-zinc-900 block">Type: {entry.docType}</span>
                    <span className="text-zinc-500 block">{entry.docName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-450 block mb-0.5">CURRENT STAGE</span>
                    <span className="font-semibold text-brand block">{entry.status.toUpperCase().replace("_", " ")}</span>
                    <span className="text-zinc-550 block">Approved levels: {entry.history.length - 1}</span>
                  </div>
                </div>

                {/* Comment Thread */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">
                    Review Discussion
                  </span>
                  
                  {entry.comments.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No notes left on this transaction yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {entry.comments.map((comm) => (
                        <div key={comm.id} className="text-xs border border-zinc-200/60 p-3 rounded-xl bg-zinc-50/50">
                          <div className="flex items-center justify-between font-semibold text-zinc-900 mb-1">
                            <span>{comm.author} ({comm.role.toUpperCase()})</span>
                            <span className="text-zinc-500 font-medium">
                              {new Date(comm.timestamp).toLocaleDateString()} {new Date(comm.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-zinc-650 font-normal leading-relaxed">{comm.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment input */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <CustomTextArea
                        placeholder="Leave a note or reason..."
                        rows={1}
                        className="min-h-[42px] max-h-[80px]"
                        value={commentInputs[entry.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [entry.id]: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddComment(entry.id, activeTab, activeTab === "level1" ? settings.level1Name : activeTab === "level2" ? settings.level2Name : settings.level3Name)}
                      className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-800 p-2.5 rounded-xl cursor-pointer transition-colors shrink-0 self-end h-[42px]"
                      title="Post note"
                    >
                      <IconMessage size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons sidebar (Except for Level 3 which uses top payment instruction bar) */}
              <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-36 shrink-0 lg:border-l border-zinc-250 lg:pl-6 pt-4 lg:pt-0">
                {activeTab !== "level3" && (
                  <button
                    onClick={() => handleApprove(entry)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <IconCheck size={14} />
                    Approve
                  </button>
                )}
                <button
                  onClick={() => handleReject(entry)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-650 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <IconX size={14} />
                  Reject
                </button>
                <button
                  onClick={() => setPreviewDoc(entry)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-650 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <IconFileDescription size={14} />
                  View Doc
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 max-w-2xl w-full rounded-2xl overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">Document Viewer</span>
                <h4 className="text-base font-bold text-zinc-950">{previewDoc.docName}</h4>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Simulated Receipt/Invoice Content */}
            <div className="border border-zinc-200 p-8 bg-zinc-50/50 rounded-xl space-y-6 text-sm text-zinc-800">
              <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
                <div className="space-y-1">
                  <span className="text-lg font-bold text-brand block">ISSAM</span>
                  <span className="text-xs text-zinc-500 font-medium">Supporting Evidence</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Doc Type</span>
                  <span className="font-semibold text-zinc-900">{previewDoc.docType}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-zinc-450 block">BUDGET LINE</span>
                  <span className="text-zinc-800">{previewDoc.itemName} ({previewDoc.categoryCode})</span>
                </div>
                <div>
                  <span className="font-bold text-zinc-450 block">DATE SUBMITTED</span>
                  <span className="text-zinc-800">{new Date(previewDoc.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="font-bold text-zinc-450 block">PAYEE DETAILS</span>
                  <span className="text-zinc-800 block">{previewDoc.payeeName || "N/A"}</span>
                  <span className="text-zinc-500">{previewDoc.payeeBank || "N/A"} - {previewDoc.payeeAccount || "-"}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-zinc-450 block">AMOUNT DEMAND</span>
                  <span className="text-base font-bold text-zinc-950 block mt-0.5">
                    ₦{previewDoc.amountNaira.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    USD {previewDoc.amountUSD.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 text-center text-xs text-zinc-400 italic">
                * This is a simulated document view of {previewDoc.docName}.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="border border-zinc-200 hover:bg-zinc-50 text-zinc-650 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); alert("File download started (Simulated)"); }}
                className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <IconDownload size={14} />
                Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
