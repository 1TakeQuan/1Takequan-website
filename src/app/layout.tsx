import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import LayoutContent from "@/components/LayoutContent";

export const metadata: Metadata = {
  title: "1TakeQuan - Official Website",
  description: "Official website of rapper 1TakeQuan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <PlayerProvider>
          <LayoutContent>{children}</LayoutContent>
        </PlayerProvider>
      </body>
    </html>
  );
}