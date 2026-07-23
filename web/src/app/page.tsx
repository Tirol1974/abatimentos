import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecaptchaCleanup } from "@/components/security/RecaptchaCleanup";
import { LayoutDashboard, Navigation, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedAccount } from "@/lib/auth";

export default async function Homepage() {
  const account = await getAuthenticatedAccount();

  if (!account) {
    return redirect("/sign-in");
  }

  return (
    <>
      <RecaptchaCleanup />
      {account.role == "admin" ? (
        <AdminHome name={account.name} />
      ) : (
        <ClientHome name={account.name} />
      )}
    </>
  );
}

const AdminHome = ({ name }: { name: string }) => {
  return (
    <div className="flex flex-col gap-4 py-10">
      <Badge variant="secondary" className="w-fit">Administração</Badge>
      <div className="flex items-start gap-3">
        <Navigation className="mt-1 size-6 text-muted-foreground" />
        <div className="flex max-w-2xl flex-col gap-2">
          <h1 className="text-2xl font-semibold">Bem-vindo(a), {name}</h1>
          <p className="text-sm text-muted-foreground">
            Use a navegação superior para acessar contas, abatimentos, configurações e informações do portal.
          </p>
        </div>
      </div>
    </div>
  );
}

const ClientHome = ({ name }: { name: string }) => {
  return (
    <div className="flex flex-col gap-4 py-10">
      <Badge variant="secondary" className="w-fit">Portal de Abatimentos</Badge>
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 size-6 text-muted-foreground" />
        <div className="flex max-w-2xl flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Bem-vindo(a), {name}</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe suas devoluções, selecione as notas disponíveis e consulte o andamento das solicitações.
            </p>
          </div>

          <Button asChild className="w-fit">
            <Link href="/dashboard">
              <LayoutDashboard />
              Acessar dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
