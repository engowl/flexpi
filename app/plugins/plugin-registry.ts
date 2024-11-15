import {
  getPairsByTokenTool,
  searchPairsTool,
  metadata as dexscreenerPluginMetadata
} from './dexscreener';
import {
  getRealTimePriceOracleTool,
  metadata as pythPriceFeedsMetadata,
} from './pyth-price-feeds';

class PluginRegistry {
  private tools = [
    /* ------------------------------- Dexscreener ------------------------------ */
    searchPairsTool,
    getPairsByTokenTool,

    /* ---------------------------- Pyth Price Feeds ---------------------------- */
    getRealTimePriceOracleTool,

    /* --------------------------------- Twitter -------------------------------- */

    /* ----------------------------- Contract Caller ---------------------------- */

  ];

  private metadatas = [
    /* ------------------------------- Dexscreener ------------------------------ */
    dexscreenerPluginMetadata,
    pythPriceFeedsMetadata,
  ]


  getTools() {
    return this.tools;
  }

  getMetadatas() {
    return this.metadatas;
  }
}

export const pluginRegistry = new PluginRegistry();