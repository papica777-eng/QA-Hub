# Code Review Standards for QA-Hub

This document outlines the code review standards that all code in this repository must meet. These standards are designed to ensure code quality comparable to companies like Google and Netflix.

## Zero Tolerance Policies

### 1. No `any` Types
- **BANNED**: `const data: any = ...`
- **REQUIRED**: Explicit types for all variables, parameters, and return values
- **Example**:
  ```typescript
  // ❌ Bad
  function process(data: any): any {
    return data;
  }

  // ✅ Good
  function process<T>(data: T): T {
    return data;
  }
  ```

### 2. No Lazy Comments
- **BANNED**: `// TODO: implement this later`, `// rest of logic`, `// etc.`
- **REQUIRED**: Full implementation on first commit
- **Example**:
  ```typescript
  // ❌ Bad
  async login(username: string): Promise<void> {
    await this.enterUsername(username);
    // rest of login logic
  }

  // ✅ Good
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
    await this.waitForNavigation();
  }
  ```

## SOLID Principles Enforcement

### Single Responsibility Principle (SRP)
Each class must have exactly one reason to change.

```typescript
// ❌ Bad - Multiple responsibilities
class UserManager {
  saveUser(user: User): void { /* ... */ }
  sendEmail(email: string): void { /* ... */ }
  logActivity(message: string): void { /* ... */ }
}

// ✅ Good - Single responsibility per class
class UserRepository {
  save(user: User): void { /* ... */ }
}

class EmailService {
  send(email: string): void { /* ... */ }
}

class ActivityLogger {
  log(message: string): void { /* ... */ }
}
```

### Open/Closed Principle (OCP)
Classes should be open for extension but closed for modification.

```typescript
// ✅ Good - Extensible through inheritance
abstract class BasePage {
  protected abstract getPageUrl(): string;
  
  async navigate(): Promise<void> {
    await this.page.goto(this.getPageUrl());
  }
}

class LoginPage extends BasePage {
  protected getPageUrl(): string {
    return `${this.baseUrl}/login`;
  }
}
```

### Liskov Substitution Principle (LSP)
Derived classes must be substitutable for their base classes.

```typescript
// ✅ Good - All pages can be used interchangeably
function navigateToPage(page: BasePage): Promise<void> {
  return page.navigate();
}

const loginPage: BasePage = new LoginPage(page, baseUrl);
const homePage: BasePage = new HomePage(page, baseUrl);

await navigateToPage(loginPage);  // Works
await navigateToPage(homePage);   // Works
```

### Interface Segregation Principle (ISP)
Clients should not depend on interfaces they don't use.

```typescript
// ❌ Bad - Bloated interface
interface IUser {
  login(): void;
  logout(): void;
  sendEmail(): void;
  generateReport(): void;
}

// ✅ Good - Focused interfaces
interface IAuthenticatable {
  login(): void;
  logout(): void;
}

interface IEmailSender {
  sendEmail(): void;
}

interface IReportGenerator {
  generateReport(): void;
}
```

### Dependency Inversion Principle (DIP)
Depend on abstractions, not concretions.

```typescript
// ❌ Bad - Depends on concrete class
class TestRunner {
  private logger: ConsoleLogger;
  
  constructor() {
    this.logger = new ConsoleLogger();
  }
}

// ✅ Good - Depends on interface
class TestRunner {
  private readonly logger: ILogger;
  
  constructor(logger: ILogger) {
    this.logger = logger;
  }
}
```

## Design Pattern Requirements

### Page Object Model (POM)
All UI tests MUST use Page Object Model pattern.

```typescript
// ✅ Required structure
class LoginPage extends BasePage {
  // 1. Locators encapsulated in private class
  private readonly locators: LoginPageLocators;
  
  // 2. Page-specific methods
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }
  
  // 3. Abstract methods implemented
  protected getPageUrl(): string {
    return `${this.baseUrl}/login`;
  }
  
  public async waitForPageLoad(): Promise<void> {
    await this.waitForElement(this.locators.loginButton);
  }
}

class LoginPageLocators {
  readonly usernameInput: ILocator = {
    strategy: 'testId',
    value: 'username-input',
    description: 'Username input field',
  };
}
```

