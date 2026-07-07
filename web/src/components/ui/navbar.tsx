'use client';

import {
  MenuIcon,
  Users
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger
} from "./drawer";
import { Button } from "./button";
import { useSignedAccount } from '../../../store/signedAccount';
import { useState } from 'react';
import { ApiErrorData } from '../forms/SignIn';
import { useRouter } from 'next/navigation';
import { Separator } from './separator';
import Link from 'next/link';
import { maskCNPJ } from '@/lib/utils';

export const Navbar = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });
  
  const {
    account,
    logout
  } = useSignedAccount();

  const router = useRouter();

  const onLogout = async () => {
      setLoading(true);
      try {
        const request = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-out`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify({}),
        });
  
        if (!request.ok) {
          const data = await request.json() as ApiErrorData;

          setLoading(false);
  
          setApiError(data);
        }

        logout();
        
        return router.replace("/sign-in");
      } catch (error) {
        console.log(error);
      }
    }
  
  return (
    <header className="flex items-center justify-center border border-l-0 border-r-0 border-t-0">
      <div className="container p-3 flex justify-between items-center">
        <div>
          <Link href="/">
            <span className="text-3xl font-medium">Abatimentos</span>
          </Link>
        </div>
        <div className='hidden md:flex md:gap-2'>
          {account?.role == "admin" && (
            <Link href="/accounts" className='flex items-center gap-2'>
              <Users />
              Contas
            </Link>
          )}
        </div>
        <div className='block md:hidden'>
          <Drawer direction='right'>
            <DrawerTrigger>
              <MenuIcon />
            </DrawerTrigger>
            <DrawerContent className="p-3">
              <div
                className="
                  flex
                  flex-col
                  flex-1
                  items-center
                  gap-5
                "
              >
                <span className='font-md text-lg'>{account?.name}</span>
                {account?.cnpj && <span className='text-sm'>Cliente {maskCNPJ(account.cnpj)}</span>}
                <Button
                  size='sm'
                  variant='destructive'
                  className="hover:cursor-pointer"
                  onClick={() => onLogout()}
                >Sair</Button>
                <Separator />
                <Link href="/accounts" className="flex gap-2 items-center">
                  <Users />
                  Contas
                </Link>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <div
          className="
            hidden
            md:flex
            md:flex-col
            md:justify-between
          "
        >
          {loading ? (
            <span>Saindo...</span>
          ) : (
            <>
              <span className='font-lg'>{account?.name}</span>
              {account?.cnpj && <span className='text-sm'>Cliente {maskCNPJ(account.cnpj)}</span>}
              <Button
                size='sm'
                variant='destructive'
                className="self-start hover:cursor-pointer"
                onClick={() => onLogout()}
              >Sair</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}