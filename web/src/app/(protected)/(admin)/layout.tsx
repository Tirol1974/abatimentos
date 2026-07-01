import { getAuthenticatedAccount } from "../../../lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const signedAccount = await getAuthenticatedAccount();

  if (!signedAccount) {
    return redirect('/sign-in');
  }
  
  if (signedAccount.role != "admin") {
    return redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div>
        {children}
      </div>
    </div>
  );
}