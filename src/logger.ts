// 简单的日志记录器
export class Logger {
  private prefix: string

  constructor(prefix: string = '') {
    this.prefix = prefix
  }

  info(message: string, ...args: any[]) {
    console.log(`[INFO] ${this.prefix} ${message}`, ...args)
  }

  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${this.prefix} ${message}`, ...args)
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${this.prefix} ${message}`, ...args)
  }

  debug(message: string, ...args: any[]) {
    console.debug(`[DEBUG] ${this.prefix} ${message}`, ...args)
  }
}

// 创建默认日志记录器
export const logger = new Logger('[WebHook]')

// 创建带前缀的日志记录器
export function createLogger(prefix: string) {
  return new Logger(prefix)
}