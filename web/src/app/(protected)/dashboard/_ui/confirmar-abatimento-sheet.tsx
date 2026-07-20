"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { SapPartidasProps } from "../_types/devolucoes";
import { NfWidget } from "./nf";

type ConfirmarAbatimentoSheetProps = {
  totalAbatimento: number
  totalSaldo: number
  selectedNfs: SapPartidasProps[]
  selectedNfsParaAbater: SapPartidasProps[]
  submittingAbatimento: boolean
  onConfirm: () => void
}

export const ConfirmarAbatimentoSheet = ({
  totalAbatimento,
  totalSaldo,
  selectedNfs,
  selectedNfsParaAbater,
  submittingAbatimento,
  onConfirm,
}: ConfirmarAbatimentoSheetProps) => {
  return (
    <div className="flex">
      <Sheet>
        <SheetTrigger className="self-end" asChild>
          <Button disabled={((totalSaldo * -1) < totalAbatimento) || totalAbatimento == 0}>
            <ShoppingCart />
            Confirmar
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Abatimentos</SheetTitle>
            <SheetDescription>
              Você está realizando uma solicitação de abatimento para a Tirol.
            </SheetDescription>
          </SheetHeader>
          <div className="no-scrollbar overflow-y-auto flex flex-col gap-3">
            <div className="grid auto-rows-min gap-6 px-4">
              <h1 className="font-medium">Abater essas NFs de devolução</h1>
              {selectedNfs.map((partida) => (
                <NfWidget key={partida.id} partida={partida} />
              ))}
            </div>
            <div className="grid auto-rows-min gap-6 px-4">
              <h1 className="font-medium">Nessas NFs de venda</h1>
              {selectedNfsParaAbater.map((partida) => (
                <NfWidget key={partida.id} partida={partida} />
              ))}
            </div>
          </div>
          <SheetFooter>
            <Button
              type="button"
              disabled={submittingAbatimento}
              onClick={onConfirm}
            >
              {submittingAbatimento ? "Enviando..." : "Confirmar e enviar"}
            </Button>
            <SheetClose>
              Cancelar
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
