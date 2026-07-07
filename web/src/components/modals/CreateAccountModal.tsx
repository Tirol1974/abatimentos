"use client";

import { FormProvider, useForm } from 'react-hook-form';
import { CreateAccountForm } from '../forms/CreateAccountForm';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Spinner } from '../ui/spinner';
import { useState } from 'react';
import { toast } from 'sonner';

const createAccountSchema = z.object({
  name: z.string(),
  email: z.email("Insira um e-mail valido"),
  role: z.enum(["admin", "operator", ""], "Insira uma função valida")
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

type CreateAccountModalProps = {
  toggleUpdateAccountsList: () => void;
}

export const CreateAccountModal = ({
  toggleUpdateAccountsList
}: CreateAccountModalProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'operator'
    }
  });

  const onOpenChange = () => {
    toggleUpdateAccountsList();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        <Button variant="outline">Criar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Criando nova conta</DialogTitle>
          <DialogDescription>
            Crie uma nova conta aqui
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <CreateAccountForm onOpenChange={onOpenChange} />
        </FormProvider>
        <DialogFooter>
          <DialogClose asChild disabled={form.formState.isSubmitting}>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            type="submit"
            form='form-create-account'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <Spinner /> : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}