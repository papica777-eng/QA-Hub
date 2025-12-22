/**
 * Custom error types for the QA framework
 * Provides specific error handling for different failure scenarios
 */

/**
 * Base error class for all framework errors
 * Follows Open/Closed Principle - open for extension, closed for modification
 */
export abstract class QAFrameworkError extends Error {
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  protected constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when element cannot be found within timeout
 */
export class ElementNotFoundError extends QAFrameworkError {
  public readonly locator: string;

  constructor(locator: string, timeout: number, context?: Record<string, unknown>) {
    super(`Element not found: ${locator} within ${timeout}ms`, context);
    this.locator = locator;
  }
}

/**
 * Thrown when element is found but not in expected state
 */
export class ElementStateError extends QAFrameworkError {
  public readonly locator: string;
  public readonly expectedState: string;

  constructor(locator: string, expectedState: string, context?: Record<string, unknown>) {
    super(`Element ${locator} is not in expected state: ${expectedState}`, context);
    this.locator = locator;
    this.expectedState = expectedState;
  }
}

/**
 * Thrown when page navigation fails
 */
export class NavigationError extends QAFrameworkError {
  public readonly url: string;

  constructor(url: string, reason: string, context?: Record<string, unknown>) {
    super(`Navigation to ${url} failed: ${reason}`, context);
    this.url = url;
  }
}

/**
 * Thrown when timeout occurs during wait operation
 */
export class TimeoutError extends QAFrameworkError {
  public readonly operation: string;
  public readonly timeout: number;

  constructor(operation: string, timeout: number, context?: Record<string, unknown>) {
    super(`Timeout waiting for ${operation} after ${timeout}ms`, context);
    this.operation = operation;
    this.timeout = timeout;
  }
}

/**
 * Thrown when configuration is invalid
 */
export class ConfigurationError extends QAFrameworkError {
  public readonly configKey: string;

  constructor(configKey: string, reason: string, context?: Record<string, unknown>) {
    super(`Configuration error for ${configKey}: ${reason}`, context);
    this.configKey = configKey;
  }
}

/**
 * Thrown when test assertion fails
 */
export class AssertionError extends QAFrameworkError {
  public readonly expected: unknown;
  public readonly actual: unknown;

  constructor(
    expected: unknown,
    actual: unknown,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(
      `Assertion failed: ${message}. Expected: ${String(expected)}, Actual: ${String(actual)}`,
      context
    );
    this.expected = expected;
    this.actual = actual;
  }
}
