/**
 * QA-Hub - Enterprise-grade Test Automation Framework
 *
 * This framework implements:
 * - Strict TypeScript type safety (no 'any' types)
 * - SOLID principles throughout the codebase
 * - Page Object Model design pattern
 * - Comprehensive error handling
 * - Dependency inversion through interfaces
 * - Factory patterns for object creation
 * - Modular, maintainable architecture
 *
 * @packageDocumentation
 */

export { BasePage } from './core/BasePage';
export { BaseTest } from './core/BaseTest';
export { ConsoleLogger, LoggerFactory } from './core/logger';
export {
  QAFrameworkError,
  ElementNotFoundError,
  ElementStateError,
  NavigationError,
  TimeoutError,
  ConfigurationError,
  AssertionError,
} from './core/errors';

export type {
  IBrowserConfig,
  IViewport,
  ILocator,
  ITestResult,
  ILogger,
  IWaitCondition,
  IElementOptions,
  IPosition,
  INavigationOptions,
  IScreenshotOptions,
  LocatorStrategy,
  TestStatus,
} from './core/interfaces';

export { LoginPage } from './pages/LoginPage';
export { HomePage } from './pages/HomePage';
export type { HomePageSection } from './pages/HomePage';

export type {
  IUserCredentials,
  ITestUser,
  ITestData,
  ITestDataMetadata,
  IFormData,
  IApiResponse,
  IApiError,
  IEnvironmentConfig,
  IAssertionResult,
  ITestContext,
  UserRole,
  Permission,
  FormFieldValue,
  EnvironmentName,
} from './models/TestModels';

export { Assertions } from './utils/Assertions';
export { TestDataFactory } from './utils/TestDataFactory';
export { StringUtils, DateUtils, RetryUtils } from './utils/CommonUtils';
export type { CharsetType, DateFormatType, IRetryOptions } from './utils/CommonUtils';

export { LoginTest, LoginErrorTest, NavigationTest } from './__tests__/LoginTest';
