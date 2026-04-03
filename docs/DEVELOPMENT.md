# Development Guidelines

## Testing Strategy

### Current Test Coverage

The project currently includes tests for:
- Anthropic request/response translation
- Chat completions handler
- Basic protocol conversion logic

### Planned Test Expansion (P0 Priority)

To improve reliability and catch edge cases, the following test areas should be expanded:

#### 1. Authentication & Token Lifecycle Tests
**Priority: High**

Tests needed:
- Token acquisition flow
- Token refresh behavior
- Expired token handling
- Invalid token responses
- Token storage and retrieval
- Different account types (individual, business, enterprise)

Example scenarios:
```typescript
// tests/auth-lifecycle.test.ts
describe('Token lifecycle', () => {
  it('should refresh token when expired')
  it('should handle invalid GitHub token')
  it('should handle Copilot token fetch failure')
  it('should persist token across restarts')
})
```

#### 2. Rate Limiting Tests
**Priority: High**

Tests needed:
- Rate limit enforcement with `--rate-limit` flag
- Wait mode behavior with `--wait` flag
- Rate limit error responses
- Rate limit state reset
- Concurrent request handling with rate limits

Example scenarios:
```typescript
// tests/rate-limiting.test.ts
describe('Rate limiting', () => {
  it('should reject requests within rate limit window')
  it('should allow requests after cooldown')
  it('should wait when --wait flag is enabled')
  it('should return proper error with retry-after header')
})
```

#### 3. Streaming Response Tests
**Priority: High**

Tests needed:
- Normal streaming flow
- Stream interruption handling
- Partial message handling
- Stream error propagation
- SSE format validation
- Tool use in streaming responses

Example scenarios:
```typescript
// tests/streaming.test.ts
describe('Streaming responses', () => {
  it('should handle stream interruption gracefully')
  it('should properly format SSE events')
  it('should handle network errors during streaming')
  it('should support tool calls in streaming mode')
})
```

#### 4. Error Handling Tests
**Priority: High**

Tests needed:
- Network error handling
- Malformed request handling
- Upstream API errors
- Timeout scenarios
- Invalid model requests
- Missing required fields

Example scenarios:
```typescript
// tests/error-handling.test.ts
describe('Error handling', () => {
  it('should return structured error for invalid requests')
  it('should handle upstream API failures')
  it('should timeout long-running requests')
  it('should validate required fields')
})
```

#### 5. API Endpoint Tests
**Priority: Medium**

Tests needed:
- `/v1/chat/completions` edge cases
- `/v1/messages` edge cases
- `/v1/models` response validation
- `/v1/embeddings` functionality
- `/usage` endpoint accuracy
- `/token` endpoint security

Example scenarios:
```typescript
// tests/routes/usage.test.ts
describe('Usage endpoint', () => {
  it('should return current usage statistics')
  it('should handle quota exceeded scenarios')
  it('should format response correctly')
})
```

#### 6. Tool Use & Multi-Tool Tests
**Priority: Medium**

Tests needed:
- Single tool call handling
- Multiple tool calls in one request
- Tool result processing
- Tool call in streaming mode
- Invalid tool definitions

Example scenarios:
```typescript
// tests/tool-use.test.ts
describe('Tool usage', () => {
  it('should handle single tool call')
  it('should handle multiple parallel tool calls')
  it('should validate tool definitions')
  it('should process tool results correctly')
})
```

#### 7. CLI Subcommand Tests
**Priority: Medium**

Tests needed:
- `start` command with various flags
- `auth` command flow
- `check-usage` command
- `debug` command output
- Flag combination validation

Example scenarios:
```typescript
// tests/cli/commands.test.ts
describe('CLI commands', () => {
  it('should start server with custom port')
  it('should handle auth flow')
  it('should display usage information')
  it('should validate incompatible flag combinations')
})
```

#### 8. Protocol Translation Tests
**Priority: Medium**

Expand existing translation tests:
- OpenAI → Copilot translation edge cases
- Anthropic → Copilot translation edge cases
- Copilot → OpenAI response mapping
- Copilot → Anthropic response mapping
- Message format edge cases
- System message handling

### Test Organization

```
tests/
├── unit/
│   ├── auth/
│   │   ├── token-lifecycle.test.ts
│   │   └── token-storage.test.ts
│   ├── translation/
│   │   ├── openai-to-copilot.test.ts
│   │   └── anthropic-to-copilot.test.ts
│   ├── validation/
│   │   └── request-validation.test.ts
│   └── utils/
│       └── rate-limiter.test.ts
├── integration/
│   ├── routes/
│   │   ├── chat-completions.test.ts
│   │   ├── messages.test.ts
│   │   ├── usage.test.ts
│   │   └── token.test.ts
│   └── streaming/
│       └── sse-streaming.test.ts
├── e2e/
│   └── full-flow.test.ts
└── cli/
    └── commands.test.ts
```

### Testing Best Practices

1. **Use descriptive test names**: Test names should clearly describe the scenario
2. **Test both success and failure paths**: Don't only test happy paths
3. **Mock external dependencies**: Mock GitHub API calls to avoid rate limits
4. **Use test fixtures**: Create reusable test data for common scenarios
5. **Isolate tests**: Each test should be independent and not rely on others
6. **Test edge cases**: Empty inputs, very large inputs, special characters, etc.

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/auth-lifecycle.test.ts

