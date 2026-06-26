"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setSubmitting(false);
    if (!response.ok) {
      setError("Invalid email or password");
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full rounded-2xl border border-white/10 bg-surface p-6"
      >
        <h1 className="font-display text-3xl text-white">Admin Login</h1>
        <p className="mt-2 text-sm text-muted">Use your env admin credentials.</p>
        <div className="mt-5 space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? <p className="text-sm text-accent">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>
    </div>
  );
}
