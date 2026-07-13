import { valorFormatado } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

type TotalAbatimentosProps = {
  total: number
}

export const TotalAbatimentos = ({
  total
}: TotalAbatimentosProps) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-2xl">Total disponível para abater</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="font-medium">{valorFormatado(total) ?? 0}</span>
      </CardContent>
    </Card>
  );
}