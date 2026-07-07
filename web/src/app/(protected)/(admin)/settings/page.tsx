'use client';

import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon, Save } from 'lucide-react';
import { useState } from 'react';
import { ApiErrorData } from '@/components/forms/SignIn';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const changeValidityDays = z.object({
  days: z.number(),
});

type ChangeValidityDaysFormdata = z.infer<typeof changeValidityDays>;

export default function SettingsPage() {
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const form = useForm<ChangeValidityDaysFormdata>({
    resolver: zodResolver(changeValidityDays),
    defaultValues: {
      days: 5
    }
  });

  const onSubmit = async (data: ChangeValidityDaysFormdata) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/settings/validity-days`, {
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

      return;
    }

    toast.success("Data de validade dos títulos atualizada com sucesso");
  }
  
  return (
    <div className='flex flex-col gap-3'>
      <span className="text-lg font-md">Configurações</span>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex gap-2 max-w-96'
      >
        <Controller
          name="days"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Dias para vencer</FieldLabel>
              <Input
                {...field}
                type='number'
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Button className='self-end' variant={'ghost'} type='submit'>
          <Save />
        </Button>
      </form>
      {apiError.message != "" && (
        <Alert variant="destructive" className="max-w-md mb-3">
          <AlertCircleIcon />
          <AlertTitle>Mensagem da API</AlertTitle>
          <AlertDescription>
            {apiError.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
