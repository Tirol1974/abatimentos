"use client";

import { ApiErrorData } from "@/components/forms/ChangePasswordForm";
import { BreadLinks } from "@/components/navigations/bread-links";
import { InfoTabContent } from "@/components/tabs/account/edit/info";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type AccountType = {
  id: number
  name: string
  email: string
  role: "admin" | "cliente"
  first_login: boolean
  cnpj_root: string
  created_at: Date
  updated_at: Date
}

type ApiSuccessResponseType = {
  account: AccountType
}

export default function AccountEditPage() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountType | null>();
  const [updateAccountData, setUpdateAccountData] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const {
    id
  } = useParams<{ id: string }>();

  useEffect(() => {
    async function loadAccount() {
      try {
        const request = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/account/${id}/details`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        const apiData = await request.json();

        if (!request.ok) {
          setLoading(false);

          setApiError(apiData as ApiErrorData);
        }
        setAccount((apiData as ApiSuccessResponseType).account);
        
        setLoading(false);
      } catch (error) { 
        setLoading(false);

        console.log(error);
      }
    }

    loadAccount();
  }, [ updateAccountData ]);

  const updateAccount = () => {
    setUpdateAccountData(prev => !prev);
  }

  const updateContent = useMemo(() => {
    return (
      <TabsContent value="info" className="py-3">
        {account && (
          <InfoTabContent
            loading={loading}
            account={account}
            updateData={updateAccount}
          />
        )}
      </TabsContent>
    );
  }, [ updateAccountData, account ]);

  return (
    <div className="px-3 flex flex-col gap-5">
      <BreadLinks
        links={[
          {
            actual: false,
            address: '/',
            name: 'Home'
          },
          {
            actual: false,
            address: '/accounts',
            name: 'Contas'
          },
          {
            actual: true,
            address: '/accounts/edit',
            name: 'Editando conta de usuário'
          },
        ]}
      />
      <Tabs defaultValue="info">
        <TabsList variant="line">
          <TabsTrigger value="info">
            <User />
            Informações
          </TabsTrigger>
        </TabsList>
        {updateContent}
      </Tabs>
    </div>
  );
}