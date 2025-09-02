import "@testing-library/jest-dom";

// Mock Next.js cache revalidation
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock Next.js headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore console.log in tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
