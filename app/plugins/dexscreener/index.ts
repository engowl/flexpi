import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import { PluginMetadata } from "../types";

export const metadata: PluginMetadata = {
  name: 'Dexscreener',
  description: 'Tools for querying DexScreener API. Dexscreener is a ...',
  tools: [
    {
      id: 'dexscreener_search_pairs',
      name: 'Search Pairs',
      description: 'Search for trading pairs/tokens matching a text query on DexScreener.',
    },
    {
      id: 'dexscreener_get_pairs_by_token',
      name: 'Get Pairs by Token',
      description: 'Get trading pairs by token address on DexScreener. Can be used if there is a token address available.',
    }
  ]
}

export const searchPairsTool = tool(async ({ query }) => {
  try {
    const response = await axios.get('https://api.dexscreener.com/latest/dex/search', {
      params: { q: query },
    });
    const pair = response.data?.pairs?.[0];
    if (!pair) return "No pair data found";

    // Return the pair data as a JSON string
    return JSON.stringify({
      tokenAddress: pair.baseToken.address,
      tokenName: pair.baseToken.name,
      tokenSymbol: pair.baseToken.symbol,
      priceInUSD: pair.priceUsd,
      priceInNative: pair.priceNative,
      volume24h: pair.volume?.h24,
      liquidityUSD: pair.liquidity?.usd,
      fdv: pair.fdv,
      pairCreatedAt: pair.pairCreatedAt,
    });
  } catch (error: any) {
    console.error('Error searching for pairs:', error);
    return `Error searching pairs: ${error.message}`;
  }
}, {
  name: "search_pairs",
  description: "Search for trading pairs/tokens matching a text query on DexScreener. This tool should be called first for context when only a text-based query is provided.",
  schema: z.object({
    query: z.string().describe("The text query to search for trading pairs."),
  }),
});

export const getPairsByTokenTool = tool(async ({ tokenAddresses }) => {
  try {
    const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddresses}`);
    const pairs = response.data.pairs;
    if (!pairs || pairs.length === 0) return "No pairs found for token";

    // Return the pairs data as a JSON string
    const formattedPairs = pairs.slice(0, 3)
      .filter((pair: any) => pair !== undefined)
      .map((pair: any) => ({
        pairAddress: pair.pairAddress,
        baseToken: pair.baseToken,
        quoteToken: pair.quoteToken,
        priceInUSD: pair.priceUsd,
        priceInNative: pair.priceNative,
        volume24h: pair.volume?.h24,
        liquidityUSD: pair.liquidity?.usd,
      }));

    return JSON.stringify(formattedPairs);
  } catch (error: any) {
    console.error('Error getting pairs by token:', error);
    return `Error getting pairs: ${error.message}`;
  }
}, {
  name: "get_pairs_by_token",
  description: "Get trading pairs by token address on DexScreener.",
  schema: z.object({
    tokenAddresses: z.string().describe("One or multiple comma-separated token addresses."),
  }),
});