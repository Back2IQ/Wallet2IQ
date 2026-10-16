import { createPublicClient, http, formatEther } from 'viem';
import { mainnet, polygon, bsc, avalanche } from 'viem/chains';

export const RPC_URLS = {
  ethereum: 'https://eth.llamarpc.com',
  polygon: 'https://polygon.llamarpc.com',
  bnb: 'https://binance.llamarpc.com',
  avalanche: 'https://avalanche.llamarpc.com',
};

export const getPublicClient = (chain: 'ethereum' | 'polygon' | 'bnb' | 'avalanche') => {
  const chainConfig = {
    ethereum: mainnet,
    polygon: polygon,
    bnb: bsc,
    avalanche: avalanche,
  }[chain];

  return createPublicClient({
    chain: chainConfig,
    transport: http(RPC_URLS[chain]),
  });
};

export async function getBalance(address: string, chain: 'ethereum' | 'polygon' | 'bnb' | 'avalanche'): Promise<string> {
  const client = getPublicClient(chain);
  const balance = await client.getBalance({ address: address as `0x${string}` });
  return formatEther(balance);
}

export async function getTokenPrice(symbol: string): Promise<number> {
  try {
    const response = await fetch(`https://coins.llama.fi/prices/current/coingecko:${symbol.toLowerCase()}`);
    const data = await response.json();
    const price = data.coins[`coingecko:${symbol.toLowerCase()}`]?.price;
    return typeof price === 'number' ? price : 0;
  } catch (error) {
    console.error('Error fetching price from DeFiLlama:', error);
    return 0;
  }
}
