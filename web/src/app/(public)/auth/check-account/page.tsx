"use client";

import { useEffect, useState } from "react";
import { useSignedAccount } from "../../../../../store/signedAccount";
import { SendResetPasswordLinkEmailForm } from "@/components/forms/SendResetPasswordLinkEmailForm";

export default function SendResetPasswordEmailLinkPage() {
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
      <SendResetPasswordLinkEmailForm />
    </div>
  );
}