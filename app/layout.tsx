// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { GlobalProvider } from "../context/GlobalProvider";
import { ThemeProvider } from "@/context/Theme";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOTATE",
  description: "เว็บสำหรับจดบันทึกและจัดการงาน",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme");
  const cookieConsent = cookieStore.get("cookie-consent");
  const initialTheme = (themeCookie?.value || "light") as "light" | "dark";
  return (
    <html lang="en" className={initialTheme === "dark" ? "dark" : "light"}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider initialTheme={initialTheme}>
          <GlobalProvider>
            {children}
          </GlobalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
