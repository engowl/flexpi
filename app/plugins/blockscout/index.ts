import { tool } from "@langchain/core/tools";
import { PluginMetadata } from "../types";
import axios from "axios";
import { z } from "zod";

export const metadata: PluginMetadata = {
  name: "Blockscout",
  description: `
      A suite of tools for querying data from the Blockscout API. Blockscout provides detailed blockchain insights, including block data, transaction information, token balances, and network statistics. It is essential for developers, analysts, and users looking to explore blockchain activity, monitor network performance, and analyze token metrics.`,
  tools: [
    {
      id: "get_blocks",
      name: "Get Blocks",
      description: `
          Fetches blocks data from Blockscout based on the specified type.
  
          Key Features:
          - Retrieves detailed information about blocks, including:
            - Gas fees and usage.
            - Block height, hash, and miner details.
            - Timestamp and transaction count.
            - Metadata for the miner, including tags and ENS domain name.
          - Supports different block types: "block", "uncle", or "reorg".
  
          Use Cases:
          - To analyze block data for blockchain statistics.
          - For obtaining miner details and block-specific metrics.`,
    },
    {
      id: "get_stats",
      name: "Get Network Stats",
      description: `
          Fetches general network statistics from Blockscout.
  
          Key Features:
          - Provides high-level statistics about the blockchain, including:
            - Total blocks, addresses, and transactions.
            - Average block time and today's transaction count.
            - Coin price, market cap, and network utilization percentage.
            - Gas usage and prices (average, fast, slow).
  
          Use Cases:
          - To monitor blockchain performance and usage metrics.
          - To understand gas trends and market activity.
          - To gain insights into network health and coin performance.`,
    },
    {
      id: "get_transaction_hash_summary",
      name: "Get Transaction Hash Summary",
      description: `
          Fetches detailed transaction information and its summary from Blockscout.
  
          Key Features:
          - Retrieves transaction details, including:
            - Gas fees, status, method, and token transfers.
          - Provides summarized actions for the transaction, including:
            - Registered actions, token metrics, and other associated details.
          - Handles cases where no transaction exists and returns appropriate messages.
  
          Use Cases:
          - To analyze individual transaction details and related actions.
          - To obtain summarized actions for transactions, including token transfers and protocol interactions.`,
    },
    {
      id: "get_token_balances",
      name: "Get Token Balances",
      description: `
          Fetches token balances for a specific address from Blockscout.
  
          Key Features:
          - Retrieves detailed information about token balances, including:
            - Metadata, token details, and ownership information.
          - Formats and returns token balances in a structured JSON format.
          - Handles errors gracefully and returns meaningful error messages.
  
          Use Cases:
          - To analyze token holdings for a specific address.
          - To retrieve detailed token information for wallets or contracts.`,
    },
  ],
};

export const getBlocks = tool(
  async ({ type }) => {
    try {
      console.log(
        `\n\n========== Calling Blockscout get blocks with type: ${type} ==========\n\n`
      );

      const response = await axios.get(
        "https://eth.blockscout.com/api/v2/blocks",
        {
          params: {
            type,
          },
        }
      );

      if (!response.data || response.data.items.length === 0) {
        console.warn("No data found for the specified type.");
        return JSON.stringify("No blocks data found for the specified type.");
      }

      const rawData = response.data;

      const parsedData = {
        items: rawData.items.map((item: any) => ({
          baseFeePerGas: item.base_fee_per_gas,
          blobGasUsed: item.blob_gas_used,
          gasUsedPercentage: item.gas_used_percentage,
          height: item.height,
          hash: item.hash,
          miner: {
            ensDomainName: item.miner.ens_domain_name,
            hash: item.miner.hash,
            tags: item.miner.metadata?.tags.map((tag: any) => ({
              name: tag.name,
              slug: tag.slug,
              url: tag.meta.url || null,
            })),
          },
          timestamp: item.timestamp,
          transactionCount: item.transaction_count,
        })),
        nextPageParams: {
          blockNumber: rawData.next_page_params.block_number,
          itemsCount: rawData.next_page_params.items_count,
        },
      };

      return JSON.stringify(parsedData, null, 2);
    } catch (error: any) {
      console.error("Error getting blocks:", error);
      return JSON.stringify(`Error retrieving blocks`);
    }
  },
  {
    name: "get_blocks",
    description: `
      Fetches blocks data from Blockscout based on the specified type.
      
      Requirements:
      - Input must specify the block type: "block", "uncle", or "reorg".

      Features:
      - Retrieves detailed information about blocks, including:
        - Gas fees and usage.
        - Block height, hash, and miner details.
        - Timestamp and transaction count.
        - Metadata for the miner, including tags and ENS domain name.

      Use Cases:
      - To analyze block data for blockchain statistics.
      - For obtaining miner details and block-specific metrics.
    `,
    schema: z.object({
      type: z
        .enum(["block", "uncle", "reorg"])
        .describe("The type of blocks to fetch: 'block', 'uncle', or 'reorg'."),
    }),
    tags: [
      "Blockscout",
      "Blockchain Data",
      "Blocks",
      "Transactions",
      "Gas Usage",
    ],
  }
);

