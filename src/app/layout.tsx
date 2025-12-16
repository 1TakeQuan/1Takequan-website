import type { Metadata } from "next";
import "./globals.css";
import ClientShell from "./components/ClientShell";

export const metadata: Metadata = {
  title: "1TakeQuan - Official Website",
  description: "Official website of rapper 1TakeQuan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}