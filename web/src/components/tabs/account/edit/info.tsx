"use client";

import { AccountType } from "@/app/(protected)/(admin)/accounts/edit/[id]/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/date";
import { AlertCircleIcon, Save } from "lucide-react";
import * as z from 'zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner";
import { ApiErrorData } from "@/components/forms/ChangePasswordForm";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountRoleType } from "@/components/forms/CreateAccountForm";
import { Button } from "@/components/ui/button";
import { maskCNPJRoot } from "@/lib/utils";

type InfoTabContentProps = {
  account: AccountType
  loading: boolean
  updateData: () => void
}

const updateAccountSchema = z.object({
  account_id: z.number(),
  name: z.string(),
  email: z.email("Insira um e-mail valido"),
  cnpj_root: z.string().min(10, "A raiz precisa ter 10 caracteres").max(10, "A raiz precisa ter 10 caracteres"),
  role: z.enum(["admin", "cliente"], "Insira uma função valida")
});

type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;

export const InfoTabContent = ({
  account,
  loading,
  updateData
}: InfoTabContentProps) => {
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });
  const [roles, setRoles] = useState<AccountRoleType[]>([]);
  const [apiErrorFetchRoles, setApiErrorFetchRoles] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const form = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      account_id: account.id,
      name: account.name,
      email: account.email,
      cnpj_root: maskCNPJRoot(account.cnpj_root),
      role: account.role
    }
  });

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

  const onSubmit = async (data: UpdateAccountFormData) => {
    setApiError({
      message: "",
      status: ""
    });

    try {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          account_id: data.account_id,
          name: data.name,
          email: data.email,
          role: data.role,
          cnpj_root: data.cnpj_root.replaceAll(".", ""),
        }),
      });

      if (!request.ok) {
        const data = await request.json() as ApiErrorData;

        setApiError(data);

        return;
      }

      toast.success("Informações atualizadas com sucesso");

      updateData();
    } catch (error) {
      console.log(error);
    }
  }

  const selectedRole = useWatch({
    control: form.control,
    name: 'role'
  });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">Informações de contato</CardTitle>
        <Button type="submit" form="update-account">
          <Save />
        </Button>
      </CardHeader>
      <Separator />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center">
            <Spinner className="size-10" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {apiError.message != "" && (
              <Alert variant="destructive" className="break-all whitespace-pre-wrap">
                <AlertCircleIcon />
                <AlertTitle>Mensagem da API</AlertTitle>
                <AlertDescription>
                  {apiError.message}
                </AlertDescription>
              </Alert>
            )}
            {apiErrorFetchRoles.message != "" && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Mensagem da API</AlertTitle>
                <AlertDescription>
                  {apiError.message}
                </AlertDescription>
              </Alert>
            )}
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-5 md:flex-row md:justify-between md:flex-wrap"
              id="update-account"
            >
              {account && (
                <>
                  <FieldGroup className="md:max-w-96 hidden">
                    <Controller
                      name='account_id'
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="form-id">
                            ID
                          </FieldLabel>
                          <Input
                            {...field}
                            id="form-id"
                            type="number"
                            aria-invalid={fieldState.invalid}
                            placeholder="Entre com um nome para a conta"
                            autoComplete="off"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                  <FieldGroup className="md:max-w-96">
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
                            placeholder="Entre com um nome para a conta"
                            autoComplete="off"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                  <FieldGroup className="md:max-w-96">
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
                  <FieldGroup className="md:max-w-96">
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
                            defaultValue={account.role}
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
                    <FieldGroup className="md:max-w-96">
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
                  <FieldGroup className="md:max-w-96">
                    <Field>
                      <FieldLabel>Atividade</FieldLabel>
                      <Input defaultValue={account.first_login ? "Nunca acessou o sistema" : "Já fez login"} disabled/>
                    </Field>
                  </FieldGroup>
                  <FieldGroup className="md:max-w-96">
                    <Field>
                      <FieldLabel>Criado em</FieldLabel>
                      <Input defaultValue={formatDateTime(account.created_at)} disabled />
                    </Field>
                  </FieldGroup>
                  <FieldGroup className="md:max-w-96">
                    <Field>
                      <FieldLabel>Última atualização em</FieldLabel>
                      <Input defaultValue={formatDateTime(account.updated_at)} disabled />
                    </Field>
                  </FieldGroup>
                </>
              )}
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
