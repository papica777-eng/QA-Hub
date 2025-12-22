/**
 * User credentials model
 * Encapsulates user authentication data with strict types
 */
export interface IUserCredentials {
  readonly username: string;
  readonly password: string;
  readonly email?: string;
  readonly role?: UserRole;
}

/**
 * User role type
 * Defines valid user roles in the system
 */
export type UserRole = 'admin' | 'user' | 'guest' | 'moderator';

/**
 * Test user model
 * Extends user credentials with additional test metadata
 */
export interface ITestUser extends IUserCredentials {
  readonly displayName: string;
  readonly permissions: readonly Permission[];
}

/**
 * Permission type
 * Defines granular permissions for authorization testing
 */
export type Permission = 'read' | 'write' | 'delete' | 'admin' | 'moderate' | 'report' | 'export';

/**
 * Test data model
 * Generic model for test data with metadata
 */
export interface ITestData<T> {
  readonly data: T;
  readonly metadata: ITestDataMetadata;
}

/**
 * Test data metadata
 * Tracks test data provenance and validity
 */
export interface ITestDataMetadata {
  readonly createdAt: Date;
  readonly source: string;
  readonly isValid: boolean;
  readonly description?: string;
}

/**
 * Form data model
 * Generic form submission data structure
 */
export interface IFormData {
  readonly fields: Record<string, FormFieldValue>;
  readonly submitButtonId?: string;
}

/**
 * Form field value type
 * Defines valid form field value types
 */
export type FormFieldValue = string | number | boolean | readonly string[];

/**
 * API response model
 * Generic API response structure
 */
export interface IApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: IApiError;
  readonly timestamp: Date;
}

/**
 * API error model
 * Structured error information from API responses
 */
export interface IApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/**
 * Test environment configuration
 * Defines environment-specific settings
 */
export interface IEnvironmentConfig {
  readonly name: EnvironmentName;
  readonly baseUrl: string;
  readonly apiUrl: string;
  readonly timeout: number;
  readonly retryAttempts: number;
}

/**
 * Environment name type
 * Defines valid environment names
 */
export type EnvironmentName = 'development' | 'staging' | 'production' | 'test';

/**
 * Assertion result model
 * Captures assertion execution results
 */
export interface IAssertionResult {
  readonly passed: boolean;
  readonly expected: unknown;
  readonly actual: unknown;
  readonly message: string;
  readonly timestamp: Date;
}

/**
 * Test execution context
 * Provides context information during test execution
 */
export interface ITestContext {
  readonly testName: string;
  readonly suiteName: string;
  readonly environment: EnvironmentName;
  readonly startTime: Date;
  readonly tags: readonly string[];
}
