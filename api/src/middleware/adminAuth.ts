import type { FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "../utils/ApiError.js";
import { RolesEnum } from "../repositories/Role-repository.js";

export async function checkAdminAuth(request: FastifyRequest, reply: FastifyReply) {
  await request.jwtVerify();

  const payload = request.user;

  if (payload.role != RolesEnum.ADMIN) {
    throw new ApiError("Você não é um administrador", 401);
  }
}