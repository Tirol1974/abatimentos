"use client";

import { useEffect } from "react";
import { useSignedAccount } from "../../../../store/signedAccount";
import { SignInForm } from "../../../components/forms/SignIn";

export default function SignInPage() {
  const {
    logout
  } = useSignedAccount();

  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="flex w-screen justify-center p-3">
      <SignInForm />
    </div>
  );
}