import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Minimal scrollIntoView mock for components using cmdk/scroll behavior
// @ts-ignore
if (!HTMLElement.prototype.scrollIntoView) {
  // eslint-disable-next-line no-extend-native
  HTMLElement.prototype.scrollIntoView = function () { return undefined }
}

// Ensure global fetch/Request/Response exist for tests
try {
  // Prefer node's global fetch if available; otherwise use undici
  // @ts-ignore
  if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const undici = require('undici');
    // @ts-ignore
    global.fetch = undici.fetch;
    // @ts-ignore
    global.Request = undici.Request;
    // @ts-ignore
    global.Response = undici.Response;
    // @ts-ignore
    global.Headers = undici.Headers;
  }
  // Ensure Request exists (Next 15 tests may not polyfill global Request)
  // @ts-ignore
  if (typeof global.Request === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const undici = require('undici');
    // @ts-ignore
    global.Request = undici.Request;
  }
} catch {}

// Mock next/server to avoid Node Request dependency in tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) =>
      new Response(JSON.stringify(data), {
        status: (init && init.status) || 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  },
  NextRequest: class {},
}))
