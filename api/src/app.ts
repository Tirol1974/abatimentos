import Fastify, { type FastifyInstance } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import { router } from './router.js';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyCookie from '@fastify/cookie';
import * as dotenv from "dotenv";
import { ApiError } from './utils/ApiError.js';

dotenv.config({ path: ".env" });

export class App {
  app: FastifyInstance;

  constructor() {
    this.app = Fastify({
      logger: true,
    }).withTypeProvider<ZodTypeProvider>();
  }

  public async build() {
    this.app.setValidatorCompiler(validatorCompiler);
    this.app.setSerializerCompiler(serializerCompiler);

    await this.registerPlugins();
    await this.registerRoutes();
  }

  private async registerPlugins() {
    await this.app.register(fastifyCookie, {});

    await this.app.register(fastifyCors, {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    });

    await this.app.register(fastifyJwt, {
      secret: process.env.JWT_SECRET!,
      cookie: {
        cookieName: 'auth_token',
        signed: false
      }
    });

    await this.app.register(fastifyRateLimit, {
      max: Number(process.env.RATE_LIMIT_MAX) || 300,
      timeWindow: process.env.RATE_LIMIT_TIME_WINDOW || "1 minute",
      errorResponseBuilder: (request, context) => ({
        statusCode: context.statusCode,
        status: "ERROR",
        message: "Muitas requisicoes em pouco tempo. Tente novamente em alguns instantes."
      })
    });

    this.app.setErrorHandler((error, request, reply) => {
      if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.code(400).send({
          status: "ERROR",
          message: "Validation error" + JSON.stringify(error.validation),
          errors: error.validation,
        });
      }

      if (isResponseSerializationError(error)) {
        return reply.code(500).send({
          status: "ERROR",
          message: "Invalid response schema" + error.cause,
        });
      }

      if (error instanceof ApiError) {
        return reply.status(error.statusCode).send({
          status: "ERROR",
          message: error.message
        });
      }

      const errorWithStatus = error as {
        statusCode?: number;
        message?: string;
      };

      if (errorWithStatus.statusCode) {
        return reply.status(errorWithStatus.statusCode).send({
          status: "ERROR",
          message: errorWithStatus.message ?? "Muitas requisicoes em pouco tempo. Tente novamente em alguns instantes."
        });
      }

      return reply.status(500).send({
        status: "ERROR",
        message: "Internal server error"
      });
    });

    await this.app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Abatimentos API',
          description: `API para gerenciamento do app abatimentos`,
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT"
            }
          }
        }
      },
      transform: jsonSchemaTransform,
    });

    await this.app.register(fastifySwaggerUi, {
      routePrefix: "/docs",
      indexPrefix: process.env.NODE_ENV == "production" ? "/api" : ""
    });
  }

  public async registerRoutes() {
    await this.app.register(router);
  }

  public async listen() {
    try {
      this.app.listen({
        port: Number(process.env.PORT) || 3333,
        host: '0.0.0.0'
      }).then(() => {
        console.log(`🚀 HTTP server running on ${process.env.APP_URL ?? ""}:${process.env.PORT || 3333}`);
        console.log(`📚 Docs available at ${process.env.APP_URL ?? ""}:${process.env.PORT || 3333}/docs`);
      });
    } catch (error) {
      console.log(error);
    }
  }

}
