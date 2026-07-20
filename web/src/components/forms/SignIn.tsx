"use client";

import * as z from 'zod';
import { AlertCircleIcon, Eye, EyeOff } from 'lucide-react';
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
import { InputGroup, InputGroupButton, InputGroupInput } from '../ui/input-group';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';

const signInSchema = z.object({
  email: z.email("Insira um e-mail valido"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
  code: z.string().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export type SignInAPIResponse = {
  account: SignedAccount
}

export type SignInTwoFactorAPIResponse = {
  two_factor_required: boolean
  email: string
  expires_in_minutes: number
}

export type ApiErrorData = {
  status: string,
  message: string
}

export const SignInForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(5);
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
      password: '',
      code: '',
    }
  });

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  }

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);
    setApiError({
      message: "",
      status: ""
    });

    try {
      if (twoFactorRequired) {
        if (!data.code || data.code.length != 6) {
          setApiError({
            status: "ERROR",
            message: "Informe o codigo de 6 digitos enviado por e-mail"
          });
          return;
        }

        const request = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify({
            email: twoFactorEmail,
            code: data.code,
          }),
        });

        const response = await request.json();

        if (!request.ok) {
          setApiError(response as ApiErrorData);
          return;
        }

        const {
          account
        } = response as SignInAPIResponse;

        setSignedAccount(account);

        if (account.first_login) {
          return router.replace("/change-password");
        }

        return router.replace("/");
      }

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const response = await request.json();

      if (!request.ok) {
        setApiError(response as ApiErrorData);
        return;
      }

      const {
        email,
        expires_in_minutes
      } = response as SignInTwoFactorAPIResponse;

      setTwoFactorRequired(true);
      setTwoFactorEmail(email);
      setExpiresInMinutes(expires_in_minutes);
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
          id='form-sign-in'
          className="flex flex-col gap-3"
        >
          {twoFactorRequired ? (
            <FieldGroup>
              <Controller
                name='code'
                control={form.control}
                rules={{
                  required: "Informe o codigo enviado por e-mail",
                  minLength: {
                    value: 6,
                    message: "O codigo precisa ter 6 digitos",
                  }
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-code">
                      Codigo de acesso
                    </FieldLabel>
                    <InputOTP
                      id="form-code"
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      autoComplete="one-time-code"
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-muted-foreground text-sm">
                      Enviamos um codigo para {twoFactorEmail}. Ele expira em {expiresInMinutes} minutos.
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          ) : (
            <>
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
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id="form-password"
                          type={showPassword ? "text" : "password"}
                          aria-invalid={fieldState.invalid}
                          placeholder="**************"
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
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {isSubmitting ? (
          <Button disabled type="submit" className="w-full">
            <Spinner data-icon="inline-start" />
            {twoFactorRequired ? "Validando codigo..." : "Entrando no sistema..."}
          </Button>
        ) : (
          <Button type="submit" className="w-full" form="form-sign-in">
            {twoFactorRequired ? "Validar codigo" : "Entrar"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
