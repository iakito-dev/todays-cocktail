import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

const abResizableDescriptor = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'resizable');
if (!abResizableDescriptor) {
  Object.defineProperty(ArrayBuffer.prototype, 'resizable', {
    configurable: true,
    get: () => false,
  });
}

if (typeof SharedArrayBuffer !== 'undefined') {
  const sabGrowableDescriptor = Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, 'growable');
  if (!sabGrowableDescriptor) {
    Object.defineProperty(SharedArrayBuffer.prototype, 'growable', {
      configurable: true,
      get: () => false,
    });
  }
}

// Extend Vitest's expect method with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
