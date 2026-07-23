"use client";

import { useEffect } from "react";

export function RecaptchaCleanup() {
  useEffect(() => {
    const removeRecaptchaBadge = () => {
      document.querySelectorAll(".grecaptcha-badge").forEach((element) => {
        element.parentElement?.remove();
        element.remove();
      });
    };

    removeRecaptchaBadge();

    const timeout = window.setTimeout(removeRecaptchaBadge, 500);

    return () => window.clearTimeout(timeout);
  }, []);

  return null;
}
