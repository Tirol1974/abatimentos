-- AlterTable
ALTER TABLE "abatimentos"
ADD COLUMN "boleto_path" TEXT,
ADD COLUMN "boleto_file_name" TEXT,
ADD COLUMN "boleto_uploaded_at" TIMESTAMP(3);
