import { prismaClient } from '../../lib/prisma';
import { Schema } from '../../types/common';
export const logAPICall = async ({
  userId,
  schema,
  duration,
  response
}: {
  userId: string;
  schema: Schema;
  duration: number;
  response: any;
}) => {
  try {
    await prismaClient.apiCall.create({
      data: {
        userId: userId,
        schema: JSON.parse(JSON.stringify(schema)),
        duration: duration,
        response: JSON.parse(JSON.stringify(response)),
      }
    })
    console.log('API call logged successfully');
  } catch (error) {
    console.error('Error logging API call:', error);
  }
}
