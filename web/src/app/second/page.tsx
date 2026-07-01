'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TotalAbatimentos } from "@/components/ui/totalAbatimentos";

import NfsData from '@/app/_mock/nfs_ref.json';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { TotalAbatimentosSelecionados } from "@/components/ui/totalAbatimentosSelecionados";
import { TotalAbatimentosSelecionadosPorNf } from "@/components/ui/totalAbatimentosSelecionadosPorNf";

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

export type AbatimentoType = {
  id: number;
  nf: string;
  tipo: string;
  descricao: string;
  valor: number;
  status: string;
};

export default function SecondPage() {
  const [total, setTotal] = useState(0);
  const [totalSelecionadoParaAbater, setTotalSelecionadoParaAbater] = useState(0);
  const [nfs, setNfs] = useState<NfType[]>(NfsData.notas ?? []);
  const [abatimentos, setAbatimentos] = useState<AbatimentoType[]>([]);
  const [nfsSelected, setNfsSelected] = useState<NfType[]>([]);
  const [abatimentosSelected, setAbatimentosSelected] = useState<AbatimentoType[]>([]);
  
  useEffect(() => {
    async function loadAbatimentos() {
      nfs.forEach((nf) => {
        nf.abatimentos.map((abatimento) => {
          setAbatimentos((prev) => [...prev, {
            id: abatimento.id,
            nf: nf.numero,
            tipo: abatimento.tipo,
            descricao: abatimento.descricao,
            valor: abatimento.valor,
            status: abatimento.status
          }]);
        })
      });

      let somaTotal = nfs.reduce((prev, nf) => {
        return prev + nf.valorLiquido;
      }, 0);

      setTotal(somaTotal);
    }

    loadAbatimentos();
  }, []);

  const selectNfs = (nf: NfType) => {
    if (nfsSelected.includes(nf)) {
      setNfsSelected((prev) => prev.filter(prevNf => prevNf.numero != nf.numero));
    } else {
      setNfsSelected((prev) => [ ...prev, nf ]);
    }
  }
  
  const selectAbatimentos = (abatimento: AbatimentoType) => {
    if (abatimentosSelected.includes(abatimento)) {
      setAbatimentosSelected((prev) => prev.filter(prevAbatimento => prevAbatimento.id != abatimento.id));
    } else {
      setAbatimentosSelected((prev) => [ ...prev, abatimento ]);
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
      if (abatimentosSelected.length > 0) {
        setAbatimentosSelected([]);
      }
    } else {
      soma = abatimentosSelected.reduce((prev, curr) => {
        return prev + curr.valor;
      }, 0);
    }

    return <TotalAbatimentosSelecionados totalSelecionado={soma} total={totalSelecionadoParaAbater} />
  }, [ abatimentosSelected, totalSelecionadoParaAbater ]);

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
        <span className="text-2xl font-medium">Abatimentos</span>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          <Card className="h-max">
            <CardContent className="flex flex-col gap-3">
              <span className="font-medium text-lg">NFs de Devolução</span>
              <Field orientation="horizontal" className="mb-3 self-start md:max-w-96">
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
                <span className="font-medium text-lg">Abatimentos</span>
                {/* {abatimentos.map((abatimento) => (
                  <NfAbatimentos
                    key={abatimento.id}
                    abatimento={abatimento}
                    selectAbatimentos={selectAbatimentos}
                  />
                ))} */}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
