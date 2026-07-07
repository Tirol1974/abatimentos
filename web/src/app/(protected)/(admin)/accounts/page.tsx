"use client";

import { CreateAccountModal } from "@/components/modals/CreateAccountModal";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Account, account_collumns } from "./columns";
import { ApiErrorData } from "@/components/forms/SignIn";
import { AccountsDataTable } from "./data-table";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

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

      if (!request.ok) {
        setLoading(false);

        const data = await request.json() as ApiErrorData;

        setApiError(data);
      }

      const response = await request.json() as Account[];

      setAccounts(response);

      setLoading(false);
    }

    getAccounts();
  }, [ updateAccountsList ]);

  const renderTable = useMemo(() => {
    return <AccountsDataTable columns={account_collumns} data={accounts} />
  }, [ accounts ]);

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <Spinner className="size-10" />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col p-3">
        <div className="flex flex-col gap-3">
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
