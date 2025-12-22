/**
 * Browser context configuration interface
 * Defines strict types for browser initialization parameters
 */
export interface IBrowserConfig {
  readonly headless: boolean;
  readonly viewport: IViewport;
  readonly timeout: number;
  readonly slowMo?: number;
  readonly args?: readonly string[];
}

/**
 * Viewport dimensions interface
 */
export interface IViewport {
  readonly width: number;
  readonly height: number;
}

/**
 * Locator strategy types
 * Defines all possible element selection strategies
 */
export type LocatorStrategy =
  | 'css'
  | 'xpath'
  | 'text'
  | 'id'
  | 'testId'
  | 'role'
  | 'placeholder'
  | 'label';

/**
 * Element locator interface
 * Encapsulates element identification strategy and value
 */
export interface ILocator {
  readonly strategy: LocatorStrategy;
  readonly value: string;
  readonly description?: string;
}

/**
 * Test result status types
 */
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'pending';

/**
 * Test result interface
 * Captures comprehensive test execution metadata
 */
export interface ITestResult {
  readonly testName: string;
  readonly status: TestStatus;
  readonly duration: number;
  readonly error?: Error;
  readonly timestamp: Date;
  readonly screenshots?: readonly string[];
}

/**
 * Logger interface
 * Defines contract for logging functionality (Dependency Inversion Principle)
 */
export interface ILogger {
  info(message: string, ...args: readonly unknown[]): void;
  warn(message: string, ...args: readonly unknown[]): void;
  error(message: string, ...args: readonly unknown[]): void;
  debug(message: string, ...args: readonly unknown[]): void;
}

/**
 * Wait condition interface
 * Defines contract for waiting strategies
 */
export interface IWaitCondition {
  readonly timeout: number;
  readonly pollingInterval?: number;
  readonly errorMessage?: string;
}

/**
 * Element interaction options
 */
export interface IElementOptions {
  readonly timeout?: number;
  readonly force?: boolean;
  readonly noWaitAfter?: boolean;
  readonly position?: IPosition;
}

/**
 * Position coordinates interface
 */
export interface IPosition {
  readonly x: number;
  readonly y: number;
}

/**
 * Navigation options interface
 */
export interface INavigationOptions {
  readonly timeout?: number;
  readonly waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

/**
 * Screenshot options interface
 */
export interface IScreenshotOptions {
  readonly path?: string;
  readonly fullPage?: boolean;
  readonly type?: 'png' | 'jpeg';
  readonly quality?: number;
}
