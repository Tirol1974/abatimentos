import type { FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "../utils/ApiError.js";

export async function checkAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    throw new ApiError("Unauthorized", 401);
  }
}