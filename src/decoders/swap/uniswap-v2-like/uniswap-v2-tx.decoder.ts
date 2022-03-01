import {
    BlockchainRpcCaller,
    DecodeInfo,
    Transaction,
    Web3Resources
} from '../../../model/common.model';
import UniswapRouterV2BI from '../../../abi/UNI2_ROUTER_V2.json';
import ERC20ABI from '../../../abi/ERC20ABI.json';
import { DecoderResult, getParam } from '../../types';
import { BigNumber } from 'ethers';


type DecodeResult = 
    { tag: 'AnotherContract' } | 
    { tag: 'WrongContractCall' } | 
    { tag: 'NotSupported', funcName: string } | 
    { 
        tag: 'Success',
        srcTokenAddress?: string | 'native';
        dstTokenAddress?: string | 'native';
        srcAmount?: string;
        minReturnAmount?: string;
        dstAmount?: BigNumber;
    } | 
    { tag: 'Activation' }

function decodeUniV2Like(contractAddr: string, tx: Transaction): DecodeResult {
    if (contractAddr.toUpperCase() != tx.to.toUpperCase()) {
        return { tag: 'AnotherContract' };
    }

    const abiDecoder = require('abi-decoder');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    abiDecoder.addABI(UniswapRouterV2BI);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    abiDecoder.addABI(ERC20ABI);

    const rootFunc: DecoderResult = abiDecoder.decodeMethod(tx.data);

    switch(rootFunc.name) {
        case 'swapExactETHForTokens': {
            const to = getParam(rootFunc, 'to');
            if(to == null) {
                return { tag: 'WrongContractCall' };
            } else if((to as string).toUpperCase() == tx.from.toUpperCase()) {
                const path = getParam(rootFunc, 'path') as string[];
                const dst = path[path.length - 1];
                const minAmount = getParam(rootFunc, 'amountOutMin') as string;
                return { 
                    tag: 'Success',
                    srcTokenAddress: 'native',
                    dstTokenAddress: dst,
                    srcAmount: tx.value,
                    minReturnAmount: minAmount,
                };
            } 
            return { tag: 'WrongContractCall' };
        }
        case 'approve':
            return { tag: 'Activation' };

        case 'swapExactTokensForTokens': {
            const to = getParam(rootFunc, 'to');
            if(to == null) {
                return { tag: 'WrongContractCall' };
            } else if((to as string).toUpperCase() == tx.from.toUpperCase()) {
                const path = getParam(rootFunc, 'path') as string[];
                const src = path[0];
                const dst = path[path.length - 1];
                const minAmount = getParam(rootFunc, 'amountOutMin') as string;
                return { 
                    tag: 'Success',
                    srcTokenAddress: src,
                    dstTokenAddress: dst,
                    srcAmount: tx.value,
                    minReturnAmount: minAmount,
                };
            } 
            return { tag: 'WrongContractCall' };
        }
        case 'swapExactTokensForETH': {
            const to = getParam(rootFunc, 'to');
            if(to == null) {
                return { tag: 'WrongContractCall' };
            } else if((to as string).toUpperCase() == tx.from.toUpperCase()) {
                const path = getParam(rootFunc, 'path') as string[];
                const src = path[0];
                const minAmount = getParam(rootFunc, 'amountOutMin') as string;
                return { 
                    tag: 'Success',
                    srcTokenAddress: src,
                    dstTokenAddress: 'native',
                    srcAmount: tx.value,
                    minReturnAmount: minAmount,
                };
            } 
            return { tag: 'WrongContractCall' };
        }
        default:
            return { tag: 'NotSupported', funcName: rootFunc.name };
    } 
}


type TxDecoder = (tx: Transaction) => DecodeResult;

// Uniswap V2
// https://etherscan.io/address/0x7a250d5630b4cf539739df2c5dacb4c659f2488d
export function decodeUniswapV2(tx: Transaction): DecodeResult {
    return decodeUniV2Like('0x7a250d5630b4cf539739df2c5dacb4c659f2488d', tx);
}

// Pancake
// https://bscscan.com/address/0x10ed43c718714eb63d5aa57b78b54704e256024e
export function decodePancake(tx: Transaction): DecodeResult {
    return decodeUniV2Like('0x10ed43c718714eb63d5aa57b78b54704e256024e', tx);
}

function combineTxDecoders(decoders: TxDecoder[]): TxDecoder {
    return tx => {
        let res: DecodeResult | null = null;
        for(let d of decoders) {
            if (res != null) {
                break;
            }

            const r = d(tx);
            switch(r.tag) {
                case 'AnotherContract':
                    break;
                default:
                    res = r;
                    break;
            }
        }

        if(res != null) {
            return res;
        }

        return {tag: 'AnotherContract'};
    }
}