# Testing Setup

This project uses Jest as the testing framework with React Testing Library for component testing.

## Test Scripts

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (recommended for development)
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests for CI/CD with coverage and no watch mode

## Test Structure

```
__tests__/
├── lib/
│   └── actions/
│       └── polls.test.ts      # Tests for poll actions
├── utils/
│   └── test-helpers.ts        # Common test utilities and mock data
└── README.md                  # This file
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- polls.test.ts
```

### Run Tests Matching a Pattern
```bash
npm test -- --testNamePattern="createPoll"
```

## Test Coverage

The project has a coverage threshold of 70% for:
- Branches
- Functions  
- Lines
- Statements

**Current Status**: 
- **polls.ts**: 76.61% statement coverage ✅
- **Overall Project**: 41.7% statement coverage (below threshold due to only testing one file)

**Test Results**: 19/25 tests passing (76% success rate)

## Mocking

- **Supabase Client**: Mocked using Jest to avoid actual database calls
- **Next.js Cache**: Mocked to avoid side effects during testing
- **Next.js Headers**: Mocked to avoid server-side dependencies

## Test Utilities

The `test-helpers.ts` file provides common utilities:
- Mock data generators for users, profiles, polls, etc.
- Mock Supabase client setup
- Helper functions for common test patterns

## Writing Tests

### Example Test Structure
```typescript
describe('Function Name', () => {
  beforeEach(() => {
    // Setup mocks and test data
  })

  it('should do something successfully', async () => {
    // Arrange
    // Act
    // Assert
  })

  it('should handle errors gracefully', async () => {
    // Test error scenarios
  })
})
```

### Best Practices
1. Use descriptive test names that explain the expected behavior
2. Test both success and failure scenarios
3. Mock external dependencies (Supabase, Next.js functions)
4. Use the test utilities for consistent mock data
5. Group related tests using `describe` blocks
6. Clean up mocks in `beforeEach` or `afterEach`

## Debugging Tests

To debug a failing test, you can:
1. Use `console.log` in your test (uncomment in jest.setup.js)
2. Run a single test file: `npm test -- polls.test.ts`
3. Use the `--verbose` flag: `npm test -- --verbose`
4. Check the coverage report for untested code paths
