import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent, Tooltip } from '@nextui-org/react';
import Marquee from 'react-fast-marquee';

const PluginList = () => {
  const pluginsList = [
    {
      id: 'dexscreener',
      name: 'Dexscreener',
      icon: '/assets/plugins/dexscreener.svg',
      description: 'Get the latest market-related data for tokens and trading pairs on decentralized exchanges from Dexscreener.',
      dataTags: [
        `Token's price`,
        `Trading pairs`,
        `Market cap`,
        `Volume`,
        `Liquidity`,
      ],
      // bgClass: 'bg-[#000000]'
      bgClass: 'bg-gradient-to-br from-[#000000] to-[#303030] text-white'
    },
    {
      id: 'pyth-price-feeds',
      name: 'Pyth Price Feeds',
      icon: '/assets/plugins/pyth-price-feeds.svg',
      description: 'Access real-time price feeds for traditional assets like stocks, commodities, and forex pairs from the Pyth Network Oracle.',
      dataTags: [
        `Stock prices`,
        `Commodities`,
        `Forex pairs`,
        `Asset prices`,
      ],
      // bgClass: 'bg-[#e6dafe]'
      bgClass: 'bg-gradient-to-br from-[#e6dafe] to-[#f7f5ff] text-black'
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: '/assets/plugins/twitter.svg',
      description: 'Retrieve the latest tweets, user information, and posts from Twitter using the Twitter API.',
      dataTags: [
        `Tweets`,
        `User profiles`,
        `Posts`,
        `User information`,
      ],
      // bgClass: 'bg-[#000000]'
      bgClass: 'bg-gradient-to-br from-[#000000] to-[#303030] text-white'
    },
    {
      id: 'the-graph',
      name: 'The Graph',
      icon: '/assets/plugins/the-graph.svg',
      description: 'Query The Graph subgraphs to fetch detailed data on DeFi protocols, NFTs, and other Ethereum-based applications.',
      dataTags: [
        `Uniswap V3`,
        `ENS`,
      ],
      // bgClass: 'bg-[#6747ed]',
      bgClass: 'bg-gradient-to-br from-[#6747ed] to-[#7d63f7] text-white'

    },
    {
      id: 'blockscout',
      name: 'Blockscout',
      icon: '/assets/plugins/blockscout.svg',
      description: 'Retrieve blockchain data, transaction details, and token balances from the Blockscout API.',
      dataTags: [
        `Blocks`,
        `Transactions`,
        `Token balances`,
        `Network statistics`,
      ],
      // bgClass: 'bg-[#5453d3]'
      bgClass: 'bg-gradient-to-br from-[#5453d3] to-[#6f6ee6] text-white'
    },
    {
      id: 'contract-caller',
      name: 'Contract Caller',
      icon: '/assets/plugins/contract-caller.svg',
      description: 'Interact with smart contracts on the Ethereum blockchain to fetch token balances, approvals, and contract information.',
      dataTags: [
        `ERC20`,
        `ERC721`,
        `Ethereum Mainnet`,
      ],
      // bgClass: 'bg-[#d8d8d8]'
      bgClass: 'bg-gradient-to-br from-[#d8d8d8] to-[#f0f0f0] text-black'
    },
  ];

  return (
    <div className='flex gap-2 max-w-[50vw] w-full'>
      <Tooltip
        content="These are the available plugins that you can use to fetch data from different sources."
        placement="right"
        className='max-w-[16rem]'
        
      >
        <div className="text-sm opacity-60 mb-1 w-fit font-semibold">
          Available data sources
        </div>
      </Tooltip>

      <Marquee autoFill className="grid grid-cols-4 rounded-xl" pauseOnHover speed={90}>
        {pluginsList.map((plugin) => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </Marquee>
    </div>
  );
};


const PluginCard = ({ plugin }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Popover isOpen={isHovered}>
      <PopoverTrigger className='mx-2'>
        <div
          className={`${plugin.bgClass} border-black/10 border py-2 px-4 rounded-xl transition-colors cursor-pointer`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="font-medium text-xs">
              {plugin.name}
            </div>
            <img
              src={plugin.icon}
              alt={plugin.name}
              className="w-6 h-6 rounded-md"
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">
            {plugin.name}
          </div>
          <p className="text-sm text-gray-500">
            {plugin.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {plugin.dataTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PluginList;