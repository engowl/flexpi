import { prismaClient } from "../../lib/prisma";

export const apiKeyLimiterMiddleware = async (request: any, reply: any) => {
  const apiKey = request.headers["Flex-api-key"];

  if (!apiKey) {
    return reply.status(401).send({ message: "API key is required" });
  }

  try {
    const keyRecord = await prismaClient.userApiKey.findUnique({
      where: { key: apiKey },
    });

    if (!keyRecord) {
      return reply.status(403).send({ message: "Invalid API key" });
    }

    if (keyRecord.usageCount >= keyRecord.maxLimit) {
      return reply.status(429).send({
        message:
          "API usage limit reached. Please contact support or wait for the reset.",
      });
    }

    await prismaClient.userApiKey.update({
      where: { key: apiKey },
      data: { usageCount: { increment: 1 } },
    });

    return true;
  } catch (error) {
    console.error("Error limiting API key usage:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};
