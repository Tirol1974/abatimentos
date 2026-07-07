"use client";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from "../ui/field";
import { AccountCnpj, ApiSuccessResponse } from "../tabs/account/cnpjs/cnpjs";
import { ApiErrorData, SignInAPIResponse } from "./SignIn";
import { useEffect, useState } from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { Folder } from "lucide-react";
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from "next/navigation";
import { useSignedAccount } from "../../../store/signedAccount";

const signInWithCnpjSchema = z.object({
  cnpj: z.string(),
});

type SignInWithCnpjFormData = z.infer<typeof signInWithCnpjSchema>;

export const SelectCnpjForm = () => {
  const [accountCnpjs, setAccountCnpjs] = useState<AccountCnpj[]>([]);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const router = useRouter();

  const {
    setSignedAccount
  } = useSignedAccount();

  const form = useForm<SignInWithCnpjFormData>({
    resolver: zodResolver(signInWithCnpjSchema),
    defaultValues: {
      cnpj: ''
    }
  });

  const onSubmit = async (data: SignInWithCnpjFormData) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/select-cnpj`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const apiData = await request.json();

    if (!request.ok) {
      setApiError(apiData as ApiErrorData);

      return;
    }

    const {
      account
    } = apiData as SignInAPIResponse;

    setSignedAccount(account);

    return router.replace('/');
  }

  useEffect(() => {
    async function loadAccountCnpjs() {
      const query_string = `?signed=true`;

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/cnpjs${query_string}`,
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
        setApiError(data as ApiErrorData);

        return;
      }

      const {
        cnpjs
      } = data as ApiSuccessResponse;

      setAccountCnpjs(cnpjs);
    }

    loadAccountCnpjs();
  }, []);
  
  return (
    <div>
      {accountCnpjs.length == 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Folder />
            </EmptyMedia>
            <EmptyTitle>Nenhum CNPJ cadastrado</EmptyTitle>
            <EmptyDescription>Você precisa esperar a Tirol atribuir pelo menos um CNPJ a sua conta para seguir com o login</EmptyDescription>
          </EmptyHeader>
        </Empty>
        ) : (
        <Card>
          <CardHeader>
            <CardTitle>Selecione um CNPJ</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="form-advance"
            >
              <Controller
                name='cnpj'
                control={form.control}
                render={({ field, fieldState }) => (
                  <RadioGroup onValueChange={field.onChange}  required className="flex flex-row md:flex-row md:justify-between md:flex-wrap">
                    {accountCnpjs.map((data) => (
                      <Field key={data.id} data-invalid={fieldState.invalid} className="flex-1 max-w-96">
                        <FieldLabel htmlFor={`cnpj-${data.id}`}>
                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>{data.cnpj}</FieldTitle>
                            </FieldContent>
                            <RadioGroupItem value={`${data.cnpj}`} id={`cnpj-${data.id}`} />
                          </Field>
                        </FieldLabel>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    ))}
                  </RadioGroup>
                )}
              />
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form="form-advance">Avançar</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
