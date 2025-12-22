# QA-Hub

Enterprise-grade Test Automation Framework built with TypeScript, implementing strict code quality standards and SOLID principles.

## 🎯 Features

- **Strict Type Safety**: Zero tolerance for `any` types - 100% type-safe TypeScript
- **SOLID Principles**: Clean architecture following all SOLID principles
- **Page Object Model**: Structured test automation with proper abstraction layers
- **Enterprise Standards**: Code quality that passes Google/Netflix-level code reviews
- **Zero Laziness**: Full implementations with no placeholder comments
- **Comprehensive Error Handling**: Custom error types for precise debugging
- **Dependency Inversion**: Interface-based design for maximum flexibility
- **Factory Patterns**: Elegant object creation and management
- **Extensive Utilities**: Assertions, retry logic, data factories, and more

## 📦 Installation

```bash
npm install
```

## 🏗️ Project Structure

```
src/
├── core/               # Core framework components
│   ├── BasePage.ts    # Abstract base page class
│   ├── BaseTest.ts    # Abstract base test class
│   ├── interfaces.ts  # Type definitions and interfaces
│   ├── errors.ts      # Custom error classes
│   └── logger.ts      # Logging infrastructure
├── pages/             # Page Object Models
│   ├── LoginPage.ts   # Login page implementation
│   └── HomePage.ts    # Home page implementation
├── models/            # Data models and types
│   └── TestModels.ts  # Test-related models
├── utils/             # Utility functions
│   ├── Assertions.ts  # Test assertion utilities
│   ├── CommonUtils.ts # Common utilities
│   └── TestDataFactory.ts # Test data creation
├── __tests__/         # Test implementations
│   └── LoginTest.ts   # Example test suite
├── config.ts          # Configuration management
└── index.ts           # Main export file
```

## 🚀 Usage

### Creating a Page Object

```typescript
import { BasePage } from './core/BasePage';
import type { ILocator } from './core/interfaces';

export class MyPage extends BasePage {
  private readonly locators = {
    submitButton: {
      strategy: 'testId' as const,
      value: 'submit-btn',
      description: 'Submit button',
    },
  };

  protected getPageUrl(): string {
    return `${this.baseUrl}/my-page`;
  }

  public async waitForPageLoad(): Promise<void> {
    await this.waitForElement(this.locators.submitButton);
  }

  public async submit(): Promise<void> {
    await this.click(this.locators.submitButton);
  }
}
```

### Creating a Test

```typescript
import { BaseTest } from './core/BaseTest';
import { MyPage } from './pages/MyPage';
import { Assertions } from './utils/Assertions';

export class MyTest extends BaseTest {
  private myPage: MyPage | null = null;

  protected async setup(): Promise<void> {
    await super.setup();
    this.myPage = new MyPage(this.getPage(), 'https://example.com');
  }

  protected async runTest(): Promise<void> {
    if (this.myPage === null) {
      throw new Error('Page not initialized');
    }

    await this.myPage.navigate();
    await this.myPage.submit();
    
    const title = await this.myPage.getPageTitle();
    Assertions.assertEquals(title, 'Expected Title');
  }
}
```

### Running Tests

```bash
# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Format code
npm run format
```

## 🔧 Configuration

### Browser Configuration

```typescript
import { getBrowserConfig } from './config';

// Use default configuration
const config = getBrowserConfig('default');

// Use debug mode (visible browser)
const debugConfig = getBrowserConfig('debug');

// Use CI configuration
const ciConfig = getBrowserConfig('ci');

// Use mobile viewport
const mobileConfig = getBrowserConfig('mobile');
```

### Environment Configuration

```typescript
import { getEnvironmentConfig } from './config';

// Get environment configuration
const env = getEnvironmentConfig('staging');
console.log(env.baseUrl); // https://staging.example.com
```

## 📋 Code Quality Standards

### TypeScript Configuration

- **Strict mode**: All strict type checking options enabled
- **No implicit any**: Explicit types required everywhere
- **Strict null checks**: Null safety enforced
- **No unused parameters**: Clean, maintainable code
- **Exhaustive switch checks**: Type-safe enum handling

### ESLint Rules

- **Max complexity**: 10 (functions must be simple)
- **Max lines per function**: 50 (enforce single responsibility)
- **Max depth**: 3 (avoid deep nesting)
- **Max parameters**: 4 (encourage object parameters)
- **No console**: Warnings (use logger instead)
- **Strict boolean expressions**: Explicit boolean checks

### Design Principles

1. **Single Responsibility**: Each class has one reason to change
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Derived classes are substitutable
4. **Interface Segregation**: Focused, cohesive interfaces
5. **Dependency Inversion**: Depend on abstractions, not concretions

## 🧪 Test Coverage

The framework enforces minimum 80% code coverage for:
- Branches
- Functions
- Lines
- Statements

## 🛡️ Error Handling

Custom error types for precise error handling:

- `ElementNotFoundError`: Element not found within timeout
- `ElementStateError`: Element not in expected state
- `NavigationError`: Page navigation failures
- `TimeoutError`: Operation timeout errors
- `ConfigurationError`: Invalid configuration errors
- `AssertionError`: Test assertion failures

## 📝 Best Practices

1. **Always use strict types** - Never use `any`
2. **Implement interfaces** - Depend on abstractions
3. **Use Page Object Model** - Separate test logic from page structure
4. **Write focused tests** - One test, one purpose
5. **Handle errors explicitly** - Use custom error types
6. **Log appropriately** - Use the logger, not console
7. **Follow SOLID** - Keep code maintainable and extensible

## 🤝 Contributing

All contributions must:
- Pass ESLint with zero errors/warnings
- Maintain 100% type safety (no `any`)
- Include comprehensive tests
- Follow SOLID principles
- Pass code review standards

## 📄 License

MIT