### Factory Pattern
Use factories for complex object creation.

```typescript
// ✅ Good - Factory for test data
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

## Type Safety Requirements

### 1. Readonly Properties
Use `readonly` for immutable data.

```typescript
// ✅ Required
interface ILocator {
  readonly strategy: LocatorStrategy;
  readonly value: string;
  readonly description?: string;
}
```

### 2. Exhaustive Type Checks
Handle all cases in unions/enums.

```typescript
// ✅ Required
function buildSelector(strategy: LocatorStrategy): string {
  switch (strategy) {
    case 'css': return '...';
    case 'xpath': return '...';
    case 'testId': return '...';
    // ... all cases
    default:
      const exhaustiveCheck: never = strategy;
      throw new Error(`Unknown strategy: ${String(exhaustiveCheck)}`);
  }
}
```

### 3. Strict Null Checks
Handle null/undefined explicitly.

```typescript
// ✅ Required
async getText(locator: ILocator): Promise<string> {
  const text = await this.page.textContent(selector);
  
  if (text === null) {
    throw new ElementStateError(
      locator.description ?? selector,
      'has text content'
    );
  }
  
  return text.trim();
}
```

## Code Metrics

All code must meet these metrics:

- **Cyclomatic Complexity**: ≤ 10
- **Max Function Length**: ≤ 50 lines
- **Max Nesting Depth**: ≤ 3
- **Max Parameters**: ≤ 4

## Error Handling

### Required Error Practices

1. **Custom Error Types**: Use specific error classes
   ```typescript
   throw new ElementNotFoundError(locator, timeout);
   ```

2. **Error Context**: Provide context in errors
   ```typescript
   throw new NavigationError(url, reason, { context: 'login flow' });
   ```

3. **No Silent Failures**: Always handle or propagate errors
   ```typescript
   // ❌ Bad
   try {
     await operation();
   } catch (error) {
     // Silent failure
   }

   // ✅ Good
   try {
     await operation();
   } catch (error) {
     this.logger.error('Operation failed', error);
     throw error;
   }
   ```

## Testing Requirements

### Test Structure

```typescript
// ✅ Required test structure
class MyTest extends BaseTest {
  // 1. Private page objects with null initialization
  private myPage: MyPage | null = null;
  
  // 2. Setup with null check
  protected async setup(): Promise<void> {
    await super.setup();
    this.myPage = new MyPage(this.getPage(), this.baseUrl);
  }
  
  // 3. Test with validation
  protected async runTest(): Promise<void> {
    if (this.myPage === null) {
      throw new Error('Page not initialized');
    }
    
    // Test logic with assertions
    await this.myPage.navigate();
    const result = await this.myPage.getData();
    Assertions.assertEquals(result, expected);
  }
}
```

## Code Coverage

Minimum required coverage:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Documentation

### Required Documentation

1. **JSDoc for public methods**:
   ```typescript
   /**
    * Navigate to the page and wait for load
    * @param options - Navigation options
    * @throws NavigationError if navigation fails
    */
   public async navigate(options?: INavigationOptions): Promise<void>
   ```

2. **Interface documentation**:
   ```typescript
   /**
    * Browser configuration interface
    * Defines strict types for browser initialization
    */
   export interface IBrowserConfig {
     readonly headless: boolean;
     readonly viewport: IViewport;
   }
   ```

## Pre-Commit Checklist

Before committing, verify:

- [ ] No `any` types used
- [ ] All functions have explicit return types
- [ ] All interfaces use `readonly` for immutable properties
- [ ] ESLint passes with zero warnings
- [ ] TypeScript compiles with zero errors
- [ ] All tests pass
- [ ] Code coverage meets minimums
- [ ] No lazy comments (TODO, rest of logic, etc.)
- [ ] SOLID principles followed
- [ ] Appropriate design patterns used
- [ ] Proper error handling implemented
- [ ] Public methods documented

## Review Rejection Reasons

Code will be rejected if:

1. Contains `any` type
2. Has lazy comments
3. Violates SOLID principles
4. Fails type checking
5. Below coverage thresholds
6. Missing error handling
7. Exceeds complexity metrics
8. Missing documentation
9. Not using Page Object Model for UI tests
10. Silent error swallowing