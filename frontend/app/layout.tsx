import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "HackX — Transparent, Evidence-Based Hackathon Evaluation",
  description:
    "HackX helps hackathons evaluate projects fairly using AI-generated evidence reports. Every finalized evaluation is hashed and anchored to blockchain, making it auditable and tamper-evident.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
