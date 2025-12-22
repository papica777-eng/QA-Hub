/**
 * Example usage of the QA-Hub framework
 * Demonstrates how to create and run tests
 */

import { LoginTest, LoginErrorTest } from './src/__tests__/LoginTest';
import { getBrowserConfig, getEnvironmentConfig } from './src/config';

/**
 * Main execution function
 * Runs example tests to demonstrate framework capabilities
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('QA-Hub Framework - Example Test Execution');
  console.log('='.repeat(60));
  console.log('');

  const browserConfig = getBrowserConfig('default');
  const environment = getEnvironmentConfig('test');

  console.log('Configuration:');
  console.log(`  Environment: ${environment.name}`);
  console.log(`  Base URL: ${environment.baseUrl}`);
  console.log(`  Headless: ${browserConfig.headless}`);
  console.log(`  Viewport: ${browserConfig.viewport.width}x${browserConfig.viewport.height}`);
  console.log('');

  const tests = [
    { name: 'Login Test', TestClass: LoginTest },
    { name: 'Login Error Test', TestClass: LoginErrorTest },
  ];

  for (const { name, TestClass } of tests) {
    console.log(`Running: ${name}`);
    console.log('-'.repeat(60));

    try {
      const test = new TestClass(browserConfig, environment.baseUrl);
      await test.execute();
      console.log(`✓ ${name} PASSED`);
    } catch (error) {
      console.error(`✗ ${name} FAILED`);
      if (error instanceof Error) {
        console.error(`  Error: ${error.message}`);
      }
    }

    console.log('');
  }

  console.log('='.repeat(60));
  console.log('Test execution completed');
  console.log('='.repeat(60));
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\nExiting with success');
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('\nExiting with error:', error);
      process.exit(1);
    });
}

export { main };
