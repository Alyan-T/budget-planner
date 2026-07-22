"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(mode === "signin" ? "/api/auth/login" : "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-[20px] py-[64px]">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl shadow-ambient p-[32px]">
        <div className="flex flex-col items-center text-center mb-[32px]">
          <div className="w-[48px] h-[48px] bg-primary rounded-lg flex items-center justify-center mb-4">
            <Wallet className="text-on-primary" size={24} />
          </div>
          <h1 className="text-[24px] font-semibold text-on-surface tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-[14px] text-on-surface-variant mt-2">
            {mode === "signin"
              ? "Enter your details to access your wealth planner."
              : "Start managing your finances beautifully."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[48px] px-4 bg-surface-container-low border border-outline-variant rounded-md text-[14px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[48px] px-4 bg-surface-container-low border border-outline-variant rounded-md text-[14px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-md text-[14px] font-medium border border-error/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] mt-2 bg-primary text-on-primary rounded-md text-[16px] font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {mode === "signin" && (
          <div className="mt-6 pt-4 border-t border-surface-dim text-center">
            <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Demo Credentials</p>
            <p className="text-[14px] text-on-surface">Email: <span className="font-mono text-primary">admin@test.com</span></p>
            <p className="text-[14px] text-on-surface">Password: <span className="font-mono text-primary">admin123</span></p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-surface-dim text-center">
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="text-[14px] font-medium text-secondary hover:text-primary transition-colors"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
