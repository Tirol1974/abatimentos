"use client";

import { CreateAccountModal } from "@/components/modals/CreateAccountModal";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { Account, account_collumns } from "./columns";
import { ApiErrorData } from "@/components/forms/SignIn";
import { AccountsDataTable } from "./data-table";
import { Spinner } from "@/components/ui/spinner";
import { useSignedAccount } from "../../../../../store/signedAccount";

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const {
    updateAccountsList
  } = useSignedAccount();

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
                <CreateAccountModal />
              </EmptyContent>
            </Empty>
          )}
          {accounts.length > 0 && (
            <div className="flex flex-col gap-3">
              <div>
                <CreateAccountModal />
              </div>
              <AccountsDataTable columns={account_collumns} data={accounts} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
