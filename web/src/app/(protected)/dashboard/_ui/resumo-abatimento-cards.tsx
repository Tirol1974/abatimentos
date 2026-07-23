"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemHeader, ItemMedia, ItemSeparator } from "@/components/ui/item";
import { valorFormatado } from "@/lib/utils";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { useState } from "react";
import { Resume, SapPartidasProps } from "../_types/devolucoes";
import { ConfirmarAbatimentoSheet } from "./confirmar-abatimento-sheet";

type ResumoAbatimentoCardsProps = {
  resumoCarteira: Resume
  totalAbatimento: number
  totalSaldo: number
  selectedNfs: SapPartidasProps[]
  selectedNfsParaAbater: SapPartidasProps[]
  submittingAbatimento: boolean
  onConfirmAbatimento: () => void
}

export const ResumoAbatimentoCards = ({
  resumoCarteira,
  totalAbatimento,
  totalSaldo,
  selectedNfs,
  selectedNfsParaAbater,
  submittingAbatimento,
  onConfirmAbatimento,
}: ResumoAbatimentoCardsProps) => {
  const [showWalletValues, setShowWalletValues] = useState(false);
  const [showCartValues, setShowCartValues] = useState(false);

  const valueLabel = (value: number, showValues: boolean) => {
    if (!showValues) {
      return "R$ •••••";
    }

    return valorFormatado(value);
  }

  return (
    <div
      className="
        grid
        gap-3
        grid-cols-1
        md:grid-cols-3
      "
    >
      <Item variant={'outline'} className="shadow-lg">
        <ItemHeader className="flex-row items-center justify-between">
          <span className="font-medium text-lg">Carteira</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            title={showWalletValues ? "Esconder valores" : "Exibir valores"}
            onClick={() => setShowWalletValues((prev) => !prev)}
          >
            {showWalletValues ? <EyeOff /> : <Eye />}
            <span className="sr-only">
              {showWalletValues ? "Esconder valores" : "Exibir valores"}
            </span>
          </Button>
        </ItemHeader>
        <ItemSeparator />
        <ItemMedia className="self-start">
          <Wallet className="self-start" />
        </ItemMedia>
        <ItemContent>
          <span>Total a pagar: <Badge>{valueLabel(resumoCarteira.totalAPagar, showWalletValues)}</Badge></span>
          <span>Total a receber em devoluções: <Badge variant={'secondary'}>{valueLabel(resumoCarteira.totalAReceberRv, showWalletValues)}</Badge></span>
          <span>Total a receber em acordos: <Badge variant={'secondary'}>{valueLabel(resumoCarteira.totalAReceberSa, showWalletValues)}</Badge></span>
        </ItemContent>
      </Item>

      <Item variant={'outline'} className="shadow-lg">
        <ItemHeader className="flex-row items-center justify-between">
          <span className="font-medium text-lg">Carrinho de Abatimentos</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            title={showCartValues ? "Esconder valores" : "Exibir valores"}
            onClick={() => setShowCartValues((prev) => !prev)}
          >
            {showCartValues ? <EyeOff /> : <Eye />}
            <span className="sr-only">
              {showCartValues ? "Esconder valores" : "Exibir valores"}
            </span>
          </Button>
        </ItemHeader>
        <ItemSeparator />
        <ItemMedia className="self-start">
          <Wallet />
        </ItemMedia>
        <ItemContent>
          <span>Total a abater: <Badge>{valueLabel(totalAbatimento * -1, showCartValues)}</Badge></span>
          <span>Saldo a pagar selecionado: <Badge>{valueLabel(totalSaldo * -1, showCartValues)}</Badge></span>
        </ItemContent>
      </Item>

      <ConfirmarAbatimentoSheet
        totalAbatimento={totalAbatimento}
        totalSaldo={totalSaldo}
        selectedNfs={selectedNfs}
        selectedNfsParaAbater={selectedNfsParaAbater}
        submittingAbatimento={submittingAbatimento}
        onConfirm={onConfirmAbatimento}
      />
    </div>
  );
}
