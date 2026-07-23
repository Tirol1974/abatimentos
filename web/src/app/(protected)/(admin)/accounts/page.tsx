"use client";

import { CreateAccountModal } from "@/components/modals/CreateAccountModal";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AlertCircleIcon, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Account, getAccountColumns } from "./columns";
import { ApiErrorData } from "@/components/forms/SignIn";
import { AccountsDataTable } from "./data-table";
import { Spinner } from "@/components/ui/spinner";
import { BreadLinks } from "@/components/navigations/bread-links";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });
  const [updateAccountsList, setUpdateAccountsList] = useState(false);

  const toggleUpdateAccountsList = () => {
    setUpdateAccountsList(prev => !prev);
  }

  useEffect(() => {
    async function getAccounts() {
      setLoading(true);

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        }
      );
      const data = await request.json();

      if (!request.ok) {
        setLoading(false);


        setApiError(data as ApiErrorData);
      }

      setAccounts(data as Account[]);

      setLoading(false);
    }

    getAccounts();
  }, [ updateAccountsList ]);

  const renderTable = useMemo(() => {
    const accountColumns = getAccountColumns({
      toggleUpdateAccountsList,
    });

    return <AccountsDataTable columns={accountColumns} data={accounts} />
  }, [ accounts ]);

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <Spinner className="size-10" />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-5 px-3">
        <BreadLinks
          links={[
            {
              actual: false,
              address: '/',
              name: 'Home'
            },
            {
              actual: true,
              address: '/accounts',
              name: 'Contas'
            },
          ]}
        />
        <div className="flex flex-col gap-3">
          {apiError.message != "" && (
            <Alert variant="destructive" className="max-w-md mb-3">
              <AlertCircleIcon />
              <AlertTitle>Mensagem da API</AlertTitle>
              <AlertDescription>
                {apiError.message}
              </AlertDescription>
            </Alert>
          )}
          {accounts.length == 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <User />
                </EmptyMedia>
                <EmptyTitle>Nenhuma conta cadastrada</EmptyTitle>
                <EmptyDescription>No data found</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <CreateAccountModal
                  toggleUpdateAccountsList={toggleUpdateAccountsList}
                />
              </EmptyContent>
            </Empty>
          )}
          {accounts.length > 0 && (
            <div className="flex flex-col gap-3">
              <div>
                <CreateAccountModal
                  toggleUpdateAccountsList={toggleUpdateAccountsList}
                />
              </div>
              {renderTable}
            </div>
          )}
        </div>
      </div>
    );
  }
}
