import { Item } from '../model/tx-ui-items.model';
import {BuilderParams} from '../model/common.model';
import {oneInchRouterV4Swap} from './helpers/1inch-router-v4-swap.helper';
import {findTokenByAddress} from './helpers/tokens.helper';
import {
    getTokensOfUniswapV3Pools
} from './helpers/uni-pool.helper';
import {BigNumber} from '@ethersproject/bignumber';
import {getDestAmountViaEstimation} from './helpers/dest-amount.helper';

export interface UnoswapV3TxItemData {
    amount: string;
    minReturn: string;
    pools: BigNumber[];
}

export async function uniswapV3TxConfirmDataBuilder(
    params: BuilderParams<UnoswapV3TxItemData>
): Promise<Item[]> {
    const {resources, txConfig, data, rpcCaller} = params;

    const {
        amount: srcAmount,
        minReturn: minReturnAmount,
        pools
    } = data;

    const {
        srcTokenAddress,
        dstTokenAddress
    } = await getTokensOfUniswapV3Pools(pools.map(pool => pool.toString()), rpcCaller);

    const srcToken = findTokenByAddress(resources, srcTokenAddress);
    const dstToken = findTokenByAddress(resources, dstTokenAddress);
    const dstAmount = await getDestAmountViaEstimation(params);

    if (!srcToken) {
        throw new Error('Src token is not found for uniswapV3TxConfirmDataBuilder: ' + srcTokenAddress);
    }

    if (!dstToken) {
        throw new Error('Dst token is not found for uniswapV3TxConfirmDataBuilder: ' + dstTokenAddress);
    }

    return oneInchRouterV4Swap({
        srcToken,
        srcAmount,
        dstToken,
        dstAmount,
        minReturnAmount,
        from: txConfig.from.toLowerCase()
    });
}
