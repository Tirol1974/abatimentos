ALTER TABLE "settings"
ADD COLUMN "devolucao_days_back" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN "venda_days_forward" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN "abatimentos_mail_to" TEXT NOT NULL DEFAULT '';
