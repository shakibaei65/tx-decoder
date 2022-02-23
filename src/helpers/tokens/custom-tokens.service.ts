import { ChainTokenByNetwork, NATIVE_TOKEN_ADDRESS, NetworkEnum, ZERO_ADDRESS } from '../../const/common.const';
import { Token } from '../../model/common.model';
import { Web3Service } from '../web3/web3.service';

export class CustomTokensService {
    private customTokensMap: { [key: string]: Token } = {}

    constructor(
        readonly web3Service: Web3Service,
        readonly chainId: NetworkEnum
    ) {
        const t: Token = ChainTokenByNetwork[this.chainId] ?
            ChainTokenByNetwork[this.chainId] :
            ChainTokenByNetwork[NetworkEnum.ETHEREUM];

        this.customTokensMap[ZERO_ADDRESS] = t;
        this.customTokensMap[NATIVE_TOKEN_ADDRESS] = t;
    }

  async getTokenByAddress(address: string): Promise<Token | null> {
    try {
      if (this.customTokensMap[address]) {
        return this.customTokensMap[address]
      }

      const data = await this.fetchTokenInfo(address.toLowerCase())
      if (!data) {
        return null
      }
      if (data.decimals === null || data.decimals === undefined) {
        return null
      }

      const info = this.buildMinimizedTokenFromData(data)

      this.customTokensMap[address] = info

      return info
    } catch (e) {
      console.error(e)
      return null
    }
  }

  buildMinimizedTokenFromData(data: Token): Token {
      const info: Token = {name: data.name, symbol: data.symbol, address: data.address, decimals: data.decimals}

    if (data.logoURI) {
      info.logoURI = data.logoURI
    }
    return info
  }

  async fetchTokenInfo(address: string): Promise<Token | null> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises,no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        try {
          resolve(await this.fetchNormalTokenInfo(address))
        } catch (e) {
          if (isUpperCaseToken(e)) {
            try {
              resolve(await this.fetchUpperCaseTokenInfo(address))
            } catch (e) {
              console.error(e)
            }
          } else if (isBytes32TokenInfo(e)) {
            try {
              resolve(await this.fetchBytes32TokenInfo(address))
            } catch (e) {
              console.error(e)
            }
          }
        }
          reject('cannot fetch details for token: ' + address)
      })
    } catch (e) {
        return null
    }
  }

    private async fetchNormalTokenInfo(tokenAddress: string): Promise<Token> {
        const token = new this.web3Service.web3.eth.Contract(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ERC20,
            tokenAddress
        )

        return {
            symbol: await token.methods.symbol().call(),
            name: await token.methods.name().call(),
            address: tokenAddress,
      decimals: Number((await token.methods.decimals().call()).toString())
    }
  }

  private async fetchUpperCaseTokenInfo(
    tokenAddress: string
  ): Promise<Token> {
    const token = new this.web3Service.web3.eth.Contract(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ERC20_UPPER_CASE,
      tokenAddress
    )

    return {
      symbol: await token.methods.SYMBOL().call(),
      name: await token.methods.NAME().call(),
      address: tokenAddress,
      decimals: Number((await token.methods.DECIMALS().call()).toString())
    }
  }

  private async fetchBytes32TokenInfo(tokenAddress: string): Promise<Token> {
    const token = new this.web3Service.web3.eth.Contract(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ERC20_BYTE32,
      tokenAddress
    )

    return {
      symbol: this.web3Service.web3.utils.hexToUtf8(
        await token.methods.symbol().call()
      ),
      name: this.web3Service.web3.utils.hexToUtf8(
        await token.methods.name().call()
      ),
      address: tokenAddress,
      decimals: Number((await token.methods.decimals().call()).toString())
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUpperCaseToken(e: any): boolean {
    return e.toString().indexOf('Reverted 0x') !== -1
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isBytes32TokenInfo(e: any): boolean {
    return (
        e.toString().indexOf('Number can only safely store up to 53 bits') !== -1 ||
        e.toString().indexOf('overflow') !== -1
    )
}

export const isETH = (address: string): boolean => {
    return NATIVE_TOKEN_ADDRESS === address.toLowerCase() || ZERO_ADDRESS === address
}