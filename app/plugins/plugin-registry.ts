import {
  getPairsByTokenTool,
  searchPairsTool,
  metadata as dexscreenerPluginMetadata,
} from "./dexscreener";
import {
  getPriceFeedsTool,
  getRealTimePriceOracleTool,
  metadata as pythPriceFeedsMetadata,
} from "./pyth-price-feeds";
import {
  getERC20InfoTool,
  getERC20ApprovalTool,
  getERC20BalanceTool,
  getERC721ApprovalsTool,
  getERC721BalanceTool,
  getERC721InfoTool,
  metadata as contractCallerMetadata,
} from "./contract-caller";
import {
  uniswapV3SubgraphTool,
  ensSubgraphTool,
  metadata as theGraphMetadata,
} from "./the-graph";
import {
  getBlocks,
  getStats,
  getTokenBalances,
  getTransactionHashSummary,
  metadata as blockscoutMetadata,
} from "./blockscout";
import {
  getUserPostsTool,
  getUserTool,
  searchLatestTweetsTool,
  searchTopTweetsTool,
  searchUsersTool,
  metadata as twitterMetadata,
} from "./untwitter";

class PluginRegistry {
  private tools = [
    /* ------------------------------- Dexscreener ------------------------------ */
    searchPairsTool,
    getPairsByTokenTool,

    /* ---------------------------- Pyth Price Feeds ---------------------------- */
    getRealTimePriceOracleTool,
    getPriceFeedsTool,

    /* --------------------------------- Twitter -------------------------------- */
    searchTopTweetsTool,
    searchLatestTweetsTool,
    searchUsersTool,
    getUserTool,
    getUserPostsTool,

    /* ------------------------------- The Graph ------------------------------- */
    uniswapV3SubgraphTool,
    ensSubgraphTool,

    /* ------------------------------- Blockscout ------------------------------- */
    getBlocks,
    getStats,
    getTransactionHashSummary,
    getTokenBalances,

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
    theGraphMetadata,
    blockscoutMetadata,
    twitterMetadata,
    contractCallerMetadata,
  ];

  getTools() {
    return this.tools;
  }

  getMetadatas() {
    return this.metadatas;
  }
}

export const pluginRegistry = new PluginRegistry();
