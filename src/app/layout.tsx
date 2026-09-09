import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Detronics ID — QRIS Live Display",
  description: "Live QRIS Payment Dashboard & Stream Overlay for Detronics ID",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#050d1a]">{children}</body>
    </html>
  )
}
