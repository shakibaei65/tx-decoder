import {
    MulticallItem,
    MulticallPayload,
    TransactionParsed,
} from '../../core/transaction-parsed';
import {
    MulticallPayloadRich,
    MulticallRichItem,
    TransactionRich,
} from '../../core/transaction-rich';
import {createUnknownToken, Token} from '../../core/token';
import {TransactionType} from '../../core/transaction-type';
import {CustomTokensService} from '../../helpers/tokens/custom-tokens.service';
import {ChainTokenByNetwork} from '../../const/common.const';
import {LimitOrderFillPayload} from '../../core/transaction-parsed/limit-order-fill-payload';
import {ApproveTxPayload} from '../../core/transaction-parsed/approve-payload';
import {ApproveRich} from '../../core/transaction-rich/approve';
import {
    SwapExactInputRich,
    SwapExactOutputRich,
} from '../../core/transaction-rich/swap-payload';
import {LimitOrderFillRich} from '../../core/transaction-rich/limit-order-fill';
import {
    SwapExactInputPayload,
    SwapExactOutputPayload,
    SwapThroughPoolPayload,
} from '../../core/transaction-parsed/swap-payload';

export class NormalizationService {
    constructor(private customTokenSvc: CustomTokensService) {}

    async normalize(tx: TransactionParsed): Promise<TransactionRich> {
        switch (tx.tag) {
            case TransactionType.Approve:
                return {
                    tag: TransactionType.Approve,
                    raw: tx.raw,
                    payload: await this.normalizeApprove(tx.payload),
                };
            case TransactionType.Unwrap:
                return tx;
            case TransactionType.SwapExactInput:
                return {
                    tag: TransactionType.SwapExactInput,
                    raw: tx.raw,
                    payload: await this.normalizeSwapExactInput(tx.payload),
                };
            case TransactionType.SwapExactOutput:
                return {
                    tag: TransactionType.SwapExactOutput,
                    raw: tx.raw,
                    payload: await this.normalizeSwapExactOutput(tx.payload),
                };
            case TransactionType.LimitOrderFill:
                return {
                    tag: TransactionType.LimitOrderFill,
                    raw: tx.raw,
                    payload: await this.normalizeLimitOrderFill(tx.payload),
                };
            case TransactionType.LimitOrderCancel:
                return tx;
            case TransactionType.Multicall:
                return {
                    tag: TransactionType.Multicall,
                    raw: tx.raw,
                    payload: await this.normalizeMulticall(tx.payload),
                };
            case TransactionType.SwapThroughPool:
                return {
                    tag: TransactionType.SwapThroughPool,
                    raw: tx.raw,
                    payload: await this.normilizeSwapThroughPool(tx.payload),
                };
        }
    }

    
    private async normalizeApprove(
        p?: ApproveTxPayload
    ): Promise<ApproveRich | undefined> {
        if (!p) {
            return undefined;
        } else {
            const t = await this.getToket(p.tokenAddress);
            const token = t ? t : createUnknownToken(p.tokenAddress);
            return {...p, token};
        }
    }

    private async normalizeSwapExactInput(
        p: SwapExactInputPayload
    ): Promise<SwapExactInputRich> {
        const [srcToken, dstToken] = await Promise.all([
            this.getToket(p.srcTokenAddress),
            this.getToket(p.dstTokenAddress),
        ]);

        return {
            ...p,
            srcToken: srcToken
                ? srcToken
                : createUnknownToken(p.srcTokenAddress),
            dstToken: dstToken
                ? dstToken
                : createUnknownToken(p.dstTokenAddress),
        };
    }

    private async normalizeSwapExactOutput(
        p: SwapExactOutputPayload
    ): Promise<SwapExactOutputRich> {
        const [srcToken, dstToken] = await Promise.all([
            this.getToket(p.srcTokenAddress),
            this.getToket(p.dstTokenAddress),
        ]);

        return {
            ...p,
            srcToken: srcToken
                ? srcToken
                : createUnknownToken(p.srcTokenAddress),
            dstToken: dstToken
                ? dstToken
                : createUnknownToken(p.dstTokenAddress),
        };
    }

    private async normalizeLimitOrderFill(
        p: LimitOrderFillPayload
    ): Promise<LimitOrderFillRich> {
        const [srcToken, dstToken] = await Promise.all([
            this.getToket(p.srcTokenAddress),
            this.getToket(p.dstTokenAddress),
        ]);

        return {
            ...p,
            srcToken: srcToken
                ? srcToken
                : createUnknownToken(p.srcTokenAddress),
            dstToken: dstToken
                ? dstToken
                : createUnknownToken(p.dstTokenAddress),
        };
    }

    private async normalizeMulticall(
        p: MulticallPayload
    ): Promise<MulticallPayloadRich> {
        const mapNonError: (i: MulticallItem) => Promise<MulticallRichItem> =
            async (i) => {
                switch (i.tag) {
                    case TransactionType.Approve:
                        return {
                            tag: TransactionType.Approve,
                            payload: await this.normalizeApprove(i.payload),
                        };
                    case TransactionType.Unwrap:
                        return i;
                    case TransactionType.SwapExactInput:
                        return {
                            tag: TransactionType.SwapExactInput,
                            payload: await this.normalizeSwapExactInput(
                                i.payload
                            ),
                        };
                    case TransactionType.SwapExactOutput:
                        return {
                            tag: TransactionType.SwapExactOutput,
                            payload: await this.normalizeSwapExactOutput(
                                i.payload
                            ),
                        };
                    case TransactionType.LimitOrderFill:
                        return {
                            tag: TransactionType.LimitOrderFill,
                            payload: await this.normalizeLimitOrderFill(
                                i.payload
                            ),
                        };
                    case TransactionType.LimitOrderCancel:
                        return i;
                    case TransactionType.Multicall:
                        return {
                            tag: TransactionType.Multicall,
                            payload: await this.normalizeMulticall(i.payload),
                        };
                }
            };

        const ps = p.map(async (i) => {
            switch (i.tag) {
                case 'Error':
                    return i;
                default:
                    return mapNonError(i);
            }
        });

        const payload = await Promise.all(ps);
        return payload;
    }

    private async getToket(
        tokenAddr: string | 'native'
    ): Promise<Token | null> {
        if (tokenAddr == 'native') {
            return ChainTokenByNetwork[this.customTokenSvc.chainId];
        } else {
            return this.customTokenSvc.getTokenByAddress(tokenAddr);
        }
    }

    private async normilizeSwapThroughPool(p: SwapThroughPoolPayload) {
        const [srcToken, dstToken] = await Promise.all([
            this.getToket(p.srcTokenAddress),
            this.getToket(p.srcTokenAddress),
        ]);

        return {
            ...p,
            srcToken: srcToken
                ? srcToken
                : createUnknownToken(p.srcTokenAddress),
            dstToken: dstToken
                ? dstToken
                : createUnknownToken(p.srcTokenAddress),
        };
    }
}
