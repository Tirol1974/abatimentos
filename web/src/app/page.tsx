'use client';

import { LayoutDashboard, Settings, Users } from "lucide-react";
import { Item } from "@/components/ui/item";
import Link from "next/link";
import { useSignedAccount } from "../../store/signedAccount";

export default function Dashboardpage() {
  const {
    account
  } = useSignedAccount();

  return (
    <div className="flex flex-col gap-5 py-5">
      <span className="text-2xl font-md">Bem-vindo(a)</span>
      <div className="flex flex-col gap-5 md:flex-row md:justify-between flex-wrap">
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
      <Link href="/accounts" className="md:min-w-52 h-52">
        <Item
          variant={'outline'}
          className="flex flex-col items-center justify-center h-full"
        >
          <Users />
          <span>Contas</span>
        </Item>
      </Link>
      <Link href="/settings" className="md:min-w-52 h-52">
        <Item
          variant={'outline'}
          className="flex flex-col items-center justify-center h-full"
        >
          <Settings />
          <span>Configuração</span>
        </Item>
      </Link>
    </>
  );
}

const ClientMenu = () => {
  return (
    <>
      <Link href="/dashboard" className="md:min-w-52 h-52">
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
