import {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { Schema } from "../types/common";
import { pluginRegistry } from "../plugins/plugin-registry";
import { schemaToPrompt } from "../core/utils/schema";
import { run } from "../core/FlexPiEngine";
import { logAPICall } from "./helpers/logging";
import { generateCallId } from "../utils/apiUtils";
import generateApiKey from "../utils/apiUtils";
import { authMiddleware } from "./middlewares/authMiddleware";
import { prismaClient } from "../lib/prisma";

export const apiRoutes: FastifyPluginCallback = (
  app: FastifyInstance,
  _,
  done
) => {
  // TODO: Call the API saved to library
  app.get("/:libraryId", async (request, reply) => {
    const libraryId = request.params as unknown as string
    try {
      const lib = await prismaClient.library.findFirst({
        where: {
          id: libraryId
        }
      })

      if(!lib) {
        return reply.code(40).send({
          message: "No library found"
        })
      }

      return {
        data: lib,
        message: "Hello, World!",
      };
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
      });
    }
  });

  app.post("/call", async (request, reply) => {
    try {
      const { query, items } = request.body as Schema;

      const schemaPrompt = schemaToPrompt({ query, items });
      console.log("schemaPrompt", schemaPrompt);

      const prompt = `
        User Query: ${query}
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

      // logAPICall({
      //   userId: '123',
      //   schema: { query, items },
      //   duration: duration,
      //   response: res,
      // })

      return res;
    } catch (error) {
      console.log("/call error", error);
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

  interface SaveSchemaBody {
    name: string;
    schema: Record<string, any>;
  }

  // TODO: Save to library API
  app.post(
    "/save",
    {
      preHandler: [authMiddleware],
    },
    async (request: FastifyRequest<{ Body: SaveSchemaBody }>, reply) => {
      const { userId } = (request as any).user;
      const { schema, name } = request.body;
      try {
        const savedSchema = await prismaClient.library.create({
          data: {
            userId,
            name,
            description: "Generated schema",
            query: schema.query,
            schema,
          },
        });
        return {
          data: savedSchema,
          message: "Schema saved successfully",
        };
      } catch (error) {
        console.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
        });
      }
    }
  );

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

  interface LibraryQuerystring {
    page?: number;
    take?: number;
    status?: "all" | "reading" | "completed" | "plan_to_read";
    sortBy?: "title" | "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  }

  app.get(
    "/explore",
    async (
      request: FastifyRequest<{
        Querystring: LibraryQuerystring;
      }>,
      reply: FastifyReply
    ) => {
      try {
        const page = Math.max(1, request.query.page || 1);
        const take = Math.min(100, Math.max(1, request.query.take || 30));
        const skip = (page - 1) * take;

        const [libraries, total] = await Promise.all([
          prismaClient.library.findMany({
            include: {
              user: true,
            },
            skip,
            take,
          }),
          prismaClient.library.count(),
        ]);

        return {
          data: libraries,
          pagination: {
            page,
            take,
            total,
            totalPages: Math.ceil(total / take),
            hasMore: skip + libraries.length < total,
          },
          message: "Libraries retrieved successfully",
        };
      } catch (error) {
        console.error("Error fetching libraries:", error);
        return reply.status(500).send({
          data: null,
          message: "An error occurred while fetching libraries",
          error: process.env.NODE_ENV === "development" ? error : undefined,
        });
      }
    }
  );

  app.get(
    "/user-library",
    {
      preHandler: [authMiddleware],
    },
    async (
      request: FastifyRequest<{
        Querystring: LibraryQuerystring;
      }>,
      reply: FastifyReply
    ) => {
      const { userId } = (request as any).user;
      const page = Math.max(1, request.query.page || 1);
      const take = Math.min(100, Math.max(1, request.query.take || 30));
      const skip = (page - 1) * take;
      const status = request.query.status || "all";
      const sortBy = request.query.sortBy || "createdAt";
      const order = request.query.order || "desc";

      try {
        const user = await prismaClient.user.findFirst({
          where: {
            id: userId,
          },
        });

        if (!user) {
          reply.status(404).send({
            data: null,
            message: "User not found",
          });
        }

        const [libraries, total] = await Promise.all([
          prismaClient.library.findMany({
            where: { userId },
            orderBy: {
              [sortBy]: order,
            },
            skip,
            take,
          }),
          prismaClient.library.count({ where: { userId } }),
        ]);

        return {
          data: libraries,
          pagination: {
            page,
            take,
            total,
            totalPages: Math.ceil(total / take),
            hasMore: skip + libraries.length < total,
          },
          message: "User libraries retrieved successfully",
        };
      } catch (error) {
        console.error("Error fetching libraries:", error);
        return reply.status(500).send({
          data: null,
          message: "An error occurred while fetching libraries",
          error: process.env.NODE_ENV === "development" ? error : undefined,
        });
      }
    }
  );

  done();
};
