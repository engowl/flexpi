import { tool } from "@langchain/core/tools";
import { PluginMetadata } from "../types";
import { z } from "zod";
import axios from "axios";
import path from "path";
import fs from "fs";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";


export const metadata: PluginMetadata = {
  name: 'The Graph',
  description: 'The Graph is an indexing protocol for querying data from blockchains, enabling developers to build and access subgraphs, which are open APIs that serve data from Ethereum and IPFS networks. The Graph provides a decentralized and reliable way to access blockchain data, making it easier to build decentralized applications (dApps) and Web3 services.',
  tools: [
    {
      id: 'uniswap_v3_subgraph',
      name: 'Uniswap V3 Subgraph',
      description: `Query the Uniswap V3 subgraph to retrieve detailed information about liquidity pools, token swaps, and historical data on the Uniswap V3 decentralized exchange. Use this tool when you need:
        - Historical data on liquidity pools and token swaps
        - Information on specific token pairs and trading volumes
        - Insights into Uniswap V3 trading activity and liquidity providers
        - Detailed analytics for Uniswap V3 pools and token pairs
        Returns data in a structured format for analysis and visualization.`,
    }
  ]
}

let model;
if (process.env.ANTHROPIC_MODE === "true") {
  model = new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0,
    verbose: true,
  })
} else {
  model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: 'llama3.2',
    verbose: true,
    maxRetries: 3,
  })
}

export const uniswapV3SubgraphTool = tool(async ({ query }) => {
  try {
    console.log(`\n\n========== Calling Uniswap V3 Subgraph with query: ${query} ==========\n\n`);

    const sdl = fs.readFileSync(path.join(__dirname, '/sdl/uniswap-v3.txt'), 'utf-8');
    console.log(sdl);

    // Based on the query, create the graphql query to fetch data from Uniswap V3 subgraph
    const systemPrompt =
      `
      On your following response, only show the graphql query code and do not use sentences. Only return the graphql query code.

      The following is the schema for the Uniswap V3 Subgraph:

      ${sdl}

      Based on the above schema, choose the corresponding query to fetch the required data for the given query.

      For any-kind of data, make it quite comprehensive and detailed.
      Make sure you generate the correct query to fetch the required data from the Uniswap V3 subgraph.
      Watch out about using gt operator, usually on this subgraph, it will use something like amount_gt: <value>, instead of amount: {gt: <value>}.

      The query languange is GraphQL.
    `

    console.log('Generating graphql query code for:', query);
    const response = await model.invoke(
      [
        new SystemMessage(systemPrompt),
        new HumanMessage(`Please create the graphql query code for: ${query}. Only return the graphql query code.`)
      ]
    );

    const graphqlQuery = response.content;
    console.log('Generated graphql query:', graphqlQuery);

    const endpoint = `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`

    const graphResponse = await axios.post(endpoint, {
      query: graphqlQuery
    });

    const responseData = graphResponse.data.data;
    console.log('Response data:', responseData);

    if (!responseData) {
      console.warn("No data found for the specified query.");
      return JSON.stringify("No data found for the specified query.");
    }else{
      return JSON.stringify(responseData, null, 2);
    }
  } catch (error) {
    console.error(error);
    return JSON.stringify("Failed to fetch data from Uniswap V3 subgraph.");
  }
}, {
  schema: z.object({
    query: z.string().optional().describe('The detailed natural language query that mentions the what kind of data that want to be fetched from the Uniswap V3 subgraph and how detailed it should be.'),
  }),
  name: 'uniswap_v3_subgraph',
  description: 'Query the Uniswap V3 subgraph to retrieve detailed information about liquidity pools, token swaps, and historical data on the Uniswap V3 decentralized exchange. Use this tool to get all data related to Uniswap V3.',
})