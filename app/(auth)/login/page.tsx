"use client";

import React, { useActionState, useState } from "react";
import { loginAction } from "./actions";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-[400px] border border-zinc-200 bg-white p-8 rounded-2xl">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Sign In
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Enter your credentials to access your account.
        </p>

        <form action={formAction} className="mt-8 space-y-6">
          {state?.error && (
            <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-650 rounded-xl">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-brand focus:bg-white focus:outline-none focus:ring-0 rounded-xl"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full border border-zinc-200 bg-zinc-50 pl-3.5 pr-10 py-2.5 text-sm text-zinc-900 focus:border-brand focus:bg-white focus:outline-none focus:ring-0 rounded-xl"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 focus:outline-none"
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60 rounded-xl"
          >
            {isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
