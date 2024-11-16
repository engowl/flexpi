import { z } from "zod";
import { PluginMetadata } from "../types";
import { tool } from '@langchain/core/tools';
import { Contract, ethers } from "ethers";
import { erc20Abi, erc721Abi } from "viem";

export const metadata: PluginMetadata = {
  name: 'Contract Caller',
  description: 'A suite of tools for querying data from smart contracts on various blockchains. Use these tools to interact with smart contracts, read data from them, and trigger transactions on supported blockchains. Now only supports Ethereum Mainnet (chain ID: 1).',
  tools: [
    {
      id: 'get_erc20_info',
      name: 'Get ERC20 Token Info',
      description: `Fetches detailed information about an ERC20 token by its contract address. Use this tool when you need:
        - Token name, symbol, and decimals
        - Total supply and balance of a specific address
        - Token metadata and contract details
        Returns token information in a structured format.`,
    },
    {
      id: 'get_erc721_info',
      name: 'Get ERC721 Token Info',
      description: `Retrieves metadata and ownership details of an ERC721 token by its contract address and token ID. Use this tool when you need:
        - Token name, symbol, and metadata
        - Owner address and token URI
        - Token details and contract information
        Returns token information in a structured format.`,
    }
  ]
}

const mainnetRpc = 'https://eth.llamarpc.com';

export const getERC20InfoTool = tool(async ({ contractAddress }) => {
  try {
    console.log(`\n\n========== Calling Get ERC20 Token Info with contract address: ${contractAddress} ==========\n\n`);

    const provider = new ethers.JsonRpcProvider(mainnetRpc);
    const contract = new Contract(
      contractAddress,
      erc20Abi,
      provider
    )

    const [name, decimals, symbol, totalSupply] = await Promise.all([
      contract.name(),
      contract.decimals(),
      contract.symbol(),
      contract.totalSupply(),
    ]);

    const data = {
      name,
      symbol,
      decimals: parseInt(decimals),
      totalSupply: parseFloat(ethers.formatUnits(totalSupply, decimals)),
    }

    console.log('Fetched ERC20 token info:', data);

    return JSON.stringify(data);
  } catch (error) {
    console.error('Error fetching ERC20 token info:', error);
    return JSON.stringify("Error fetching ERC20 token info.");
  }
}, {
  name: 'get_erc20_info',
  schema: z.object({
    contractAddress: z.string(),
  }),
  tags: ['ERC20', 'Token', 'ERC20 contract'],
})

export const getERC20BalanceTool = tool(async ({ contractAddress, ownerAddress }) => {
  try {
    console.log(`\n\n========== Calling Get ERC20 Balance with contract address: ${contractAddress}, owner address: ${ownerAddress} ==========\n\n`);

    const provider = new ethers.JsonRpcProvider(mainnetRpc);
    const contract = new Contract(
      contractAddress,
      erc20Abi,
      provider
    )

    const balance = await contract.balanceOf(ownerAddress);

    return JSON.stringify({
      balance: balance.toString()
    });
  } catch (error) {
    console.error('Error fetching ERC20 balance:', error);
    return JSON.stringify("Error fetching ERC20 balance.");
  }
}, {
  name: 'get_erc20_balance',
  schema: z.object({
    contractAddress: z.string(),
    ownerAddress: z.string(),
  }),
  tags: ['ERC20', 'Token', 'ERC20 contract', 'Token Balance'],
})

export const getERC20ApprovalTool = tool(async ({ contractAddress, ownerAddress, spenderAddress }) => {
  try {
    console.log(`\n\n========== Calling Get ERC20 Approval with contract address: ${contractAddress}, owner address: ${ownerAddress}, spender address: ${spenderAddress} ==========\n\n`);

    const provider = new ethers.JsonRpcProvider(mainnetRpc);
    const contract = new Contract(
      contractAddress,
      erc20Abi,
      provider
    )

    const allowance = await contract.allowance(ownerAddress, spenderAddress);

    return JSON.stringify({
      allowance: allowance.toString()
    });
  } catch (error) {
    console.error('Error fetching ERC20 allowance:', error);
    return JSON.stringify("Error fetching ERC20 allowance.");
  }
}, {
  name: 'get_erc20_approval',
  schema: z.object({
    contractAddress: z.string(),
    ownerAddress: z.string(),
    spenderAddress: z.string(),
  }),
  tags: ['ERC20', 'Token', 'ERC20 contract', 'Token Approval'],
})

