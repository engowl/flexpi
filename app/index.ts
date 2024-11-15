import "./dotenv";
import Fastify from "fastify";
import FastifyCors from "@fastify/cors";
import { experimentalRoutes } from "./routes/experimentalRoutes";
import { authRoutes } from "./routes/authRoutes";
import { pluginRegistry } from "./plugins/plugin-registry";
import { run } from "./core/FlexPiEngine";
import { apiRoutes } from "./routes/apiRoutes";
import generateApiKey from "./utils/apiUtils";
import { userRoutes } from "./routes/userRoutes";

const fastify = Fastify();

fastify.register(FastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Experimental Routes
fastify.register(experimentalRoutes, {
  prefix: "/experimental",
});

fastify.register(authRoutes, {
  prefix: "/auth",
});

fastify.register(userRoutes, {
  prefix: "/user",
});

fastify.get("/ping", async (request, reply) => {
  return "pong\n";
});

console.log(generateApiKey());

fastify.listen(
  {
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000,
  },
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log("\n\n==============================================\n\n");
    console.log(`
███████╗██╗░░░░░███████╗██╗░░██╗██████╗░██╗
██╔════╝██║░░░░░██╔════╝╚██╗██╔╝██╔══██╗██║
█████╗░░██║░░░░░█████╗░░░╚███╔╝░██████╔╝██║
██╔══╝░░██║░░░░░██╔══╝░░░██╔██╗░██╔═══╝░██║
██║░░░░░███████╗███████╗██╔╝╚██╗██║░░░░░██║
╚═╝░░░░░╚══════╝╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝
  `);
    console.log(`Server listening at http://localhost:${process.env.APP_PORT}`);
    console.log("\n\n==============================================\n\n");
  }
);
