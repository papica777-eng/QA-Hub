import type { Page } from 'playwright';
import type {
  ILocator,
  IElementOptions,
  INavigationOptions,
  IScreenshotOptions,
  ILogger,
} from './interfaces';
import { ElementNotFoundError, ElementStateError, TimeoutError } from './errors';
import { LoggerFactory } from './logger';

/**
 * Abstract Base Page Class
 * Implements Page Object Model pattern with SOLID principles
 * - Single Responsibility: Manages page-level operations
 * - Open/Closed: Open for extension through inheritance, closed for modification
 * - Liskov Substitution: All derived pages can be used interchangeably
 * - Interface Segregation: Provides focused, cohesive methods
 * - Dependency Inversion: Depends on abstractions (ILogger, Page interface)
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly logger: ILogger;
  protected readonly baseUrl: string;
  protected readonly defaultTimeout: number;

  /**
   * Constructor initializes page with required dependencies
   * @param page - Playwright Page instance
   * @param baseUrl - Base URL for the application
   * @param defaultTimeout - Default timeout for operations in milliseconds
   */
  protected constructor(page: Page, baseUrl: string, defaultTimeout: number = 30000) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
    this.logger = LoggerFactory.getInstance().getLogger(this.constructor.name);
  }

  /**
   * Abstract method to get page URL
   * Forces derived classes to define their own URL structure
   */
  protected abstract getPageUrl(): string;

  /**
   * Abstract method to verify page load
   * Forces derived classes to implement their own load verification
   */
  public abstract waitForPageLoad(): Promise<void>;

  /**
   * Navigate to the page
   * @param options - Navigation options
   */
  public async navigate(options?: INavigationOptions): Promise<void> {
    const url = this.getPageUrl();
    this.logger.info(`Navigating to: ${url}`);

    try {
      await this.page.goto(url, {
        timeout: options?.timeout ?? this.defaultTimeout,
        waitUntil: options?.waitUntil ?? 'domcontentloaded',
      });
      await this.waitForPageLoad();
      this.logger.info(`Successfully navigated to: ${url}`);
    } catch (error) {
      this.logger.error(`Navigation failed to: ${url}`, error);
      throw error;
    }
  }

  /**
   * Wait for element to be visible
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds
   */
  protected async waitForElement(locator: ILocator, timeout?: number): Promise<void> {
    const waitTimeout = timeout ?? this.defaultTimeout;
    const selector = this.buildSelector(locator);

    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: waitTimeout,
      });
      this.logger.debug(`Element visible: ${locator.description ?? selector}`);
    } catch (error) {
      this.logger.error(`Element not found: ${locator.description ?? selector}`);
      throw new ElementNotFoundError(locator.description ?? selector, waitTimeout, {
        strategy: locator.strategy,
        value: locator.value,
      });
    }
  }

  /**
   * Click on element
   * @param locator - Element locator
   * @param options - Element options
   */
  protected async click(locator: ILocator, options?: IElementOptions): Promise<void> {
    const selector = this.buildSelector(locator);
    await this.waitForElement(locator, options?.timeout);

    try {
      await this.page.click(selector, {
        timeout: options?.timeout ?? this.defaultTimeout,
        force: options?.force,
        noWaitAfter: options?.noWaitAfter,
        position: options?.position,
      });
      this.logger.info(`Clicked: ${locator.description ?? selector}`);
    } catch (error) {
      this.logger.error(`Click failed: ${locator.description ?? selector}`, error);
      throw error;
    }
  }

  /**
   * Fill input field with text
   * @param locator - Element locator
   * @param text - Text to fill
   * @param options - Element options
   */
  protected async fill(locator: ILocator, text: string, options?: IElementOptions): Promise<void> {
    const selector = this.buildSelector(locator);
    await this.waitForElement(locator, options?.timeout);

    try {
      await this.page.fill(selector, text, {
        timeout: options?.timeout ?? this.defaultTimeout,
        noWaitAfter: options?.noWaitAfter,
      });
      this.logger.info(`Filled text: ${locator.description ?? selector}`);
    } catch (error) {
      this.logger.error(`Fill failed: ${locator.description ?? selector}`, error);
      throw error;
    }
  }

  /**
   * Get text content from element
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds
   * @returns Text content
   */
  protected async getText(locator: ILocator, timeout?: number): Promise<string> {
    const selector = this.buildSelector(locator);
    await this.waitForElement(locator, timeout);

    try {
      const text = await this.page.textContent(selector, {
        timeout: timeout ?? this.defaultTimeout,
      });

      if (text === null) {
        throw new ElementStateError(locator.description ?? selector, 'has text content', {
          strategy: locator.strategy,
          value: locator.value,
        });
      }

      this.logger.debug(`Got text: ${locator.description ?? selector} = "${text}"`);
      return text.trim();
    } catch (error) {
      this.logger.error(`Get text failed: ${locator.description ?? selector}`, error);
      throw error;
    }
  }

  /**
   * Check if element is visible
   * @param locator - Element locator
   * @param timeout - Timeout in milliseconds
   * @returns True if visible, false otherwise
   */
  protected async isVisible(locator: ILocator, timeout?: number): Promise<boolean> {
    const selector = this.buildSelector(locator);

    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: timeout ?? this.defaultTimeout,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for specific amount of time
   * @param milliseconds - Time to wait in milliseconds
   */
  protected async wait(milliseconds: number): Promise<void> {
    this.logger.debug(`Waiting for ${milliseconds}ms`);
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Take screenshot of the page
   * @param options - Screenshot options
   * @returns Screenshot buffer
   */
  protected async takeScreenshot(options?: IScreenshotOptions): Promise<Buffer> {
    this.logger.info('Taking screenshot');
    return await this.page.screenshot({
      path: options?.path,
      fullPage: options?.fullPage ?? false,
      type: options?.type ?? 'png',
      quality: options?.quality,
    });
  }

  /**
   * Build selector string from locator
   * @param locator - Element locator
   * @returns Selector string
   */
  private buildSelector(locator: ILocator): string {
    switch (locator.strategy) {
      case 'css':
        return locator.value;
      case 'xpath':
        return `xpath=${locator.value}`;
      case 'text':
        return `text=${locator.value}`;
      case 'id':
        return `#${locator.value}`;
      case 'testId':
        return `[data-testid="${locator.value}"]`;
      case 'role':
        return `role=${locator.value}`;
      case 'placeholder':
        return `[placeholder="${locator.value}"]`;
      case 'label':
        return `label=${locator.value}`;
      default: {
        const exhaustiveCheck: never = locator.strategy;
        throw new Error(`Unknown locator strategy: ${String(exhaustiveCheck)}`);
      }
    }
  }

  /**
   * Get current page URL
   * @returns Current URL
   */
  protected getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   * @returns Page title
   */
  protected async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for navigation to complete
   * @param timeout - Timeout in milliseconds
   */
  protected async waitForNavigation(timeout?: number): Promise<void> {
    try {
      await this.page.waitForLoadState('domcontentloaded', {
        timeout: timeout ?? this.defaultTimeout,
      });
    } catch (error) {
      throw new TimeoutError('navigation', timeout ?? this.defaultTimeout, {
        url: this.getCurrentUrl(),
      });
    }
  }
}
