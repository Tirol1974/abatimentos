'use client';

import {
  Info,
  Home,
  MenuIcon,
  ReceiptText,
  Settings,
  Users
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger
} from "./drawer";
import { Button } from "./button";
import { SignedAccount, useSignedAccount } from '../../../store/signedAccount';
import { useEffect, useRef, useState } from 'react';
import { ApiErrorData } from '../forms/SignIn';
import { usePathname, useRouter } from 'next/navigation';
import { Separator } from './separator';
import Link from 'next/link';
import { maskCNPJ } from '@/lib/utils';
import Image from 'next/image';

type NavbarProps = {
  initialAccount: SignedAccount | null;
}

export const Navbar = ({
  initialAccount
}: NavbarProps) => {
  const [loading, setLoading] = useState(false);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<SignedAccount | null>(initialAccount);
  const logoutRequested = useRef(false);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });
  
  const {
    account,
    setSignedAccount,
    logout
  } = useSignedAccount();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hasLoggedOut && !account && initialAccount) {
      setSignedAccount(initialAccount);
      setCurrentAccount(initialAccount);
    }
  }, [ account, hasLoggedOut, initialAccount, setSignedAccount ]);

  useEffect(() => {
    if (account && !logoutRequested.current) {
      setHasLoggedOut(false);
      setCurrentAccount(account);
    }
  }, [ account ]);

  useEffect(() => {
    if (!account && hasLoggedOut) {
      logoutRequested.current = false;
    }
  }, [ account, hasLoggedOut ]);

  const signedAccount = hasLoggedOut ? null : currentAccount;

  useEffect(() => {
    if (!currentAccount || hasLoggedOut) {
      return;
    }

    let isMounted = true;

    const clearExpiredSession = () => {
      logoutRequested.current = true;
      setCurrentAccount(null);
      setHasLoggedOut(true);
      logout();

      if (pathname != "/sign-in") {
        router.replace("/sign-in");
      }
    }

    const validateSession = async () => {
      try {
        const request = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!isMounted) {
          return;
        }

        if (!request.ok) {
          clearExpiredSession();
          return;
        }

        const data = await request.json() as { account: SignedAccount };

        setCurrentAccount(data.account);
      } catch (error) {
        console.log(error);
      }
    }

    const validateSessionWhenVisible = () => {
      if (document.visibilityState == "visible") {
        validateSession();
      }
    }

    validateSession();

    document.addEventListener("visibilitychange", validateSessionWhenVisible);

    const interval = window.setInterval(validateSession, 300000);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", validateSessionWhenVisible);
      window.clearInterval(interval);
    }
  }, [ currentAccount?.id, hasLoggedOut, logout, pathname, router ]);

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

          return;
        }

        logoutRequested.current = true;
        setCurrentAccount(null);
        setHasLoggedOut(true);
        logout();

        setLoading(false);

        return router.replace("/sign-in");
      } catch (error) {
        console.log(error);
      }
    }

  return (
    <header className="flex items-center justify-center border border-l-0 border-r-0 border-t-0">
      <div className="container flex items-center justify-between px-4 py-3 md:px-6">
        <div>
          <Link href="/">
            <Image
              width={100}
              height={100}
              src="/images/logo_tirol.png"
              alt='Logo portal'
            />
          </Link>
        </div>

        <div className='block md:hidden'>
          {signedAccount && (
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
                  <span className='font-md text-lg'>{signedAccount?.name}</span>
                  {signedAccount?.cnpj_root && <span className='text-sm'>Cliente {maskCNPJ(signedAccount.cnpj_root)}</span>}
                  <Button
                    size='sm'
                    variant='destructive'
                    className="hover:cursor-pointer"
                    onClick={() => onLogout()}
                  >Sair</Button>
                  <Separator />
                  <Link href="/" className="flex gap-2 items-center border-l-0 border-r-0 border-t-0 border w-full justify-center pb-5">
                    <Home />
                    Home
                  </Link>
                  <Link href="/accounts" className="flex gap-2 items-center border-l-0 border-r-0 border-t-0 border w-full justify-center pb-5">
                    <Users />
                    Contas
                  </Link>
                  {signedAccount.role == "admin" && (
                    <>
                      <Link href="/abatimentos" className="flex gap-2 items-center border-l-0 border-r-0 border-t-0 border w-full justify-center pb-5">
                        <ReceiptText />
                        Abatimentos
                      </Link>
                      <Link href="/settings" className="flex gap-2 items-center border-l-0 border-r-0 border-t-0 border w-full justify-center pb-5">
                        <Settings />
                        Configurações
                      </Link>
                      <Link href="/sobre" className="flex gap-2 items-center border-l-0 border-r-0 border-t-0 border w-full justify-center pb-5">
                        <Info />
                        Sobre
                      </Link>
                    </>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
        <div
          className="
            hidden
            md:flex
            md:items-center
            md:gap-4
          "
        >
          {loading ? (
            <span>Saindo...</span>
          ) : (
            <>
              {signedAccount && (
                <>
                  {signedAccount.role == "admin" && (
                    <nav className="flex items-center gap-1 border-r pr-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/accounts">
                          <Users />
                          Contas
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/abatimentos">
                          <ReceiptText />
                          Abatimentos
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/settings">
                          <Settings />
                          Configurações
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/sobre">
                          <Info />
                          Sobre
                        </Link>
                      </Button>
                    </nav>
                  )}
                  <div className="flex min-w-0 flex-col items-end gap-0.5 border-r pr-4">
                    <span className='max-w-72 truncate text-sm font-medium'>{signedAccount?.name}</span>
                    {signedAccount?.cnpj_root && (
                      <span className='text-xs text-muted-foreground'>
                        Cliente {maskCNPJ(signedAccount.cnpj_root)}
                      </span>
                    )}
                  </div>
                  <Button
                    size='sm'
                    variant='destructive'
                    className="hover:cursor-pointer"
                    onClick={() => onLogout()}
                  >Sair</Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
