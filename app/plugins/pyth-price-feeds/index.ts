import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import { PluginMetadata } from "../types";

export const metadata: PluginMetadata = {
  name: 'Pyth Price Feeds',
  description: 'Tools for querying real-time price data from Pyth Network Oracle for stocks, forex, and commodities.',
  tools: [
    {
      id: 'get_realtime_price_oracle',
      name: 'Get Real-Time Price Oracle',
      description: 'Get real-time price data from Pyth Network Oracle for stocks, forex, and commodities.',
    },
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
      return "No price data found for the specified asset.";
    }

    const feedId = feedResponse.data[0]?.id;
    if (!feedId) {
      console.warn("Feed ID is missing in the response data.");
      return "Feed ID missing in response.";
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
      return "No price data available in the response.";
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

    // Return the price data as a JSON string
    return JSON.stringify(response, null, 2);

  } catch (error: any) {
    console.error('Error getting latest price:', error);
    return `Error retrieving price: ${error.message}`;
  }
}, {
  name: "get_realtime_price_oracle",
  description: "Get real-time price data from Pyth Network Oracle for stocks, forex, and commodities.",
  schema: z.object({
    query: z.string().describe("The symbol of the asset to get price for (e.g., 'AAPL', 'USD', 'XAU'). Do not include special characters."),
    assetType: z.string().describe("The type of asset: 'equity' for stocks, 'fx' for forex, 'metal' for commodities."),
  }),
});