import {
  getPairsByTokenTool,
  searchPairsTool,
  metadata as dexscreenerPluginMetadata
} from './dexscreener';
import {
  getPriceFeedsTool,
  getRealTimePriceOracleTool,
  metadata as pythPriceFeedsMetadata,
} from './pyth-price-feeds';
import {
  getERC20InfoTool,
  getERC20ApprovalTool,
  getERC20BalanceTool,
  getERC721ApprovalsTool,
  getERC721BalanceTool,
  getERC721InfoTool,
  metadata as contractCallerMetadata
} from './contract-caller'

class PluginRegistry {
  private tools = [
    /* ------------------------------- Dexscreener ------------------------------ */
    searchPairsTool,
    getPairsByTokenTool,

    /* ---------------------------- Pyth Price Feeds ---------------------------- */
    getRealTimePriceOracleTool,
    getPriceFeedsTool,

    /* --------------------------------- Twitter -------------------------------- */

    /* ----------------------------- Contract Caller ---------------------------- */
    getERC20InfoTool,
    getERC20ApprovalTool,
    getERC20BalanceTool,
    getERC721ApprovalsTool,
    getERC721BalanceTool,
    getERC721InfoTool,
  ];

  private metadatas = [
    /* ------------------------------- Dexscreener ------------------------------ */
    dexscreenerPluginMetadata,
    pythPriceFeedsMetadata,
    contractCallerMetadata,
  ]


  getTools() {
    return this.tools;
  }

  getMetadatas() {
    return this.metadatas;
  }
}

export const pluginRegistry = new PluginRegistry();