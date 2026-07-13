import { Metadata } from "next";
import { Navbar } from "../../components/ui/navbar";
import { getAuthenticatedAccount } from "../../lib/auth";
import { redirect } from "next/navigation";

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

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const signedAccount = await getAuthenticatedAccount();

  if (!signedAccount) {
    return redirect('/sign-in');
  }

  return (
    <div className="flex flex-col">
      <div className="p-3">
        {children}
      </div>
    </div>
  )
}