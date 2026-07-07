'use client';

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Field } from "../../../components/ui/field";
import { Input } from "../../../components/ui/input";
import { TotalAbatimentos } from "../../../components/ui/totalAbatimentos";

import NfsData from '../../_mock/nfs_ref.json';
import TitulosData from '../../_mock/titulos.json';
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { TotalAbatimentosSelecionados } from "../../../components/ui/totalAbatimentosSelecionados";
import { TotalAbatimentosSelecionadosPorNf } from "../../../components/ui/totalAbatimentosSelecionadosPorNf";
import { Titulo } from "../../../components/ui/titulo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderArchive, Settings, User, Users } from "lucide-react";
import { Item } from "@/components/ui/item";
import Link from "next/link";
import { useSignedAccount } from "../../../../store/signedAccount";
import { ApiErrorData } from "@/components/forms/SignIn";

type NfType = {
  numero: string;
  serie: string;
  dataEmissao: string;
  valorBruto: number;
  valorAbatimentos: number;
  valorLiquido: number;
  status: string;
  abatimentos: {
    id: number;
    tipo: string;
    descricao: string;
    valor: number;
    status: string;
  }[];
};

export type TitulosType = {
  id: string,
  bukrs: string,
  belnr: string,
  gjahr: number,
  buzei: number,
  kunnr: string,
  budat: string,
  zfbdt: string,
  zbd1t: number,
  dmbtr: number,
  wrbtr: number,
  xblnr: string,
  zuonr: string,
  sgtxt: string
}

export type ParcelaType = {
  id: number,
  title: number,
  validade: string;
  descricao: string;
  valor: number;
}

type FetchTitlesSuccessApiResponse = {
  titles: TitulosType[]
}

export default function Dashboardpage() {
  const [total, setTotal] = useState(0);
  const [totalSelecionadoParaAbater, setTotalSelecionadoParaAbater] = useState(0);
  const [nfs, setNfs] = useState<NfType[]>(NfsData.notas ?? []);
  const [titulos, setTitulos] = useState<TitulosType[]>([]);
  const [nfsSelected, setNfsSelected] = useState<NfType[]>([]);
  const [parcelas, setParcelas] = useState<ParcelaType[]>([]);
  const [apiError, setApiError] = useState<ApiErrorData>({
    message: "",
    status: ""
  });

  const {
    account
  } = useSignedAccount();
  
  useEffect(() => {
    async function loadTitulos() {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/titles`,
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

        return;
      }

      const {
        titles
      } = data as FetchTitlesSuccessApiResponse;

      setTitulos(titles);
    }

    loadTitulos();
  }, []);

  const selectNfs = (nf: NfType) => {
    if (nfsSelected.includes(nf)) {
      setNfsSelected((prev) => prev.filter(prevNf => prevNf.numero != nf.numero));
    } else {
      setNfsSelected((prev) => [ ...prev, nf ]);
    }
  }

  const selectParcelas = (parcela: ParcelaType) => {
    if (parcelas.length == 0) {
      setParcelas((prev) => [...prev,parcela]);
    } else {
      let parcIncluded = false;
      
      parcelas.forEach((parc) => {
        if (parc.id == parcela.id) {
          parcIncluded = true;
        }
      });

      if (parcIncluded) {
        setParcelas((prev) => prev.filter((prParc) => prParc.id != parcela.id));
      } else {
        setParcelas((prev) => [...prev,parcela]);
      }
    }
  }

  const totalEmAbatimentosSelecionadosPorNfRef = useMemo(() => {    
    let soma = 0;

    if (nfsSelected.length > 0) {
      soma = nfsSelected.reduce((prev, curr) => {
        return prev + curr.valorLiquido;
      }, 0);
    
      setTotalSelecionadoParaAbater(soma);
    } else {
      setTotalSelecionadoParaAbater(0);
    }

    return <TotalAbatimentosSelecionadosPorNf total={soma} />;
  }, [ nfsSelected ]);
  
  const totalEmAbatimentosSelecionados = useMemo(() => {
    let soma = 0;

    if (nfsSelected.length == 0) {
      if (parcelas.length > 0) {
        setParcelas([]);
      }
    } else {
      soma = parcelas.reduce((totalParcelas, parc) => {
        return totalParcelas + parc.valor;
      }, 0);
    }

    return (
      <>
        <TotalAbatimentosSelecionados totalSelecionado={soma} total={totalSelecionadoParaAbater} />
      </>
    );
  }, [ parcelas, totalSelecionadoParaAbater ]);

  return (
    <div className="flex flex-col gap-y-10">
      <div
        className="
          grid
          gap-3
          grid-cols-1
          md:grid-cols-3
        "
      >
        <TotalAbatimentos total={total} />  
        {totalEmAbatimentosSelecionadosPorNfRef}
        {totalEmAbatimentosSelecionados}
      </div>
      <div
        className="flex flex-col gap-3"
      >
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          <Card className="h-max">
            <CardContent className="flex flex-col gap-3">
              <span className="font-medium text-lg">NFs de Devolução Lançadas</span>
              <Field orientation="horizontal" className="mb-3 self-start md:w-96">
                <Input type="search" placeholder="Buscar NF de referencia..." />
                <Button>Buscar</Button>
              </Field>
              <div className="p-3 flex flex-col gap-3">
                {nfs.map((data) => (
                  <Field key={data.numero} orientation='horizontal'>
                    <Checkbox
                      id={`nf-${data.numero}-checkbox`}
                      name={`nf-${data.numero}-checkbox`}
                      onCheckedChange={(checked) => {
                        selectNfs(data);
                      }}
                    />
                    <Label htmlFor={`nf-${data.numero}-checkbox`}>{data.numero}</Label>
                  </Field>
                ))}
              </div>
            </CardContent>
          </Card>
          {nfsSelected.length > 0 && (
            <Card>
              <CardContent className="flex gap-3 flex-col">
                <span className="font-medium text-lg">Saldo devedor - Titulos</span>
                {titulos.map((titulo) => (
                  <Titulo
                    titulo={titulo}
                    selectParcelas={() => {}}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const AdminMenu = () => {
  return (
    <>
      <Link href="/accounts" className="md:min-w-52 h-52">
        <Item
          variant={'outline'}
          className="flex flex-col items-center justify-center h-full"
        >
          <Users />
          <span>Contas</span>
        </Item>
      </Link>
      <Link href="/settings" className="md:min-w-52 h-52">
        <Item
          variant={'outline'}
          className="flex flex-col items-center justify-center h-full"
        >
          <Settings />
          <span>Configuração</span>
        </Item>
      </Link>
    </>
  );
}

const ClientMenu = () => {
  return (
    <>
      <Link href="/accounts" className="md:min-w-52 h-52">
        <Item
          variant={'outline'}
          className="flex flex-col items-center justify-center h-full"
        >
          <Users />
          <span>Abatimentos</span>
        </Item>
      </Link>
    </>
  );
}