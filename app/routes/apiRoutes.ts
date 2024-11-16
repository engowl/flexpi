import {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from "fastify";
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
import { apiKeyLimiterMiddleware } from "./middlewares/apiKeyLimiterMiddleware";
import axios from "axios";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const apiRoutes: FastifyPluginCallback = (
  app: FastifyInstance,
  _,
  done
) => {
  // TODO: Call the API saved to library
  app.get("/:libraryId", async (request, reply) => {
    const { libraryId } = request.params as any;
    try {
      const lib = await prismaClient.library.findFirst({
        where: {
          id: libraryId,
        },
      });

      if (!lib) {
        return reply.code(40).send({
          message: "No library found",
        });
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

  app.post(
    "/call",
    {
      preHandler: [authMiddleware, apiKeyLimiterMiddleware],
    },
    async (request, reply) => {
      try {
        const { userId } = (request as any).user;

        const { schema, libraryId } = request.body as any;

        const interpolatedSchema = interpolateVariables(schema);
        console.log("interpolated", interpolatedSchema);

        const schemaPrompt = schemaToPrompt(interpolatedSchema);
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
          libraryId: libraryId,
          userId: userId,
          schema: schema,
          duration: duration,
          response: res,
        });

        const response = {
          duration: duration,
          data: res,
        };

        return response;
      } catch (error) {
        console.log("/call error", error);
        return reply.code(500).send({
          error: "Internal Server Error",
        });
      }
    }
  );

  app.post(
    "/call/dummy",
    {
      preHandler: [authMiddleware, apiKeyLimiterMiddleware],
    },
    async (request, reply) => {
      try {
        const { userId } = (request as any).user;

        const { schema, libraryId } = request.body as any;
        // await sleep(3000);
        const res = {
          hello: "world",
        };

        await sleep(2000);

        logAPICall({
          libraryId: libraryId,
          userId: userId,
          schema: schema,
          duration: 2000,
          response: res,
        });

        const response = {
          duration: 2000,
          data: res,
        };

        return response;
      } catch (error) {
        console.log("/call/test error", error);
        return reply.code(500).send({
          error: "Internal Server Error",
        });
      }
    }
  );

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
    async (request: FastifyRequest, reply) => {
      const { userId } = (request as any).user;
      const { schema, name } = request.body as { schema: Schema; name: string };

      // Make description based on the schema
      const schemaDescription = schemaToPrompt(schema);

      const prompt = `
        This is the data from the user to create a new API for people to use.

        Name: ${name}
        User Query: ${schema.query}
        Schema: ${JSON.stringify(schema.items)}

        Schema Description:
        ${schemaDescription}

        Based on that, create me a nice, short, and clear description about what this API does. Keep it simple and easy to understand.
        Only return the description, do need to return anything besides the description, like don't include your sentence or anything else.

        For text that is wrapped with {{ <text> }}, it means that the text is a variable that will be replaced with the actual value when the API is called.

        The functionality will revolves around web3, crypto, and blockchain. So be familiar with terms like swap, transaction, ENS, address, ethereum, The Graph, etc.

        Focus on describing the overall function, don't need to include the small details. Make the description fun and easy to understand, maybe include some emojis to make it more fun. Keep it short and simple.

        Description:
      `;

      const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4o-mini",
        temperature: 0.5,
        maxTokens: 100,
      });

      let description: string = "API Description";
      try {
        console.log("Generating description");
        const response = await model.invoke([
          new SystemMessage(prompt),
          new HumanMessage(
            "Please create a description for the API. Only return the short and simple description. Also response in pure plain text, no markdown or anything else."
          ),
        ]);
        description = response.content.toString();
        console.log("Generated description:", description);
      } catch (error) {
        console.error("Error generating description:", error);
      }

      try {
        const savedSchema = await prismaClient.library.create({
          data: {
            userId,
            name,
            description: description,
            query: schema.query,
            schema: schema as any,
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
              user: {
                include: {
                  wallet: true,
                },
              },
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
    "/history",
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

      try {
        const user = await prismaClient.user.findFirst({
          where: { id: userId },
        });

        if (!user) {
          return reply.status(400).send({
            message: "User not found",
          });
        }

        const history = await prismaClient.apiCall.findMany({
          where: { userId: user.id },
        });

        return {
          data: history,
          message: "History retrieved successfully",
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
    "/user-libraries",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { userId } = (request as any).user;

      try {
        const user = await prismaClient.user.findUnique({
          where: {
            id: userId,
          },
          include: {
            libraries: {
              include: {
                apiCalls: {
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            },
          },
        });

        const libraries = user?.libraries.map((library) => {
          const endpointURL = `http://localhost:3700/api/${library.id}`;
          const lastCallDate =
            library.apiCalls.length > 0 ? library.apiCalls[0].createdAt : null;
          const usageCount = library.apiCalls.length;

          return {
            ...library,
            endpointURL,
            usageCount,
            lastCallDate,
          };
        });

        console.log({ libraries });

        return {
          data: libraries ?? null,
          message: "Success getting user library",
        };
      } catch (e) {
        console.log("Error while getting user library", e);
        return reply.status(500).send({
          message: "Error while getting user library",
          data: null,
        });
      }
    }
  );

  done();
};
