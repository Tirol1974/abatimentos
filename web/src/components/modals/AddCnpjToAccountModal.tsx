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
import { Plus } from 'lucide-react';
import { AddCnpjToAccountForm } from '../forms/AddCnpjToAccountForm';

const addCnpjToAccountSchema = z.object({
  account_id: z.number(),
  cnpj: z.string(),
});

type AddCnpjToAccountFormData = z.infer<typeof addCnpjToAccountSchema>;

type AddCnpjToAccountModalProps = {
  toggleUpdateCnpjsList: () => void;
  account_id: number
}

export const AddCnpjToAccountModal = ({
  toggleUpdateCnpjsList,
  account_id
}: AddCnpjToAccountModalProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<AddCnpjToAccountFormData>({
    resolver: zodResolver(addCnpjToAccountSchema),
    defaultValues: {
      account_id,
      cnpj: '',
    }
  });

  const onOpenChange = () => {
    toggleUpdateCnpjsList();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionando CNPJ para essa conta</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <AddCnpjToAccountForm
            onOpenChange={onOpenChange}
          />
        </FormProvider>
        <DialogFooter>
          <DialogClose asChild disabled={form.formState.isSubmitting}>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            type="submit"
            form='form-add-cnpj-to-account'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <Spinner /> : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}