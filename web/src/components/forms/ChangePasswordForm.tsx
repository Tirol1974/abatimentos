"use client";

import * as z from 'zod';
import { AlertCircleIcon, Eye, EyeOff } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
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
import { InputGroup, InputGroupButton, InputGroupInput } from '../ui/input-group';

const changePasswordSchema = z
  .object({
    password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não são iguais",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

type ChangePasswordAPIResponse = {
  account: SignedAccount
}

export type ApiErrorData = {
  status: string,
  message: string
}

export const ChangePasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const {
    account
  } = useSignedAccount();

  const router = useRouter();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  }

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "PATCH",
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

      return router.replace("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Card className="flex-1 max-w-112.5 md:m-auto">
      <CardHeader className='flex flex-col gap-2 items-center'>
        <CardTitle className='text-2xl'>Tirol Abatimentos</CardTitle>
        <CardDescription>
          Altere sua senha para continuar
        </CardDescription>
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
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-password">
                    Senha
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="form-password"
                      type={showPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      placeholder="*********************"
                      autoComplete="off"
                    />
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                      <span className="sr-only">{showPassword ? "Ocultar senha" : "Exibir senha"}</span>
                    </InputGroupButton>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup className="grid gap-2">
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-confirm-password">
                    Confirme sua senha
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="form-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      placeholder="*********************"
                      autoComplete="off"
                    />
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      onClick={toggleShowConfirmPassword}
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                      <span className="sr-only">{showConfirmPassword ? "Ocultar senha" : "Exibir senha"}</span>
                    </InputGroupButton>
                  </InputGroup>
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
            Avançar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
