import * as dotenv from 'dotenv';
import { Alchemy, Network, AlchemySubscription, AlchemySettings } from 'alchemy-sdk';
import { HandlerConfig, TelegramConfig } from './config';
import { TelegramService, TransactionHandler } from './services';
import targetWallets from './targetWallets.json';
import { TargetWallet } from './models';
import { UniswapService } from './services';

dotenv.config({
  path:
    process.env.NODE_ENV?.toLowerCase() !== 'production' ? `.env.${process.env.NODE_ENV}` : '.env',
});

const main = async () => {
  console.log(`Starting on env: `, process.env.NODE_ENV);

  let network = Network.ETH_GOERLI;
  switch (process.env.NETWORK_NAME) {
    case 'eth-mainnet':
      network = Network.ETH_MAINNET;
      break;
    case 'eth-goerli':
    default:
      network = Network.ETH_GOERLI;
  }

  const alchemConfig: AlchemySettings = {
    apiKey: process.env.ALCHEMY_KEY,
    network: network,
  };

  const tgConfig: TelegramConfig = {
    apiUrl: process.env.TG_API_URL ?? '',
    apiKey: process.env.TG_API_KEY ?? '',
  };

  const walletsToMonitor = loadWallets();

  console.log('Monitoring wallets: ', walletsToMonitor);

  const handlerConfig: HandlerConfig = {
    walletsToMonitor,
    receiverId: process.env.RECEIVER_ID ?? '',
  };

  const alchemy = new Alchemy(alchemConfig);
  const dexService = new UniswapService();
  const msgService = new TelegramService(tgConfig);
  const transactionHandler = new TransactionHandler(handlerConfig, dexService, alchemy, msgService);

  console.log(
    'Listening from transactions on Uniswap address: ',
    process.env.UNISWAP_SWAP_ROUTER_ADDRESS
  );

  alchemy.ws.on(
    {
      method: AlchemySubscription.PENDING_TRANSACTIONS,
      toAddress: process.env.UNISWAP_SWAP_ROUTER_ADDRESS,
    },
    async (tx) => {
      try {
        await transactionHandler.handleTransaction(tx);
      } catch (e) {
        console.log(e);
      }
    }
  );
};

const loadWallets = (): Map<string, TargetWallet> => {
  const map: Map<string, TargetWallet> = new Map<string, TargetWallet>();

  targetWallets.forEach((w) => {
    map[w.address.toLowerCase()] = w;
  });

  return map;
};

main();
