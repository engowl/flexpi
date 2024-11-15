import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import { PluginMetadata } from "../types";

export const metadata: PluginMetadata = {
  name: 'Pyth Price Feeds',
  description: 'Real-time financial market data tools powered by Pyth Network Oracle. Use these tools to fetch current market prices for various financial instruments including stocks/equities (e.g., AAPL, MSFT), forex/currency pairs (e.g., EUR/USD, GBP/USD), and commodities/metals (e.g., XAU/USD for gold, XAG/USD for silver).',
  tools: [
    {
      id: 'get_realtime_price_oracle',
      name: 'Get Real-Time Price Oracle',
      description: `Fetches current market prices and confidence intervals for financial assets. Use this tool when you need:
        - Real-time stock prices (e.g., 'AAPL' with assetType 'equity')
        - Currency exchange rates (e.g., 'EUR' with assetType 'fx' for EUR/USD rate)
        - Commodity prices (e.g., 'XAU' with assetType 'metal' for gold prices)
        Returns price, confidence interval, and asset metadata in a structured format.`,
    },
    {
      id: 'get_price_feeds',
      name: 'Get Price Feeds',
      description: `Retrieves detailed feed information and unique identifiers for Pyth Network price feeds. Use this tool when you need:
        - To verify if a particular asset is available on Pyth Network
        - To get metadata about an asset's price feed
        - To obtain the feed ID for subsequent API calls
        Supports queries for stocks/equities, forex pairs, and commodities/metals.`,
    }
  ]
}

// Tool to get real-time price data from Pyth Network Oracle
export const getRealTimePriceOracleTool = tool(async ({ query, assetType }) => {
  try {
    console.log(`\n\n========== Calling Pyth Oracle Price Feed with query: ${query}, assetType: ${assetType} ==========\n\n`);

    const feedResponse = await axios.get('https://hermes.pyth.network/v2/price_feeds', {
      params: {
        query,
        assetType: assetType || undefined,
      },
    });

    if (!feedResponse.data || feedResponse.data.length === 0) {
      console.warn("No data found for the specified query and asset type.");
      return JSON.stringify("No price data found for the specified asset.");
    }

    const feedId = feedResponse.data[0]?.id;
    if (!feedId) {
      console.warn("Feed ID is missing in the response data.");
      return JSON.stringify("Feed ID missing in response.");
    }

    const priceResponse = await axios.get('https://hermes.pyth.network/v2/updates/price/latest', {
      params: {
        ids: [feedId],
        encoding: "hex",
        parsed: true,
        ignore_invalid_price_ids: true,
      },
    });

    if (!priceResponse.data || !priceResponse.data.parsed || !priceResponse.data.parsed[0]) {
      console.warn("No parsed data found in the price response.");
      return JSON.stringify("No price data available in the response.");
    }

    const priceData = priceResponse.data.parsed[0];

    // Calculate the actual price and confidence interval
    const price = parseFloat(priceData.price.price) / Math.pow(10, -priceData.price.expo);
    const conf = parseFloat(priceData.price.conf) / Math.pow(10, -priceData.price.expo);

    const attributes = feedResponse.data[0]?.attributes;

    const response = {
      assetType: attributes.asset_type,
      base: attributes.base,
      description: attributes.description,
      displaySymbol: attributes.display_symbol,
      symbol: attributes.symbol,
      price,
      confidenceInterval: conf,
    }
    console.log('response from pyth oracle:', response);

    return JSON.stringify(response, null, 2);

  } catch (error: any) {
    console.error('Error getting latest price:', error);
    return JSON.stringify(`Error retrieving price`);
  }
}, {
  name: "get_realtime_price_oracle",
  description: `Fetches real-time price data from Pyth Network Oracle for financial assets. This tool should be used when:
    1. You need current market prices for:
       - Stocks/Equities (use assetType 'equity'): e.g., 'AAPL', 'MSFT', 'GOOGL'
       - Forex/Currency pairs (use assetType 'fx'): e.g., 'EUR' for EUR/USD, 'GBP' for GBP/USD
       - Commodities/Metals (use assetType 'metal'): e.g., 'XAU' for gold, 'XAG' for silver
    2. You need both the current price and confidence interval
    3. You need additional metadata about the asset
    
    The tool returns a structured response including:
    - Current price
    - Confidence interval
    - Asset metadata (symbol, description, display symbol)
    - Asset type and base currency`,
  schema: z.object({
    query: z.string().describe("The asset symbol to query. Examples: 'AAPL' for Apple stock, 'EUR' for EUR/USD rate, 'XAU' for gold. Enter only the base symbol without special characters or currency pairs."),
    assetType: z.string().describe("The type of asset being queried. Must be one of: 'equity' (for stocks like AAPL, MSFT), 'fx' (for currency pairs like EUR/USD), or 'metal' (for commodities like XAU/USD for gold)."),
  }),
});

export const getPriceFeedsTool = tool(async ({ query, assetType }) => {
  try {
    console.log(`\n\n========== Calling Pyth Oracle Price Feed with query: ${query}, assetType: ${assetType} ==========\n\n`);

    const feedResponse = await axios.get('https://hermes.pyth.network/v2/price_feeds', {
      params: {
        query,
        assetType: assetType || undefined,
      },
    });

    if (!feedResponse.data || feedResponse.data.length === 0) {
      console.warn("No data found for the specified query and asset type.");
      return JSON.stringify("No price data found for the specified asset.");
    }

    const feedId = feedResponse.data[0]?.id;
    if (!feedId) {
      console.warn("Feed ID is missing in the response data.");
      return JSON.stringify("Feed ID missing in response.");
    }

    return JSON.stringify(feedResponse.data[0], null, 2);

  } catch (error: any) {
    console.error('Error getting latest price:', error);
    return JSON.stringify(`Error retrieving price`);
  }
}, {
  name: 'get_price_feeds',
  description: `Retrieves detailed price feed information from Pyth Network Oracle. This tool should be used when:
    1. You need to verify if a particular asset is available on Pyth Network
    2. You need detailed metadata about an asset's price feed, including:
       - Feed ID (unique identifier)
       - Asset attributes
       - Price feed specifications
    3. You're working with:
       - Stocks/Equities (use assetType 'equity'): e.g., 'AAPL', 'MSFT', 'GOOGL'
       - Forex/Currency pairs (use assetType 'fx'): e.g., 'EUR' for EUR/USD, 'GBP' for GBP/USD
       - Commodities/Metals (use assetType 'metal'): e.g., 'XAU' for gold, 'XAG' for silver
    
    Returns complete feed information in a structured format, including the unique feed ID required for other API operations.`,
  schema: z.object({
    query: z.string().describe("The asset symbol to query. Examples: 'AAPL' for Apple stock, 'EUR' for EUR/USD rate, 'XAU' for gold. Enter only the base symbol without special characters or currency pairs."),
    assetType: z.string().describe("The type of asset being queried. Must be one of: 'equity' (for stocks like AAPL, MSFT), 'fx' (for currency pairs like EUR/USD), or 'metal' (for commodities like XAU/USD for gold)."),
  }),
});