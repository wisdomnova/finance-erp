"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";
import {
  IconLayoutDashboard,
  IconPlus,
  IconChecks,
  IconScale,
  IconCoin,
  IconReport,
  IconSettings,
} from "@tabler/icons-react";

interface SidebarProps {
  user: {
    role: string;
    email: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
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
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-zinc-200 bg-white">
      {/* Logo / Brand Header */}
      <div className="px-6 pt-8 pb-2">
        <span className="text-xl font-extrabold tracking-wider text-brand select-none">
          ISSAM
        </span>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 space-y-1.5 px-4 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* Footer Profile & Logout */}
      <div className="border-t border-zinc-200 p-4">
        <div className="flex flex-col gap-1.5 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 select-none">
            Active Role
          </span>
          <span className="text-sm font-medium text-zinc-900">
            {formatRole(user.role)}
          </span>
          <span className="truncate text-xs text-zinc-550">
            {user.email}
          </span>
        </div>
        <div className="mt-3">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
