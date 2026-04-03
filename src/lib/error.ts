import type { Context } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"

import consola from "consola"

export class HTTPError extends Error {
  response: Response

  constructor(message: string, response: Response) {
    super(message)
    this.response = response
  }
}

/**
 * API Error types based on error-codes.md documentation
 */
export type APIErrorType =
  | "authentication_error"
  | "invalid_request_error"
  | "validation_error"
  | "rate_limit_error"
  | "service_unavailable"
  | "timeout_error"
  | "internal_error"

/**
 * Structured API error class for consistent error responses
 */
export class APIError extends Error {
  type: APIErrorType
  statusCode: number

  constructor(type: APIErrorType, message: string, statusCode: number) {
    super(message)
    this.type = type
    this.statusCode = statusCode
    this.name = "APIError"
  }
}

/**
 * Create a validation error for invalid request parameters
 */
export function createValidationError(message: string): APIError {
  return new APIError("validation_error", message, 422)
}

/**
 * Create an invalid request error for malformed requests
 */
export function createInvalidRequestError(message: string): APIError {
  return new APIError("invalid_request_error", message, 400)
}

/**
 * Create a rate limit error
 */
export function createRateLimitError(message?: string): APIError {
  return new APIError(
    "rate_limit_error",
    message || "Rate limit exceeded. Please wait before making another request.",
    429,
  )
}

/**
 * Create an authentication error
 */
export function createAuthenticationError(message?: string): APIError {
  return new APIError(
    "authentication_error",
    message || "Invalid or expired GitHub Copilot token",
    401,
  )
}

/**
 * Create a service unavailable error
 */
export function createServiceUnavailableError(message?: string): APIError {
  return new APIError(
    "service_unavailable",
    message || "GitHub Copilot service is temporarily unavailable",
    503,
  )
}

/**
 * Create a timeout error
 */
export function createTimeoutError(message?: string): APIError {
  return new APIError(
    "timeout_error",
    message || "Request to GitHub Copilot timed out",
    504,
  )
}

/**
 * Create an internal server error
 */
export function createInternalError(message?: string): APIError {
  return new APIError(
    "internal_error",
    message || "An unexpected error occurred",
    500,
  )
}

export async function forwardError(c: Context, error: unknown) {
  consola.error("Error occurred:", error)

  // Handle structured APIError
  if (error instanceof APIError) {
    return c.json(
      {
        error: {
          type: error.type,
          message: error.message,
        },
      },
      error.statusCode as ContentfulStatusCode,
    )
  }

  // Handle HTTPError from upstream
  if (error instanceof HTTPError) {
    const errorText = await error.response.text()
    let errorJson: unknown
    try {
      errorJson = JSON.parse(errorText)
    } catch {
      errorJson = errorText
    }
    consola.error("HTTP error:", errorJson)

    // Try to extract error information from upstream response
    const statusCode = error.response.status
    let errorType: APIErrorType = "internal_error"
    let errorMessage = errorText

    // Map HTTP status codes to error types
    if (statusCode === 401) {
      errorType = "authentication_error"
      errorMessage = "Invalid or expired GitHub Copilot token"
    } else if (statusCode === 429) {
      errorType = "rate_limit_error"
      errorMessage = "Rate limit exceeded. Please wait before making another request."
    } else if (statusCode === 503) {
      errorType = "service_unavailable"
      errorMessage = "GitHub Copilot service is temporarily unavailable"
    } else if (statusCode === 504) {
      errorType = "timeout_error"
      errorMessage = "Request to GitHub Copilot timed out"
    } else if (statusCode >= 500) {
      errorType = "internal_error"
      errorMessage = "An unexpected error occurred"
    } else if (statusCode === 400) {
      errorType = "invalid_request_error"
    } else if (statusCode === 422) {
      errorType = "validation_error"
    }

    return c.json(
      {
        error: {
          type: errorType,
          message: errorMessage,
        },
      },
      statusCode as ContentfulStatusCode,
    )
  }

  // Handle generic errors
  return c.json(
    {
      error: {
        type: "internal_error",
        message: (error as Error).message || "An unexpected error occurred",
      },
    },
    500,
  )
}
