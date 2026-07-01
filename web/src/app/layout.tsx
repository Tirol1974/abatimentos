import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { cn } from "../lib/utils"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <main className="container flex flex-col m-auto">
          <ThemeProvider>
            {children}
            <Toaster position="top-center" />
          </ThemeProvider>
        </main>
      </body>
    </html>
  )
}
