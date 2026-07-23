"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AlertCircleIcon, ChevronLeft, ChevronRight, Clock3, Download, FileCheck2, FileClock, FileUp, Hourglass, Newspaper, Play, ReceiptText, TrendingUp } from "lucide-react";
import { BoletoPreviewDialog } from "@/components/abatimentos/BoletoPreviewDialog";
import { ApiErrorData } from "@/components/forms/SignIn";
import { BreadLinks } from "@/components/navigations/bread-links";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemMedia } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/date";
import { maskCNPJRoot, valorFormatado } from "@/lib/utils";
import { toast } from "sonner";

type Account = {
  id: number;
  name: string;
  email: string;
  cnpj_root: string;
}

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
  account: Account;
  devolucoes: PartidaAbatimento[];
  vendas: PartidaAbatimento[];
  status: "solicitado" | "atendimento" | "finalizado";
  total_devolucoes: number;
  total_vendas: number;
  boleto_file_name: string | null;
  boleto_uploaded_at: string | null;
  boleto_download_url: string | null;
  created_at: string;
}

type AbatimentoMetrics = {
  month: string;
  total_requested: number;
  total_finished: number;
  total_in_progress: number;
  total_pending: number;
  amount_requested: number;
  amount_finished: number;
  average_resolution_hours: number;
}

type StatusFilter = "todos" | Abatimento["status"];

const statusText = {
  todos: "Todos",
  solicitado: "Solicitado",
  atendimento: "Em atendimento",
  finalizado: "Finalizado",
}

const ABATIMENTOS_PER_PAGE = 5;

