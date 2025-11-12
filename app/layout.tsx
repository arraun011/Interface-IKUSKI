import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ConfigProvider } from "@/contexts/config-context"
import { AnalysisProvider } from "@/contexts/analysis-context"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IKUSKI - AI Rust Detection System",
  description: "Professional drone-based rust detection powered by AI",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`font-sans antialiased`}>
        <ConfigProvider>
          <AnalysisProvider>
            {children}
            <Toaster />
          </AnalysisProvider>
        </ConfigProvider>
        <Analytics />
      </body>
    </html>
  )
}
