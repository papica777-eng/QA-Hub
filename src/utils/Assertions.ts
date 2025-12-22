import type { IAssertionResult } from '../models/TestModels';
import { AssertionError } from '../core/errors';

/**
 * Assertion utilities for test validation
 * Provides type-safe assertion methods
 * Single Responsibility: Only handles assertions
 */
export class Assertions {
  /**
   * Assert that two values are equal
   * @param actual - Actual value
   * @param expected - Expected value
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertEquals<T>(actual: T, expected: T, message?: string): IAssertionResult {
    const passed = actual === expected;
    const defaultMessage = `Expected ${String(expected)} but got ${String(actual)}`;
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError(expected, actual, finalMessage);
    }

    return this.createResult(passed, expected, actual, finalMessage);
  }

  /**
   * Assert that two values are not equal
   * @param actual - Actual value
   * @param notExpected - Not expected value
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertNotEquals<T>(actual: T, notExpected: T, message?: string): IAssertionResult {
    const passed = actual !== notExpected;
    const defaultMessage = `Expected value to not be ${String(notExpected)}`;
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError(`not ${String(notExpected)}`, actual, finalMessage);
    }

    return this.createResult(passed, `not ${String(notExpected)}`, actual, finalMessage);
  }

  /**
   * Assert that value is truthy
   * @param value - Value to check
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertTrue(value: unknown, message?: string): IAssertionResult {
    const passed = Boolean(value);
    const defaultMessage = `Expected truthy value but got ${String(value)}`;
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError(true, value, finalMessage);
    }

    return this.createResult(passed, true, value, finalMessage);
  }

  /**
   * Assert that value is falsy
   * @param value - Value to check
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertFalse(value: unknown, message?: string): IAssertionResult {
    const passed =
      value === false || value === null || value === undefined || value === 0 || value === '';
    const defaultMessage = `Expected falsy value but got ${String(value)}`;
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError(false, value, finalMessage);
    }

    return this.createResult(passed, false, value, finalMessage);
  }

  /**
   * Assert that value is null
   * @param value - Value to check
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertNull(value: unknown, message?: string): IAssertionResult {
    const passed = value === null;
    const defaultMessage = `Expected null but got ${String(value)}`;
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError(null, value, finalMessage);
    }

    return this.createResult(passed, null, value, finalMessage);
  }

  /**
   * Assert that value is not null
   * @param value - Value to check
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertNotNull(value: unknown, message?: string): IAssertionResult {
    const passed = value !== null;
    const defaultMessage = 'Expected non-null value but got null';
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError('not null', null, finalMessage);
    }

    return this.createResult(passed, 'not null', value, finalMessage);
  }

  /**
   * Assert that string contains substring
   * @param actual - Actual string
   * @param expected - Expected substring
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertContains(
    actual: string,
    expected: string,
    message?: string
  ): IAssertionResult {
    const passed = actual.includes(expected);
    const defaultMessage = `Expected "${actual}" to contain "${expected}"`;
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError(expected, actual, finalMessage);
    }

    return this.createResult(passed, expected, actual, finalMessage);
  }

  /**
   * Assert that array contains element
   * @param array - Array to check
   * @param element - Element to find
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertArrayContains<T>(
    array: readonly T[],
    element: T,
    message?: string
  ): IAssertionResult {
    const passed = array.includes(element);
    const defaultMessage = `Expected array to contain ${String(element)}`;
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError(element, array, finalMessage);
    }

    return this.createResult(passed, element, array, finalMessage);
  }

  /**
   * Assert that value matches regex pattern
   * @param actual - Actual value
   * @param pattern - Regex pattern
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertMatches(actual: string, pattern: RegExp, message?: string): IAssertionResult {
    const passed = pattern.test(actual);
    const defaultMessage = `Expected "${actual}" to match pattern ${pattern.toString()}`;
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError(pattern.toString(), actual, finalMessage);
    }

    return this.createResult(passed, pattern.toString(), actual, finalMessage);
  }

  /**
   * Assert that value is of specific type
   * @param value - Value to check
   * @param expectedType - Expected type
   * @param message - Custom error message
   * @returns Assertion result
   */
  public static assertType(
    value: unknown,
    expectedType: string,
    message?: string
  ): IAssertionResult {
    const actualType = typeof value;
    const passed = actualType === expectedType;
    const defaultMessage = `Expected type ${expectedType} but got ${actualType}`;
    const finalMessage = message ?? defaultMessage;

    if (!passed) {
      throw new AssertionError(expectedType, actualType, finalMessage);
    }

    return this.createResult(passed, expectedType, actualType, finalMessage);
  }

  /**
   * Create assertion result object
   * @param passed - Whether assertion passed
   * @param expected - Expected value
   * @param actual - Actual value
   * @param message - Message
   * @returns Assertion result
   */
  private static createResult(
    passed: boolean,
    expected: unknown,
    actual: unknown,
    message: string
  ): IAssertionResult {
    return {
      passed,
      expected,
      actual,
      message,
      timestamp: new Date(),
    };
  }
}
