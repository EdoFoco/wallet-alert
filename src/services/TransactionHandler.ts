import { Alchemy } from 'alchemy-sdk';
import { HandlerConfig } from '../config';
import { IDex, IMessagingProvider } from '../interfaces';
import { TelegramAlertMessage, TokenMetadata } from '../models';

class TransactionHandler {
  private readonly _config: HandlerConfig;
  private readonly _dexService: IDex;
  private readonly _alchemy: Alchemy;
  private readonly _messagingService: IMessagingProvider;

  constructor(
    config: HandlerConfig,
    dexService: IDex,
    alchemy: Alchemy,
    messagingService: IMessagingProvider
  ) {
    this._config = config;
    this._dexService = dexService;
    this._alchemy = alchemy;
    this._messagingService = messagingService;

    console.log(this._config);
  }

  public handleTransaction = async (tx: any): Promise<void> => {
    if (this._config.walletsToMonitor[tx.from.toLowerCase()] !== undefined) {
      const caller = this._config.walletsToMonitor[tx.from.toLowerCase()];
      console.log('Tx Hash: ', tx.hash);
      const txDetails = this._dexService.decodeTransaction(tx);
      const token1Meta = await this._alchemy.core.getTokenMetadata(txDetails.tokenIn);
      const token2Meta = await this._alchemy.core.getTokenMetadata(txDetails.tokenOut);

      const token1: TokenMetadata = {
        address: txDetails.tokenIn,
        name: token1Meta.name,
        symbol: token1Meta.symbol,
        logo: token1Meta.logo,
      };

      const token2: TokenMetadata = {
        address: txDetails.tokenOut,
        name: token2Meta.name,
        symbol: token2Meta.symbol,
        logo: token2Meta.logo,
      };

      const alert = new TelegramAlertMessage(
        token1,
        token2,
        caller ?? { description: 'Unknown', rating: 0 }
      );
      await this._messagingService.send(this._config.receiverId, alert.toMarkdownV2());
    }
  };
}

export default TransactionHandler;
