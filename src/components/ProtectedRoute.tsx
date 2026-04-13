"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/usAuth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/auth/login?next=${next}`);
    }
  }, [token, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex flex-1 min-h-[40vh] items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
          <p className="text-sm text-gray-400">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-1 min-h-[40vh] items-center justify-center py-12">
        <p className="text-sm text-gray-400">Redirecting to sign in…</p>
      </div>
    );
  }

  return <>{children}</>;
}
