"use client";

import * as z from 'zod';
import { AlertCircleIcon } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";

import { useEffect, useState } from "react";
import { ApiErrorData } from "./SignIn";
import { useRouter } from "next/navigation";
import { useSignedAccount } from "../../../store/signedAccount";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { maskCNPJRoot } from '@/lib/utils';

const createAccountSchema = z.object({
  name: z.string(),
  email: z.email("Insira um e-mail valido"),
  cnpj_root: z.string(),
  role: z.enum(["admin", "cliente"], "Insira uma função valida")
}).superRefine(({ role, cnpj_root }, ctx) => {
  if (role == "cliente") {
    if (cnpj_root == "" || (cnpj_root.length < 10 || cnpj_root.length > 10)) {
      ctx.addIssue({
        code: "custom",
        path: ['cnpj_root'],
        message: "A raiz do CNPJ precisa ter 10 caracteres"
      });
    }
  }
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export type AccountRoleType = {
  id: number
  name: string
  slug: string
  created_at: Date
  updated_at: Date
}

type CreateAccountFormProps = {
  onOpenChange: () => void;
}

export const CreateAccountForm = ({
  onOpenChange
}: CreateAccountFormProps) => {
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
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          cnpj_root: data.cnpj_root.replaceAll(".", ""),
          role: data.role
        }),
      });

      if (!request.ok) {
        const data = await request.json() as ApiErrorData;

        setApiError(data);

        return;
      }

      toast.success("Conta criada com sucesso");

      onOpenChange();
    } catch (error) {
      console.log(error);
    }
  }

  const selectedRole = useWatch({
    control: form.control,
    name: 'role'
  });

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
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
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
        {selectedRole == "cliente" && (
          <FieldGroup className="grid gap-2">
            <Controller
              name="cnpj_root"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-cnpj-root">
                    Raiz do CNPJ
                  </FieldLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      let formatedCnpj = maskCNPJRoot(e.target.value);
                      field.onChange(formatedCnpj);
                    }}
                    id="form-cnpj-root"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Digite a raiz do CNPJ desse cliente"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        )}
      </form>
    </div>
  );
}
