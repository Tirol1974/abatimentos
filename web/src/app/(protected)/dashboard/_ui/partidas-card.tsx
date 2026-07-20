"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ArrowDownUp, BrushCleaning, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SapPartidasProps } from "../_types/devolucoes";
import { NfWidget } from "./nf";

type SortDirection = "asc" | "desc";

type PartidasCardProps = {
  title: string
  loading: boolean
  partidas: SapPartidasProps[]
  selectedPartidas: SapPartidasProps[]
  checkboxIdSuffix: string
  emptyContent: string
  onTogglePartida: (partida: SapPartidasProps) => void
}

export const PartidasCard = ({
  title,
  loading,
  partidas,
  selectedPartidas,
  checkboxIdSuffix,
  emptyContent,
  onTogglePartida
}: PartidasCardProps) => {
  const [filter, setFilter] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const filteredPartidas = useMemo(() => {
    if (filter > "") {
      return partidas.filter((partida) => partida.referencia.includes(filter));
    }

    return partidas;
  }, [ partidas, filter ]);

  const sortedPartidas = useMemo(() => {
    return sortPartidasByValue(filteredPartidas, sortDirection);
  }, [ filteredPartidas, sortDirection ]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(sortedPartidas.length / pageSize));

  const paginatedPartidas = useMemo(() => {
    const start = (page - 1) * pageSize;

    return sortedPartidas.slice(start, start + pageSize);
  }, [ sortedPartidas, page ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [ page, totalPages ]);

  return (
    <Card className="h-max shadow-lg">
      <CardContent className="flex flex-col gap-3">
        <span className="font-medium text-lg">{title}</span>
        {loading ? (
          <div className="flex items-center justify-center p-3">
            <Spinner className="size-10" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Field orientation="horizontal" className="self-start md:w-96">
                <Input
                  type="search"
                  placeholder="Buscar NF em aberto..."
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value);
                    setPage(1);
                  }}
                />
              </Field>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSortDirection((prev) => prev == "desc" ? "asc" : "desc");
                    setPage(1);
                  }}
                >
                  <ArrowDownUp />
                  {sortDirection == "desc" ? "Maior valor" : "Menor valor"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedPartidas.length} selecionadas de {filteredPartidas.length}
                </span>
              </div>
            </div>

            <div className="p-3 flex flex-col gap-3">
              {filteredPartidas.length > 0 && (
                <>
                  {paginatedPartidas.map((partida) => {
                    const isSelected = selectedPartidas.some((selectedNf) => selectedNf.id == partida.id);

                    return (
                      <Field orientation={'horizontal'} key={partida.id}>
                        <Checkbox
                          id={`check-${partida.id}-${checkboxIdSuffix}`}
                          checked={isSelected}
                          onCheckedChange={() => onTogglePartida(partida)}
                        />
                        <FieldLabel htmlFor={`check-${partida.id}-${checkboxIdSuffix}`}>
                          <NfWidget partida={partida} />
                        </FieldLabel>
                      </Field>
                    );
                  })}

                  {totalPages > 1 && (
                    <div className="flex flex-col gap-2 border-t pt-3 md:flex-row md:items-center md:justify-between">
                      <span className="text-sm text-muted-foreground">
                        Pagina {page} de {totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={page == 1}
                          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        >
                          <ChevronLeft />
                          Anterior
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={page == totalPages}
                          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        >
                          Proxima
                          <ChevronRight />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {filteredPartidas.length == 0 && (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BrushCleaning />
                    </EmptyMedia>
                    <EmptyTitle></EmptyTitle>
                    <EmptyDescription>Sem NFs encontradas</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <span>{emptyContent}</span>
                  </EmptyContent>
                </Empty>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const sortPartidasByValue = (partidas: SapPartidasProps[], direction: SortDirection) => {
  return [...partidas].sort((a, b) => {
    const firstValue = Math.abs(a.valor);
    const secondValue = Math.abs(b.valor);

    if (direction == "desc") {
      return secondValue - firstValue;
    }

    return firstValue - secondValue;
  });
}
