import { It, Mock, Times } from 'moq.ts';
import { IDex } from '../../interfaces';
import { DexTransaction, TargetWallet } from '../../models';
import TransactionHandler from '../TransactionHandler';
import { HandlerConfig } from '../../config';

describe('HandleTransaction', () => {
  let dexServiceMock: Mock<IDex>;

  beforeEach(() => {
    dexServiceMock = new Mock<IDex>();
  });

  it('should call DecodeTransaction if transaction wallet is in monitor list', async () => {
    // Arrange
    const decodeTransactionResult: DexTransaction = { tokenIn: 'token1', tokenOut: 'token2' };

    const dex = dexServiceMock
      .setup((i) => i.decodeTransaction(It.IsAny()))
      .returns(decodeTransactionResult)
      .object();

    const wallets = new Map<string, TargetWallet>();
    wallets['wallet1'] = { address: 'wallet1', description: 'xxx', rating: 1 };
    const handlerConfig: HandlerConfig = { walletsToMonitor: wallets };

    const sut = new TransactionHandler(handlerConfig, dex);

    // Act
    sut.handleTransaction({ from: 'wallet1', gasPrice: '0x19b0bec92f' });

    // Assert
    dexServiceMock.verify((i) => i.decodeTransaction(It.IsAny()), Times.Once());
  });

  it('should not call DecodeTransaction if transaction wallet not in monitor list', async () => {
    // Arrange
    const decodeTransactionResult: DexTransaction = { tokenIn: 'token1', tokenOut: 'token2' };

    const dex = dexServiceMock
      .setup((i) => i.decodeTransaction(It.IsAny()))
      .returns(decodeTransactionResult)
      .object();

    const wallets = new Map<string, TargetWallet>();
    wallets['wallet1'] = { address: 'wallet1', description: 'xxx', rating: 1 };
    const handlerConfig: HandlerConfig = { walletsToMonitor: wallets };

    const sut = new TransactionHandler(handlerConfig, dex);

    // Act
    sut.handleTransaction({ from: 'wallet2', gasPrice: '0x19b0bec92f' });

    // Assert
    dexServiceMock.verify((i) => i.decodeTransaction(It.IsAny()), Times.Never());
  });
});
