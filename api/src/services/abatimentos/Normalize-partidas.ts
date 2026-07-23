export type PartidaAbatimento = {
  id?: string;
  tipo?: string;
  blart?: string;
  doc?: string;
  parcela?: number;
  dataDocumento?: string;
  dataVencimento?: string;
  valor: number;
  referencia?: string;
  descricao?: string;
}

export function normalizePartidas(data: unknown): PartidaAbatimento[] {
  if (Array.isArray(data)) {
    return data.filter(isPartidaAbatimento);
  }

  if (typeof data == "string") {
    try {
      const parsedData = JSON.parse(data);

      if (Array.isArray(parsedData)) {
        return parsedData.filter(isPartidaAbatimento);
      }
    } catch (error) {
      return [];
    }
  }

  return [];
}

function isPartidaAbatimento(data: unknown): data is PartidaAbatimento {
  return (
    typeof data == "object" &&
    data != null &&
    "valor" in data &&
    typeof data.valor == "number"
  );
}
