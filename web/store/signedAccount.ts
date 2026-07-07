import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SignedAccount = {
  id: number;
  name: string;
  email: string;
  role: string;
  cnpj: string;
  first_login: boolean;
}

type SignedAccountStore = {
  account: SignedAccount | null;
  isSigned: boolean;
  setSignedAccount: (p_data: SignedAccount) => void;
  logout: () => void;
  updateAccountsList: boolean;
  setUpdateAccountsList: (data: boolean) => void;
}

export const useSignedAccount = create<SignedAccountStore>()(
  persist(
    (set, get) => ({
      account: null,
      isSigned: false,
      setSignedAccount: (data: SignedAccount) => set({
        account: data,
        isSigned: true,
      }),
      logout: () => {
        useSignedAccount.persist.clearStorage();

        set({
          account: null,
          isSigned: false,
        });
      },
      updateAccountsList: false,
      setUpdateAccountsList: (value: boolean) => {
        set({
          updateAccountsList: value,
        })
      },
    }),
    {
      name: 'signed-account',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