# Run tests with coverage
bun test --coverage
```

## Error Handling Standards

### Error Handling Architecture

The codebase should follow a consistent three-layer error handling approach:

#### 1. Service Layer (Business Logic)

**Goal**: Throw specific, typed errors

```typescript
// src/lib/error.ts - Extend existing error classes
export class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class UpstreamAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public upstreamResponse?: unknown
  ) {
    super(message);
    this.name = 'UpstreamAPIError';
  }
}

// Usage in service layer
async function fetchCopilotToken() {
  const response = await fetch(/* ... */);

  if (!response.ok) {
    throw new UpstreamAPIError(
      'Failed to fetch Copilot token',
      response.status
    );
  }

  // ...
}
```

#### 2. HTTP Layer (Routes)

**Goal**: Convert errors to consistent HTTP response format

```typescript
// src/lib/error-handler.ts
export interface ErrorResponse {
  error: {
    type: string;
    message: string;
    code?: string;
    param?: string;
  };
  request_id?: string;
}

export function handleError(error: Error, c: Context): Response {
  // Generate unique request ID for tracking
  const requestId = crypto.randomUUID();

  // Log error with context
  consola.error('[Request ID:', requestId + ']', error);

  // Map to appropriate HTTP response
  if (error instanceof TokenExpiredError) {
    return c.json<ErrorResponse>(
      {
        error: {
          type: 'authentication_error',
          message: error.message,
          code: 'token_expired',
        },
        request_id: requestId,
      },
      401
    );
  }

  if (error instanceof RateLimitError) {
    return c.json<ErrorResponse>(
      {
        error: {
          type: 'rate_limit_error',
          message: error.message,
          code: 'rate_limit_exceeded',
        },
        request_id: requestId,
      },
      429,
      {
        'Retry-After': error.retryAfter.toString(),
      }
    );
  }

  // Default error response
  return c.json<ErrorResponse>(
    {
      error: {
        type: 'api_error',
        message: 'An unexpected error occurred',
        code: 'internal_error',
      },
      request_id: requestId,
    },
    500
  );
}

// Usage in routes
app.post('/v1/chat/completions', async (c) => {
  try {
    // Route logic
  } catch (error) {
    return handleError(error as Error, c);
  }
});
```

#### 3. CLI Layer

**Goal**: User-friendly console output with proper log levels

```typescript
// src/cli/commands.ts
import { consola } from 'consola';

// Use structured logging levels
try {
  await startServer(options);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    consola.error('Authentication failed:', error.message);
    consola.info('Please run: copilot-api auth');
    process.exit(1);
  }

  if (error instanceof RateLimitError) {
    consola.warn('Rate limit exceeded');
    consola.info('Retry after:', error.retryAfter, 'seconds');
    process.exit(1);
  }

  // Generic error
  consola.error('Unexpected error:', error);
  consola.debug('Stack trace:', error.stack);
  process.exit(1);
}
```

### Logging Standards

Use `consola` consistently with appropriate log levels:

```typescript
import { consola } from 'consola';

// Debug: Detailed information for debugging
consola.debug('Token refresh initiated', { accountType });

// Info: General informational messages
consola.info('Server started on port', port);

// Success: Operation completed successfully
consola.success('Authentication completed');

// Warn: Warning messages that don't stop execution
consola.warn('Rate limit approaching:', remaining, 'requests left');

// Error: Error messages
consola.error('Failed to connect to GitHub API:', error.message);

// Never use console.log, console.error directly
// ❌ BAD
console.log('Server started');

// ✅ GOOD
consola.info('Server started');
```

### Error Response Format

All HTTP errors should follow this structure:

```typescript
{
  "error": {
    "type": "rate_limit_error" | "authentication_error" | "invalid_request_error" | "api_error",
    "message": "Human-readable error message",
    "code": "specific_error_code",
    "param": "optional_parameter_name"  // For validation errors
  },
  "request_id": "uuid-v4-string"
}
```

This format is compatible with both OpenAI and Anthropic API error responses.

### Implementation Priority

1. **Phase 1** (Immediate):
   - Define error classes in `src/lib/error.ts`
   - Create central error handler in `src/lib/error-handler.ts`
   - Update CLI to use consola consistently

2. **Phase 2** (Short-term):
   - Update all route handlers to use error handler
   - Add request ID tracking
   - Add error logging with context

3. **Phase 3** (Medium-term):
   - Add error monitoring/tracking
   - Add error analytics
   - Create error documentation

### Current Error Handling Gaps

Areas that currently need improvement:
- Inconsistent error formats across endpoints
- Some errors use `console.error` instead of structured logging
- Missing request ID tracking
- No standardized error codes
- Incomplete error type coverage

## Code Style & Conventions

### Imports
- Use ESNext syntax
- Prefer absolute imports via `~/*` for `src/*`
- Group imports: external, internal, types

### TypeScript
- Strict mode enabled
- Avoid `any`
- Use explicit return types for functions
- Use interfaces for object shapes

### Naming
- `camelCase` for variables and functions
- `PascalCase` for types, interfaces, and classes
- `UPPER_SNAKE_CASE` for constants

### Linting
- Uses `@echristian/eslint-config`
- Run `bun run lint` to check
- Run `bun run lint --fix` to auto-fix

### Testing
- Use Bun's built-in test runner
- Place tests in `tests/` directory
- Name test files as `*.test.ts`
- Use descriptive test names

## Contributing to Tests

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure tests cover both success and failure cases
3. Add integration tests for new endpoints
4. Update this document if adding new test patterns

When fixing bugs:
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Ensure the test passes
4. Consider adding related edge case tests
