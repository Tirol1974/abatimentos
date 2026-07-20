"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { ApiErrorData } from "@/components/forms/SignIn";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type BoletoPreviewDialogProps = {
  boletoDownloadUrl: string;
  boletoFileName: string | null;
  onError: (error: ApiErrorData) => void;
}

export const BoletoPreviewDialog = ({
  boletoDownloadUrl,
  boletoFileName,
  onError,
}: BoletoPreviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    return () => {
      if (pdfUrl != "") {
        window.URL.revokeObjectURL(pdfUrl);
      }
    }
  }, [pdfUrl]);

  const loadPreview = async () => {
    setOpen(true);

    if (pdfUrl != "") {
      return;
    }

    setLoading(true);

    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${boletoDownloadUrl}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!request.ok) {
      const data = await request.json() as ApiErrorData;

      setLoading(false);
      setOpen(false);
      onError(data);

      return;
    }

    const blob = await request.blob();
    const url = window.URL.createObjectURL(blob);

    setPdfUrl(url);
    setLoading(false);
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={loadPreview}
      >
        <Eye />
        Visualizar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90vh] max-w-[calc(100%-2rem)] grid-rows-none flex-col sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Preview do boleto</DialogTitle>
            <DialogDescription>
              {boletoFileName ?? "boleto.pdf"}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="size-10" />
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              <iframe
                src={pdfUrl}
                className="h-full w-full rounded-md border"
                title={boletoFileName ?? "Preview do boleto"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
