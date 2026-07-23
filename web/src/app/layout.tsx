import localFont from 'next/font/local'

import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { Metadata } from 'next';
import { Navbar } from '@/components/ui/navbar';
import { getAuthenticatedAccount } from '@/lib/auth';

export const metadata: Metadata = {
  title: {
    default: "Tirol - Portal Abatimentos",
    template: `%s - Tirol - Portal Abatimentos`,
  },
  description: "Portal para solicitação de abatimentos na Tirol",
  icons: {
    icon: "/favicon.ico",
  },
};

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
  const signedAccount = await getAuthenticatedAccount();

  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
    >
      <body className={`${customFont.variable} font-sans`}>
        <main className="container flex flex-col h-screen m-auto p-3">
          <ThemeProvider>
            <Navbar initialAccount={signedAccount} />
            {children}
            <Toaster position="top-center" />
          </ThemeProvider>
        </main>
      </body>
    </html>
  )
}
