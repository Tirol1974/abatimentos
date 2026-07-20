"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircleIcon, BrushCleaning, Download, FileCheck2 } from "lucide-react";
import { ApiErrorData } from "@/components/forms/SignIn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BoletoPreviewDialog } from "@/components/abatimentos/BoletoPreviewDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemContent, ItemDescription, ItemMedia } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/date";
import { valorFormatado } from "@/lib/utils";
import { Newspaper } from "lucide-react";

type PartidaAbatimento = {
  id: string;
  tipo: string;
  blart: string;
  doc: string;
  parcela: number;
  dataDocumento: string;
  dataVencimento: string;
  valor: number;
  referencia: string;
  descricao: string;
}

type Abatimento = {
  id: number;
  devolucoes: PartidaAbatimento[];
  vendas: PartidaAbatimento[];
  status: "solicitado" | "atendimento" | "finalizado";
  total_devolucoes: number;
  total_vendas: number;
  boleto_file_name: string | null;
  boleto_uploaded_at: string | null;
  boleto_download_url: string | null;
  created_at: string;
  updated_at: string;
}

type StatusFilter = "todos" | Abatimento["status"];

const statusText = {
  todos: "Todos",
  solicitado: "Solicitado",
  atendimento: "Em atendimento",
  finalizado: "Finalizado",
}

export const AbatimentosTab = () => {
  const [loading, setLoading] = useState(true);
  const [abatimentos, setAbatimentos] = useState<Abatimento[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  useEffect(() => {
    async function loadAbatimentos() {
      setLoading(true);

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/abatimentos`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
        }
      );

      const data = await request.json();

      if (!request.ok) {
        setApiError(data as ApiErrorData);
        setLoading(false);

        return;
      }

      setAbatimentos(data as Abatimento[]);
      setLoading(false);
    }

    loadAbatimentos();
  }, []);

  const totalSolicitado = useMemo(() => {
    return abatimentos.reduce((total, abatimento) => total + abatimento.total_devolucoes, 0);
  }, [abatimentos]);

  const filteredAbatimentos = useMemo(() => {
    if (statusFilter == "todos") {
      return abatimentos;
    }

    return abatimentos.filter((abatimento) => abatimento.status == statusFilter);
  }, [abatimentos, statusFilter]);

  const statusCount = useMemo(() => {
    return {
      todos: abatimentos.length,
      solicitado: abatimentos.filter((abatimento) => abatimento.status == "solicitado").length,
      atendimento: abatimentos.filter((abatimento) => abatimento.status == "atendimento").length,
      finalizado: abatimentos.filter((abatimento) => abatimento.status == "finalizado").length,
    }
  }, [abatimentos]);

  const downloadBoleto = async (abatimento: Abatimento) => {
    if (!abatimento.boleto_download_url) {
      return;
    }

    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${abatimento.boleto_download_url}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!request.ok) {
      const data = await request.json() as ApiErrorData;

      setApiError(data);

      return;
    }

    const blob = await request.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = abatimento.boleto_file_name ?? `boleto-abatimento-${abatimento.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {apiError.message != "" && (
        <Alert variant="destructive" className="max-w-md mb-3">
          <AlertCircleIcon />
          <AlertTitle>Mensagem da API</AlertTitle>
          <AlertDescription>
            {apiError.message}
          </AlertDescription>
        </Alert>
      )}

      {abatimentos.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Item variant="outline" className="shadow-lg">
            <ItemMedia>
              <FileCheck2 />
            </ItemMedia>
            <ItemContent>
              <span>Total solicitado</span>
              <span className="font-medium">{valorFormatado(totalSolicitado)}</span>
            </ItemContent>
            <ItemDescription>{abatimentos.length} solicitações</ItemDescription>
          </Item>
        </div>
      )}

      {abatimentos.length == 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BrushCleaning />
            </EmptyMedia>
            <EmptyTitle>Nenhum abatimento solicitado</EmptyTitle>
            <EmptyDescription>As suas solicitações aparecerão aqui.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <span>Selecione as NFs na aba de devoluções para criar uma solicitação.</span>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(["todos", "solicitado", "atendimento", "finalizado"] as StatusFilter[]).map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={statusFilter == status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
              >
                {statusText[status]}
                <Badge variant={statusFilter == status ? "secondary" : "outline"}>
                  {statusCount[status]}
                </Badge>
              </Button>
            ))}
          </div>

          {filteredAbatimentos.length == 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BrushCleaning />
                </EmptyMedia>
                <EmptyTitle>Nenhum abatimento encontrado</EmptyTitle>
                <EmptyDescription>Nao ha solicitacoes com esse status.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {filteredAbatimentos.map((abatimento) => (
            <Card key={abatimento.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  Abatimento #{abatimento.id}
                  <Badge variant={abatimento.status == "finalizado" ? "secondary" : "default"}>
                    {statusText[abatimento.status]}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Criado em {formatDateTime(abatimento.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Item variant="outline">
                    <ItemContent>
                      <span>Total em devoluções</span>
                      <span className="font-medium">{valorFormatado(abatimento.total_devolucoes)}</span>
                    </ItemContent>
                  </Item>
                  <Item variant="outline">
                    <ItemContent>
                      <span>Saldo selecionado</span>
                      <span className="font-medium">{valorFormatado(abatimento.total_vendas * -1)}</span>
                    </ItemContent>
                  </Item>
                </div>

                {abatimento.boleto_download_url ? (
                  <Item variant="outline">
                    <ItemMedia>
                      <Download />
                    </ItemMedia>
                    <ItemContent>
                      <span>Boleto disponivel</span>
                      {abatimento.boleto_uploaded_at && (
                        <span>Enviado em {formatDateTime(abatimento.boleto_uploaded_at)}</span>
                      )}
                    </ItemContent>
                    <ItemDescription className="flex flex-wrap items-center gap-2">
                      <BoletoPreviewDialog
                        boletoDownloadUrl={abatimento.boleto_download_url}
                        boletoFileName={abatimento.boleto_file_name}
                        onError={setApiError}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => downloadBoleto(abatimento)}
                      >
                        <Download />
                        Baixar
                      </Button>
                    </ItemDescription>
                  </Item>
                ) : (
                  <Item variant="outline">
                    <ItemContent>
                      <span>Boleto ainda nao disponivel</span>
                      <span>A area responsavel vai anexar o PDF nesta solicitacao.</span>
                    </ItemContent>
                  </Item>
                )}

                <Accordion type="multiple">
                  <AccordionItem value={`devolucoes-${abatimento.id}`}>
                    <AccordionTrigger>
                      Devoluções selecionadas ({abatimento.devolucoes.length})
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2">
                      {abatimento.devolucoes.map((partida) => (
                        <NfResumo key={partida.id} partida={partida} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value={`vendas-${abatimento.id}`}>
                    <AccordionTrigger>
                      Vendas selecionadas ({abatimento.vendas.length})
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2">
                      {abatimento.vendas.map((partida) => (
                        <NfResumo key={partida.id} partida={partida} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const NfResumo = ({
  partida
}: {
  partida: PartidaAbatimento
}) => {
  return (
    <Item variant="outline">
      <ItemMedia>
        <Newspaper />
      </ItemMedia>
      <ItemContent>
        <span>NF {partida.referencia}</span>
        <span>Parcela {partida.parcela}</span>
      </ItemContent>
      <ItemDescription>
        <Badge variant={partida.valor < 0 ? "default" : "secondary"}>
          {valorFormatado(partida.valor)}
        </Badge>
      </ItemDescription>
    </Item>
  );
}
