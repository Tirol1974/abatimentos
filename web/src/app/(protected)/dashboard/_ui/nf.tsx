"use client";

import { Badge } from "@/components/ui/badge";
import { Item, ItemContent, ItemDescription, ItemMedia } from "@/components/ui/item";
import { Newspaper } from "lucide-react";
import { SapPartidasProps } from "../_types/devolucoes";
import { valorFormatado } from "@/lib/utils";

type NfWidgetProps = {
  partida: SapPartidasProps
}

export const NfWidget = ({
  partida
}: NfWidgetProps) => {
  return (
    <Item variant={'outline'}>
      <ItemMedia>
        <Newspaper />
      </ItemMedia>
      <ItemContent>
        <span>NF {partida.referencia}</span>
        <span>Parcela {partida.parcela}</span>
      </ItemContent>
      <ItemDescription>
        <Badge variant={`${partida.valor < 0 ? "default" : "secondary"}`}>{valorFormatado(partida.valor)}</Badge>
      </ItemDescription>
    </Item>
  );
}
