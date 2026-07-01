import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "./accordion";
import { Field } from "./field";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { ParcelaType, TitulosType } from "../../app/page";

export const Titulo = ({
  titulo,
  selectParcelas
}: {
  titulo: TitulosType,
  selectParcelas: (parcela: ParcelaType) => void
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-1"
    >
      <AccordionItem value="item-1" className="border rounded h-max">
        <AccordionTrigger className="px-3">NF {titulo.numero}</AccordionTrigger>
        <AccordionContent className="px-3 h-max flex flex-col gap-3">
          {titulo.parcelas.map((parcela) => (
            <Field key={titulo.numero-parcela.id} orientation='horizontal'>
              <Checkbox
                id={`titulo-${titulo.numero}-${parcela.id}-checkbox`}
                name={`titulo-${titulo.numero}-${parcela.id}-checkbox`}
                onCheckedChange={() => {
                  selectParcelas({
                    id: parcela.id,
                    title: titulo.numero,
                    descricao: parcela.descricao,
                    validade: parcela.validade,
                    valor: parcela.valor
                  });
                }}
              />
              <Label htmlFor={`titulo-${titulo.numero}-${parcela.id}-checkbox`}>{parcela.descricao} - R$ {parcela.valor} - {parcela.validade}</Label>
            </Field>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
