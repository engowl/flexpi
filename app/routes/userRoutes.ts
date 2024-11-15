import { FastifyInstance } from "fastify";
import { authMiddleware } from "./middlewares/authMiddleware";
import { prismaClient } from "../lib/prisma";
import { clamp } from "../utils/miscUtils";

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
          include: {
            apiKey: true,
          },
        });

        const userData = {
          ...user,
          apiCredits: clamp(
            (user?.apiKey?.maxLimit || 0) - (user?.apiKey?.usageCount || 0),
            0,
            user?.apiKey?.maxLimit || 0
          ),
        };

        delete userData.apiKey;

        return {
          data: userData,
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
