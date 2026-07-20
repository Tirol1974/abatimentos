'use client';

import { FileCheck2, LayoutDashboard, Settings, Users } from "lucide-react";
import { Item } from "@/components/ui/item";
import Link from "next/link";
import { useSignedAccount } from "../../store/signedAccount";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Homepage() {
  const {
    account
  } = useSignedAccount();

  const router = useRouter();

  useEffect(() => {
    if (!account) {
      return router.replace("/sign-in");
    }
  }, []);

  return (
    <div className="flex flex-col gap-5 py-5">
      <span className="text-2xl font-md text-center">Bem-vindo(a)</span>
      <div className="flex justify-center gap-5 flex-row flex-wrap">
        {account?.role == "admin" ? (
          <AdminMenu />
        ) : (
          <ClientMenu />
        )}
      </div>
    </div>
  );
}

const AdminMenu = () => {
  return (
    <>
      <Link href="/accounts" className="w-28 h-28 md:min-w-52 md:min-h-52">
        <Item
          variant={'outline'}
          className="flex flex-col items-center justify-center h-full hover:shadow-2xl"
        >
          <Users />
          <span>Contas</span>
        </Item>
      </Link>
      <Link href="/settings" className="w-28 h-28 md:min-w-52 md:min-h-52">
        <Item
          variant={'outline'}
          className="flex flex-col items-center justify-center h-full hover:shadow-2xl"
        >
          <Settings />
          <span>Configuração</span>
        </Item>
      </Link>
      <Link href="/abatimentos" className="w-28 h-28 md:min-w-52 md:min-h-52">
        <Item
          variant={'outline'}
          className="flex flex-col items-center justify-center h-full hover:shadow-2xl"
        >
          <FileCheck2 />
          <span>Abatimentos</span>
        </Item>
      </Link>
    </>
  );
}

const ClientMenu = () => {
  return (
    <>
      <Link href="/dashboard" className="w-28 h-28 md:min-w-52 md:min-h-52">
        <Item
          variant={'outline'}
          className="flex flex-col items-center justify-center h-full"
        >
          <LayoutDashboard />
          <span>Dashboard</span>
        </Item>
      </Link>
    </>
  );
}
