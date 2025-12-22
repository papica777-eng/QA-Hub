import type { Page } from 'playwright';
import { BasePage } from '../core/BasePage';
import type { ILocator } from '../core/interfaces';

/**
 * Login Page Model
 * Demonstrates Page Object Model implementation with strict types
 * Follows Single Responsibility Principle - only handles login page operations
 */
export class LoginPage extends BasePage {
  private readonly locators: LoginPageLocators;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
    this.locators = new LoginPageLocators();
  }

  /**
   * Get page URL
   * @returns Login page URL
   */
  protected getPageUrl(): string {
    return `${this.baseUrl}/login`;
  }

  /**
   * Wait for page to load
   * Verifies that critical elements are present
   */
  public async waitForPageLoad(): Promise<void> {
    this.logger.info('Waiting for login page to load');
    await this.waitForElement(this.locators.usernameInput);
    await this.waitForElement(this.locators.passwordInput);
    await this.waitForElement(this.locators.loginButton);
    this.logger.info('Login page loaded successfully');
  }

  /**
   * Enter username
   * @param username - Username to enter
   */
  public async enterUsername(username: string): Promise<void> {
    this.logger.info('Entering username');
    await this.fill(this.locators.usernameInput, username);
  }

  /**
   * Enter password
   * @param password - Password to enter
   */
  public async enterPassword(password: string): Promise<void> {
    this.logger.info('Entering password');
    await this.fill(this.locators.passwordInput, password);
  }

  /**
   * Click login button
   */
  public async clickLoginButton(): Promise<void> {
    this.logger.info('Clicking login button');
    await this.click(this.locators.loginButton);
  }

  /**
   * Perform complete login action
   * @param username - Username
   * @param password - Password
   */
  public async login(username: string, password: string): Promise<void> {
    this.logger.info(`Logging in as: ${username}`);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
    await this.waitForNavigation();
    this.logger.info('Login completed');
  }

  /**
   * Get error message text
   * @returns Error message or null if not present
   */
  public async getErrorMessage(): Promise<string | null> {
    const isErrorVisible = await this.isVisible(this.locators.errorMessage);
    if (!isErrorVisible) {
      return null;
    }
    return await this.getText(this.locators.errorMessage);
  }

  /**
   * Check if login button is enabled
   * @returns True if enabled, false otherwise
   */
  public async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isVisible(this.locators.loginButton);
  }

  /**
   * Get page title
   * @returns Page title
   */
  public async getPageTitle(): Promise<string> {
    return await this.getTitle();
  }
}

/**
 * Login Page Locators
 * Encapsulates all locators for the login page
 * Follows Single Responsibility Principle - only manages locators
 */
class LoginPageLocators {
  public readonly usernameInput: ILocator = {
    strategy: 'testId',
    value: 'username-input',
    description: 'Username input field',
  };

  public readonly passwordInput: ILocator = {
    strategy: 'testId',
    value: 'password-input',
    description: 'Password input field',
  };

  public readonly loginButton: ILocator = {
    strategy: 'testId',
    value: 'login-button',
    description: 'Login submit button',
  };

  public readonly errorMessage: ILocator = {
    strategy: 'testId',
    value: 'error-message',
    description: 'Error message container',
  };

  public readonly rememberMeCheckbox: ILocator = {
    strategy: 'testId',
    value: 'remember-me',
    description: 'Remember me checkbox',
  };

  public readonly forgotPasswordLink: ILocator = {
    strategy: 'testId',
    value: 'forgot-password-link',
    description: 'Forgot password link',
  };
}
