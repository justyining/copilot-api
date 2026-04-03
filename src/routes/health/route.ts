import { Hono } from "hono"

import { state } from "~/lib/state"

export const healthRoutes = new Hono()

/**
 * Liveness probe - checks if the server is running
 * Returns 200 OK if the server process is alive
 */
healthRoutes.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

/**
 * Readiness probe - checks if the server is ready to handle requests
 * Returns 200 OK if tokens are available and the service is ready
 * Returns 503 Service Unavailable if not ready
 */
healthRoutes.get("/ready", (c) => {
  const isReady = !!(state.githubToken && state.copilotToken)

  if (!isReady) {
    return c.json(
      {
        status: "unavailable",
        message: "Service not ready - authentication required",
        timestamp: new Date().toISOString(),
        ready: false,
        details: {
          hasGithubToken: !!state.githubToken,
          hasCopilotToken: !!state.copilotToken,
          hasModels: !!state.models,
        },
      },
      503,
    )
  }

  return c.json({
    status: "ready",
    message: "Service is ready to handle requests",
    timestamp: new Date().toISOString(),
    ready: true,
    details: {
      hasGithubToken: !!state.githubToken,
      hasCopilotToken: !!state.copilotToken,
      hasModels: !!state.models,
      accountType: state.accountType,
      rateLimitEnabled: !!state.rateLimitSeconds,
    },
  })
})
