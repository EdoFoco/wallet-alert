import { DexTransaction } from '../models';

export interface IDex {
  decodeTransaction(tx: any): DexTransaction;
}
