CREATE TABLE "abatimento_creditos_utilizados" (
  "id" SERIAL NOT NULL,
  "abatimento_id" INTEGER NOT NULL,
  "account_id" INTEGER NOT NULL,
  "doc" TEXT NOT NULL,
  "parcela" INTEGER NOT NULL,
  "tipo" TEXT NOT NULL,
  "blart" TEXT NOT NULL,
  "referencia" TEXT NOT NULL,
  "valor_original" DOUBLE PRECISION NOT NULL,
  "valor_utilizado" DOUBLE PRECISION NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "abatimento_creditos_utilizados_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "abatimento_creditos_utilizados_account_id_idx"
ON "abatimento_creditos_utilizados"("account_id");

CREATE INDEX "abatimento_creditos_utilizados_account_id_doc_parcela_blart_idx"
ON "abatimento_creditos_utilizados"("account_id", "doc", "parcela", "blart");

ALTER TABLE "abatimento_creditos_utilizados"
ADD CONSTRAINT "abatimento_creditos_utilizados_abatimento_id_fkey"
FOREIGN KEY ("abatimento_id") REFERENCES "abatimentos"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "abatimento_creditos_utilizados"
ADD CONSTRAINT "abatimento_creditos_utilizados_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
