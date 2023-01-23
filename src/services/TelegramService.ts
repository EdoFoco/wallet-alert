import https from 'https';
import { TelegramConfig } from '../config';
import { IMessagingProvider } from '../interfaces';
// import { TelegramParseModes } from '../models';

export default class TelegramService implements IMessagingProvider {
  private readonly _config: TelegramConfig;

  constructor(config: TelegramConfig) {
    this._config = config;
  }

  public send = async (receiver: string, text: string): Promise<boolean> => {
    const resp = await this.request('sendMessage', {
      chat_id: receiver,
      text: text,
    });

    return resp.ok;
  };

  private request<T extends Record<string, any>>(
    path: string,
    data?: Record<string, any>
  ): Promise<{ ok: boolean } & Partial<T>> {
    return new Promise((resolve, reject) => {
      const req = https
        .request(
          `${this._config.apiUrl}/bot${this._config.apiKey}/${path}`,
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
          },
          (res) => {
            let result = '';

            res
              .setEncoding('utf-8')
              .on('data', (chunk) => {
                result += chunk;
              })
              .on('end', () => {
                resolve(JSON.parse(result));
              });
          }
        )
        .on('error', (e) => {
          console.log(e);
          reject(e);
        });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }
}
