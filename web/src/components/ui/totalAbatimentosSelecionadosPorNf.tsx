import { Card, CardContent, CardHeader, CardTitle } from "./card";

type TotalAbatimentosProps = {
  total: number
}

export const TotalAbatimentosSelecionadosPorNf = ({
  total
}: TotalAbatimentosProps) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-2xl">Total selecionado em NFs</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3 items-center">
        <span className={`font-medium`}>R$ {total ?? 0}</span>
      </CardContent>
    </Card>
  );
}