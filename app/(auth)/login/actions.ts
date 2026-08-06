"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  let role: string | null = null;

  if (
    email === process.env.SUPER_ADMIN_EMAIL &&
    password === process.env.SUPER_ADMIN_PASSWORD
  ) {
    role = "admin";
  } else if (
    email === process.env.DATA_ENTRY_EMAIL &&
    password === process.env.DATA_ENTRY_PASSWORD
  ) {
    role = "dataentry";
  } else if (
    email === process.env.LEVEL1_EMAIL &&
    password === process.env.LEVEL1_PASSWORD
  ) {
    role = "level1";
  } else if (
    email === process.env.LEVEL2_EMAIL &&
    password === process.env.LEVEL2_PASSWORD
  ) {
    role = "level2";
  } else if (
    email === process.env.LEVEL3_EMAIL &&
    password === process.env.LEVEL3_PASSWORD
  ) {
    role = "level3";
  }

  if (!role) {
    return { error: "Invalid email or password." };
  }

  // Set secure cookie
  const cookieStore = await cookies();
  cookieStore.set("issam_session", JSON.stringify({ email, role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/");
}
