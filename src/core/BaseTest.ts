import { Browser, BrowserContext, Page, chromium } from 'playwright';
import type { IBrowserConfig, ILogger } from './interfaces';
import { LoggerFactory } from './logger';
import { ConfigurationError } from './errors';

/**
 * Abstract Base Test Class
 * Implements test lifecycle management with SOLID principles
 * - Single Responsibility: Manages test setup, execution, and teardown
 * - Open/Closed: Extensible through inheritance
 * - Dependency Inversion: Depends on abstractions (ILogger, IBrowserConfig)
 */
export abstract class BaseTest {
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected page: Page | null = null;
  protected readonly logger: ILogger;
  protected readonly config: IBrowserConfig;

  /**
   * Constructor initializes test with configuration
   * @param config - Browser configuration
   */
  protected constructor(config: IBrowserConfig) {
    this.validateConfig(config);
    this.config = config;
    this.logger = LoggerFactory.getInstance().getLogger(this.constructor.name);
  }

  /**
   * Setup method - called before each test
   * Initializes browser, context, and page
   */
  protected async setup(): Promise<void> {
    this.logger.info('Setting up test environment');

    try {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        slowMo: this.config.slowMo,
        args: this.config.args ? [...this.config.args] : undefined,
      });

      this.context = await this.browser.newContext({
        viewport: {
          width: this.config.viewport.width,
          height: this.config.viewport.height,
        },
      });

      this.context.setDefaultTimeout(this.config.timeout);

      this.page = await this.context.newPage();

      this.logger.info('Test environment setup completed');
    } catch (error) {
      this.logger.error('Test setup failed', error);
      await this.teardown();
      throw error;
    }
  }

  /**
   * Teardown method - called after each test
   * Cleans up browser, context, and page resources
   */
  protected async teardown(): Promise<void> {
    this.logger.info('Tearing down test environment');

    try {
      if (this.page !== null) {
        await this.page.close();
        this.page = null;
      }

      if (this.context !== null) {
        await this.context.close();
        this.context = null;
      }

      if (this.browser !== null) {
        await this.browser.close();
        this.browser = null;
      }

      this.logger.info('Test environment teardown completed');
    } catch (error) {
      this.logger.error('Test teardown failed', error);
      throw error;
    }
  }

  /**
   * Get current page instance
   * @returns Page instance
   * @throws Error if page is not initialized
   */
  protected getPage(): Page {
    if (this.page === null) {
      throw new Error('Page is not initialized. Call setup() first.');
    }
    return this.page;
  }

  /**
   * Validate browser configuration
   * @param config - Browser configuration to validate
   * @throws ConfigurationError if configuration is invalid
   */
  private validateConfig(config: IBrowserConfig): void {
    if (config.timeout < 0) {
      throw new ConfigurationError('timeout', 'Timeout must be a positive number', {
        timeout: config.timeout,
      });
    }

    if (config.viewport.width <= 0 || config.viewport.height <= 0) {
      throw new ConfigurationError('viewport', 'Viewport dimensions must be positive numbers', {
        viewport: config.viewport,
      });
    }

    if (config.slowMo !== undefined && config.slowMo < 0) {
      throw new ConfigurationError('slowMo', 'slowMo must be a positive number', {
        slowMo: config.slowMo,
      });
    }
  }

  /**
   * Abstract method for test execution
   * Must be implemented by derived classes
   */
  protected abstract runTest(): Promise<void>;

  /**
   * Execute complete test lifecycle
   * Template Method Pattern: defines the skeleton of test execution
   */
  public async execute(): Promise<void> {
    try {
      await this.setup();
      await this.runTest();
    } finally {
      await this.teardown();
    }
  }
}
