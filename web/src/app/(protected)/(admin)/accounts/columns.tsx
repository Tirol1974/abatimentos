"use client"
 
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash, UserPen, UserStar, User } from "lucide-react";
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

export type Account = {
  id: string
  name: string
  email: string
  role: string
  created_at: Date
  updated_at: Date
}

export const account_collumns: ColumnDef<Account>[] = [
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
    accessorKey: "role",
    header: "Perfil",
    cell: ({ row }) => {
      if (row.original.role == "admin") {
        return (
          <div className="flex gap-2 items-center">
            <UserStar />
            <span>Administrador</span>
          </div>
        );
      } else {
        return (
          <div className="flex gap-2 items-center">
            <User />
            <span>Cliente</span>
          </div>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ações</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem>
              <UserPen />
              Editar conta
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash />
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]