import "./dotenv";
import Fastify from 'fastify'
import FastifyCors from "@fastify/cors";
import { experimentalRoutes } from "./routes/experimentalRoutes";

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