"use client";

import { Badge } from "@/components/ui/badge";
import { Item, ItemContent, ItemHeader, ItemMedia, ItemSeparator } from "@/components/ui/item";
import { valorFormatado } from "@/lib/utils";
import { Wallet } from "lucide-react";
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
        <ItemHeader>
          <span className="font-medium text-lg">Carteira</span>
        </ItemHeader>
        <ItemSeparator />
        <ItemMedia className="self-start">
          <Wallet className="self-start" />
        </ItemMedia>
        <ItemContent>
          <span>Total a pagar: <Badge>{valorFormatado(resumoCarteira.totalAPagar)}</Badge></span>
          <span>Total a receber em devoluções: <Badge variant={'secondary'}>{valorFormatado(resumoCarteira.totalAReceberRv)}</Badge></span>
          <span>Total a receber em acordos: <Badge  variant={'secondary'}>{valorFormatado(resumoCarteira.totalAReceberSa)}</Badge></span>
        </ItemContent>
      </Item>

      <Item variant={'outline'} className="shadow-lg">
        <ItemHeader>
          <span className="font-medium text-lg">Carrinho de Abatimentos</span>
        </ItemHeader>
        <ItemSeparator />
        <ItemMedia className="self-start">
          <Wallet />
        </ItemMedia>
        <ItemContent>
          <span>Total a abater: <Badge>{valorFormatado(totalAbatimento * -1)}</Badge></span>
          <span>Saldo a pagar selecionado: <Badge>{valorFormatado(totalSaldo * -1)}</Badge></span>
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
