"use client";

import { useState, useEffect } from "react";

export interface SubItem {
  id: string;
  code: string;
  name: string;
  budgetUSD: number;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  items: SubItem[];
  isComputed?: boolean;
}

export interface ActualEntry {
  id: string;
  itemId: string;
  itemName: string;
  categoryCode: string;
  amountNaira: number;
  exRate: number;
  amountUSD: number;
  docType: string;
  docName: string;
  payeeName: string;
  payeeBank: string;
  payeeAccount: string;
  status: "pending_l1" | "pending_l2" | "pending_l3" | "activated" | "rejected";
  submittedAt: string;
  comments: {
    id: string;
    author: string;
    role: string;
    text: string;
    timestamp: string;
  }[];
  history: {
    action: string;
    by: string;
    timestamp: string;
  }[];
}

export interface FxTranche {
  id: string;
  date: string;
  amountUSD: number;
  exRate: number;
  amountNaira: number;
  memo: string;
}

export interface SystemSettings {
  benchmarkRate: number;
  level1Name: string;
  level2Name: string;
  level3Name: string;
  bankName: string;
  bankAccount: string;
  bankAddress: string;
}

export interface InboxMessage {
  id: string;
  sender: string;
  receiver: string;
  type: string;
  title: string;
  message: string;
  refId?: string;
  read: boolean;
  timestamp: string;
}

// Initial budget categories structure
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "1",
    code: "CAT-01",
    name: "Personnel Costs",
    items: [
      { id: "1-1", code: "1.1", name: "Project Coordinator", budgetUSD: 48000 },
      { id: "1-2", code: "1.2", name: "Finance Officer", budgetUSD: 36000 },
      { id: "1-3", code: "1.3", name: "IT Support Specialist", budgetUSD: 24000 },
      { id: "1-4", code: "1.4", name: "Program Assistant", budgetUSD: 18000 },
    ],
  },
  {
    id: "2",
    code: "CAT-02",
    name: "Travel & Logistics",
    items: [
      { id: "2-1", code: "2.1", name: "Vehicle Leasing", budgetUSD: 15000 },
      { id: "2-2", code: "2.2", name: "Fuel & Maintenance", budgetUSD: 8000 },
      { id: "2-3", code: "2.3", name: "Domestic Flights", budgetUSD: 12000 },
      { id: "2-4", code: "2.4", name: "Staff Travel Per Diem", budgetUSD: 10000 },
    ],
  },
  {
    id: "3",
    code: "CAT-03",
    name: "Office Operations",
    items: [
      { id: "3-1", code: "3.1", name: "Office Rent", budgetUSD: 20000 },
      { id: "3-2", code: "3.2", name: "Utilities & Power", budgetUSD: 6000 },
      { id: "3-3", code: "3.3", name: "Internet & Communications", budgetUSD: 4800 },
      { id: "3-4", code: "3.4", name: "Stationery & Supplies", budgetUSD: 3000 },
    ],
  },
  {
    id: "4",
    code: "CAT-04",
    name: "Equipment & Assets",
    items: [
      { id: "4-1", code: "4.1", name: "Laptops & Accessories", budgetUSD: 16000 },
      { id: "4-2", code: "4.2", name: "Office Furniture", budgetUSD: 8000 },
      { id: "4-3", code: "4.3", name: "Generator (30kVA)", budgetUSD: 12000 },
      { id: "4-4", code: "4.4", name: "Network Infrastructure", budgetUSD: 5000 },
    ],
  },
  {
    id: "5",
    code: "CAT-05",
    name: "Workshops & Training",
    items: [
      { id: "5-1", code: "5.1", name: "Hall Rental & Facilities", budgetUSD: 14000 },
      { id: "5-2", code: "5.2", name: "Catering Services", budgetUSD: 18000 },
      { id: "5-3", code: "5.3", name: "Training Materials", budgetUSD: 6000 },
      { id: "5-4", code: "5.4", name: "Participant Travel Subsidies", budgetUSD: 22000 },
    ],
  },
  {
    id: "6",
    code: "CAT-06",
    name: "Consulting & Legal",
    items: [
      { id: "6-1", code: "6.1", name: "Annual Audit Fees", budgetUSD: 10000 },
      { id: "6-2", code: "6.2", name: "Legal Advisory Retainer", budgetUSD: 8000 },
      { id: "6-3", code: "6.3", name: "M&E External Consultant", budgetUSD: 15000 },
    ],
  },
  {
    id: "7",
    code: "CAT-07",
    name: "Contingency & Misc",
    items: [
      { id: "7-1", code: "7.1", name: "Emergency Contingency Fund", budgetUSD: 25000 },
      { id: "7-2", code: "7.2", name: "General Miscellaneous Expenses", budgetUSD: 10000 },
    ],
  },
  {
    id: "8",
    code: "CAT-08",
    name: "Bank Interest",
    items: [
      { id: "8-1", code: "8.1", name: "Earned Savings Interest", budgetUSD: 0 },
    ],
  },
  {
    id: "9",
    code: "CAT-09",
    name: "Bank Charges",
    items: [
      { id: "9-1", code: "9.1", name: "Account Maintenance Charges", budgetUSD: 0 },
    ],
  },
  {
    id: "10",
    code: "CAT-10",
    name: "Delivery Fee",
    isComputed: true,
    items: [
      { id: "10-1", code: "10.1", name: "6% Delivery Fee (Categories 1-7)", budgetUSD: 0 },
    ],
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  benchmarkRate: 1600,
  level1Name: "Level 1 Reviewer",
  level2Name: "Level 2 Manager",
  level3Name: "Level 3 Director",
  bankName: "Guaranty Trust Bank (GTB)",
  bankAccount: "0123456789",
  bankAddress: "Plot 1234, Adetokunbo Ademola Crescent, Wuse II, Abuja",
};

