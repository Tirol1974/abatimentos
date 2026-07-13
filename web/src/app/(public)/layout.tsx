import { redirect } from "next/navigation";
import { getAuthenticatedAccount } from "../../lib/auth";
import { Metadata } from "next";

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

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const signedAccount = await getAuthenticatedAccount();

  if (signedAccount) {
    return redirect('/');
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-3">
      {children}
    </div>
  );
}