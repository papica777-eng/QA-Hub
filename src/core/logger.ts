import type { ILogger } from './interfaces';

/**
 * Logger implementation using console
 * Implements Dependency Inversion Principle through ILogger interface
 * Single Responsibility: Only handles logging operations
 */
export class ConsoleLogger implements ILogger {
  private readonly prefix: string;
  private readonly enableDebug: boolean;

  constructor(prefix: string = '[QA-Hub]', enableDebug: boolean = false) {
    this.prefix = prefix;
    this.enableDebug = enableDebug;
  }

  public info(message: string, ...args: readonly unknown[]): void {
    this.log('INFO', message, args);
  }

  public warn(message: string, ...args: readonly unknown[]): void {
    this.log('WARN', message, args);
  }

  public error(message: string, ...args: readonly unknown[]): void {
    this.log('ERROR', message, args);
  }

  public debug(message: string, ...args: readonly unknown[]): void {
    if (this.enableDebug) {
      this.log('DEBUG', message, args);
    }
  }

  private log(level: string, message: string, args: readonly unknown[]): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `${timestamp} ${this.prefix} [${level}] ${message}`;
    
    if (args.length > 0) {
      console.log(formattedMessage, ...args);
    } else {
      console.log(formattedMessage);
    }
  }
}

/**
 * Factory for creating logger instances
 * Implements Factory Pattern for flexible logger creation
 */
export class LoggerFactory {
  private static instance: LoggerFactory;
  private readonly loggers: Map<string, ILogger>;

  private constructor() {
    this.loggers = new Map<string, ILogger>();
  }

  public static getInstance(): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory();
    }
    return LoggerFactory.instance;
  }

  public getLogger(name: string, enableDebug: boolean = false): ILogger {
    const existingLogger = this.loggers.get(name);
    if (existingLogger) {
      return existingLogger;
    }

    const newLogger = new ConsoleLogger(`[${name}]`, enableDebug);
    this.loggers.set(name, newLogger);
    return newLogger;
  }

  public clearLoggers(): void {
    this.loggers.clear();
  }
}
