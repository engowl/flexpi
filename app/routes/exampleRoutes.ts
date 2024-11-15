import { FastifyInstance, FastifyPluginCallback } from "fastify";

export const apiRoutes: FastifyPluginCallback = (
  app: FastifyInstance,
  _,
  done
) => {
  app.get("/test", async (request, reply) => {
    try {
      return {
        message: "Hello, World!"
      };
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: "Internal Server Error"
      });
    }
  })


  done();
}