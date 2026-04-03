import { Hono } from "hono"

import { state } from "~/lib/state"

export const healthRoute = new Hono()

/**
 * Liveness probe - checks if the server process is running
 * This endpoint always returns 200 if the server is alive
 */
healthRoute.get("/", (c) => {
  return c.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    200,
  )
})

/**
 * Readiness probe - checks if the server is ready to accept requests
 * This endpoint checks if critical dependencies are initialized:
 * - Copilot token is available
 * - Models are cached
 */
export const readyRoute = new Hono()

readyRoute.get("/", (c) => {
  const checks = {
    copilotToken: !!state.copilotToken,
    models: !!state.models && state.models.data.length > 0,
    vsCodeVersion: !!state.vsCodeVersion,
  }

  const isReady = checks.copilotToken && checks.models && checks.vsCodeVersion

  if (!isReady) {
    return c.json(
      {
        status: "not_ready",
        checks,
        timestamp: new Date().toISOString(),
      },
      503,
    )
  }

  return c.json(
    {
      status: "ready",
      checks,
      timestamp: new Date().toISOString(),
    },
    200,
  )
})
