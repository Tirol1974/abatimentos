"use cliente";

import { ApiErrorData } from "@/components/forms/SignIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemHeader, ItemMedia, ItemSeparator } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { maskCNPJ, valorFormatado } from "@/lib/utils";
import { AlertCircleIcon, BrushCleaning, Newspaper, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSignedAccount } from "../../../../../store/signedAccount";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Resume = {
  totalAPagar: number,
  totalAReceberSa: number,
  totalAReceberRv: number,
}

type SapPartidasProps = {
  id: string,
  tipo: string,
  blart: string,
  doc: string,
  dataDocumento: string,
  dataVencimento: string,
  valor: number,
  referencia: string,
  descricao: string,
}

type SapApiSuccessResponse = {
  resumo: Resume,
  partidas: SapPartidasProps[]
}

type AccountCnpjs = {
  kunnr: string
  stcd1: string
}

type FetchAccountCnpjsSuccessApiResponse = {
  cnpjs: AccountCnpjs[]
}

export const VerbasTab = () => {
  const [loadingCnpjs, setLoadingCnpjs] = useState(true);
  const [loadingNfs, setLoadingNfs] = useState(true);
  const [cnpjs, setCnpjs] = useState<AccountCnpjs[]>([]);
  const [selectedCnpj, setSelectedCnpj] = useState<AccountCnpjs[]>([]);
  const [filterPartidas, setFilterPartidas] = useState("");
  const [sapData, setSapData] = useState<SapApiSuccessResponse>({
    resumo: {
      totalAPagar: 0,
      totalAReceberSa: 0,
      totalAReceberRv: 0,
    },
    partidas: []
  })
  const [apiErrorFetchCnpjs, setApiErrorFetchCnpjs] = useState<ApiErrorData>({
    message: "",
    status: ""
  });
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const anchor = useComboboxAnchor();

  const {
    account
  } = useSignedAccount();

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
        setApiError(data as ApiErrorData);

        setLoadingCnpjs(false);

        return;
      }

      const {
        cnpjs
      } = data as FetchAccountCnpjsSuccessApiResponse;

      let cnpjsComboBox: string[] = [];

      cnpjs.forEach((cnpj) => {
        cnpjsComboBox.push(maskCNPJ(cnpj.stcd1));
      });

      setLoadingCnpjs(false);

      setCnpjs(cnpjs);
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
            doc_type: ["SA", "DA"],
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

      setLoadingNfs(false);

      setSapData({
        resumo,
        partidas
      });
    }

    loadPartidas();
  }, [ selectedCnpj ]);

  const filteredPartidas = useMemo(() => {
    if (filterPartidas > "") {
      return sapData.partidas.filter((partida) => partida.doc.includes(filterPartidas));
    }

    return sapData.partidas;
  }, [ sapData, filterPartidas ]);

  const wallet = useMemo(() => {
    return (
      <Item variant={'outline'} className="shadow-lg">
        <ItemHeader>
          <span className="font-md text-lg">Carteira</span>
        </ItemHeader>
        <ItemSeparator />
        <ItemMedia className="self-start">
          <Wallet className="self-start" />
        </ItemMedia>
        <ItemContent>
          <span>Total a pagar: <span className="text-red-600">{valorFormatado(sapData.resumo.totalAPagar)}</span></span>
          <span>Total a receber em devoluções: <span className="text-green-700">{valorFormatado(sapData.resumo.totalAReceberRv)}</span></span>
          <span>Total a receber em acordos: <span className="text-green-700">{valorFormatado(sapData.resumo.totalAReceberSa)}</span></span>
        </ItemContent>
      </Item>
    );
  }, [ selectedCnpj, sapData ]);

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
          <div
            className="
              grid
              gap-3
              grid-cols-1
              md:grid-cols-3
            "
          >
            {wallet}
          </div>
          <div
            className="flex flex-col gap-3"
          >
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              <Card className="h-max shadow-lg">
                <CardContent className="flex flex-col gap-3">
                  <span className="font-medium text-lg">Quais NFs você quer abater?</span>
                  <Field orientation="horizontal" className="mb-3 self-start md:w-96">
                    <Input type="search" placeholder="Buscar NF em aberto..." onChange={(e) => setFilterPartidas(e.target.value)} />
                  </Field>
                  <div className="p-3 flex flex-col gap-3">
                    {loadingNfs ? (
                      <div className="flex items-center justify-center p-3">
                        <Spinner className="size-10" />
                      </div>
                    ) : (
                      <>
                        {sapData.partidas.length > 0 && (
                          filteredPartidas.map((partida) => (
                            <Field orientation={'horizontal'}>
                              <Checkbox id={`check-${partida.referencia}`} />
                              <FieldLabel htmlFor={`check-${partida.referencia}`}>
                                <Item variant={'outline'}>
                                  <ItemMedia>
                                    <Newspaper />
                                  </ItemMedia>
                                  <ItemContent>
                                    <span>NF {partida.referencia}</span>
                                    <span
                                      className={`${partida.valor < 0 ? "text-red-600" : "text-green-700"}`}
                                    >{valorFormatado(partida.valor)}</span>
                                  </ItemContent>
                                  <ItemDescription>{partida.descricao}</ItemDescription>
                                </Item>
                              </FieldLabel>
                            </Field>
                          ))
                        )}
                        {sapData.partidas.length == 0 && (
                          <Empty>
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <BrushCleaning />
                              </EmptyMedia>
                              <EmptyTitle></EmptyTitle>
                              <EmptyDescription>Sem NFs encontradas</EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                              <span>Não foram encontradas partidas em aberto para o CNPJ selecionado</span>
                            </EmptyContent>
                          </Empty>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
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