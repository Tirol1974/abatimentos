"use client";

import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { Suspense, useEffect } from "react";
import { useSignedAccount } from "../../../../../store/signedAccount";

export default function ResetPasswordPage() {  
  const {
    logout
  } = useSignedAccount();

  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="flex w-screen justify-center p-3">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