export const getStats = tool(
  async () => {
    try {
      console.log(`\n\n========== Calling Blockscout get stats ==========\n\n`);

      const response = await axios.get(
        "https://eth.blockscout.com/api/v2/stats"
      );

      const rawData = response.data;

      const parsedData = {
        totalBlocks: rawData.total_blocks,
        totalAddresses: rawData.total_addresses,
        totalTransactions: rawData.total_transactions,
        averageBlockTime: rawData.average_block_time,
        coinPrice: rawData.coin_price,
        totalGasUsed: rawData.total_gas_used,
        transactionsToday: rawData.transactions_today,
        gasUsedToday: rawData.gas_used_today,
        gasPrices: {
          average: rawData.gas_prices.average,
          fast: rawData.gas_prices.fast,
          slow: rawData.gas_prices.slow,
        },
        staticGasPrice: rawData.static_gas_price,
        marketCap: rawData.market_cap,
        networkUtilizationPercentage: rawData.network_utilization_percentage,
      };

      return JSON.stringify(parsedData, null, 2);
    } catch (error: any) {
      console.error("Error getting stats:", error);
      return JSON.stringify(`Error retrieving stats`);
    }
  },
  {
    name: "get_stats",
    description: `
        Fetches general network statistics from Blockscout.
  
        Features:
        - Provides high-level statistics about the blockchain, including:
          - Total blocks, addresses, and transactions.
          - Average block time and today's transaction count.
          - Coin price, market cap, and network utilization percentage.
          - Gas usage and prices (average, fast, slow).
  
        Use Cases:
        - To monitor blockchain performance and usage metrics.
        - To understand gas trends and market activity.
        - To gain insights into network health and coin performance.
      `,
    schema: z.object({}),
    tags: [
      "Blockscout",
      "Blockchain Stats",
      "Network Statistics",
      "Gas Prices",
      "Market Data",
    ],
  }
);

export const getTransactionHashSummary = tool(
  async ({ transactionHash }) => {
    try {
      console.log(
        `\n\n========== Calling Blockscout get transaction hash summary ==========\n\n`
      );

      const [hashResponse, summaryResponse] = await Promise.all([
        axios
          .get(
            `https://eth.blockscout.com/api/v2/transactions/${transactionHash}`
          )
          .catch((err) => err.response),
        axios
          .get(
            `https://eth.blockscout.com/api/v2/transactions/${transactionHash}/summary`
          )
          .catch((err) => err.response),
      ]);

      if (
        (hashResponse?.status === 404 &&
          hashResponse?.data?.message === "Not found") ||
        (summaryResponse?.status === 404 &&
          summaryResponse?.data?.message === "Not found")
      ) {
        return JSON.stringify(
          {
            message: `No transaction found for hash: ${transactionHash}`,
          },
          null,
          2
        );
      }

      const transactionData = hashResponse.data;
      const summaryData = summaryResponse.data?.data?.summaries || [];

      // Merge responses into a single structured object
      const parsedData = {
        transactionDetails: {
          timestamp: transactionData.timestamp,
          fee: transactionData.fee,
          gasLimit: transactionData.gas_limit,
          block: transactionData.block,
          status: transactionData.status,
          method: transactionData.method,
          confirmations: transactionData.confirmations,
          type: transactionData.type,
          exchangeRate: transactionData.exchange_rate,
          txBurntFee: transactionData.tx_burnt_fee,
          maxFeePerGas: transactionData.max_fee_per_gas,
          hash: transactionData.hash,
          gasPrice: transactionData.gas_price,
          priorityFee: transactionData.priority_fee,
          baseFeePerGas: transactionData.base_fee_per_gas,
          gasUsed: transactionData.gas_used,
          value: transactionData.value,
          revertReason: transactionData.revert_reason,
          decodedInput: transactionData.decoded_input,
          tokenTransfers: transactionData.token_transfers,
          actions: transactionData.actions,
        },
        transactionSummary: summaryData.map((summary: any) => ({
          summaryTemplate: summary.summary_template,
          actionType:
            summary.summary_template_variables?.action_type?.value || null,
          amount: summary.summary_template_variables?.amount?.value || null,
          token: {
            address:
              summary.summary_template_variables?.token?.value?.address || null,
            name:
              summary.summary_template_variables?.token?.value?.name || null,
            symbol:
              summary.summary_template_variables?.token?.value?.symbol || null,
            volume24h:
              summary.summary_template_variables?.token?.value?.volume_24h ||
              null,
            type:
              summary.summary_template_variables?.token?.value?.type || null,
          },
        })),
      };

      return JSON.stringify(parsedData, null, 2);
    } catch (error: any) {
      console.error("Error getting transaction hash summary:", error);
      return JSON.stringify(
        {
          message: `Error retrieving transaction hash summary for hash: ${transactionHash}`,
        },
        null,
        2
      );
    }
  },
  {
    name: "get_transaction_hash_summary",
    description: `
        Fetches detailed transaction information and its summary from Blockscout.
        
        Features:
        - Retrieves transaction details including gas fees, status, method, and token transfers.
        - Merges transaction details with summarized actions and token information.
        - Returns a message if no transaction exists for the given hash.
  
        Use Cases:
        - To analyze individual transaction details and related actions.
        - To obtain summarized actions for transactions, including token transfers and protocol interactions.
      `,
    schema: z.object({
      transactionHash: z
        .string()
        .describe(
          "The hash of the transaction to retrieve details and summary for."
        ),
    }),
    tags: [
      "Blockscout",
      "Transaction Details",
      "Transaction Summary",
      "Blockchain Data",
    ],
  }
);

