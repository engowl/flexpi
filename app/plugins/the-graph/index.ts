import { tool } from "@langchain/core/tools";
import { PluginMetadata } from "../types";
import { z } from "zod";
import axios from "axios";
import path from "path";
import fs from "fs";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";


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
    },
    {
      id: 'ens_subgraph',
      name: 'ENS Subgraph',
      description: `Query the ENS subgraph to retrieve detailed information about Ethereum Name Service (ENS) domains, owners, and resolver data. Use this tool when you need:
        - Information on ENS domain ownership and resolver settings
        - Data on resolved addresses and ENS domain configurations
        - Insights into ENS domain history and ownership changes
        - Detailed analytics for ENS domains and resolver configurations
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

// Cache for processed SDL chunks


export const uniswapV3SubgraphTool = tool(async ({ query }) => {
  try {
    console.log(`\n\n========== Calling Uniswap V3 Subgraph with query: ${query} ==========\n\n`);

    const sdl = fs.readFileSync(path.join(__dirname, '/sdl/uniswap-v3-optimized.txt'), 'utf-8');
    console.log('SDL:', sdl);

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


    console.log('Calling The Graph...')
    const endpoint = `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`
    const graphResponse = await axios.post(endpoint, {
      query: graphqlQuery
    });

    const responseData = graphResponse.data.data;
    console.log('Response data:', responseData);

    if (!responseData) {
      console.warn("No data found for the specified query.");
      return JSON.stringify("No data found for the specified query.");
    } else {
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

export const ensSubgraphTool = tool(async ({ query }) => {
  try {
    console.log(`\n\n========== Calling ENS Subgraph with query: ${query} ==========\n\n`);

    const sdl = fs.readFileSync(path.join(__dirname, '/sdl/ens-optimized.txt'), 'utf-8');
    console.log('SDL:', sdl);

    // Based on the query, create the graphql query to fetch data from ENS subgraph
    const systemPrompt =
      `
      On your following response, only show the graphql query code and do not use sentences. Only return the graphql query code.

      The following is the schema for the ENS Subgraph:

      ${sdl}

      Based on the above schema, choose the corresponding query to fetch the required data for the given query.

      For any-kind of data, make it quite comprehensive and detailed.
      Make sure you generate the correct query to fetch the required data from the ENS subgraph.

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

    console.log('Calling The Graph...')
    const endpoint = `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/9sVPwghMnW4XkFTJV7T53EtmZ2JdmttuT5sRQe6DXhrq`

    const graphResponse = await axios.post(endpoint, {
      query: graphqlQuery
    });

    const responseData = graphResponse.data.data;
    console.log('Response data:', responseData);

    if (!responseData) {
      console.warn("No data found for the specified query.");
      return JSON.stringify("No data found for the specified query.");
    } else {
      return JSON.stringify(responseData, null, 2);
    }
  } catch (error) {
    console.error(error);
    return JSON.stringify("Failed to fetch data from ENS subgraph.");
  }
}, {
  schema: z.object({
    query: z.string().optional().describe('The detailed natural language query that mentions the what kind of data that want to be fetched from the ENS subgraph and how detailed it should be.'),
  }),
  name: 'ens_subgraph',
  description: `
  Query the ENS subgraph to retrieve detailed information about Ethereum Name Service (ENS) domains, owners, and resolver data. Use this tool to get all data related to ENS.
  Some info:
  - Watch mainly about the resolved address. If a domain has a resolved address, it means that the domain is pointing to a specific address. And that specific address will be used for another query. 
  - Don't really mind about any other address like registrant, resolver address, etc. Mainly focus on the resolved address.  
`,
})

export const uniswapV2SubgraphTool = tool(async ({ query }) => {
  try {
    console.log(`\n\n========== Calling Uniswap V2 with query: ${query} ==========\n\n`);

    const sdl = fs.readFileSync(path.join(__dirname, '/sdl/uniswap-v2-optimized.txt'), 'utf-8');
    console.log('SDL:', sdl);

    // Based on the query, create the graphql query to fetch data from ENS subgraph
    const systemPrompt =
      `
      On your following response, only show the graphql query code and do not use sentences. Only return the graphql query code.

      The following is the schema for the ENS Subgraph:

      ${sdl}

      Based on the above schema, choose the corresponding query to fetch the required data for the given query.

      For any-kind of data, make it quite comprehensive and detailed.
      Make sure you generate the correct query to fetch the required data from the ENS subgraph.

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

    console.log('Calling The Graph...')
    const endpoint = `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu`

    const graphResponse = await axios.post(endpoint, {
      query: graphqlQuery
    });

    const responseData = graphResponse.data.data;
    console.log('Response data:', responseData);

    if (!responseData) {
      console.warn("No data found for the specified query.");
      return JSON.stringify("No data found for the specified query.");
    } else {
      return JSON.stringify(responseData, null, 2);
    }
  } catch (error) {
    console.error(error);
    return JSON.stringify("Failed to fetch data from ENS subgraph.");
  }
}, {
  schema: z.object({
    query: z.string().optional().describe('The detailed natural language query that mentions the what kind of data that want to be fetched from the Uniswap V2 subgraph and how detailed it should be.'),
  }),
  name: 'uniswap_v2_subgraph',
  description: 'Query the Uniswap V2 subgraph to retrieve detailed information about liquidity pools, token swaps, and historical data on the Uniswap V2 decentralized exchange. Use this tool to get all data related to Uniswap V2.',
})
