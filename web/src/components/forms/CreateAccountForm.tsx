"use client";

import * as z from 'zod';
import { AlertCircleIcon } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ApiErrorData } from "./SignIn";
import { useRouter } from "next/navigation";
import { useSignedAccount } from "../../../store/signedAccount";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

const createAccountSchema = z.object({
  name: z.string(),
  email: z.email("Insira um e-mail valido"),
  role: z.enum(["admin", "operator"], "Insira uma função valida")
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

type CreateAccountAPIResponse = {
  account: {
    id: number,
    name: string,
    email: string,
    created_at: Date,
    updated_at: Date
  }
}

type AccountRoleType = {
  id: number
  name: string
  slug: string
  created_at: Date
  updated_at: Date
}

type CreateAccountFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const CreateAccountForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<AccountRoleType[]>([]);
  const [apiErrorFetchRoles, setApiErrorFetchRoles] = useState<ApiErrorData>({
    message: "",
    status: ""
  });
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const router = useRouter();

  const {
    setUpdateAccountsList,
    updateAccountsList
  } = useSignedAccount();

  const form = useFormContext<CreateAccountFormData>();

  useEffect(() => {
    async function loadRoles() {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/roles`,
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
        setApiErrorFetchRoles(data as ApiErrorData);
      }

      const roles = data as AccountRoleType[];

      setRoles(roles);
    }

    loadRoles();
  }, []);

  const onSubmit = async (data: CreateAccountFormData) => {
    setIsSubmitting(true);
    try {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!request.ok) {
        const data = await request.json() as ApiErrorData;

        setApiError(data);
      }

      toast.success("Conta criada com sucesso");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      {apiError.message != "" && (
        <Alert variant="destructive" className="max-w-md mb-3">
          <AlertCircleIcon />
          <AlertTitle>Mensagem da API</AlertTitle>
          <AlertDescription>
            {apiError.message}
          </AlertDescription>
        </Alert>
      )}
      {apiErrorFetchRoles.message != "" && (
        <Alert variant="destructive" className="max-w-md mb-3">
          <AlertCircleIcon />
          <AlertTitle>Mensagem da API</AlertTitle>
          <AlertDescription>
            {apiErrorFetchRoles.message}
          </AlertDescription>
        </Alert>
      )}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id='form-create-account'
        className="flex flex-col gap-3"
      >
        <FieldGroup>
          <Controller
            name='name'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-name">
                  Nome
                </FieldLabel>
                <Input
                  {...field}
                  id="form-name"
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="Nome do cliente"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <FieldGroup className="grid gap-2">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-email">
                  E-mail
                </FieldLabel>
                <Input
                  {...field}
                  id="form-email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="E-mail do cliente"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <FieldGroup className="grid gap-2">
          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-role">
                  Perfil
                </FieldLabel>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleciona o perfil da conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.slug}>{role.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </div>
  );
}
