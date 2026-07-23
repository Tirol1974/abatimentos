'use client';

import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, Mail, RotateCcw, Save, TimerReset } from 'lucide-react';
import { ApiErrorData } from '@/components/forms/SignIn';
import { BreadLinks } from '@/components/navigations/bread-links';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemDescription, ItemMedia } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const settingsSchema = z.object({
  devolucao_days_back: z.number().int().min(0).max(365),
  venda_days_forward: z.number().int().min(0).max(365),
  abatimentos_mail_to: z.email("Informe um e-mail valido"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

type SettingsApiResponse = {
  settings: SettingsFormData
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      devolucao_days_back: 5,
      venda_days_forward: 7,
      abatimentos_mail_to: '',
    }
  });

  useEffect(() => {
    async function loadSettings() {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
        }
      );

      const data = await request.json();

      if (!request.ok) {
        setApiError(data as ApiErrorData);
        setLoading(false);

        return;
      }

      const {
        settings
      } = data as SettingsApiResponse;

      form.reset({
        devolucao_days_back: settings.devolucao_days_back,
        venda_days_forward: settings.venda_days_forward,
        abatimentos_mail_to: settings.abatimentos_mail_to,
      });
      setLoading(false);
    }

    loadSettings();
  }, [ form ]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    setApiError({
      message: "",
      status: ""
    });

    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/settings`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const response = await request.json();

    if (!request.ok) {
      setApiError(response as ApiErrorData);
      setSaving(false);

      return;
    }

    const {
      settings
    } = response as SettingsApiResponse;

    form.reset({
      devolucao_days_back: settings.devolucao_days_back,
      venda_days_forward: settings.venda_days_forward,
      abatimentos_mail_to: settings.abatimentos_mail_to,
    });

    toast.success("Configuracoes atualizadas com sucesso");
    setSaving(false);
  }

  return (
    <div className='flex flex-col gap-5 px-3'>
      <BreadLinks
        links={[
          {
            actual: false,
            address: '/',
            name: 'Home'
          },
          {
            actual: true,
            address: '/settings',
            name: 'Configuracoes'
          },
        ]}
      />

      {apiError.message != "" && (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircleIcon />
          <AlertTitle>Mensagem da API</AlertTitle>
          <AlertDescription>
            {apiError.message}
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-3">
          <Spinner className="size-10" />
        </div>
      ) : (
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Backoffice do portal</CardTitle>
            <CardDescription>
              Parametros usados nas regras de abatimento e notificacoes da area financeira.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Item variant="outline">
                  <ItemMedia>
                    <RotateCcw />
                  </ItemMedia>
                  <ItemContent>
                    <span>Devolucoes</span>
                    <span>Busca lancamentos de hoje menos os dias configurados.</span>
                  </ItemContent>
                  <ItemDescription>Data do documento</ItemDescription>
                </Item>
                <Item variant="outline">
                  <ItemMedia>
                    <TimerReset />
                  </ItemMedia>
                  <ItemContent>
                    <span>Vendas</span>
                    <span>Considera vencimentos a partir de hoje mais os dias configurados.</span>
                  </ItemContent>
                  <ItemDescription>Data de vencimento</ItemDescription>
                </Item>
                <Item variant="outline">
                  <ItemMedia>
                    <Mail />
                  </ItemMedia>
                  <ItemContent>
                    <span>E-mail financeiro</span>
                    <span>Recebe notificacoes de novas solicitacoes de abatimento.</span>
                  </ItemContent>
                  <ItemDescription>Notificacoes</ItemDescription>
                </Item>
              </div>

              <FieldGroup className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Controller
                  name="devolucao_days_back"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Dias retroativos para devolucoes</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        max={365}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="venda_days_forward"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Dias futuros para vencimento</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        max={365}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="abatimentos_mail_to"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>E-mail para solicitacoes</FieldLabel>
                      <Input
                        {...field}
                        type="email"
                        placeholder="financeiro@empresa.com.br"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <Spinner data-icon="inline-start" /> : <Save />}
                  {saving ? "Salvando..." : "Salvar configuracoes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
