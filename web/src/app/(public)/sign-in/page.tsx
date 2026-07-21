"use client";

import { useEffect, useState } from "react";
import { useSignedAccount } from "../../../../store/signedAccount";
import { SignInForm } from "../../../components/forms/SignIn";
import { FirstLoginForm } from "@/components/forms/FirstLogin";

export default function SignInPage() {
  const [itsFirstLogin, setItsFirstLogin] = useState(false);

  const {
    logout
  } = useSignedAccount();

  useEffect(() => {
    logout();
  }, []);

  const toggleForm = () => {
    setItsFirstLogin(prev => !prev);
  }

  return (
    <div className="flex w-screen justify-center p-3">
      {itsFirstLogin ? (
        <FirstLoginForm
          toggleForm={toggleForm}
        />
      ) : (
        <SignInForm
          toggleForm={toggleForm}
        />
      )}
    </div>
  );
}