export default function AdminAbatimentosPage() {
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [abatimentos, setAbatimentos] = useState<Abatimento[]>([]);
  const [metrics, setMetrics] = useState<AbatimentoMetrics | null>(null);
  const [metricsMonth, setMetricsMonth] = useState(getCurrentMonth());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("solicitado");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const loadAbatimentos = async () => {
    setLoading(true);

    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/abatimentos/admin`,
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

  const loadMetrics = async (month: string) => {
    setMetricsLoading(true);

    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/abatimentos/admin/metrics?month=${month}`,
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
      setMetricsLoading(false);

      return;
    }

    setMetrics(data as AbatimentoMetrics);
    setMetricsLoading(false);
  }

  useEffect(() => {
    loadAbatimentos();
  }, []);

  useEffect(() => {
    loadMetrics(metricsMonth);
  }, [metricsMonth]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filteredAbatimentos = abatimentos.filter((abatimento) => {
    if (statusFilter == "todos") {
      return matchesSearch(abatimento, search);
    }

    return abatimento.status == statusFilter && matchesSearch(abatimento, search);
  });

  const statusCount = {
    todos: abatimentos.length,
    solicitado: abatimentos.filter((abatimento) => abatimento.status == "solicitado").length,
    atendimento: abatimentos.filter((abatimento) => abatimento.status == "atendimento").length,
    finalizado: abatimentos.filter((abatimento) => abatimento.status == "finalizado").length,
  }

  const totalPages = Math.max(Math.ceil(filteredAbatimentos.length / ABATIMENTOS_PER_PAGE), 1);
  const paginatedAbatimentos = filteredAbatimentos.slice(
    (page - 1) * ABATIMENTOS_PER_PAGE,
    page * ABATIMENTOS_PER_PAGE
  );
  const pageStart = filteredAbatimentos.length == 0 ? 0 : ((page - 1) * ABATIMENTOS_PER_PAGE) + 1;
  const pageEnd = Math.min(page * ABATIMENTOS_PER_PAGE, filteredAbatimentos.length);

  const uploadBoleto = async (abatimentoId: number, file: File) => {
    setUploadingId(abatimentoId);

    const boletoBase64 = await fileToBase64(file);
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/abatimentos/${abatimentoId}/boleto`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          file_name: file.name,
          boleto_base64: boletoBase64,
        }),
      }
    );

    const data = await request.json();

    if (!request.ok) {
      setApiError(data as ApiErrorData);
      setUploadingId(null);

      return;
    }

    toast.success("Boleto anexado com sucesso");
    setUploadingId(null);
    await loadAbatimentos();
    await loadMetrics(metricsMonth);
  }

  const changeStatus = async (abatimentoId: number, status: Abatimento["status"]) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/abatimentos/${abatimentoId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await request.json();

    if (!request.ok) {
      setApiError(data as ApiErrorData);

      return;
    }

    toast.success("Status atualizado com sucesso");
    await loadAbatimentos();
    await loadMetrics(metricsMonth);
  }

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
    <div className="flex flex-col gap-5 px-3">
      <BreadLinks
        links={[
          {
            actual: false,
            address: '/',
            name: 'Home'
          },
          {
            actual: true,
            address: '/abatimentos',
            name: 'Abatimentos'
          },
        ]}
      />

      {apiError.message != "" && (
        <Alert variant="destructive" className="max-w-md mb-3">
          <AlertCircleIcon />
          <AlertTitle>Mensagem da API</AlertTitle>
          <AlertDescription>
            {apiError.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-medium">Indicadores do mes</span>
            <span className="text-sm text-muted-foreground">
              Acompanhe volume, finalizacoes e tempo medio de atendimento.
            </span>
          </div>
          <div className="flex flex-col gap-1 md:w-48">
            <span className="text-sm font-medium">Periodo</span>
            <Input
              type="month"
              value={metricsMonth}
              onChange={(event) => {
                if (event.target.value) {
                  setMetricsMonth(event.target.value);
                }
              }}
            />
          </div>
        </div>

        {metricsLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Item key={index} variant="outline" className="min-h-24">
                <ItemMedia>
                  <Spinner />
                </ItemMedia>
                <ItemContent>
                  <span>Carregando</span>
                  <span className="text-muted-foreground">Buscando metricas...</span>
                </ItemContent>
              </Item>
            ))}
          </div>
        ) : metrics && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <MetricItem
              icon={<ReceiptText />}
              label="Total"
              value={metrics.total_requested}
              description="Criados no mes"
            />
            <MetricItem
              icon={<FileCheck2 />}
              label="Finalizados"
              value={metrics.total_finished}
              description="Boletos anexados"
            />
            <MetricItem
              icon={<Hourglass />}
              label="Em atendimento"
              value={metrics.total_in_progress}
              description="Abertos no mes"
            />
            <MetricItem
              icon={<FileClock />}
              label="Pendentes"
              value={metrics.total_pending}
              description="Aguardando inicio"
            />
            <MetricItem
              icon={<TrendingUp />}
              label="Valor solicitado"
              value={valorFormatado(metrics.amount_requested)}
              description={`Finalizado: ${valorFormatado(metrics.amount_finished)}`}
            />
            <MetricItem
              icon={<Clock3 />}
              label="Tempo medio"
              value={formatResolutionTime(metrics.average_resolution_hours)}
              description="Criacao ate boleto"
            />
          </div>
        )}
      </div>

      {abatimentos.length == 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptText />
            </EmptyMedia>
            <EmptyTitle>Nenhum abatimento solicitado</EmptyTitle>
            <EmptyDescription>As solicitacoes dos clientes aparecerao aqui.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <span>Aguarde uma nova solicitacao pelo portal.</span>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Input
              type="search"
              placeholder="Buscar por CNPJ, cliente ou e-mail..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="md:max-w-md"
            />
            <span className="text-sm text-muted-foreground">
              {filteredAbatimentos.length} abatimentos
            </span>
          </div>

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
                  <ReceiptText />
                </EmptyMedia>
                <EmptyTitle>Nenhum abatimento encontrado</EmptyTitle>
                <EmptyDescription>Nao ha solicitacoes com esse status.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {filteredAbatimentos.length > 0 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              pageStart={pageStart}
              pageEnd={pageEnd}
              totalItems={filteredAbatimentos.length}
              onPrevious={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
              onNext={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
            />
          )}

          {paginatedAbatimentos.map((abatimento) => (
            <Card key={abatimento.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  Abatimento #{abatimento.id}
                  <Badge variant={abatimento.status == "finalizado" ? "secondary" : "default"}>
                    {statusText[abatimento.status]}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {abatimento.account.name} - CNPJ {maskCNPJRoot(abatimento.account.cnpj_root)} - criado em {formatDateTime(abatimento.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {abatimento.status == "solicitado" && (
                  <div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => changeStatus(abatimento.id, "atendimento")}
                    >
                      <Play />
                      Iniciar atendimento
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Item variant="outline">
                    <ItemContent>
                      <span>Cliente</span>
                      <span className="font-medium">{abatimento.account.email}</span>
                    </ItemContent>
                  </Item>
                  <Item variant="outline">
                    <ItemContent>
                      <span>Raiz do CNPJ</span>
                      <span className="font-medium">{maskCNPJRoot(abatimento.account.cnpj_root)}</span>
                    </ItemContent>
                  </Item>
                  <Item variant="outline">
                    <ItemContent>
                      <span>Total em devolucoes</span>
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

                <Accordion type="multiple">
                  <AccordionItem value={`devolucoes-${abatimento.id}`}>
                    <AccordionTrigger>
                      Devolucoes selecionadas ({abatimento.devolucoes.length})
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

                <Item variant="outline">
                  <ItemMedia>
                    <FileUp />
                  </ItemMedia>
                  <ItemContent>
                    <span>{abatimento.boleto_file_name ?? "Boleto nao anexado"}</span>
                    {abatimento.boleto_uploaded_at && (
                      <span>Enviado em {formatDateTime(abatimento.boleto_uploaded_at)}</span>
                    )}
                  </ItemContent>
                  <ItemDescription className="flex flex-wrap items-center gap-2">
                    <Input
                      type="file"
                      accept="application/pdf"
                      disabled={uploadingId == abatimento.id}
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          uploadBoleto(abatimento.id, file);
                        }
                      }}
                    />
                    {abatimento.boleto_download_url && (
                      <>
                        <BoletoPreviewDialog
                          boletoDownloadUrl={abatimento.boleto_download_url}
                          boletoFileName={abatimento.boleto_file_name}
                          onError={setApiError}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadBoleto(abatimento)}
                        >
                          <Download />
                          Baixar
                        </Button>
                      </>
                    )}
                  </ItemDescription>
                </Item>
              </CardContent>
            </Card>
          ))}

          {filteredAbatimentos.length > 0 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              pageStart={pageStart}
              pageEnd={pageEnd}
              totalItems={filteredAbatimentos.length}
              onPrevious={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
              onNext={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
            />
          )}
        </div>
      )}
    </div>
  );
}

const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const matchesSearch = (abatimento: Abatimento, search: string) => {
  const normalizedSearch = search.replace(/\D/g, "").toLowerCase();
  const rawSearch = search.toLowerCase().trim();

  if (rawSearch == "") {
    return true;
  }

  return (
    (normalizedSearch != "" && abatimento.account.cnpj_root.includes(normalizedSearch)) ||
    abatimento.account.name.toLowerCase().includes(rawSearch) ||
    abatimento.account.email.toLowerCase().includes(rawSearch)
  );
}

const MetricItem = ({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  description: string;
}) => {
  return (
    <Item variant="outline" className="min-h-24">
      <ItemMedia>
        {icon}
      </ItemMedia>
      <ItemContent>
        <span>{label}</span>
        <span className="text-xl font-semibold">{value}</span>
      </ItemContent>
      <ItemDescription>{description}</ItemDescription>
    </Item>
  );
}

const PaginationControls = ({
  page,
  totalPages,
  pageStart,
  pageEnd,
  totalItems,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}) => {
  return (
    <div className="flex flex-col gap-2 rounded-md border px-3 py-2 md:flex-row md:items-center md:justify-between">
      <span className="text-sm text-muted-foreground">
        Exibindo {pageStart}-{pageEnd} de {totalItems}
      </span>
      <div className="flex items-center justify-between gap-2 md:justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page == 1}
          onClick={onPrevious}
        >
          <ChevronLeft />
          Anterior
        </Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground">
          Pagina {page} de {totalPages}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page == totalPages}
          onClick={onNext}
        >
          Proxima
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

const getCurrentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const formatResolutionTime = (hours: number) => {
  if (hours <= 0) {
    return "0h";
  }

  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }

  return `${(hours / 24).toFixed(1)}d`;
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
