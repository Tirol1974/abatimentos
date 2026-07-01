import { Card, CardContent, CardHeader, CardTitle } from "./card";

type TotalAbatimentosProps = {
  total: number,
  totalSelecionado: number
}

export const TotalAbatimentosSelecionados = ({
  total,
  totalSelecionado
}: TotalAbatimentosProps) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-2xl">Total em abatimentos selecionados</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3 items-center">
        <span className={`font-medium ${totalSelecionado < total ? "text-red-700" : totalSelecionado == 0 ? "text-red-700" : "text-green-700"}`}>R$ {totalSelecionado}</span>
      </CardContent>
    </Card>
  );
}