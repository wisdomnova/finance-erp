"use client";

import React from "react";
import { IconLogout } from "@tabler/icons-react";

export function LogoutButton() {
  const handleLogout = async () => {
    // Delete session cookie via client-side trigger or API route
    document.cookie = "issam_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center justify-center gap-2 border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 rounded-xl"
    >
      <IconLogout size={16} />
      <span>Sign Out</span>
    </button>
  );
}
