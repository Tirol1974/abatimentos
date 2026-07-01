import { cookies } from "next/headers";
import { SignedAccount } from "../../store/signedAccount";

export async function getAuthenticatedAccount() {
  const cookieStore = await cookies();

  const response = await fetch(
    `${process.env.API_INTERNAL_URL}/auth/me`,
    {
      headers: {
        cookie: cookieStore.toString()
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const {
    account
  } = await response.json() as { account: SignedAccount };

  return account as SignedAccount;
}