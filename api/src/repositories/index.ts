import { prisma } from "../infra/prisma/index.js";

export type PrismaTransactionClient = Omit<
  typeof prisma,
  "$connect" |
  "$disconnect" |
  "$on" |
  "$transaction" |
  "$extends"
>;