import { BlockchainRpcCaller, Transaction, Web3Resources } from '../model/common.model';
import { BigNumber } from '@ethersproject/bignumber';
import { UniswapV3TxDecoder } from '../decoders/swap/uniswap/uniswap-v3-tx.decoder';
import { getTxTypeByCallData } from '../decoders/swap/uniswap/normalization';
import { Interface } from '@ethersproject/abi';
import { CustomTokensService } from '../helpers/tokens/custom-tokens.service';
import { Web3Service } from '../helpers/web3/web3.service';

const fetch = require('node-fetch');

const nodeUrl = 'https://web3-node-private.1inch.exchange/';
const chainId = 1;

const getTxTypeByCallDataTestData = [
    {
        name: 'ETH -> 1INCH',
        data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000620f9fac000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000e442712a67000000000000000000000000000000000000000000000001e5b8fa8fe2ac00000000000000000000000000000000000000000000000000000062bb20e4b8a7d10000000000000000000000000000000000000000000000000000000000000080000000000000000000000000d8fa3fc359a464bfdd3c7339a10b227732bb1ad90000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000111111111117dc0aa78b770fa6a738034120c30200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000412210e8a00000000000000000000000000000000000000000000000000000000',
        wanted:  [
            {
                'name': 'swapTokensForExactTokens',
                'type': 'SWAP_EXACT_OUTPUT',
                'params': {
                    'dstAmount': {
                        'type': 'BigNumber',
                        'hex': '0x01e5b8fa8fe2ac0000'
                    },
                    'amountInMaximum': {
                        'type': 'BigNumber',
                        'hex': '0x62bb20e4b8a7d1'
                    },
                    'srcTokenAddress': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    'dstTokenAddress': '0x111111111117dc0aa78b770fa6a738034120c302'
                }
            }
        ],
    },
    {
        name: 'DAI -> ETH',
        data: '0x5ae401dc000000000000000000000000000000000000000000000000000000006210f5e0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000c44659a4940000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006210fa69000000000000000000000000000000000000000000000000000000000000001b67119405127cecdbc5c4e3c2a58e3b4cd81a85199cb4353590ea8ab38eccc8f17f3647adf6759aaf257f2b7134e937f90197d0d1d3d22f04715f3239674988250000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000ef5a3f2139f41dd28fbe420f715deb14d4e795f200000000000000000000000000000000000000000000003c3a38e5ab72fc00000000000000000000000000000000000000000000000000000409bcb4da268ea8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        wanted:  [
            {
                "name": "selfPermitAllowed",
                "type": "PERMIT",
                "params": {
                    "token": "0x6b175474e89094c44da98b954eedeac495271d0f",
                    "nonce": {
                        "type": "BigNumber",
                        "hex": "0x00"
                    },
                    "expiry": {
                        "type": "BigNumber",
                        "hex": "0x6210fa69"
                    }
                }
            },
            {
                "name": "exactInputSingle",
                "type": "SWAP_EXACT_INPUT",
                "params": {
                    "srcTokenAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                    "dstTokenAddress": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                    "srcAmount": {
                        "type": "BigNumber",
                        "hex": "0x3c3a38e5ab72fc0000"
                    },
                    "minReturnAmount": {
                        "type": "BigNumber",
                        "hex": "0x0409bcb4da268ea8"
                    }
                }
            }
        ],
    }
]


