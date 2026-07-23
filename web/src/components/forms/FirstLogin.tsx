"use client";

import * as z from 'zod';
import { AlertCircleIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import { Separator } from '../ui/separator';
import Image from 'next/image';
import { toast } from 'sonner';

const firstLoginSchema = z.object({
  email: z.email("Insira um e-mail valido"),
});

type FirstLoginFormData = z.infer<typeof firstLoginSchema>;

export type ApiErrorData = {
  status: string,
  message: string
}

type FirstLoginFormProps = {
  toggleForm: () => void;
}

export const FirstLoginForm = ({
  toggleForm
}: FirstLoginFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const router = useRouter();

  const form = useForm<FirstLoginFormData>({
    resolver: zodResolver(firstLoginSchema),
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data: FirstLoginFormData) => {
    setIsSubmitting(true);
    setApiError({
      message: "",
      status: ""
    });

    try {
      const token = await window.grecaptcha.enterprise.execute(`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`, {
        action: "first_login",
      });

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/first-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          recaptcha_token: token
        }),
      });

      if (!request.ok) {
        const response = await request.json();

        setApiError(response as ApiErrorData);
        
        return;
      }

      toast.success("Enviamos uma nova senha para o e-mail cadastrado no SAP");

      toggleForm();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="md:m-auto max-w-100 flex-1">
      <CardHeader className='flex items-center justify-center'>
        <CardTitle>
          <Image
            width={100}
            height={100}
            src="/images/logo_tirol_abatimentos.png"
            alt='Logo portal'
          />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
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
          id='form-first-login'
          className="flex flex-col gap-3"
        >
          <FieldGroup>
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-email">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="joe@example.com"
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
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" form="form-first-login" disabled={isSubmitting}>
          {isSubmitting ? "Checando sua solicitação..." : "Solicitar acesso"}
        </Button>
        <Button variant={'ghost'} type="button" className="w-full" onClick={() => toggleForm()}>
          Voltar
        </Button>
      </CardFooter>
    </Card>
  );
}