export const INITIAL_ACTUALS: ActualEntry[] = [
  {
    id: "act-1",
    itemId: "1-1",
    itemName: "Project Coordinator",
    categoryCode: "CAT-01",
    amountNaira: 3200000,
    exRate: 1600,
    amountUSD: 2000,
    docType: "Payroll summary",
    docName: "payroll_october_2026.pdf",
    payeeName: "Staff Payroll",
    payeeBank: "Access Bank",
    payeeAccount: "0011223344",
    status: "activated",
    submittedAt: "2026-10-01T10:00:00Z",
    comments: [],
    history: [
      { action: "Submitted", by: "Data Entry", timestamp: "2026-10-01T10:00:00Z" },
      { action: "Approved L1", by: "Level 1 Reviewer", timestamp: "2026-10-01T14:00:00Z" },
      { action: "Approved L2", by: "Level 2 Manager", timestamp: "2026-10-02T09:00:00Z" },
      { action: "Activated", by: "Level 3 Director", timestamp: "2026-10-02T16:00:00Z" },
    ],
  },
  {
    id: "act-2",
    itemId: "3-1",
    itemName: "Office Rent",
    categoryCode: "CAT-03",
    amountNaira: 8000000,
    exRate: 1600,
    amountUSD: 5000,
    docType: "Invoice",
    docName: "office_rent_invoice_2026.pdf",
    payeeName: "Wuse Real Estate Ltd",
    payeeBank: "Zenith Bank",
    payeeAccount: "1012345678",
    status: "pending_l2",
    submittedAt: "2026-10-03T11:30:00Z",
    comments: [
      { id: "c-1", author: "Level 1 Reviewer", role: "level1", text: "Invoice verification complete. Rent details match contract.", timestamp: "2026-10-03T15:00:00Z" }
    ],
    history: [
      { action: "Submitted", by: "Data Entry", timestamp: "2026-10-03T11:30:00Z" },
      { action: "Approved L1", by: "Level 1 Reviewer", timestamp: "2026-10-03T15:00:00Z" },
    ],
  },
];

export const INITIAL_FX: FxTranche[] = [
  {
    id: "fx-1",
    date: "2026-09-15",
    amountUSD: 50000,
    exRate: 1600,
    amountNaira: 80000000,
    memo: "Initial Program Tranche Funding",
  },
];

