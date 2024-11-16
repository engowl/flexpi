import { RateLimiterMemory } from "rate-limiter-flexible";
import { FastifyRequest, FastifyReply } from "fastify";

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 1,
});

// Middleware function
export const rateLimiterMiddleware = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    await rateLimiter.consume(req.ip); // Consume 1 point per request based on IP
  } catch (err) {
    reply.status(429).send({
      error: "Too Many Requests",
      message:
        "You have exceeded the number of requests allowed. Please try again later.",
    });
  }
};
