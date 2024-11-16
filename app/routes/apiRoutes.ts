import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { Schema } from "../types/common";
import { pluginRegistry } from "../plugins/plugin-registry";
import { interpolateVariables, schemaToPrompt } from "../core/utils/schema";
import { run } from "../core/FlexPiEngine";
import { logAPICall } from "./helpers/logging";
import { generateCallId } from "../utils/apiUtils";
import generateApiKey from "../utils/apiUtils";
import { authMiddleware } from "./middlewares/authMiddleware";
import { prismaClient } from "../lib/prisma";
import { sleep } from "../utils/miscUtils";

export const apiRoutes: FastifyPluginCallback = (
  app: FastifyInstance,
  _,
  done
) => {
  // TODO: Call the API saved to library
  app.get("/:libraryId", async (request, reply) => {
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

  app.post("/call", {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    try {
      const { userId } = (request as any).user;

      // TODO: Validate the API call amount here

      const schema = request.body as Schema;

      const interpolatedSchema = interpolateVariables(schema);
      console.log("interpolated", interpolatedSchema);

      const schemaPrompt = schemaToPrompt(interpolatedSchema)
      console.log("schemaPrompt", schemaPrompt);

      const prompt = `
        User Query: ${interpolatedSchema.query}
        ${schemaPrompt}
      `;

      const start = performance.now();

      const callId = generateCallId();
      console.log("callId", callId);

      const res = await run(prompt, callId);
      console.log("res", res);

      // DUMMY RETURN
      // await sleep(3000);
      // const res = {
      //   "hello": "world"
      // }

      const duration = Math.round(performance.now() - start);

      logAPICall({
        userId: userId,
        schema: schema,
        duration: duration,
        response: res,
      })

      const response = {
        duration: duration,
        data: res
      }

      return response;
    } catch (error) {
      console.log("/call error", error);
      return reply.code(500).send({
        error: "Internal Server Error",
      });
    }
  });

  app.post("/call/dummy", {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    try {
      const { userId } = (request as any).user;

      const schema = request.body as Schema;
      // await sleep(3000);
      const res = {
        "hello": "world"
      }

      await sleep(2000);

      logAPICall({
        userId: userId,
        schema: schema,
        duration: 2000,
        response: res,
      })

      const response = {
        duration: 2000,
        data: res
      }

      return response;
    } catch (error) {
      console.log("/call/test error", error);
      return reply.code(500).send({
        error: "Internal Server Error",
      });
    }
  });

  // TODO: Call history API
  app.get("/history", async (request, reply) => {
    try {
      return {
        message: "Call history",
      };
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
      });
    }
  });

  // TODO: Save to library API
  app.post("/save", async (request, reply) => {
    try {
      return {
        message: "Saved to library",
      };
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
      });
    }
  });

  app.post(
    "/create-key",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const generatedApiKey = generateApiKey();

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

        if (!user) {
          return reply.status(400).send({
            message: "User not found",
            data: null,
          });
        }

        if (user.apiKey) {
          return reply.status(400).send({
            message: "User API KEY already created",
            data: null,
          });
        }

        const updatedUser = await prismaClient.user.update({
          where: {
            id: userId,
          },
          data: {
            isNewUser: false,
            apiKey: {
              create: {
                key: generatedApiKey,
              },
            },
          },
          include: {
            apiKey: true,
          },
        });

        const apiKey = updatedUser.apiKey?.key;

        return {
          data: {
            apiKey,
          },
          message: "Success creating api key",
        };
      } catch (e) {
        console.log("Error while generating api key", e);
        return reply.status(500).send({
          data: null,
          message: "Error while creating api key",
        });
      }
    }
  );

  app.get(
    "/stats",
    { preHandler: [authMiddleware] },
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

        if (!user) {
          return reply.status(400).send({
            message: "User not found, please register first",
            data: null,
          });
        }

        const apiStatsData = {
          apiKey: user.apiKey?.key ?? null,
          apiKeyMaxLimit: user.apiKey?.maxLimit ?? null,
          apiKeyCurrentUsage: user.apiKey?.usageCount ?? null,
        };

        return {
          data: apiStatsData,
          message: "Succes getting API stats",
        };
      } catch (e) {
        console.log("Error while getting API stats", e);
        return reply.status(500).send({
          message: "Error while getting API stats",
          data: null,
        });
      }
    }
  );

  done();
};
