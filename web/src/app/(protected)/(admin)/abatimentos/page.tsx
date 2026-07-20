"use client";

import { useEffect, useState } from "react";
import { AlertCircleIcon, Download, FileUp, Play, ReceiptText } from "lucide-react";
import { BoletoPreviewDialog } from "@/components/abatimentos/BoletoPreviewDialog";
import { ApiErrorData } from "@/components/forms/SignIn";
import { BreadLinks } from "@/components/navigations/bread-links";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

type Abatimento = {
  id: number;
  account: Account;
  status: "solicitado" | "atendimento" | "finalizado";
  total_devolucoes: number;
  total_vendas: number;
  boleto_file_name: string | null;
  boleto_uploaded_at: string | null;
  boleto_download_url: string | null;
  created_at: string;
}

type StatusFilter = "todos" | Abatimento["status"];

const statusText = {
  todos: "Todos",
  solicitado: "Solicitado",
  atendimento: "Em atendimento",
  finalizado: "Finalizado",
}

export default function AdminAbatimentosPage() {
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [abatimentos, setAbatimentos] = useState<Abatimento[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("solicitado");
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    loadAbatimentos();
  }, []);

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
    abatimento.account.cnpj_root.includes(normalizedSearch) ||
    abatimento.account.name.toLowerCase().includes(rawSearch) ||
    abatimento.account.email.toLowerCase().includes(rawSearch)
  );
}
