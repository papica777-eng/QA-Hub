import type { Page } from 'playwright';
import { BasePage } from '../core/BasePage';
import type { ILocator } from '../core/interfaces';

/**
 * Home Page Model
 * Demonstrates Page Object Model for a home/dashboard page
 */
export class HomePage extends BasePage {
  private readonly locators: HomePageLocators;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
    this.locators = new HomePageLocators();
  }

  /**
   * Get page URL
   * @returns Home page URL
   */
  protected getPageUrl(): string {
    return `${this.baseUrl}/home`;
  }

  /**
   * Wait for page to load
   * Verifies that critical elements are present
   */
  public async waitForPageLoad(): Promise<void> {
    this.logger.info('Waiting for home page to load');
    await this.waitForElement(this.locators.header);
    await this.waitForElement(this.locators.welcomeMessage);
    this.logger.info('Home page loaded successfully');
  }

  /**
   * Get welcome message text
   * @returns Welcome message
   */
  public async getWelcomeMessage(): Promise<string> {
    this.logger.info('Getting welcome message');
    return await this.getText(this.locators.welcomeMessage);
  }

  /**
   * Check if user is logged in by verifying profile icon presence
   * @returns True if logged in, false otherwise
   */
  public async isUserLoggedIn(): Promise<boolean> {
    this.logger.info('Checking if user is logged in');
    return await this.isVisible(this.locators.profileIcon);
  }

  /**
   * Click on profile icon to open menu
   */
  public async clickProfileIcon(): Promise<void> {
    this.logger.info('Clicking profile icon');
    await this.click(this.locators.profileIcon);
  }

  /**
   * Click logout button
   */
  public async logout(): Promise<void> {
    this.logger.info('Logging out');
    await this.clickProfileIcon();
    await this.waitForElement(this.locators.logoutButton);
    await this.click(this.locators.logoutButton);
    await this.waitForNavigation();
    this.logger.info('Logout completed');
  }

  /**
   * Navigate to specific section
   * @param section - Section name
   */
  public async navigateToSection(section: HomePageSection): Promise<void> {
    this.logger.info(`Navigating to section: ${section}`);
    const locator = this.getSectionLocator(section);
    await this.click(locator);
    await this.waitForNavigation();
  }

  /**
   * Get section locator based on section name
   * @param section - Section name
   * @returns Section locator
   */
  private getSectionLocator(section: HomePageSection): ILocator {
    switch (section) {
      case 'dashboard':
        return this.locators.dashboardLink;
      case 'settings':
        return this.locators.settingsLink;
      case 'profile':
        return this.locators.profileLink;
      case 'reports':
        return this.locators.reportsLink;
      default: {
        const exhaustiveCheck: never = section;
        throw new Error(`Unknown section: ${String(exhaustiveCheck)}`);
      }
    }
  }

  /**
   * Verify page title
   * @returns Page title
   */
  public async verifyPageTitle(): Promise<string> {
    return await this.getTitle();
  }

  /**
   * Get current page URL
   * @returns Current URL
   */
  public getCurrentPageUrl(): string {
    return this.getCurrentUrl();
  }
}

/**
 * Home Page Locators
 * Encapsulates all locators for the home page
 */
class HomePageLocators {
  public readonly header: ILocator = {
    strategy: 'testId',
    value: 'page-header',
    description: 'Page header',
  };

  public readonly welcomeMessage: ILocator = {
    strategy: 'testId',
    value: 'welcome-message',
    description: 'Welcome message',
  };

  public readonly profileIcon: ILocator = {
    strategy: 'testId',
    value: 'profile-icon',
    description: 'Profile icon',
  };

  public readonly logoutButton: ILocator = {
    strategy: 'testId',
    value: 'logout-button',
    description: 'Logout button',
  };

  public readonly dashboardLink: ILocator = {
    strategy: 'testId',
    value: 'nav-dashboard',
    description: 'Dashboard navigation link',
  };

  public readonly settingsLink: ILocator = {
    strategy: 'testId',
    value: 'nav-settings',
    description: 'Settings navigation link',
  };

  public readonly profileLink: ILocator = {
    strategy: 'testId',
    value: 'nav-profile',
    description: 'Profile navigation link',
  };

  public readonly reportsLink: ILocator = {
    strategy: 'testId',
    value: 'nav-reports',
    description: 'Reports navigation link',
  };
}

/**
 * Home page section type
 * Defines valid section names for type safety
 */
export type HomePageSection = 'dashboard' | 'settings' | 'profile' | 'reports';
