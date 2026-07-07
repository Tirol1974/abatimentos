/*
  Warnings:

  - A unique constraint covering the columns `[account_id,cnpj]` on the table `account_info` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "account_info_account_id_cnpj_key" ON "account_info"("account_id", "cnpj");
