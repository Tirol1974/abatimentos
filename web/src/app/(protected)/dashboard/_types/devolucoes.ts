export type Resume = {
  totalAPagar: number,
  totalAReceberSa: number,
  totalAReceberRv: number,
}

export type SapPartidasProps = {
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

export type SapApiSuccessResponse = {
  resumo: Resume,
  partidas: SapPartidasProps[]
}

export type AccountCnpjs = {
  kunnr: string
  stcd1: string
}
