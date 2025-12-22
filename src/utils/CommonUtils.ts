/**
 * String utility functions with strict type safety
 * Single Responsibility: String manipulation operations
 */
export class StringUtils {
  /**
   * Capitalize first letter of string
   * @param str - Input string
   * @returns Capitalized string
   */
  public static capitalize(str: string): string {
    if (str.length === 0) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert string to camelCase
   * @param str - Input string
   * @returns camelCase string
   */
  public static toCamelCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_match, chr: string) => chr.toUpperCase());
  }

  /**
   * Convert string to snake_case
   * @param str - Input string
   * @returns snake_case string
   */
  public static toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * Truncate string to specified length
   * @param str - Input string
   * @param maxLength - Maximum length
   * @param suffix - Suffix to append (default: '...')
   * @returns Truncated string
   */
  public static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Check if string is empty or whitespace
   * @param str - Input string
   * @returns True if empty or whitespace
   */
  public static isBlank(str: string): boolean {
    return str.trim().length === 0;
  }

  /**
   * Generate random string
   * @param length - Length of random string
   * @param charset - Character set to use
   * @returns Random string
   */
  public static random(
    length: number,
    charset: CharsetType = 'alphanumeric'
  ): string {
    const charsets: Record<CharsetType, string> = {
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      numeric: '0123456789',
      hex: '0123456789abcdef',
    };

    const chars = charsets[charset];
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
}

/**
 * Character set type for random string generation
 */
export type CharsetType = 'alphanumeric' | 'alpha' | 'numeric' | 'hex';

/**
 * Date utility functions with strict type safety
 * Single Responsibility: Date manipulation operations
 */
export class DateUtils {
  /**
   * Format date to ISO string
   * @param date - Date to format
   * @returns ISO formatted string
   */
  public static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Get current timestamp
   * @returns Current timestamp in milliseconds
   */
  public static now(): number {
    return Date.now();
  }

  /**
   * Add days to date
   * @param date - Base date
   * @param days - Number of days to add
   * @returns New date
   */
  public static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add hours to date
   * @param date - Base date
   * @param hours - Number of hours to add
   * @returns New date
   */
  public static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Calculate difference between dates in milliseconds
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Difference in milliseconds
   */
  public static diffInMs(date1: Date, date2: Date): number {
    return Math.abs(date1.getTime() - date2.getTime());
  }

  /**
   * Format date to custom string
   * @param date - Date to format
   * @param format - Format string (YYYY-MM-DD, etc.)
   * @returns Formatted date string
   */
  public static format(date: Date, format: DateFormatType): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formats: Record<DateFormatType, string> = {
      'YYYY-MM-DD': `${year}-${month}-${day}`,
      'DD/MM/YYYY': `${day}/${month}/${year}`,
      'MM/DD/YYYY': `${month}/${day}/${year}`,
      'YYYY-MM-DD HH:mm:ss': `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
    };

    return formats[format];
  }
}

/**
 * Date format type
 */
export type DateFormatType =
  | 'YYYY-MM-DD'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY-MM-DD HH:mm:ss';

/**
 * Retry utility for flaky operations
 * Single Responsibility: Retry logic management
 */
export class RetryUtils {
  /**
   * Retry async operation with exponential backoff
   * @param operation - Async operation to retry
   * @param options - Retry options
   * @returns Result of successful operation
   */
  public static async withRetry<T>(
    operation: () => Promise<T>,
    options: IRetryOptions
  ): Promise<T> {
    let lastError: Error | undefined;
    let delay = options.initialDelay;

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < options.maxAttempts) {
          await this.sleep(delay);
          delay *= options.backoffMultiplier ?? 2;
        }
      }
    }

    throw lastError ?? new Error('Retry failed with unknown error');
  }

  /**
   * Sleep for specified duration
   * @param milliseconds - Duration in milliseconds
   */
  private static async sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

/**
 * Retry options interface
 */
export interface IRetryOptions {
  readonly maxAttempts: number;
  readonly initialDelay: number;
  readonly backoffMultiplier?: number;
}
