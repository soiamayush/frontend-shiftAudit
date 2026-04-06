// src/components/GoogleLoginButton.tsx
"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_ROUTES } from "@/config";

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleCredentialResponse = useCallback(async (response: typeof google.accounts.id.CredentialResponse) => {
    const res = await fetch(API_ROUTES.GOOGLE_AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } else {
      console.error(data.error);
    }
  }, [router]);

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
      document.getElementById("google-signin")!,
      { theme: "outline", size: "large" }
    );
  }, [handleCredentialResponse]);


  return <div id="google-signin"></div>;
}
