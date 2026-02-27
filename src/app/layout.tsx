import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { DateProvider } from "@/context/DateContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OptiMetrics Analytics Platform",
  description: "Ad Performance Analytics Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <DateProvider>
          <Header />
          <div className="flex flex-1 pt-16">
            <Sidebar />
            <main className="flex-1 ml-64 p-6 overflow-y-auto bg-background">
              {children}
            </main>
          </div>
        </DateProvider>
      </body>
    </html>
  );
}
