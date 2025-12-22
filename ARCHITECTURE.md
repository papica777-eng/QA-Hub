# Architecture Overview

## Framework Architecture

The QA-Hub framework is built on a layered architecture that enforces separation of concerns and follows SOLID principles.

```
┌─────────────────────────────────────────────────────────┐
│                    Test Layer                           │
│  (LoginTest, NavigationTest, etc.)                      │
│  - Implements BaseTest                                   │
│  - Orchestrates test scenarios                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Page Object Layer                      │
│  (LoginPage, HomePage, etc.)                            │
│  - Implements BasePage                                   │
│  - Encapsulates page structure                          │
│  - Provides high-level page actions                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Core Layer                           │
│  (BasePage, BaseTest, Interfaces)                       │
│  - Abstract base classes                                │
│  - Common functionality                                 │
│  - Framework infrastructure                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Utility Layer                         │
│  (Assertions, Logger, TestDataFactory)                  │
│  - Shared utilities                                     │
│  - Helper functions                                     │
│  - Common services                                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Browser Driver                         │
│  (Playwright)                                           │
│  - Browser automation                                   │
│  - Low-level interactions                               │
└─────────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. Page Object Model (POM)

**Purpose**: Separate test logic from page structure

**Implementation**:
```typescript
abstract class BasePage {
  // Common page operations
  protected abstract getPageUrl(): string;
  public abstract waitForPageLoad(): Promise<void>;
}

class LoginPage extends BasePage {
  // Page-specific operations
  async login(username: string, password: string): Promise<void> {
    // Implementation
  }
}
```

**Benefits**:
- Maintainability: Page changes affect only page objects
- Reusability: Page methods used across multiple tests
- Readability: Tests read like business scenarios

### 2. Template Method Pattern

**Purpose**: Define test execution skeleton

**Implementation**:
```typescript
abstract class BaseTest {
  public async execute(): Promise<void> {
    try {
      await this.setup();
      await this.runTest();
    } finally {
      await this.teardown();
    }
  }
  
  protected abstract runTest(): Promise<void>;
}
```

**Benefits**:
- Consistent test lifecycle
- Guaranteed cleanup
- Extensible test behavior

### 3. Factory Pattern

**Purpose**: Encapsulate object creation

**Implementation**:
```typescript
class TestDataFactory {
  static createAdminUser(): IUserCredentials {
    return {
      username: 'admin',
      password: 'Admin@123',
      role: 'admin',
    };
  }
}
```

**Benefits**:
- Centralized test data creation
- Type-safe data generation
- Easy maintenance

### 4. Singleton Pattern

**Purpose**: Single instance of logger factory

**Implementation**:
```typescript
class LoggerFactory {
  private static instance: LoggerFactory;
  
  static getInstance(): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory();
    }
    return LoggerFactory.instance;
  }
}
```

**Benefits**:
- Shared logger instances
- Consistent logging behavior
- Memory efficient

## SOLID Principles Application

### Single Responsibility Principle (SRP)

Each class has one reason to change:

- `BasePage`: Page interaction logic
- `BaseTest`: Test lifecycle management
- `ConsoleLogger`: Logging operations
- `Assertions`: Test validation
- `TestDataFactory`: Test data creation

### Open/Closed Principle (OCP)

Classes are open for extension, closed for modification:

- `BasePage` is abstract with extensible methods
- New pages extend `BasePage` without modifying it
- New tests extend `BaseTest` without modifying it

### Liskov Substitution Principle (LSP)

Derived classes are substitutable:

```typescript
function testPage(page: BasePage): Promise<void> {
  return page.navigate();
}

// Any page object works
testPage(new LoginPage(page, url));
testPage(new HomePage(page, url));
```

### Interface Segregation Principle (ISP)

Clients depend only on interfaces they use:

- `ILogger`: Only logging methods
- `ILocator`: Only location information
- `IBrowserConfig`: Only browser settings

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions:

```typescript
class BasePage {
  protected readonly logger: ILogger; // Interface, not class
  
  constructor(page: Page, baseUrl: string) {
    this.logger = LoggerFactory.getInstance().getLogger();
  }
}
```

## Type Safety Strategy

### 1. No Any Types

All types are explicit:
```typescript
// Every function has explicit return type
async getText(locator: ILocator): Promise<string>

// Every parameter has explicit type
protected async click(locator: ILocator, options?: IElementOptions)
```

### 2. Readonly Properties

Immutable data is marked readonly:
```typescript
interface ILocator {
  readonly strategy: LocatorStrategy;
  readonly value: string;
}
```

### 3. Strict Null Checks

Null/undefined handled explicitly:
```typescript
if (text === null) {
  throw new ElementStateError(/*...*/);
}
return text.trim();
```

### 4. Exhaustive Checking

All union/enum cases handled:
```typescript
switch (strategy) {
  case 'css': return '...';
  case 'xpath': return '...';
  // ... all cases
  default:
    const exhaustiveCheck: never = strategy;
    throw new Error(`Unknown: ${String(exhaustiveCheck)}`);
}
```

## Error Handling Strategy

### Error Hierarchy

```
QAFrameworkError (abstract)
├── ElementNotFoundError
├── ElementStateError
├── NavigationError
├── TimeoutError
├── ConfigurationError
└── AssertionError
```

### Error Context

All errors include context:
```typescript
throw new ElementNotFoundError(
  locator,
  timeout,
  { 
    strategy: locator.strategy,
    value: locator.value 
  }
);
```

## Testing Strategy

### Test Structure

1. **Setup Phase**: Initialize resources
2. **Execution Phase**: Run test scenario
3. **Validation Phase**: Assert expected outcomes
4. **Teardown Phase**: Clean up resources

### Test Independence

- Each test is completely independent
- No shared state between tests
- Fresh browser instance per test

### Test Data

- Created via factories
- Type-safe and validated
- No hardcoded values

## Logging Strategy

### Levels

- **DEBUG**: Detailed diagnostic information
- **INFO**: General informational messages
- **WARN**: Warning messages
- **ERROR**: Error messages

### Usage

```typescript
this.logger.info('Starting login');
this.logger.debug('Clicking button', { locator });
this.logger.error('Login failed', error);
```

## Configuration Management

### Browser Configs

- `default`: Standard headless execution
- `debug`: Visible browser for debugging
- `ci`: Optimized for CI/CD
- `mobile`: Mobile viewport simulation

### Environment Configs

- `development`: Local development
- `staging`: Staging environment
- `production`: Production environment
- `test`: Test environment

## Extensibility Points

### Adding New Pages

1. Extend `BasePage`
2. Implement `getPageUrl()`
3. Implement `waitForPageLoad()`
4. Add page-specific methods

### Adding New Tests

1. Extend `BaseTest`
2. Override `setup()` to initialize pages
3. Implement `runTest()` with test logic
4. Use assertions for validation

### Adding New Utilities

1. Create focused utility class
2. Use static methods for stateless operations
3. Provide strict type definitions
4. Include comprehensive error handling

## Performance Considerations

### Parallel Execution

Tests can run in parallel as they're independent:
```bash
npm test -- --maxWorkers=4
```

### Resource Management

- Automatic browser cleanup
- Explicit resource disposal
- No memory leaks

### Optimization

- Headless by default
- Configurable timeouts
- Smart waiting strategies