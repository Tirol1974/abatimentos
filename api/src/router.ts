import { type FastifyInstance } from 'fastify';
import { AuthRoutes } from './routers/auth.routes.js';
import { AccountRoutes } from './routers/account.routes.js';
import { RolesRoutes } from './routers/role.routes.js';
import { TitlesRoutes } from './routers/partidas.routes.js';
import { AbatimentosRoutes } from './routers/abatimentos.routes.js';
import { SettingsRoutes } from './routers/settings.routes.js';

export async function router(fastify: FastifyInstance) {
  fastify.register(AuthRoutes);
  fastify.register(AccountRoutes);
  fastify.register(RolesRoutes);
  fastify.register(TitlesRoutes);
  fastify.register(AbatimentosRoutes);
  fastify.register(SettingsRoutes);
}
