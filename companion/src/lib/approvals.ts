/**
 * ERC-20 Token Approval Scanner + Revoke Transaction Builder.
 *
 * Reads on-chain state using viem's public client, lists active allowances
 * and produces revoke (approve=0) transaction calldata.
 */

import {
  parseAbi,
  formatUnits,
  encodeFunctionData,
  createPublicClient,
  http,
  type Hex,
  type Address,
  maxUint256,
} from 'viem';
import { mainnet, polygon, arbitrum, optimism, base } from 'viem/chains';

export interface TokenApproval {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  spender: string;
  spenderLabel?: string;
  allowance: bigint;
  allowanceFormatted: string;
  isUnlimited: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

const erc20Abi = parseAbi([
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
]);

const KNOWN_SPENDERS: Record<string, string> = {
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2 Router',
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'Uniswap V3 Router',
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': '0x Exchange Proxy',
  '0x1111111254eeb25477b68fb85ed929f73a960582': '1inch Router',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap Universal Router',
  '0x881d40237659c251811cec9c364ef91dc08d300c': 'Metamask Swap Router',
};

export function getSpenderLabel(address: string): string | undefined {
  return KNOWN_SPENDERS[address.toLowerCase()];
}

const CHAIN_MAP = { 1: mainnet, 137: polygon, 42161: arbitrum, 10: optimism, 8453: base } as const;
const DEFAULT_RPC: Record<number, string> = {
  1: 'https://eth.llamarpc.com',
  137: 'https://polygon-rpc.com',
  42161: 'https://arb1.arbitrum.io/rpc',
  10: 'https://mainnet.optimism.io',
  8453: 'https://mainnet.base.org',
};

function pickClient(chainId: number, rpcUrl?: string) {
  const chain = (CHAIN_MAP as Record<number, (typeof CHAIN_MAP)[keyof typeof CHAIN_MAP]>)[chainId];
  if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
  return createPublicClient({ chain, transport: http(rpcUrl ?? DEFAULT_RPC[chainId]) });
}

/**
 * Scan the list of tokens for approvals set by `owner`.
 * If `tokenAddresses` is empty, the caller should provide one via token list.
 */
export async function scanApprovals(
  chainId: number,
  owner: string,
  tokenAddresses: string[],
  opts?: { fromBlock?: bigint; rpcUrl?: string },
): Promise<TokenApproval[]> {
  if (tokenAddresses.length === 0) return [];
  const client = pickClient(chainId, opts?.rpcUrl);
  const approvals: TokenApproval[] = [];
  const seen = new Set<string>();

  const approvalEventAbi = parseAbi([
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
  ]);

  for (const tokenAddr of tokenAddresses) {
    try {
      const logs = await client.getLogs({
        address: tokenAddr as Hex,
        event: approvalEventAbi[0],
        args: { owner: owner as Hex },
        fromBlock: opts?.fromBlock ?? 'earliest',
        toBlock: 'latest',
      });

      const spenders = new Set<string>();
      for (const log of logs) {
        const spender = log.args?.spender;
        if (spender) spenders.add((spender as string).toLowerCase());
      }

      for (const spender of spenders) {
        const key = `${tokenAddr.toLowerCase()}-${spender}`;
        if (seen.has(key)) continue;
        seen.add(key);

        try {
          const [allowance, symbol, decimals] = await Promise.all([
            client.readContract({
              address: tokenAddr as Hex,
              abi: erc20Abi,
              functionName: 'allowance',
              args: [owner as Hex, spender as Hex],
            }) as Promise<bigint>,
            client.readContract({
              address: tokenAddr as Hex,
              abi: erc20Abi,
              functionName: 'symbol',
            }) as Promise<string>,
            client.readContract({
              address: tokenAddr as Hex,
              abi: erc20Abi,
              functionName: 'decimals',
            }) as Promise<number>,
          ]);

          if (allowance > 0n) {
            const isUnlimited = allowance >= maxUint256 / 2n;
            const riskLevel: TokenApproval['riskLevel'] = isUnlimited
              ? 'high'
              : allowance > 10n ** BigInt(decimals + 4)
              ? 'medium'
              : 'low';

            approvals.push({
              id: key,
              tokenAddress: tokenAddr,
              tokenSymbol: symbol,
              tokenDecimals: decimals,
              spender,
              spenderLabel: getSpenderLabel(spender),
              allowance,
              allowanceFormatted: isUnlimited ? 'Unlimited' : formatUnits(allowance, decimals),
              isUnlimited,
              riskLevel,
            });
          }
        } catch {
          /* token not standard — skip */
        }
      }
    } catch {
      /* getLogs can fail on restricted RPCs — skip this token */
    }
  }
  return approvals;
}

/**
 * Build an unsigned transaction that revokes (sets allowance to 0).
 */
export function buildRevokeTx(
  tokenAddress: string,
  spender: string,
): { to: Address; data: Hex; value: bigint } {
  return {
    to: tokenAddress as Address,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender as Hex, 0n],
    }),
    value: 0n,
  };
}

export function getSupportedChains(): Array<{ id: number; name: string }> {
  return Object.entries(CHAIN_MAP).map(([id, chain]) => ({
    id: Number(id),
    name: chain.name,
  }));
}
