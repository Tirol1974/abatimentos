"use client";

import { ApiErrorData } from "@/components/forms/SignIn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor
} from "@/components/ui/combobox";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { maskCNPJ } from "@/lib/utils";
import { AlertCircleIcon, BrushCleaning } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSignedAccount } from "../../../../../store/signedAccount";
import { toast } from "sonner";
import { AccountCnpjs, SapApiSuccessResponse, SapPartidasProps } from "../_types/devolucoes";
import { PartidasCard } from "../_ui/partidas-card";
import { ResumoAbatimentoCards } from "../_ui/resumo-abatimento-cards";

type FetchAccountCnpjsSuccessApiResponse = {
  cnpjs: AccountCnpjs[]
}

export const DevolucoesTab = () => {
  const [loadingCnpjs, setLoadingCnpjs] = useState(true);
  const [loadingNfs, setLoadingNfs] = useState(true);
  const [loadingNfsToPay, setLoadingNfsToPay] = useState(true);
  const [submittingAbatimento, setSubmittingAbatimento] = useState(false);
  const [cnpjs, setCnpjs] = useState<AccountCnpjs[]>([]);
  const [selectedCnpj, setSelectedCnpj] = useState<AccountCnpjs[]>([]);
  const [selectedNfs, setSelectedNfs] = useState<SapPartidasProps[]>([]);
  const [selectedNfsParaAbater, setSelectedNfsParaAbater] = useState<SapPartidasProps[]>([]);
  const [sapData, setSapData] = useState<SapApiSuccessResponse>({
    resumo: {
      totalAPagar: 0,
      totalAReceberSa: 0,
      totalAReceberRv: 0,
    },
    partidas: []
  });
  const [sapDataParaAbater, setSapDataParaAbater] = useState<SapApiSuccessResponse>({
    resumo: {
      totalAPagar: 0,
      totalAReceberSa: 0,
      totalAReceberRv: 0,
    },
    partidas: []
  });
  const [apiErrorFetchCnpjs, setApiErrorFetchCnpjs] = useState<ApiErrorData>({
    message: "",
    status: ""
  });
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const {
    account
  } = useSignedAccount();

  const anchor = useComboboxAnchor();

  const totalAbatimento = useMemo(() => {
    return selectedNfs.reduce((prev, nf) => {
      return prev + nf.valor;
    }, 0);
  }, [ selectedNfs ]);

  const totalSaldo = useMemo(() => {
    return selectedNfsParaAbater.reduce((prev, nf) => {
      return prev + nf.valor;
    }, 0);
  }, [ selectedNfsParaAbater ]);

  const partidasParaAbater = useMemo(() => {
    if (selectedNfsParaAbater.length > 0) {
      if (totalSaldo * -1 > totalAbatimento) {
        return selectedNfsParaAbater;
      }
    }

    return sapDataParaAbater.partidas;
  }, [
    sapDataParaAbater.partidas,
    selectedNfsParaAbater,
    totalAbatimento,
    totalSaldo
  ]);

  useEffect(() => {
    async function loadCnpjs() {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/cnpjs`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        }
      );
      const data = await request.json();

      if (!request.ok) {
        setApiErrorFetchCnpjs(data as ApiErrorData);
        setLoadingCnpjs(false);

        return;
      }

      const {
        cnpjs
      } = data as FetchAccountCnpjsSuccessApiResponse;

      setCnpjs(cnpjs);
      setLoadingCnpjs(false);
    }

    loadCnpjs();
  }, []);

  useEffect(() => {
    async function loadPartidas() {
      setLoadingNfs(true);

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/partidas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            kunnr_list: selectedCnpj,
            doc_type: ["RV"],
            dias_para_vencer: 5
          })
        },
      );

      const data = await request.json();

      if (!request.ok) {
        setApiError(data as ApiErrorData);
        setLoadingNfs(false);

        return;
      }

      const {
        resumo,
        partidas
      } = data as SapApiSuccessResponse;

      const partidasParaReceber = partidas.filter((partida) => partida.valor > 0);

      setSelectedNfs([]);
      setSapData({
        resumo,
        partidas: partidasParaReceber,
      });
      setLoadingNfs(false);
    }

    loadPartidas();
  }, [ selectedCnpj ]);

  useEffect(() => {
    async function loadCarteiraESaldosParaPagar() {
      setLoadingNfsToPay(true);

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/partidas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            kunnr_list: cnpjs,
            doc_type: [],
            dias_para_vencer: 0
          })
        },
      );

      const data = await request.json();

      if (!request.ok) {
        setApiError(data as ApiErrorData);
        setLoadingNfsToPay(false);

        return;
      }

      const {
        resumo,
        partidas
      } = data as SapApiSuccessResponse;

      const partidasParaPagar = partidas.filter((partida) => partida.valor < 0);

      setSapDataParaAbater({
        resumo,
        partidas: partidasParaPagar,
      });
      setLoadingNfsToPay(false);
    }

    loadCarteiraESaldosParaPagar();
  }, [ cnpjs ]);

  const selectNf = (nf: SapPartidasProps) => {
    setSelectedNfs((prev) => {
      const isNfSelected = prev.some(
        selectedNf => selectedNf.id === nf.id,
      );

      if (isNfSelected) {
        return prev.filter((prevNf) => prevNf.id != nf.id)
      }

      return [...prev, nf];
    });
  }

  const selectNfsParaAbater = (nf: SapPartidasProps) => {
    setSelectedNfsParaAbater(prev => {
      const isNfSelected = prev.some(
        selectedNf => selectedNf.id === nf.id
      );

      if (isNfSelected) {
        return prev.filter(prevNf => prevNf.id !== nf.id);
      }

      return [...prev, nf];
    });
  }

  const createAbatimento = async () => {
    setSubmittingAbatimento(true);

    try {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/abatimentos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            devolucoes: selectedNfs,
            vendas: selectedNfsParaAbater,
          }),
        }
      );

      const data = await request.json();

      if (!request.ok) {
        setApiError(data as ApiErrorData);
        setSubmittingAbatimento(false);

        return;
      }

      setSelectedNfs([]);
      setSelectedNfsParaAbater([]);
      setApiError({
        message: "",
        status: ""
      });

      toast.success("Solicitacao de abatimento criada com sucesso");
    } catch (error) {
      console.log(error);
    } finally {
      setSubmittingAbatimento(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {account?.cnpj_root != "" && (
        <div className="flex flex-col gap-3">
          {loadingCnpjs ? (
            <div className="p-3">
              <Spinner className="size-10" />
            </div>
          ) : (
            <Field>
              <FieldLabel>CNPJs da sua raiz</FieldLabel>
              <Combobox
                multiple
                autoHighlight
                items={cnpjs}
                onValueChange={setSelectedCnpj}
              >
                <ComboboxChips ref={anchor} className="w-full">
                  <ComboboxValue>
                    {(values: AccountCnpjs[]) => (
                      <>
                        {values.map((value) => (
                          <ComboboxChip key={value.stcd1}>{value.stcd1}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput placeholder="Pesquisar CNPJ" />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>Nenhum CNPJ encontrado no SAP</ComboboxEmpty>
                  <ComboboxList>
                    {(item: AccountCnpjs) => (
                      <ComboboxItem key={item.stcd1} value={item}>
                        {maskCNPJ(item.stcd1)}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
          )}
          {apiErrorFetchCnpjs.message != "" && (
            <Alert variant="destructive" className="max-w-md mb-3">
              <AlertCircleIcon />
              <AlertTitle>Mensagem da API</AlertTitle>
              <AlertDescription>
                {apiErrorFetchCnpjs.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {selectedCnpj.length > 0 ? (
        <>
          {apiError.message != "" && (
            <Alert variant="destructive" className="max-w-md mb-3">
              <AlertCircleIcon />
              <AlertTitle>Mensagem da API</AlertTitle>
              <AlertDescription>
                {apiError.message}
              </AlertDescription>
            </Alert>
          )}

          <ResumoAbatimentoCards
            resumoCarteira={sapDataParaAbater.resumo}
            totalAbatimento={totalAbatimento}
            totalSaldo={totalSaldo}
            selectedNfs={selectedNfs}
            selectedNfsParaAbater={selectedNfsParaAbater}
            submittingAbatimento={submittingAbatimento}
            onConfirmAbatimento={createAbatimento}
          />

          <div className="flex flex-col gap-3">
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              <PartidasCard
                title="Devoluções a receber da Tirol"
                loading={loadingNfs}
                partidas={sapData.partidas}
                selectedPartidas={selectedNfs}
                checkboxIdSuffix="abate"
                emptyContent="Não foram encontradas partidas em aberto para o CNPJ selecionado"
                onTogglePartida={selectNf}
              />

              <PartidasCard
                title="Saldos a pagar para a Tirol"
                loading={loadingNfsToPay}
                partidas={partidasParaAbater}
                selectedPartidas={selectedNfsParaAbater}
                checkboxIdSuffix="saldo"
                emptyContent="Não foram encontradas partidas em aberto para o CNPJ selecionado"
                onTogglePartida={selectNfsParaAbater}
              />
            </div>
          </div>
        </>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BrushCleaning />
            </EmptyMedia>
            <EmptyTitle></EmptyTitle>
            <EmptyDescription>Sem CNPJ selecionado</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <span>Selecione um CNPJ para ver suas informações</span>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
