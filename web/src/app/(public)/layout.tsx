import { redirect } from "next/navigation";
import { getAuthenticatedAccount } from "../../lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const signedAccount = await getAuthenticatedAccount();

  console.log(signedAccount);

  if (signedAccount) {
    return redirect('/');
  }

  return (
    <div className="flex flex-col h-screen">
      {children}
    </div>
  );
}