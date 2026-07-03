import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/PwaRegister";

export const metadata: Metadata = {
  title: "KAS PETANI",
  description: "Buku kas dan catatan kebun untuk petani.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Kas Petani",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
