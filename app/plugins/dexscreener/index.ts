import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import { PluginMetadata } from "../types";

export const metadata: PluginMetadata = {
  name: 'Dexscreener',
  description: 'A suite of tools for querying data from the DexScreener API. DexScreener provides comprehensive and real-time insights into cryptocurrency trading activity on decentralized exchanges (DEXs) across multiple blockchains. It enables detailed analysis of trading pairs, token metrics, liquidity, and volume, making it essential for DeFi users, traders, and analysts seeking up-to-date market data.',
  tools: [
    {
      id: 'dexscreener_search_pairs',
      name: 'Search Pairs',
      description: `Search for trading pairs or tokens on DexScreener using a text-based query, such as a token symbol (e.g., "ETH" or "$MOG"). Use this tool when only the token name or symbol is provided. 
      
        Key Features:
        - Performs a text-based search and retrieves the most relevant trading pairs matching the query.
        - Ideal for situations where the token address is unavailable.
        - Provides detailed information about each match, including:
          - Pair identifiers and trading symbols.
          - Associated token addresses (to be used in subsequent calls if required).
          - Blockchain or DEX where the pair is traded.
          - Token price, 24-hour price change, volume, liquidity, and FDV (Fully Diluted Valuation).
        - Use case: Always call this tool when the query is based on a token symbol or partial name.`,
    },
    {
      id: 'dexscreener_get_pairs_by_token',
      name: 'Get Pairs by Token',
      description: `Retrieve trading pairs associated with a specific token address. This tool requires a valid token address as input (e.g., "0x123...abc"). 
      
        Key Features:
        - Returns all trading pairs involving the provided token address.
        - Use case: Only use this tool when you have a token address. If starting with a symbol, first call 'search_pairs' to obtain the token address.
        - Provides detailed metrics for each pair, such as:
          - Pair addresses and identifiers.
          - Base and quote tokens with associated metrics.
          - Current token price in USD and native currencies.
          - 24-hour trading volume and liquidity data.
        - Ideal for precise analysis of a token's market activity and trading pairs across multiple blockchains.`,
    },
  ],
};


export const searchPairsTool = tool(async ({ query }) => {
  try {
    console.log(`\n\n========== Calling DexScreener Search Pairs with query: ${query} ==========\n\n`);

    // Remove the '$' symbol if present in the query
    const sanitizedQuery = query.replace(/^\$/, '').trim();

    const response = await axios.get('https://api.dexscreener.com/latest/dex/search', {
      params: { q: sanitizedQuery },
    });
    const pairs = response.data?.pairs || [];

    if (pairs.length === 0) return JSON.stringify("No matching pairs found for the query.");

    // Return key information for the first few matches
    const formattedResults = pairs.slice(0, 3).map((pair: any) => ({
      tokenAddress: pair.baseToken.address,
      tokenName: pair.baseToken.name,
      tokenSymbol: pair.baseToken.symbol,
      priceInUSD: pair.priceUsd,
      volume24h: pair.volume?.h24,
      liquidityUSD: pair.liquidity?.usd,
      pairAddress: pair.pairAddress,
      chainId: pair.chainId,
      fdv: pair.fdv,
      marketCap: pair.marketCap,
      info: pair.info,
      txns: pair.txns,
      volume: pair.volume,
      priceChange: pair.priceChange,
    }));

    return JSON.stringify(formattedResults);
  } catch (error: any) {
    console.error('Error searching for pairs:', error);
    return JSON.stringify(`Error searching for pairs`);
  }
}, {
  name: "search_pairs",
  description: `Searches for trading pairs or tokens on DexScreener based on a text query, such as a token name, symbol, or partial identifier. Retrieves key metrics for matching pairs/tokens including address, name, symbol, blockchain, price, volume, and liquidity. Highlights the top 3 most relevant results. This is useful when the user provides a token symbol or name but no address, or for exploring trading pairs across different blockchains and DEXs.`,
  schema: z.object({
    query: z.string().describe("The text query to search for trading pairs (e.g., token symbol or name)."),
  }),
  tags: ["DexScreener", "Market Data", "Trading Pairs", "Token Price", "Liquidity", "Market Cap", "Volume", "Search token by symbol"],
});

export const getPairsByTokenTool = tool(async ({ tokenAddresses }) => {
  try {
    const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddresses}`);
    const pairs = response.data.pairs || [];

    if (pairs.length === 0) return JSON.stringify("No trading pairs found for the provided token address.");

    // Return detailed data for a few pairs
    const formattedPairs = pairs.slice(0, 3).map((pair: any) => ({
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
  description: `Retrieves trading pairs associated with a specific token address on DexScreener. Requires a valid token address as input. Fetches all trading pairs for the token with key metrics including pair address, base/quote tokens, prices, volume, and liquidity. This is useful for analyzing a token's trading activity, liquidity, and arbitrage opportunities across multiple blockchains and DEXs.`,
  schema: z.object({
    tokenAddresses: z.string().describe("A single token address or multiple comma-separated token addresses."),
  }),
  tags: ["DexScreener", "Market Data", "Trading Pairs", "Token Price", "Liquidity", "Market Cap", "Volume"]
});
