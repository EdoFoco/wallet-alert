import { TargetWallet } from '../models';

export interface HandlerConfig {
  walletsToMonitor: Map<string, TargetWallet>;
  receiverId: string;
}
