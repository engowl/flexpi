import "./dotenv";
import Fastify from 'fastify'
import FastifyCors from "@fastify/cors";
import { experimentalRoutes } from "./routes/experimentalRoutes";
import { pluginRegistry } from "./plugins/plugin-registry";
import { run } from "./core/FlexPiEngine";
import { apiRoutes } from "./routes/apiRoutes";
import generateApiKey from "./utils/apiUtils";

const fastify = Fastify()


fastify.register(FastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Experimental Routes
fastify.register(experimentalRoutes, {
  prefix: "/experimental",
})

fastify.register(apiRoutes, {
  prefix: "/api",
})

const test = async () => {
  try {
    const prompt = "Provide a detailed analysis for the token at address 0xc2eaB7d33d3cB97692eCB231A5D0e4A649Cb539d, including its price in USD, AUD, and in terms of AAPL stock price.";
    const res = await run(prompt);
    console.log('Test result:', res);
  } catch (error) {
    console.error('Test error:', error);
  }
}
// test();

fastify.get('/ping', async (request, reply) => {
  return 'pong\n'
})

fastify.listen({
  port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000
}, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log('\n\n==============================================\n\n')
  console.log(`
███████╗██╗░░░░░███████╗██╗░░██╗██████╗░██╗
██╔════╝██║░░░░░██╔════╝╚██╗██╔╝██╔══██╗██║
█████╗░░██║░░░░░█████╗░░░╚███╔╝░██████╔╝██║
██╔══╝░░██║░░░░░██╔══╝░░░██╔██╗░██╔═══╝░██║
██║░░░░░███████╗███████╗██╔╝╚██╗██║░░░░░██║
╚═╝░░░░░╚══════╝╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝
  `)
  console.log(`Server listening at http://localhost:${process.env.APP_PORT}`)
  console.log('\n\n==============================================\n\n')
})