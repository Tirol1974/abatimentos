"use client";

import { ApiErrorData } from "@/components/forms/ChangePasswordForm";
import { AddCnpjToAccountModal } from "@/components/modals/AddCnpjToAccountModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { maskCNPJ } from "@/lib/utils";
import { Folder, Trash } from "lucide-react";
import { useEffect, useState } from "react";

type CnpjTabContentProps = {
  account_id: number
}
export type AccountCnpj = {
  id: number
  cnpj: string
  account_id: number
  created_at: Date
  updated_at: Date
}

export type ApiSuccessResponse = {
  cnpjs: AccountCnpj[]
}

export const CnpjTabContent = ({
  account_id
}: CnpjTabContentProps) => {
  const [open, setOpen] = useState(false);
  const [accountCnpjs, setAccountCnpjs] = useState<AccountCnpj[]>([]);
  const [updateCnpjsList, setUpdateCnpjsList] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  useEffect(() => {
    async function loadAccountCnpjs() {
      const query_string = `?signed=false&account_id=${account_id}`;

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/cnpjs${query_string}`,
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
        setApiError(data as ApiErrorData);

        return;
      }

      const {
        cnpjs
      } = data as ApiSuccessResponse;

      setAccountCnpjs(cnpjs);
    }

    loadAccountCnpjs();
  }, [ updateCnpjsList ]);

  const toggleUpdateCnpjsList = () => {
    setUpdateCnpjsList(prev => !prev);
  }
  
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">CNPJ's</CardTitle>
        <AddCnpjToAccountModal
          toggleUpdateCnpjsList={toggleUpdateCnpjsList}
          account_id={account_id}
        />
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-3">
        <div className="mb-5">
          <Input type="search" placeholder="Buscar CNPJ" className="max-w-96" maxLength={14} />
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
          {accountCnpjs.length > 0 ? (
            accountCnpjs.map((data) => (
              <Item key={data.id} variant={'outline'} className="max-w-96">
                <ItemContent>
                  <span>{maskCNPJ(data.cnpj)}</span>
                </ItemContent>
                <ItemActions>
                  <Dialog open={open} onOpenChange={setOpen} >
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Remover CNPJ?</DialogTitle>
                        <DialogDescription>
                          Você quer mesmo remover esse CNPJ?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button variant={'destructive'}>
                          <Trash />
                          Sim
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </ItemActions>
              </Item>
            ))
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Folder />
                </EmptyMedia>
                <EmptyTitle>Nenhum CNPJ cadastrado</EmptyTitle>
                <EmptyDescription>Sem dados encontrados</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
