import {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyRequest,
} from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { prismaClient } from "../lib/prisma";
import { UserWalletType } from "@prisma/client";

export const authRoutes: FastifyPluginCallback = (
  app: FastifyInstance,
  _,
  done
) => {
  app.get("/test", async (request, reply) => {
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
  });

  // ============================= LOGIN ROUTE ================================= //

  interface LoginRouteBody {
    token?: string;
    address?: string;
    walletType?: UserWalletType;
  }

  const jwksUrl = `https://app.dynamic.xyz/api/v0/sdk/${process.env.DYNAMIC_ENV_ID}/.well-known/jwks`;

  const client = new JwksClient({
    jwksUri: jwksUrl,
    rateLimit: true,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000,
  });

  app.post(
    "/login",
    async (request: FastifyRequest<{ Body: LoginRouteBody }>, reply) => {
      const { token, address, walletType } = request.body;

      if (!token || !address || !walletType) {
        return reply
          .status(400)
          .send("Please provide a token, address, and walletType in field");
      }

      try {
        // TODO REGISTER USER

        let user = await prismaClient.user.findFirst({
          where: {
            wallet: {
              address,
            },
          },
        });

        if (!user) {
          console.log("user not exist, creating one");
          user = await prismaClient.user.create({
            data: {
              wallet: {
                create: {
                  address,
                  type: walletType,
                },
              },
            },
          });
          console.log("user created");
        }

        const signingKey = await client.getSigningKey();
        const publicKey = signingKey.getPublicKey();

        const decodedToken: JwtPayload = jwt.verify(token, publicKey, {
          ignoreExpiration: false,
          maxAge: "4d",
        }) as JwtPayload;

        const jwtWrapped = jwt.sign(
          {
            ...decodedToken,
            address,
            userId: user.id,
          },
          process.env.JWT_API_KEY || ""
        );

        return reply.send({
          data: {
            isNewUser: user.isNewUser,
            access_token: jwtWrapped,
          },
          message: "Success logging in",
        });
      } catch (e) {
        console.log("Error while logging in: ", e);
        return reply.status(500).send({
          data: null,
          message: "Error while logging in",
        });
      }
    }
  );

  done();
};
