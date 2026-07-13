"use cliente";

import { ApiErrorData } from "@/components/forms/SignIn";
import { Badge } from "@/components/ui/badge";
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
import { Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemMedia, ItemSeparator } from "@/components/ui/item";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { maskCNPJ, valorFormatado } from "@/lib/utils";
import { BrushCleaning, Newspaper, ShoppingCart, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  parcela: number,
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

export const DevolucoesTab = () => {
  const [loadingCnpjs, setLoadingCnpjs] = useState(true);
  const [loadingNfs, setLoadingNfs] = useState(true);
  const [loadingNfsToPay, setLoadingNfsToPay] = useState(true);
  const [cnpjs, setCnpjs] = useState<AccountCnpjs[]>([]);
  const [selectedCnpj, setSelectedCnpj] = useState<AccountCnpjs[]>([]);
  const [filterPartidas, setFilterPartidas] = useState("");
  const [filterPartidasToPay, setFilterPartidasToPay] = useState("");
  const [selectedNfs, setSelectedNfs] = useState<SapPartidasProps[]>([]);
  const [selectedNfsParaAbater, setSelectedNfsParaAbater] = useState<SapPartidasProps[]>([]);
  const [totalAbatimento, setTotalAbatimento] = useState(0);
  const [totalSaldo, setTotalSaldo] = useState(0);
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
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const anchor = useComboboxAnchor();

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

      let partidasParaReceber = partidas.filter((prev) => prev.valor > 0);

      setLoadingNfs(false);

      setSelectedNfs([]);

      setSapData({
        resumo,
        partidas: partidasParaReceber
      });
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

      let partidasParaPagar = partidas.filter((prev) => prev.valor < 0);

      setLoadingNfsToPay(false);

      setSapDataParaAbater({
        resumo,
        partidas: partidasParaPagar
      });
    }

    loadCarteiraESaldosParaPagar();
  }, [ cnpjs ]);

  const filteredPartidas = useMemo(() => {
    if (filterPartidas > "") {
      return sapData.partidas.filter((partida) => partida.referencia.includes(filterPartidas));
    }

    return sapData.partidas;
  }, [ sapData, filterPartidas ]);
  
  const filteredPartidasToPay = useMemo(() => {
    if (filterPartidasToPay > "") {
      return sapDataParaAbater.partidas.filter((partida) => partida.referencia.includes(filterPartidasToPay));
    }

    return sapDataParaAbater.partidas;
  }, [ sapDataParaAbater, filterPartidasToPay ]);

  const wallet = useMemo(() => {
    return (
      <Item variant={'outline'} className="shadow-lg">
        <ItemHeader>
          <span className="font-medium text-lg">Carteira</span>
        </ItemHeader>
        <ItemSeparator />
        <ItemMedia className="self-start">
          <Wallet className="self-start" />
        </ItemMedia>
        <ItemContent>
          <span>Total a pagar: <Badge>{valorFormatado(sapDataParaAbater.resumo.totalAPagar)}</Badge></span>
          <span>Total a receber em devoluções: <Badge variant={'secondary'}>{valorFormatado(sapDataParaAbater.resumo.totalAReceberRv)}</Badge></span>
          <span>Total a receber em acordos: <Badge  variant={'secondary'}>{valorFormatado(sapDataParaAbater.resumo.totalAReceberSa)}</Badge></span>
        </ItemContent>
      </Item>
    );
  }, [ selectedCnpj, sapData, sapDataParaAbater ]);

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

  useMemo(() => {
    let total = selectedNfs.reduce((prev, nf) => {
      return prev + nf.valor;
    }, 0);

    setTotalAbatimento(total);
  }, [ selectedNfs ]);
  
  useMemo(() => {
    let total = selectedNfsParaAbater.reduce((prev, nf) => {
      return prev + nf.valor;
    }, 0);

    setTotalSaldo(total);
  }, [ selectedNfsParaAbater ]);
  
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

  const carrinhoDeAbatimentos = useMemo(() => {
    return (
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
    );
  }, [ totalAbatimento, totalSaldo ]);

  const confirmAbatimento = useMemo(() => {
    return (
      <div className="flex">
        <Sheet>
          <SheetTrigger className="self-end" asChild>
              <Button disabled={((totalSaldo * -1) <= totalAbatimento) || totalAbatimento == 0}>
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
                  <Item variant={'outline'}>
                    <ItemMedia>
                      <Newspaper />
                    </ItemMedia>
                    <ItemContent>
                      <span>NF {partida.referencia}</span>
                      <span>Parcela {partida.parcela}</span>
                    </ItemContent>
                    <ItemDescription>
                      <Badge
                        variant={partida.valor > 0 ? "secondary" : "default"}
                      >{valorFormatado(partida.valor)}</Badge>
                    </ItemDescription>
                  </Item>
                ))}
              </div>
              <div className="grid auto-rows-min gap-6 px-4">
                <h1 className="font-medium">Nessas NFs de venda</h1>
                {selectedNfsParaAbater.map((partida) => (
                  <Item variant={'outline'}>
                    <ItemMedia>
                      <Newspaper />
                    </ItemMedia>
                    <ItemContent>
                      <span>NF {partida.referencia}</span>
                      <span>Parcela {partida.parcela}</span>
                    </ItemContent>
                    <ItemDescription>
                      <ItemDescription>
                      <Badge
                        variant={partida.valor < 0 ? "default" : "secondary"}
                      >{valorFormatado(partida.valor)}</Badge>
                    </ItemDescription>
                    </ItemDescription>
                  </Item>
                ))}
              </div>
            </div>
            <SheetFooter>
              <Button type="submit">Confirmar e enviar</Button>
              <SheetClose>
                Cancelar
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }, [ totalAbatimento, totalSaldo ]);

  const cardComPartidasParaAbater = useMemo(() => {
    return (
      <Card className="shadow-lg">
        <CardContent>
          {loadingNfsToPay ? (
            <div className="flex items-center justify-center p-3">
              <Spinner className="size-10" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <span className="font-medium text-lg">Saldos a pagar para a Tirol</span>
              <Field orientation="horizontal" className="mb-3 self-start md:w-96">
                <Input type="search" placeholder="Buscar NF em aberto..." onChange={(e) => setFilterPartidasToPay(e.target.value)} />
              </Field>
              {filteredPartidasToPay.length > 0 && (
                filteredPartidasToPay.map((partida) => (
                  <Field orientation={'horizontal'} key={partida.id}>
                    <Checkbox id={`check-${partida.id}`} onCheckedChange={() => selectNfsParaAbater(partida)} />
                    <FieldLabel htmlFor={`check-${partida.id}`}>
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
                    </FieldLabel>
                  </Field>
                ))
              )}
              {filteredPartidasToPay.length == 0 && (
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
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [ sapDataParaAbater, filterPartidasToPay ]);

  return (
    <div className="flex flex-col gap-3">
      <div>
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
      </div>
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
            {carrinhoDeAbatimentos}
            {confirmAbatimento}
          </div>
          <div
            className="flex flex-col gap-3"
          >
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              <Card className="h-max shadow-lg">
                <CardContent className="flex flex-col gap-3">
                  <span className="font-medium text-lg">Devoluções a receber da Tirol</span>
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
                            <Field orientation={'horizontal'} key={partida.id}>
                              <Checkbox id={`check-${partida.id}`} onCheckedChange={() => selectNf(partida)} />
                              <FieldLabel htmlFor={`check-${partida.id}`}>
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
              {cardComPartidasParaAbater}
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