describe('UniswapV3TxDecoder test', () => {
    let uniswapV3TxDecoder: UniswapV3TxDecoder;
    let resources: Web3Resources;

    const rpcCaller: BlockchainRpcCaller = {
        rpcUrl: nodeUrl,
        call<T>(method: string, params: unknown[]): Promise<T> {
            return fetch(nodeUrl, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'referer': 'http://localhost:4200/',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
                        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                },
                body: JSON.stringify({
                    method,
                    params,
                    jsonrpc: '2.0',
                    id: Date.now()
                })
            })
                .then(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            res => {
                    return res.json();
                })
                .then(
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    res => {
                    return res.result as T;
                });
        }
    };

    beforeAll(async () => {
        resources = await Promise.all([
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            fetch('https://tokens.1inch.io/v1.1/' + chainId).then(res => res.json()),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            fetch('https://token-prices.1inch.io/v1.1/' + chainId).then(res => res.json()),

        ]).then(([tokens, tokenPrices]) => {
            return {
                tokens,
                tokenPrices,
                customTokens: new CustomTokensService(new Web3Service(nodeUrl), chainId),
            } as Web3Resources;
        });
    });

    beforeEach(() => {
        uniswapV3TxDecoder = new UniswapV3TxDecoder(resources, rpcCaller, {
            iface: {} as Interface,
            methodSelector: ''
        }, {data: ''}, chainId);
    });

    it('decodeByConfig() swapExactTokensForTokens + unwrapWETH9', async () => {
        // todo: check why is not parsing correctly
        // 0xac9650d800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000104414bf389000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000001f400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000061ec75470000000000000000000000000000000000000000000000000000000082316dc50000000000000000000000000000000000000000000000000c91e449c32e94e6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004449404b7c0000000000000000000000000000000000000000000000000c91e449c32e94e60000000000000000000000008c121aea8ae7cda4c207975e4b3546b95b94229e00000000000000000000000000000000000000000000000000000000
        const tx: Transaction = {
            data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000620e52eb00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000007fc66500c84a76ad7e9c93437bfc5ac33e2ddae90000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000d8fa3fc359a464bfdd3c7339a10b227732bb1ad9000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000210a14f215690bf000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            // data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000620e5554000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000c4f3995c67000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000000000000030d4000000000000000000000000000000000000000000000000000000000620e5a01000000000000000000000000000000000000000000000000000000000000001b4ac6150b8f7d2abbb1614dc78511036dc00d375add451860d84e5f80061ff9f5675f9cb00ecd4b07407cb63f490c4e796e41fc709f8a05222d992144b63fd3f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000007fc66500c84a76ad7e9c93437bfc5ac33e2ddae90000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000d8fa3fc359a464bfdd3c7339a10b227732bb1ad90000000000000000000000000000000000000000000000000000000000030d400000000000000000000000000000000000000000000000000001f96cf66141dd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            // data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000620e65c20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000000c44659a4940000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000620e6a72000000000000000000000000000000000000000000000000000000000000001b529171c6a0c74dd527dc1c882e122c65ebd44288defe55dcf17a365fc565644939a08cf1bd10ff7a295f9a96c34f1e2d47cb7ad98ff983b91bba029955d506d20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e45023b4df0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000001f40000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000e8d4a51000000000000000000000000000000000000000000000000000000ef528f6390fa9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004449404b7c000000000000000000000000000000000000000000000000000000e8d4a51000000000000000000000000000d8fa3fc359a464bfdd3c7339a10b227732bb1ad900000000000000000000000000000000000000000000000000000000',
            // data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000620f9f4000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000111111111117dc0aa78b770fa6a738034120c3020000000000000000000000000000000000000000000000000000000000002710000000000000000000000000d8fa3fc359a464bfdd3c7339a10b227732bb1ad900000000000000000000000000000000000000000000000000470de4df8200000000000000000000000000000000000000000000000000015912e222de62728b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            // data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000620f9fac000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000e442712a67000000000000000000000000000000000000000000000001e5b8fa8fe2ac00000000000000000000000000000000000000000000000000000062bb20e4b8a7d10000000000000000000000000000000000000000000000000000000000000080000000000000000000000000d8fa3fc359a464bfdd3c7339a10b227732bb1ad90000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000111111111117dc0aa78b770fa6a738034120c30200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000412210e8a00000000000000000000000000000000000000000000000000000000',
            from: '0xd8fa3FC359A464BFDd3C7339A10B227732Bb1Ad9',
            gasLimit: BigNumber.from('0x2c137'),
            gasPrice: BigNumber.from('0x163F29F8A1'),
            to: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
            value: '30000000000000000'
        };
        const result = await uniswapV3TxDecoder.decodeByConfig(tx);

        expect(result).toBeDefined()
    });

    it('decodeByConfig() ETH-> BKX (custom token)', async () => {
        // todo: check why is not parsing correctly
        // 0xac9650d800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000104414bf389000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000001f400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000061ec75470000000000000000000000000000000000000000000000000000000082316dc50000000000000000000000000000000000000000000000000c91e449c32e94e6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004449404b7c0000000000000000000000000000000000000000000000000c91e449c32e94e60000000000000000000000008c121aea8ae7cda4c207975e4b3546b95b94229e00000000000000000000000000000000000000000000000000000000
        const tx: Transaction = {
             data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000620e65c20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000000c44659a4940000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000620e6a72000000000000000000000000000000000000000000000000000000000000001b529171c6a0c74dd527dc1c882e122c65ebd44288defe55dcf17a365fc565644939a08cf1bd10ff7a295f9a96c34f1e2d47cb7ad98ff983b91bba029955d506d20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e45023b4df0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000001f40000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000e8d4a51000000000000000000000000000000000000000000000000000000ef528f6390fa9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004449404b7c000000000000000000000000000000000000000000000000000000e8d4a51000000000000000000000000000d8fa3fc359a464bfdd3c7339a10b227732bb1ad900000000000000000000000000000000000000000000000000000000',
            // data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000620f9f4000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000111111111117dc0aa78b770fa6a738034120c3020000000000000000000000000000000000000000000000000000000000002710000000000000000000000000d8fa3fc359a464bfdd3c7339a10b227732bb1ad900000000000000000000000000000000000000000000000000470de4df8200000000000000000000000000000000000000000000000000015912e222de62728b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            from: '0xd8fa3FC359A464BFDd3C7339A10B227732Bb1Ad9',
            gasLimit: BigNumber.from('0x2c137'),
            gasPrice: BigNumber.from('0x163F29F8A1'),
            to: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
            value: '3000000000000000'
        };
        const result = await uniswapV3TxDecoder.decodeByConfig(tx);

        expect(JSON.stringify(result)).toBe(JSON.stringify({
            "txs": [
                {
                    "dstToken": {
                        "name": "\"BANKEX\" project utility token",
                        "symbol": "BKX",
                        "address": "0x45245bc59219eeaaf6cd3f382e078a461ff9de7b",
                        "decimals": 18
                    },
                    "minReturnAmount": {
                        "type": "BigNumber",
                        "hex": "0x6324a8a68c38b63895"
                    },
                    "srcAmount": {
                        "type": "BigNumber",
                        "hex": "0x0aa87bee538000"
                    },
                    "srcToken": {
                        "symbol": "ETH",
                        "name": "Ethereum",
                        "decimals": 18,
                        "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                        "logoURI": "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
                    }
                }
            ]
        }))
    });

    describe('getTxTypeByCallData', () => {
        getTxTypeByCallDataTestData.forEach(({name, data, wanted}) => {
            it(name, () => {
                const result = getTxTypeByCallData(data, uniswapV3TxDecoder.abiDecoder);
                expect(JSON.stringify(result)).toBe(JSON.stringify(wanted));
            }, 50000);
        });
    });

});

