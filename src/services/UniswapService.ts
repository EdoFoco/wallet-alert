import { Interface } from '@ethersproject/abi';
import { UniswapV3Abi } from '../abis';
import { IDex } from '../interfaces';
import { DexTransaction } from '../models';

interface UniswapTransaction extends DexTransaction {}

class UniswapService implements IDex {
  public decodeTransaction = (tx: any): UniswapTransaction => {
    const contract = new Interface(UniswapV3Abi);
    const decodedMulticall = contract.parseTransaction({
      data: tx.input,
      value: tx.value,
    });

    // console.log(decodedMulticall);

    if (decodedMulticall.name !== 'multicall')
      throw `Not a multicall transaction: ${decodedMulticall.name}`;

    const decodedSwap = contract.parseTransaction({
      data: decodedMulticall.args['data'][0],
      value: tx.value,
    });

    switch (decodedSwap.name) {
      case 'exactInputSingle':
        return {
          tokenIn: decodedSwap.args[0]['tokenIn'],
          tokenOut: decodedSwap.args[0]['tokenOut'],
        };
      case 'swapExactTokensForTokens':
        return {
          tokenIn: decodedSwap.args['path'][0],
          tokenOut: decodedSwap.args['path'][1],
        };

      default:
        throw `Unable to decode method call ${decodedMulticall.name}`;
    }
  };
}

export default UniswapService;
