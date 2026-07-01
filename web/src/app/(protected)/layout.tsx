import { Navbar } from "../../components/ui/navbar";
import { getAuthenticatedAccount } from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const signedAccount = await getAuthenticatedAccount();

  if (!signedAccount) {
    return redirect('/sign-in');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div>
        {children}
      </div>
    </div>
  )
}