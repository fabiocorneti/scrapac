import { Logger as TslogLogger, ILogObj } from 'tslog';

export default class Logger {
  private static instance: Logger;

  private impl: TslogLogger<ILogObj>;

  private constructor() {
    this.impl = new TslogLogger({ name: 'scrapac' });
  }

  public static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger();
    }
    return this.instance;
  }

  public debug(...args: unknown[]): void {
    this.impl.debug(...args);
  }
}