export const getTokenBalances = tool(
  async ({ addressHash }) => {
    try {
      console.log(
        `\n\n========== Calling Blockscout get token balances for address: ${addressHash} ==========\n\n`
      );

      const response = await axios
        .get(
          `https://eth.blockscout.com/api/v2/addresses/${addressHash}/token-balances`
        )
        .catch((err) => err.response);

      if (response?.status === 404 && response?.data?.message === "Not found") {
        return JSON.stringify(
          {
            message: `No token balances found for hash: ${addressHash}`,
          },
          null,
          2
        );
      }

      const rawData = response.data;

      const parsedData = rawData.map((item: any) => {
        const token = item.token || {};
        const tokenInstance = item.token_instance || {};

        return {
          token: {
            address: token.address || null,
            circulatingMarketCap: token.circulating_market_cap || null,
            decimals: token.decimals || null,
            exchangeRate: token.exchange_rate || null,
            holders: token.holders || null,
            iconUrl: token.icon_url || null,
            name: token.name || null,
            symbol: token.symbol || null,
            totalSupply: token.total_supply || null,
            type: token.type || null,
            volume24h: token.volume_24h || null,
          },
          tokenId: item.token_id || null,
          tokenInstance: tokenInstance
            ? {
                isUnique: tokenInstance.is_unique || false,
                id: tokenInstance.id || null,
                holderAddressHash: tokenInstance.holder_address_hash || null,
                imageUrl: tokenInstance.image_url || null,
                animationUrl: tokenInstance.animation_url || null,
                externalAppUrl: tokenInstance.external_app_url || null,
                metadata: tokenInstance.metadata
                  ? {
                      year: tokenInstance.metadata.year || null,
                      tags: tokenInstance.metadata.tags || [],
                      name: tokenInstance.metadata.name || null,
                      imageUrl: tokenInstance.metadata.image_url || null,
                      homeUrl: tokenInstance.metadata.home_url || null,
                      externalUrl: tokenInstance.metadata.external_url || null,
                      description: tokenInstance.metadata.description || null,
                      attributes: (tokenInstance.metadata.attributes || []).map(
                        (attr: any) => ({
                          value: attr.value || null,
                          traitType: attr.trait_type || null,
                        })
                      ),
                    }
                  : null,
              }
            : null,
          value: item.value || null,
        };
      });

      return JSON.stringify(parsedData, null, 2);
    } catch (error: any) {
      console.error("Error getting token balances:", error);
      return JSON.stringify(
        {
          message: `Error retrieving token balances for address: ${addressHash}`,
        },
        null,
        2
      );
    }
  },
  {
    name: "get_token_balances",
    description: `
        Fetches token balances for a specific address from Blockscout.
        
        Features:
        - Retrieves detailed information about token balances, including metadata, token details, and ownership information.
        - Formats and returns token balances in a structured JSON format.
        - Handles errors gracefully and returns meaningful error messages.
  
        Use Cases:
        - To analyze token holdings for a specific address.
        - To retrieve detailed token information for wallets or contracts.
      `,
    schema: z.object({
      addressHash: z
        .string()
        .describe(
          "The address hash of the wallet or contract to retrieve token balances for."
        ),
    }),
    tags: [
      "Blockscout",
      "Token Balances",
      "Blockchain Data",
      "Token Information",
    ],
  }
);
