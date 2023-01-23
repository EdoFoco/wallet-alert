export interface IMessagingProvider {
  send(receiver: string, text: string): Promise<boolean>;
}