export const getERC721InfoTool = tool(async ({ contractAddress, tokenId }) => {
  try {
    console.log(`\n\n========== Calling Get ERC721 Token Info with contract address: ${contractAddress}, tokenId: ${tokenId} ==========\n\n`);

    const provider = new ethers.JsonRpcProvider(mainnetRpc);
    const contract = new Contract(
      contractAddress,
      erc721Abi,
      provider
    );

    const [name, symbol, tokenURI, owner] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.tokenURI(tokenId),
      contract.ownerOf(tokenId),
    ]);

    const data = {
      name,
      symbol,
      tokenId,
      tokenURI,
      owner,
    };

    console.log('Fetched ERC721 token info:', data);

    return JSON.stringify(data);
  } catch (error) {
    console.error('Error fetching ERC721 token info:', error);
    return JSON.stringify("Error fetching ERC721 token info.");
  }
}, {
  name: 'get_erc721_info',
  description: `Retrieves detailed information about a specific NFT (ERC721 token) including the collection name and symbol, token metadata URI, current owner, and token validity. This is useful for NFT marketplace integrations, portfolio tracking, ownership verification, and metadata resolution.

  Input Parameters:
  - contractAddress: The Ethereum contract address of the ERC721 NFT collection
  - tokenId: The unique identifier of the specific NFT token
  
  Returns:
  - Collection name and symbol
  - Token metadata URI
  - Current token owner
  - Verification of token existence`,
  schema: z.object({
    contractAddress: z.string(),
    tokenId: z.string(),
  }),
  tags: ['ERC721', 'NFT', 'ERC721 contract'],
});

export const getERC721BalanceTool = tool(async ({ contractAddress, ownerAddress }) => {
  try {
    console.log(`\n\n========== Calling Get ERC721 Balance with contract address: ${contractAddress}, owner address: ${ownerAddress} ==========\n\n`);

    const provider = new ethers.JsonRpcProvider(mainnetRpc);
    const contract = new Contract(
      contractAddress,
      erc721Abi,
      provider
    );

    const balance = await contract.balanceOf(ownerAddress);

    return JSON.stringify({
      balance: balance.toString()
    });
  } catch (error) {
    console.error('Error fetching ERC721 balance:', error);
    return JSON.stringify("Error fetching ERC721 balance.");
  }
}, {
  name: 'get_erc721_balance',
  description: `A tool for checking how many NFTs from a specific collection an address owns. This is useful for portfolio tracking and analysis, eligibility verification for holder benefits, whale wallet analysis, and collection distribution studies.

  Input Parameters:
  - contractAddress: The Ethereum contract address of the ERC721 NFT collection
  - ownerAddress: The Ethereum address to check the NFT balance for
  
  Returns:
  - balance: The total number of NFTs owned by the address from this collection`,
  schema: z.object({
    contractAddress: z.string(),
    ownerAddress: z.string(),
  }),
  tags: ['ERC721', 'NFT', 'ERC721 contract', 'NFT Balance'],
});

export const getERC721ApprovalsTool = tool(async ({ contractAddress, tokenId, ownerAddress, operatorAddress }) => {
  try {
    console.log(`\n\n========== Calling Get ERC721 Approvals with contract address: ${contractAddress}, tokenId: ${tokenId} ==========\n\n`);

    const provider = new ethers.JsonRpcProvider(mainnetRpc);
    const contract = new Contract(
      contractAddress,
      erc721Abi,
      provider
    );

    const [tokenApproval, isApprovedForAll] = await Promise.all([
      contract.getApproved(tokenId),
      contract.isApprovedForAll(ownerAddress, operatorAddress)
    ]);

    return JSON.stringify({
      tokenApproval,
      isApprovedForAll
    });
  } catch (error) {
    console.error('Error fetching ERC721 approvals:', error);
    return JSON.stringify("Error fetching ERC721 approvals.");
  }
}, {
  name: 'get_erc721_approvals',
  description: `A tool for checking NFT approval status and permissions. This is useful for verifying marketplace integrations, monitoring security of approved operators, preparing transactions, and debugging failed transfers.

Input Parameters:
- contractAddress: The Ethereum contract address of the ERC721 NFT collection
- tokenId: The specific NFT token ID to check approvals for
- ownerAddress: The address that owns the NFT
- operatorAddress: The address to check approval status for (usually a marketplace contract)

Returns:
- tokenApproval: The address approved to transfer this specific token
- isApprovedForAll: Boolean indicating if the operator can transfer all tokens from the owner`,
  schema: z.object({
    contractAddress: z.string(),
    tokenId: z.string(),
    ownerAddress: z.string(),
    operatorAddress: z.string(),
  }),
  tags: ['ERC721', 'NFT', 'ERC721 contract', 'NFT Approvals'],
});
