"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutButton as CustomLogout } from "../app/(dashboard)/LogoutButton";
import {
  IconLayoutDashboard,
  IconPlus,
  IconChecks,
  IconScale,
  IconCoin,
  IconReport,
  IconSettings,
} from "@tabler/icons-react";

interface MobileNavProps {
  user: {
    role: string;
    email: string;
  };
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/", icon: IconLayoutDashboard },
    { label: "Data Entry", href: "/entry", icon: IconPlus },
    { label: "Approvals", href: "/approvals", icon: IconChecks },
    { label: "Balances", href: "/balances", icon: IconScale },
    { label: "Funds & FX", href: "/fx", icon: IconCoin },
    { label: "Reports", href: "/reports", icon: IconReport },
    { label: "Settings", href: "/settings", icon: IconSettings },
  ];

  const formatRole = (role: string) => {
    switch (role) {
      case "admin":
        return "Super Admin";
      case "dataentry":
        return "Data Entry";
      case "level1":
        return "Level 1 Approver";
      case "level2":
        return "Level 2 Approver";
      case "level3":
        return "Level 3 Approver";
      default:
        return role;
    }
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-zinc-650 hover:text-zinc-950 cursor-pointer"
        >
          <IconMenu2 size={24} />
        </button>
        <span className="text-lg font-extrabold tracking-wider text-brand select-none">
          ISSAM
        </span>
        <div className="w-6" /> {/* Spacer for balance */}
      </header>

      {/* Slide-out Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            {/* Sidebar content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white"
            >
              {/* Sidebar Header */}
              <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-150">
                <span className="text-lg font-extrabold tracking-wider text-brand select-none">
                  ISSAM
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-zinc-950 cursor-pointer"
                >
                  <IconX size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-xl cursor-pointer ${
                        isActive
                          ? "bg-brand/10 text-brand font-semibold"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-brand" : "text-zinc-400"}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* User profile & logout footer */}
              <div className="border-t border-zinc-200 p-4">
                <div className="flex flex-col gap-1 px-3 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                    Active Role
                  </span>
                  <span className="text-sm font-bold text-zinc-900">
                    {formatRole(user.role)}
                  </span>
                  <span className="truncate text-xs text-zinc-550">
                    {user.email}
                  </span>
                </div>
                <div className="mt-3">
                  <CustomLogout />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