export function useSystemState() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [actuals, setActuals] = useState<ActualEntry[]>([]);
  const [fxTranches, setFxTranches] = useState<FxTranche[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [inbox, setInbox] = useState<InboxMessage[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedActuals = localStorage.getItem("issam_actuals");
      const storedFx = localStorage.getItem("issam_fx");
      const storedSettings = localStorage.getItem("issam_settings");
      const storedInbox = localStorage.getItem("issam_inbox");
      const storedCategories = localStorage.getItem("issam_categories");

      setActuals(storedActuals ? JSON.parse(storedActuals) : INITIAL_ACTUALS);
      setFxTranches(storedFx ? JSON.parse(storedFx) : INITIAL_FX);
      setSettings(storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS);
      setCategories(storedCategories ? JSON.parse(storedCategories) : INITIAL_CATEGORIES);
      setInbox(storedInbox ? JSON.parse(storedInbox) : []);
      setIsHydrated(true);
    }
  }, []);

  const saveToStorage = (key: string, data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const addActualEntry = (entries: Omit<ActualEntry, "id" | "status" | "submittedAt" | "comments" | "history">[]) => {
    const now = new Date().toISOString();
    const newEntries: ActualEntry[] = entries.map((entry, idx) => ({
      ...entry,
      id: `act-${Date.now()}-${idx}`,
      status: "pending_l1",
      submittedAt: now,
      comments: [],
      history: [{ action: "Submitted", by: "Data Entry", timestamp: now }],
    }));

    const updated = [...actuals, ...newEntries];
    setActuals(updated);
    saveToStorage("issam_actuals", updated);

    // Create notifications for Level 1 Approver
    const newMsgs: InboxMessage[] = newEntries.map((entry, idx) => ({
      id: `msg-${Date.now()}-${idx}`,
      sender: "Data Entry",
      receiver: "level1",
      type: "Approval Request",
      title: "New Expense Review Required",
      message: `A new entry for "${entry.itemName}" of NGN ${entry.amountNaira.toLocaleString()} requires Level 1 review.`,
      refId: entry.id,
      read: false,
      timestamp: now,
    }));
    const updatedInbox = [...inbox, ...newMsgs];
    setInbox(updatedInbox);
    saveToStorage("issam_inbox", updatedInbox);
  };

  const updateActualEntry = (id: string, updatedFields: Partial<ActualEntry>) => {
    const updated = actuals.map((act) => {
      if (act.id === id) {
        const next = { ...act, ...updatedFields };
        return next;
      }
      return act;
    });
    setActuals(updated);
    saveToStorage("issam_actuals", updated);
  };

  const addFxTranche = (tranche: Omit<FxTranche, "id">) => {
    const newTranche: FxTranche = {
      ...tranche,
      id: `fx-${Date.now()}`,
    };
    const updated = [...fxTranches, newTranche];
    setFxTranches(updated);
    saveToStorage("issam_fx", updated);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveToStorage("issam_settings", updated);
  };

  const updateCategoryBudget = (catId: string, itemId: string, usdAmount: number) => {
    const updatedCats = categories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, budgetUSD: usdAmount };
            }
            return item;
          }),
        };
      }
      return cat;
    });
    setCategories(updatedCats);
    saveToStorage("issam_categories", updatedCats);
  };

  const resetAllData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("issam_actuals");
      localStorage.removeItem("issam_fx");
      localStorage.removeItem("issam_settings");
      localStorage.removeItem("issam_inbox");
      localStorage.removeItem("issam_categories");
      setActuals(INITIAL_ACTUALS);
      setFxTranches(INITIAL_FX);
      setSettings(DEFAULT_SETTINGS);
      setCategories(INITIAL_CATEGORIES);
      setInbox([]);
    }
  };

  return {
    categories,
    actuals,
    fxTranches,
    settings,
    inbox,
    isHydrated,
    addActualEntry,
    updateActualEntry,
    addFxTranche,
    updateSettings,
    updateCategoryBudget,
    resetAllData,
  };
}

