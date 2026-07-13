import { Metadata } from "next";
import { getAuthenticatedAccount } from "../../../lib/auth";
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

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const signedAccount = await getAuthenticatedAccount();

  if (signedAccount?.role != "admin") {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <div>
        {children}
      </div>
    </div>
  );
}