CREATE TABLE "login_codes" (
  "id" SERIAL NOT NULL,
  "code_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "account_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "login_codes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "login_codes_account_id_idx" ON "login_codes"("account_id");

ALTER TABLE "login_codes"
ADD CONSTRAINT "login_codes_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
