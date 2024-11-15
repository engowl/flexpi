import { Pinecone } from "@pinecone-database/pinecone";

export const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? (() => { throw new Error("PINECONE_API_KEY is not defined in environment variables") })(),
});