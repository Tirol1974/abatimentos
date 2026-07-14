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
import { Plus } from 'lucide-react';

const createAccountSchema = z.object({
  name: z.string(),
  email: z.email("Insira um e-mail valido"),
  cnpj_root: z.string(),
  role: z.enum(["admin", "cliente"], "Insira uma função valida")
}).superRefine(({ role, cnpj_root }, ctx) => {
  if (role == "cliente") {
    if (cnpj_root == "" || (cnpj_root.length < 10 || cnpj_root.length > 10)) {
      ctx.addIssue({
        code: "custom",
        path: ['cnpj_root'],
        message: "A raiz do CNPJ precisa ter 10 caracteres"
      });
    }
  }
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
      cnpj_root: '',
      role: 'cliente'
    }
  });

  const onOpenChange = () => {
    toggleUpdateAccountsList();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        <Button>
          <Plus />
        </Button>
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