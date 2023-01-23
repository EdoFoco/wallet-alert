import { TargetWallet } from './TargetWallet';
import { TokenMetadata } from './TokenMetadata';

export class TelegramAlertMessage {
  public tokenIn: TokenMetadata;
  public tokenOut: TokenMetadata;
  public caller: TargetWallet;

  constructor(tokenIn: TokenMetadata, tokenOut: TokenMetadata, caller: TargetWallet) {
    this.tokenIn = tokenIn;
    this.tokenOut = tokenOut;
    this.caller = caller;
  }

  public toMarkdownV2 = (): string => {
    return `Swap detected \nRating: ${this.caller.rating} \nCaller: ${this.caller.description} \nSwap: ${this.tokenIn.symbol} (${this.tokenIn.address}) \nFor:  ${this.tokenOut.symbol} (${this.tokenOut.address})`;
  };
}
