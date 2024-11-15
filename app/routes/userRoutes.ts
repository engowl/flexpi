import { FastifyInstance } from "fastify";
import { authMiddleware } from "./middlewares/authMiddleware";
import { prismaClient } from "../lib/prisma";

export const userRoutes = (app: FastifyInstance, _: any, done: any) => {
  app.get(
    "/me",
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      const { userId } = (request as any).user;

      try {
        const user = await prismaClient.user.findUnique({
          where: {
            id: userId,
          },
        });
        return {
          data: user,
          message: "Success getting user info",
        };
      } catch (e) {
        console.log("Error getting user info");
        return reply.status(500).send({
          data: null,
          messsage: "Error getting user data",
        });
      }
    }
  );

  done();
};
