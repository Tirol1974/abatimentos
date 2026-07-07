import localFont from 'next/font/local'

import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { getAuthenticatedAccount } from '@/lib/auth';
import { redirect } from 'next/navigation';

const customFont = localFont({
  src: [
    {
      path: "../fonts/StagSansRegular.ttf",
      weight: "400",
    },
    {
      path: "../fonts/StagSansMedium.ttf",
      weight: "500",
    },
    {
      path: "../fonts/StagSansSemiBold.ttf",
      weight: "600",
    },
    {
      path: "../fonts/StagSansBold.ttf",
      weight: "700",
    },
  ],
  variable: '--font-stag',
  display: 'swap'
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
    >
      <body className={`${customFont.variable} font-sans`}>
        <main className="container flex flex-col m-auto p-3">
          <ThemeProvider>
            {children}
            <Toaster position="top-center" />
          </ThemeProvider>
        </main>
      </body>
    </html>
  )
}
