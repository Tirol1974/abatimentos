
import { getAuthenticatedAccount } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: {
    default: "Tirol - Portal Abatimentos",
    template: `%s - Tirol - Portal Abatimentos`,
  },
  description: "Portal para solicitação de abatimentos na Tirol",
  icons: {
    icon: "../../../public/favicon.ico",
  },
};

export default async function ProtectedAuthLayout({ children }: { children: React.ReactNode }) {
  const signedAccount = await getAuthenticatedAccount();

  if (!signedAccount) {
    return redirect('/sign-in');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div>
        {children}
      </div>
    </div>
  );
}