"use client"
 
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircleIcon, MoreHorizontal, Trash, UserPen, UserStar, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatDateTime } from "@/lib/date";
import Link from "next/link";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { maskCNPJRoot } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { ApiErrorData } from "@/components/forms/SignIn";

export type Account = {
  id: string
  name: string
  email: string
  role: string
  cnpj_root: string
  created_at: Date
  updated_at: Date
}

export const getAccountColumns = ({
  toggleUpdateAccountsList,
}: {
  toggleUpdateAccountsList: () => void;
}): ColumnDef<Account>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "cnpj_role",
    header: "Raiz do CNPJ",
    cell: ({ row }) => { 
      if (row.original.cnpj_root == "") {
        return (
          <span>Não cadastrada</span>
        );
      } else {
        return (
          <span>{maskCNPJRoot(row.original.cnpj_root)}</span>
        );
      }
    }
  },
  {
    accessorKey: "role",
    header: "Perfil",
    cell: ({ row }) => {
      if (row.original.role == "admin") {
        return (
          <Badge variant={'secondary'}>
            Administrador
          </Badge>
        );
      } else {
        return (
          <Badge variant={'outline'}>
            Cliente
          </Badge>
        );
      }
    }
  },
  {
    accessorKey: "created_at",
    header: "Criado",
    cell: ({ row }) => { 
      return (
        <span>{formatDate(row.original.created_at)}</span>
      )
    }
  },
  {
    accessorKey: "updated_at",
    header: "Atualizado",
    cell: ({ row }) => { 
      return (
        <span>{formatDateTime(row.original.updated_at)}</span>
      )
    }
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => { 
      return (
        <AccountColumnsActions
          account={row.original}
          toggleUpdateAccountsList={toggleUpdateAccountsList}
        />
      );
    },
  },
]

type AccountColumnsActionsProps = {
  account: Account;
  toggleUpdateAccountsList: () => void;
}

const AccountColumnsActions = ({
  account,
  toggleUpdateAccountsList,
}: AccountColumnsActionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const deleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError({
      message: "",
      status: ""
    });

    try {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/${account.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!request.ok) {
        const data = await request.json() as ApiErrorData;

        setDeleteError(data);

        return;
      }

      toast.success("Conta deletada com sucesso");
      setDeleteDialogOpen(false);
      toggleUpdateAccountsList();
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ações</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <Link href={`/accounts/edit/${account.id}`}>
            <DropdownMenuItem>
              <UserPen />
              Editar conta
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onSelect={() => setDeleteDialogOpen(true)}
            variant="destructive"
          >
            <Trash />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);

          if (!open) {
            setDeleteError({
              message: "",
              status: ""
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja deletar essa conta?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Você está deletando a conta {account.name}
          </DialogDescription>
          {deleteError.message != "" && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Mensagem da API</AlertTitle>
              <AlertDescription>
                {deleteError.message}
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant={'destructive'}
              disabled={isDeleting}
              onClick={deleteAccount}
            >
              {isDeleting ? "Deletando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
