import {BigNumber} from 'ethers';
import {TransactionParsed} from '../../../core/transaction-parsed';
import {LimitOrderFillPayload} from '../../../core/transaction-parsed/limit-order-fill-payload';
import {TransactionRaw} from '../../../core/transaction-raw';
import {TransactionType} from '../../../core/transaction-type';
import {decode1InchLimitOrderV2} from './1inch-limit-order-v2-tx.decoder';

describe('decode1InchLimitOrderV2', () => {
    // https://etherscan.io/tx/0xaf0d92ef658aa18343df7cf43cc5b8570f5cb6bf9c047c00bfc626bf9aaf9f15
    it('fillOrder', async () => {
        const tx: TransactionRaw = {
            data: '0x655d13cd00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000074000000000000000000000000000000000000000000000061c4989edab2e99b17f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001605d9ee9862710000000000000000000000000000000000000000000000000000000000016d14e4e7130000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000408e41876cccdc0f92210600ef50372656052a380000000000000000000000003c7789f3cba7134e345a59d1a11ad77b13c7d79100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003b4ad496106b7f00000000000000000000000000000000000000000000000000d3c21bcecced9b0a1f0000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000000005400000000000000000000000000000000000000000000000000000000000000680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044f4a215c3000000000000000000000000000000000000000000003b4ad496106b7f00000000000000000000000000000000000000000000000000d3c21bcecced9b0a1f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044296637bf000000000000000000000000000000000000000000003b4ad496106b7f00000000000000000000000000000000000000000000000000d3c21bcecced9b0a1f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e4961d5b1e000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000119c71d3bbac22029622cbaec24854d3d32d2828000000000000000000000000119c71d3bbac22029622cbaec24854d3d32d28280000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000044cf6fc6e30000000000000000000000003c7789f3cba7134e345a59d1a11ad77b13c7d791000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002463592c2b00000000000000000000000000000000000000000000000000000000621f9a9b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001146b175474e89094c44da98b954eedeac495271d0f0000000000000000000000003c7789f3cba7134e345a59d1a11ad77b13c7d791000000000000000000000000119c71d3bbac22029622cbaec24854d3d32d2828000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000621f9a6b0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000001b91db4d631b029fcb6d7801914182fffd1449227cc449732016a26483a1946449703011102542524a80acc65372bb1536eb02f5b4a4eac2740acbb42bb37256a8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000418e17ca0da2bf01a4b22fc78fd23cd3e4ba9b023a78c9b153fd838e6e883c826656ac0d0544a557f5cc283b199e095dd1dc82e4455980e337670a40f7d5e0ad9f0100000000000000000000000000000000000000000000000000000000000000',
            from: '0x425371f572e3a09ae09d6efa29799b8a86cfb3d3',
            gasLimit: BigNumber.from('0x2c137'),
            gasPrice: BigNumber.from('0x163F29F8A1'),
            to: '0x119c71d3bbac22029622cbaec24854d3d32d2828',
            value: '0',
        };
        const result = decode1InchLimitOrderV2(
            '0x119c71d3bbac22029622cbaec24854d3d32d2828',
            tx
        ) as {tag: 'Success'; tx: TransactionParsed};

        expect(result).toBeDefined();
        expect(result.tag).toBe('Success');

        const parsedTx = result.tx as {
            tag: TransactionType.LimitOrderFill;
            payload: LimitOrderFillPayload;
        };

        expect(parsedTx.tag).toBe(TransactionType.LimitOrderFill);
        expect(parsedTx.payload).toBeDefined();

        expect(parsedTx.payload).toEqual({
            srcTokenAddress: '0x408e41876cCCDC0F92210600ef50372656052a38',
            maxSrcAmount: BigNumber.from('104000000000000000000000'),
            dstTokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            dstAmount: BigNumber.from('28856006759037793841535'),
        });
    });

    // https://etherscan.io/tx/0xb456e13590723eead397615e4cac6448177f47415fa52044f6652f8af14a13f7

    it('fillOrderToWithPermit', async () => {
        const tx: TransactionRaw = {
            data: '0x6073cc2000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002c045a00000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000004d3b2c70208f3fb196affef78080b3cc05ee1cb00000000000000000000000000000000000000000000000000000000000007800000000000000000000000000000000000000000000000000000001f03e938a5000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000006ab9c477246bcaa4a1c3a825f42437ef66c55953000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004d3b2c70208f3fb196affef78080b3cc05ee1cb00000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000002c045a00000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000000005e00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044f4a215c300000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000002c045a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044296637bf00000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000002c045a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000284961d5b1e000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000119c71d3bbac22029622cbaec24854d3d32d2828000000000000000000000000119c71d3bbac22029622cbaec24854d3d32d282800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000e432565d6100000000000000000000000000000000000000000000000000000000000000000000000000000000000000002dadf9264db7eb9e24470a2e6c73efbc4bdf01aa0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000004462534ddf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000006ab9c477246bcaa4a1c3a825f42437ef66c559530000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002463592c2b00000000000000000000000000000000000000000000000000000000621df8e80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041eee10ceb69508a8e21b0cdf248e8c7a4304859cac0a6b7307c108eac0db7447a40cf52dd0ff785565c2137d345a148842f6bf52814b61f3d04eb1db53c33c7e81b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f4a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000004d3b2c70208f3fb196affef78080b3cc05ee1cb000000000000000000000000119c71d3bbac22029622cbaec24854d3d32d2828ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000621df99e000000000000000000000000000000000000000000000000000000000000001ba804c856a43d955a93a17bbb4c47d1995c71903e38b6270b342756f72dd39b243504d4dd3e7d1b1615b98c9855cb069673c457d2bcecc3f50758644b569b8dcf000000000000000000000000',
            from: '0x04d3b2c70208f3fb196affef78080b3cc05ee1cb',
            gasLimit: BigNumber.from('0x2c137'),
            gasPrice: BigNumber.from('0x163F29F8A1'),
            to: '0x119c71d3bbac22029622cbaec24854d3d32d2828',
            value: '0',
        };
        const result = decode1InchLimitOrderV2(
            '0x119c71d3bbac22029622cbaec24854d3d32d2828',
            tx
        ) as {tag: 'Success'; tx: TransactionParsed};

        expect(result).toBeDefined();
        expect(result.tag).toBe('Success');

        const parsedTx = result.tx as {
            tag: TransactionType.LimitOrderFill;
            payload: LimitOrderFillPayload;
        };

        expect(parsedTx.tag).toBe(TransactionType.LimitOrderFill);
        expect(parsedTx.payload).toBeDefined();

        expect(parsedTx.payload).toEqual({
            srcTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            srcAmount: BigNumber.from('2884698'),
            dstTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            minDstAmount: BigNumber.from('1000000000000000'),
        });
    });

    // https://etherscan.io/tx/0xa9a3835417067a0fbc1a83eba09569c683720097bb8ef21fb3f6d239b3c76b12
    it('fillOrderRFQ', async () => {
        const tx: TransactionRaw = {
            data: '0xd0a3b665000000000000000000000000000000000000000061c1bd34aef29df337ce137c000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000066666600e43c6d9e1a249d29d58639dedfcd9ade000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000b5e620f4800000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012309ce54000000000000000000000000000000000000000000000000000000000000000004153cc6f188aac39772e1e3e8ccb68954f4bd64d35be951058a032bf695e6afe5a0c6786755abbc98fe43009ba50a7e808f7c6cead378a05a7c7a9024706f6ccd81b00000000000000000000000000000000000000000000000000000000000000',
            from: '0x7f88a03f2ca5a29046ae1e1562d293962f5722db',
            gasLimit: BigNumber.from('0x2c137'),
            gasPrice: BigNumber.from('0x163F29F8A1'),
            to: '0x119c71d3bbac22029622cbaec24854d3d32d2828',
            value: '0',
        };
        const result = decode1InchLimitOrderV2(
            '0x119c71d3bbac22029622cbaec24854d3d32d2828',
            tx
        ) as {tag: 'Success'; tx: TransactionParsed};

        expect(result).toBeDefined();
        expect(result.tag).toBe('Success');

        const parsedTx = result.tx as {
            tag: TransactionType.LimitOrderFill;
            payload: LimitOrderFillPayload;
        };

        expect(parsedTx.tag).toBe(TransactionType.LimitOrderFill);
        expect(parsedTx.payload).toBeDefined();

        expect(parsedTx.payload).toEqual({
            srcTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            srcAmount: BigNumber.from('20000000000000'),
            dstTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            dstAmount: BigNumber.from('0'),
        });
    });

    // https://etherscan.io/tx/0xdddc8f16d6c867b8acaf9e523ca5480e41fbf71e28709d53a86dc97b320e6476
    it('cancelOrder', async () => {
        const tx: TransactionRaw = {
            data: '0xb244b450000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000151745631d00000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec70000000000000000000000006b0d47016e56a16f3967cb49f7db2502347c95a9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035a4f231000000000000000000000000000000000000000000000000000000605473282800000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000000005400000000000000000000000000000000000000000000000000000000000000560000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044f4a215c30000000000000000000000000000000000000000000000000000000035a4f2310000000000000000000000000000000000000000000000000000006054732828000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044296637bf0000000000000000000000000000000000000000000000000000000035a4f23100000000000000000000000000000000000000000000000000000060547328280000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e4961d5b1e000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000119c71d3bbac22029622cbaec24854d3d32d2828000000000000000000000000119c71d3bbac22029622cbaec24854d3d32d28280000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000044cf6fc6e30000000000000000000000006b0d47016e56a16f3967cb49f7db2502347c95a9000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002463592c2b0000000000000000000000000000000000000000000000000000000062237ecc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            from: '0x6b0d47016e56a16f3967cb49f7db2502347c95a9',
            gasLimit: BigNumber.from('0x2c137'),
            gasPrice: BigNumber.from('0x163F29F8A1'),
            to: '0x119c71d3bbac22029622cbaec24854d3d32d2828',
            value: '0',
        };
        const result = decode1InchLimitOrderV2(
            '0x119c71d3bbac22029622cbaec24854d3d32d2828',
            tx
        ) as {tag: 'Success'; tx: TransactionParsed};

        expect(result).toBeDefined();
        expect(result.tag).toBe('Success');

        const parsedTx = result.tx as {
            tag: TransactionType.LimitOrderCancel;
        };

        expect(parsedTx.tag).toBe(TransactionType.LimitOrderCancel);
    });
});