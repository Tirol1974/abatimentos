"use client";

import { ApiErrorData } from "@/components/forms/ChangePasswordForm";
import { CnpjTabContent } from "@/components/tabs/account/cnpjs/cnpjs";
import { InfoTabContent } from "@/components/tabs/account/edit/info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/date";
import { FolderArchive, Save, User, UserPen } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type AccountType = {
  id: number
  name: string
  email: string
  role: "admin" | "operator"
  first_login: boolean
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
    <div className="px-3 flex flex-col gap-3">
      <Tabs defaultValue="info">
        <TabsList variant="line">
          <TabsTrigger value="info">
            <User />
            Informações
          </TabsTrigger>
          <TabsTrigger value="cnpjs">
            <FolderArchive />
            CNPJs
          </TabsTrigger>
        </TabsList>
        {updateContent}
        <TabsContent value="cnpjs" className="py-3">
          <CnpjTabContent account_id={Number(id)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}