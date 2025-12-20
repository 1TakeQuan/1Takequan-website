import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import LayoutContent from "@/components/LayoutContent";
import { PlayerProvider, usePlayer } from "@/contexts/PlayerContext";

export const metadata: Metadata = {
  title: "1TakeQuan - Official Website",
  description: "Official website of rapper 1TakeQuan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* ...other head tags... */}
      </head>
      <body className="bg-black text-white">
        <ClientProviders>
          <PlayerProvider>
            <LayoutContent>{children}</LayoutContent>
            {/* <FloatingPlayer /> */}
          </PlayerProvider>
        </ClientProviders>
      </body>
    </html>
  );
}