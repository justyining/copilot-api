import { afterEach, beforeEach, expect, mock, test } from "bun:test"
import { Hono } from "hono"

import { state } from "../src/lib/state"
import { completionRoutes } from "../src/routes/chat-completions/route"

const fetchMock = mock(
  (_url: string, opts: { body?: string; headers: Record<string, string> }) => {
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => ({
        id: "chatcmpl-test",
        object: "chat.completion",
        created: 0,
        model: "gpt-test",
        choices: [],
      }),
      requestBody: opts.body,
      headers: opts.headers,
    }
  },
)

const originalFetch = globalThis.fetch
const originalState = structuredClone(state)

const app = new Hono().route("/v1/chat/completions", completionRoutes)

beforeEach(() => {
  fetchMock.mockClear()
  state.accountType = "individual"
  state.copilotToken = "test-token"
  state.vsCodeVersion = "1.0.0"
  state.manualApprove = false
  state.rateLimitSeconds = undefined
  state.rateLimitWait = false
  state.lastRequestTimestamp = undefined
  state.models = {
    object: "list",
    data: [
      {
        id: "gpt-test",
        object: "model",
        name: "Test Model",
        vendor: "github-copilot",
        version: "1.0",
        preview: false,
        model_picker_enabled: true,
        capabilities: {
          family: "gpt",
          object: "model_capabilities",
          tokenizer: "o200k_base",
          type: "chat",
          supports: {},
          limits: {
            max_output_tokens: 4096,
          },
        },
      },
    ],
  }
  globalThis.fetch = fetchMock as typeof fetch
})

afterEach(() => {
  Object.assign(state, structuredClone(originalState))
  globalThis.fetch = originalFetch
})

test("fills max_tokens from model limits when omitted", async () => {
  const response = await app.request("/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-test",
      messages: [{ role: "user", content: "Hello!" }],
    }),
  })

  expect(response.status).toBe(200)
  expect(fetchMock).toHaveBeenCalledTimes(1)

  const [, requestOptions] = fetchMock.mock.calls[0] as [
    string,
    { body?: string },
  ]
  expect(JSON.parse(requestOptions.body ?? "{}")).toMatchObject({
    model: "gpt-test",
    max_tokens: 4096,
  })
})

test("preserves explicit max_tokens when provided", async () => {
  const response = await app.request("/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-test",
      max_tokens: 256,
      messages: [{ role: "user", content: "Hello!" }],
    }),
  })

  expect(response.status).toBe(200)
  expect(fetchMock).toHaveBeenCalledTimes(1)

  const [, requestOptions] = fetchMock.mock.calls[0] as [
    string,
    { body?: string },
  ]
  expect(JSON.parse(requestOptions.body ?? "{}")).toMatchObject({
    model: "gpt-test",
    max_tokens: 256,
  })
})
