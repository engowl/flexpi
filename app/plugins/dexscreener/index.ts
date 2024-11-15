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

    if (pairs.length === 0) return "No matching pairs found for the query.";

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
    return `Error searching pairs: ${error.message}`;
  }
}, {
  name: "search_pairs",
  description: `
    Searches for trading pairs or tokens on DexScreener based on a text query, such as a token name, symbol, or partial identifier (e.g., "ETH", "BTC", or "MOG").
    
    Requirements:
    - Input must be a text string representing a token name, symbol, or keyword.
    - The '$' symbol (e.g., "$MOG") will automatically be removed if present in the query.

    Features:
    - Retrieves matching trading pairs or tokens with key metrics:
      - Token address (useful for subsequent 'get_pairs_by_token' calls).
      - Token name and symbol.
      - Blockchain or decentralized exchange (DEX) where the pair is traded.
      - Real-time token price in USD and native currencies.
      - 24-hour trading volume and price change percentage.
      - Liquidity data, including total liquidity in USD.
    - Highlights up to three most relevant matches, focusing on high-volume and well-established pairs.

    Use Cases:
    - When the user provides a token symbol (e.g., "$MOG") or name but no token address.
    - When exploring trading pairs for a token across different blockchains or DEXs.
    - As a preliminary step to identify the token address for further analysis.`,
  schema: z.object({
    query: z.string().describe("The text query to search for trading pairs (e.g., token symbol or name)."),
  }),
  tags: ["DexScreener", "Market Data", "Trading Pairs", "Token Price", "Liquidity", "Market Cap", "Volume", "Search token by symbol"],
});

export const getPairsByTokenTool = tool(async ({ tokenAddresses }) => {
  try {
    const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddresses}`);
    const pairs = response.data.pairs || [];

    if (pairs.length === 0) return "No trading pairs found for the provided token address.";

    // Return detailed data for a few pairs
    const formattedPairs = pairs.slice(0, 3).map((pair:any) => ({
      pairAddress: pair.pairAddress,
      baseToken: pair.baseToken,
      quoteToken: pair.quoteToken,
      priceInUSD: pair.priceUsd,
      priceInNative: pair.priceNative,
      volume24h: pair.volume?.h24,
      liquidityUSD: pair.liquidity?.usd,
    }));

    return JSON.stringify(formattedPairs);
  } catch (error:any) {
    console.error('Error getting pairs by token:', error);
    return `Error getting pairs: ${error.message}`;
  }
}, {
  name: "get_pairs_by_token",
  description: `
    Retrieves trading pairs associated with a specific token address on DexScreener.

    Requirements:
    - Input must be a valid token address (e.g., "0x123...abc").
    - This tool cannot be used with just a token symbol or name; the address is mandatory.

    Features:
    - Fetches all trading pairs for the provided token address with key metrics:
      - Pair address and identifiers.
      - Base and quote tokens, including token addresses and names.
      - Token price in USD and native currencies.
      - 24-hour trading volume and price changes.
      - Total liquidity in USD and pooled token amounts.
    - Useful for analyzing token-specific markets across multiple blockchains or DEXs.

    Use Cases:
    - When the token address is already available, enabling precise data retrieval for its associated trading pairs.
    - Analyzing a token's trading activity, liquidity, and volume across various platforms.
    - Supporting arbitrage strategies by comparing data for multiple trading pairs of the same token.`,
  schema: z.object({
    tokenAddresses: z.string().describe("A single token address or multiple comma-separated token addresses."),
  }),
  tags: ["DexScreener", "Market Data", "Trading Pairs", "Token Price", "Liquidity", "Market Cap", "Volume"]
});
