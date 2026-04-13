"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/usAuth";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function AuthGate({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading || !token) return;
    router.replace(safeNextPath(searchParams.get("next")));
  }, [loading, token, router, searchParams]);

  if (!loading && token) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center bg-[#0a0a0f]">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
        </div>
      }
    >
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}
