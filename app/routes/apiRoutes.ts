import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { Schema } from "../types/common";
import { pluginRegistry } from "../plugins/plugin-registry";
import { schemaToPrompt } from '../core/utils/schema';
import { run } from "../core/FlexPiEngine";
import { logAPICall } from "./helpers/logging";
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
        message: "Hello, World!"
      };
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: "Internal Server Error"
      });
    }
  })

  app.post("/call", async (request, reply) => {
    try {
      const { query, items } = request.body as Schema;

      const schemaPrompt = schemaToPrompt({ query, items });
      console.log('schemaPrompt', schemaPrompt);

      const prompt = `
        User Query: ${query}
        ${schemaPrompt}
      `

      const start = performance.now();

      const res = await run(prompt);
      console.log('res', res);

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
      console.log('/call error', error);
      return reply.code(500).send({
        error: "Internal Server Error"
      });
    }
  })

  // TODO: Call history API
  app.get('/history', async (request, reply) => {
    try {
      return {
        message: "Call history"
      };
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: "Internal Server Error"
      });
    }
  })

  // TODO: Save to library API
  app.post('/save', async (request, reply) => {
    try {
      return {
        message: "Saved to library"
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

