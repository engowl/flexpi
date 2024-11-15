import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { authMiddleware } from "./middlewares/authMiddleware";
import { apiKeyLimiterMiddleware } from "./middlewares/apiKeyLimiterMiddleware";

export const experimentalRoutes: FastifyPluginCallback = (
  app: FastifyInstance,
  _,
  done
) => {
  app.get(
    "/test",
    { preHandler: [authMiddleware, apiKeyLimiterMiddleware] },
    async (request, reply) => {
      try {
        return {
          message: "Hello, World!",
        };
      } catch (error) {
        console.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
        });
      }
    }
  );

  done();
};
