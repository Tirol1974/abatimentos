-- CreateEnum
CREATE TYPE "AbatimentoStatus" AS ENUM ('solicitado', 'atendimento', 'finalizado');

-- CreateTable
CREATE TABLE "abatimentos" (
    "id" SERIAL NOT NULL,
    "devolucoes" JSONB NOT NULL,
    "vendas" JSONB NOT NULL,
    "status" "AbatimentoStatus" NOT NULL DEFAULT 'solicitado',
    "account_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abatimentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "abatimentos" ADD CONSTRAINT "abatimentos_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
