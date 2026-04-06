// app/layout.tsx
import "./globals.css";
import Head from "next/head";
import Script from "next/script";
import { AuthProvider } from "../hooks/usAuth";
import Navbar from "../components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shift Audit AI",
  icons: {
    icon: '/favicon2.png', 
  },  
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <meta
          name="google-signin-client_id"
          content={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        />
      </Head>
      <body className="bg-[#0f0f2e] text-white">
        {/* Loads `window.google` after hydration */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />

        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

