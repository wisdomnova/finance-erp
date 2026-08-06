import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("issam_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  let user = { role: "guest", email: "" };
  try {
    user = JSON.parse(sessionCookie.value);
  } catch (e) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
