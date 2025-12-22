import type { IBrowserConfig } from './core/interfaces';
import type { IEnvironmentConfig } from './models/TestModels';

/**
 * Default browser configuration
 * Used as baseline for all test execution
 */
export const defaultBrowserConfig: IBrowserConfig = {
  headless: true,
  viewport: {
    width: 1920,
    height: 1080,
  },
  timeout: 30000,
  slowMo: 0,
};

/**
 * Debug browser configuration
 * Used for local debugging with visible browser
 */
export const debugBrowserConfig: IBrowserConfig = {
  headless: false,
  viewport: {
    width: 1920,
    height: 1080,
  },
  timeout: 60000,
  slowMo: 100,
};

/**
 * CI browser configuration
 * Optimized for continuous integration environments
 */
export const ciBrowserConfig: IBrowserConfig = {
  headless: true,
  viewport: {
    width: 1920,
    height: 1080,
  },
  timeout: 45000,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
};

/**
 * Mobile viewport configuration
 * Simulates mobile device viewport
 */
export const mobileBrowserConfig: IBrowserConfig = {
  headless: true,
  viewport: {
    width: 375,
    height: 667,
  },
  timeout: 30000,
};

/**
 * Development environment configuration
 */
export const devEnvironment: IEnvironmentConfig = {
  name: 'development',
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  timeout: 30000,
  retryAttempts: 2,
};

/**
 * Staging environment configuration
 */
export const stagingEnvironment: IEnvironmentConfig = {
  name: 'staging',
  baseUrl: 'https://staging.example.com',
  apiUrl: 'https://staging-api.example.com',
  timeout: 30000,
  retryAttempts: 3,
};

/**
 * Production environment configuration
 */
export const productionEnvironment: IEnvironmentConfig = {
  name: 'production',
  baseUrl: 'https://example.com',
  apiUrl: 'https://api.example.com',
  timeout: 30000,
  retryAttempts: 3,
};

/**
 * Test environment configuration
 */
export const testEnvironment: IEnvironmentConfig = {
  name: 'test',
  baseUrl: 'http://test.local',
  apiUrl: 'http://test.local/api',
  timeout: 30000,
  retryAttempts: 2,
};

/**
 * Get environment configuration by name
 * @param envName - Environment name
 * @returns Environment configuration
 */
export function getEnvironmentConfig(envName: string): IEnvironmentConfig {
  const environments: Record<string, IEnvironmentConfig> = {
    development: devEnvironment,
    staging: stagingEnvironment,
    production: productionEnvironment,
    test: testEnvironment,
  };

  const config = environments[envName];
  if (!config) {
    throw new Error(`Unknown environment: ${envName}`);
  }

  return config;
}

/**
 * Get browser configuration by mode
 * @param mode - Browser mode
 * @returns Browser configuration
 */
export function getBrowserConfig(mode: BrowserMode): IBrowserConfig {
  const configs: Record<BrowserMode, IBrowserConfig> = {
    default: defaultBrowserConfig,
    debug: debugBrowserConfig,
    ci: ciBrowserConfig,
    mobile: mobileBrowserConfig,
  };

  return configs[mode];
}

/**
 * Browser mode type
 */
export type BrowserMode = 'default' | 'debug' | 'ci' | 'mobile';
