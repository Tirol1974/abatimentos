"use client";

import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { SignInForm } from "@/components/forms/SignIn";

export default function ChangePasswordPage() {
  return (
    <div className="flex md:flex-1 p-3 md:items-center md:justify-center">
      <ChangePasswordForm />
    </div>
  );
}