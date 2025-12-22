import { BaseTest } from '../core/BaseTest';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import type { IBrowserConfig } from '../core/interfaces';
import { Assertions } from '../utils/Assertions';
import { TestDataFactory } from '../utils/TestDataFactory';

/**
 * Login Test Suite
 * Demonstrates complete test implementation with Page Object Model
 * Follows SOLID principles and strict type safety
 */
export class LoginTest extends BaseTest {
  private loginPage: LoginPage | null = null;
  private homePage: HomePage | null = null;
  private readonly testBaseUrl: string;

  constructor(config: IBrowserConfig, baseUrl: string) {
    super(config);
    this.testBaseUrl = baseUrl;
  }

  /**
   * Setup test - initializes page objects
   */
  protected override async setup(): Promise<void> {
    await super.setup();
    const page = this.getPage();
    this.loginPage = new LoginPage(page, this.testBaseUrl);
    this.homePage = new HomePage(page, this.testBaseUrl);
  }

  /**
   * Execute login test
   * Tests successful login flow
   */
  protected async runTest(): Promise<void> {
    this.logger.info('Starting login test');

    if (this.loginPage === null || this.homePage === null) {
      throw new Error('Page objects not initialized');
    }

    const credentials = TestDataFactory.createStandardUser();

    await this.loginPage.navigate();
    await this.loginPage.waitForPageLoad();

    const pageTitle = await this.loginPage.getPageTitle();
    this.logger.info(`Login page title: ${pageTitle}`);

    await this.loginPage.login(credentials.username, credentials.password);

    await this.homePage.waitForPageLoad();

    const isLoggedIn = await this.homePage.isUserLoggedIn();
    Assertions.assertTrue(isLoggedIn, 'User should be logged in');

    const welcomeMessage = await this.homePage.getWelcomeMessage();
    Assertions.assertContains(
      welcomeMessage.toLowerCase(),
      'welcome',
      'Welcome message should contain "welcome"'
    );

    this.logger.info('Login test completed successfully');
  }
}

/**
 * Login Error Test Suite
 * Tests login error scenarios
 */
export class LoginErrorTest extends BaseTest {
  private loginPage: LoginPage | null = null;
  private readonly testBaseUrl: string;

  constructor(config: IBrowserConfig, baseUrl: string) {
    super(config);
    this.testBaseUrl = baseUrl;
  }

  /**
   * Setup test - initializes page objects
   */
  protected override async setup(): Promise<void> {
    await super.setup();
    const page = this.getPage();
    this.loginPage = new LoginPage(page, this.testBaseUrl);
  }

  /**
   * Execute login error test
   * Tests login with invalid credentials
   */
  protected async runTest(): Promise<void> {
    this.logger.info('Starting login error test');

    if (this.loginPage === null) {
      throw new Error('Login page not initialized');
    }

    const invalidCredentials = TestDataFactory.createUserCredentials(
      'invaliduser',
      'wrongpassword'
    );

    await this.loginPage.navigate();
    await this.loginPage.waitForPageLoad();

    await this.loginPage.enterUsername(invalidCredentials.username);
    await this.loginPage.enterPassword(invalidCredentials.password);

    const isButtonEnabled = await this.loginPage.isLoginButtonEnabled();
    Assertions.assertTrue(isButtonEnabled, 'Login button should be enabled');

    await this.loginPage.clickLoginButton();

    const errorMessage = await this.loginPage.getErrorMessage();
    Assertions.assertNotNull(errorMessage, 'Error message should be displayed');

    if (errorMessage !== null) {
      Assertions.assertTrue(errorMessage.length > 0, 'Error message should not be empty');
      this.logger.info(`Error message: ${errorMessage}`);
    }

    this.logger.info('Login error test completed successfully');
  }
}

/**
 * Navigation Test Suite
 * Tests navigation functionality
 */
export class NavigationTest extends BaseTest {
  private loginPage: LoginPage | null = null;
  private homePage: HomePage | null = null;
  private readonly testBaseUrl: string;

  constructor(config: IBrowserConfig, baseUrl: string) {
    super(config);
    this.testBaseUrl = baseUrl;
  }

  /**
   * Setup test - initializes page objects
   */
  protected override async setup(): Promise<void> {
    await super.setup();
    const page = this.getPage();
    this.loginPage = new LoginPage(page, this.testBaseUrl);
    this.homePage = new HomePage(page, this.testBaseUrl);
  }

  /**
   * Execute navigation test
   * Tests navigation between sections
   */
  protected async runTest(): Promise<void> {
    this.logger.info('Starting navigation test');

    if (this.loginPage === null || this.homePage === null) {
      throw new Error('Page objects not initialized');
    }

    const credentials = TestDataFactory.createStandardUser();

    await this.loginPage.navigate();
    await this.loginPage.login(credentials.username, credentials.password);
    await this.homePage.waitForPageLoad();

    const sections: Array<'dashboard' | 'settings' | 'profile'> = [
      'dashboard',
      'settings',
      'profile',
    ];

    for (const section of sections) {
      this.logger.info(`Testing navigation to ${section}`);
      await this.homePage.navigateToSection(section);
      const currentUrl = this.homePage.getCurrentPageUrl();
      Assertions.assertContains(currentUrl, section, `URL should contain section: ${section}`);
    }

    this.logger.info('Navigation test completed successfully');
  }
}
