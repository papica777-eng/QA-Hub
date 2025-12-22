import type { IUserCredentials, ITestUser, Permission } from '../models/TestModels';

/**
 * Test data factory
 * Creates test data objects with proper types
 * Implements Factory Pattern for test data creation
 */
export class TestDataFactory {
  /**
   * Create standard user credentials
   * @param username - Username
   * @param password - Password
   * @returns User credentials
   */
  public static createUserCredentials(
    username: string,
    password: string
  ): IUserCredentials {
    return {
      username,
      password,
    };
  }

  /**
   * Create admin user credentials
   * @returns Admin user credentials
   */
  public static createAdminUser(): IUserCredentials {
    return {
      username: 'admin',
      password: 'Admin@123',
      email: 'admin@example.com',
      role: 'admin',
    };
  }

  /**
   * Create standard user credentials
   * @returns Standard user credentials
   */
  public static createStandardUser(): IUserCredentials {
    return {
      username: 'user',
      password: 'User@123',
      email: 'user@example.com',
      role: 'user',
    };
  }

  /**
   * Create guest user credentials
   * @returns Guest user credentials
   */
  public static createGuestUser(): IUserCredentials {
    return {
      username: 'guest',
      password: 'Guest@123',
      role: 'guest',
    };
  }

  /**
   * Create test user with permissions
   * @param username - Username
   * @param password - Password
   * @param displayName - Display name
   * @param permissions - User permissions
   * @returns Test user
   */
  public static createTestUser(
    username: string,
    password: string,
    displayName: string,
    permissions: readonly Permission[]
  ): ITestUser {
    return {
      username,
      password,
      displayName,
      permissions,
    };
  }

  /**
   * Create full access test user
   * @returns Test user with full permissions
   */
  public static createFullAccessUser(): ITestUser {
    return this.createTestUser(
      'fullaccess',
      'FullAccess@123',
      'Full Access User',
      ['read', 'write', 'delete', 'admin', 'moderate', 'report', 'export']
    );
  }

  /**
   * Create read-only test user
   * @returns Test user with read-only permissions
   */
  public static createReadOnlyUser(): ITestUser {
    return this.createTestUser(
      'readonly',
      'ReadOnly@123',
      'Read Only User',
      ['read']
    );
  }

  /**
   * Generate random email address
   * @param prefix - Email prefix
   * @returns Random email
   */
  public static generateRandomEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}@example.com`;
  }

  /**
   * Generate random username
   * @param prefix - Username prefix
   * @returns Random username
   */
  public static generateRandomUsername(prefix: string = 'user'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
  }
}
