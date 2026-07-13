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
import { Spinner } from '../ui/spinner';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import { SignedAccount, useSignedAccount } from '../../../store/signedAccount';
import { Separator } from '../ui/separator';
import Image from 'next/image';

const signInSchema = z.object({
  email: z.email("Insira um e-mail valido"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export type SignInAPIResponse = {
  account: SignedAccount
}

export type ApiErrorData = {
  status: string,
  message: string
}

export const SignInForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const router = useRouter();

  const {
    setSignedAccount
  } = useSignedAccount();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);
    try {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`, {
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

      const {
        account
      } = await request.json() as SignInAPIResponse;

      setSignedAccount(account);

      if (account.first_login) {
        return router.replace("/change-password");
      }

      return router.replace("/");
    } catch (error) {
      console.log(error);
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
          id='form-sign-in'
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
          <FieldGroup className="grid gap-2">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-password">
                    Senha
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="**************"
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
        <div>
          {apiError.message}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {form.formState.isSubmitting ? (
          <Button disabled type="submit" className="w-full">
            <Spinner data-icon="inline-start" />
            Entrando no sistema...
          </Button>
        ) : (
          <Button type="submit" className="w-full" form="form-sign-in">
            Entrar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}