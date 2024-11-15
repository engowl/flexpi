import {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyRequest,
} from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

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
      const { token } = request.body;

      if (!token) {
        return reply.status(400).send("Please provide a token in field");
      }

      try {
        const signingKey = await client.getSigningKey();
        const publicKey = signingKey.getPublicKey();

        const decodedToken: JwtPayload = jwt.verify(token, publicKey, {
          ignoreExpiration: false,
          maxAge: "4d",
        }) as JwtPayload;

        const jwtWrapped = jwt.sign(
          decodedToken,
          process.env.JWT_API_KEY || ""
        );

        return reply.send({
          data: {
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
