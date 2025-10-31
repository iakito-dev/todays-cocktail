import '@testing-library/jest-dom';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends jest.Matchers<void, T> {
    toBeInTheDocument(): void;
    toBeDisabled(): void;
    toHaveClass(...classNames: string[]): void;
    toHaveAttribute(attr: string, value?: string): void;
    toHaveStyle(style: Record<string, unknown>): void;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface AsymmetricMatchersContaining extends jest.Matchers<void, any> {
    toBeInTheDocument(): void;
    toBeDisabled(): void;
    toHaveClass(...classNames: string[]): void;
    toHaveAttribute(attr: string, value?: string): void;
    toHaveStyle(style: Record<string, unknown>): void;
  }
}
