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

import { useState } from "react";
import { ApiErrorData } from "./SignIn";
import { toast } from 'sonner';
import { maskCNPJ } from '@/lib/utils';

const AddCnpjToAccountSchema = z.object({
  account_id: z.number(),
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .refine((val) => val.length === 14, {
      message: 'CNPJ deve conter exatamente 14 números',
    }),
});

type AddCnpjToAccountFormData = z.infer<typeof AddCnpjToAccountSchema>;

type CreateAccountFormProps = {
  onOpenChange: () => void;
}

export const AddCnpjToAccountForm = ({
  onOpenChange
}: CreateAccountFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const form = useFormContext<AddCnpjToAccountFormData>();

  const onSubmit = async (data: AddCnpjToAccountFormData) => {
    setIsSubmitting(true);
    try {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/add-cnpjs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          cnpjs: [ data.cnpj ],
          account_id: data.account_id
        }),
      });

      if (!request.ok) {
        const data = await request.json() as ApiErrorData;

        setApiError(data);

        return;
      }

      toast.success("CNPJ adicionado com sucesso");

      onOpenChange();
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id='form-add-cnpj-to-account'
        className="flex flex-col gap-3"
      >
        <FieldGroup>
          <Controller
            name='cnpj'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-cnpj">
                  CNPJ
                </FieldLabel>
                <Input
                  {...field}
                  onChange={(e) => {
                    let formatedCnpj = maskCNPJ(e.target.value);
                    field.onChange(formatedCnpj);
                  }}
                  id="form-cnpj"
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="CNPJ do cliente"
                  autoComplete="off"
                />
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
