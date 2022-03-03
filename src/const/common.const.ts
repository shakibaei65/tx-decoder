import {Token} from '../model/common.model';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NATIVE_TOKEN_ADDRESS =
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export enum ChainId {
    Ethereum = 1,
    Ropsten = 3, // Ethereum testnet.
    Kovan = 45,
    OptimismKovan = 69,
    Polygon = 137,
    Mumbai = 80001, // Polygon testnet.
    Optimism = 10,
    Binance = 56,
    Arbitrum = 42161,
    Avalanche = 43114,
    Gnosis = 100,
}

export const TOKEN0_POOL_SELECTOR = '0x0dfe1681';
export const TOKEN1_POOL_SELECTOR = '0xd21220a7';

export const ChainTokenByNetwork: {[key: number]: Token} = {
    1: {
        symbol: 'ETH',
        name: 'Ethereum',
        address: NATIVE_TOKEN_ADDRESS,
        decimals: 18,
        logoURI:
            'https://tokens.1inch.exchange/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
    },
    56: {
        symbol: 'BNB',
        name: 'BNB',
        decimals: 18,
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        logoURI:
            'https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c_1.png',
    },
    137: {
        symbol: 'MATIC',
        name: 'MATIC',
        decimals: 18,
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        logoURI:
            'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
    },
};
