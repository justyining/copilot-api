import type { Context } from "hono"

import consola from "consola"
import { streamSSE, type SSEMessage } from "hono/streaming"

import { awaitApproval } from "~/lib/approval"
import { checkRateLimit } from "~/lib/rate-limit"
import { state } from "~/lib/state"
import { getTokenCount } from "~/lib/tokenizer"
import { isNullish } from "~/lib/utils"
import { validateChatCompletionsPayload } from "~/lib/validation"
import {
  createChatCompletions,
  type ChatCompletionChunk,
  type ChatCompletionResponse,
  type ChatCompletionsPayload,
} from "~/services/copilot/create-chat-completions"

export async function handleCompletion(c: Context) {
  await checkRateLimit(state)

  let payload = await c.req.json<ChatCompletionsPayload>()

  // Validate the payload before processing
  validateChatCompletionsPayload(payload)

  consola.debug("Request payload:", JSON.stringify(payload).slice(-400))

  // Find the selected model
  const selectedModel = state.models?.data.find(
    (model) => model.id === payload.model,
  )

  // Log model selection details
  if (selectedModel) {
    consola.info(`Selected model: ${selectedModel.id}`)
    consola.info(
      `  Model info: ${selectedModel.vendor} ${selectedModel.name} (${selectedModel.version})`,
    )
    consola.debug(`  Family: ${selectedModel.capabilities.family}`)
    consola.debug(`  Tokenizer: ${selectedModel.capabilities.tokenizer}`)
    if (selectedModel.capabilities.limits.max_context_window_tokens) {
      consola.debug(
        `  Max context window: ${selectedModel.capabilities.limits.max_context_window_tokens} tokens`,
      )
    }
    if (selectedModel.capabilities.limits.max_output_tokens) {
      consola.debug(
        `  Max output tokens: ${selectedModel.capabilities.limits.max_output_tokens} tokens`,
      )
    }
  } else {
    consola.warn(`Model not found: ${payload.model}`)
  }

  // Calculate and display token count
  try {
    if (selectedModel) {
      const tokenCount = await getTokenCount(payload, selectedModel)
      consola.info(
        `Current token count: ${tokenCount.input} input + ${tokenCount.output} output = ${tokenCount.input + tokenCount.output} total`,
      )
    } else {
      consola.warn("No model selected, skipping token count calculation")
    }
  } catch (error) {
    consola.warn("Failed to calculate token count:", error)
  }

  if (state.manualApprove) await awaitApproval()

  if (isNullish(payload.max_tokens)) {
    payload = {
      ...payload,
      max_tokens: selectedModel?.capabilities.limits.max_output_tokens,
    }
    consola.debug("Set max_tokens to:", JSON.stringify(payload.max_tokens))
  }

  const response = await createChatCompletions(payload)

  if (isNonStreaming(response)) {
    consola.debug("Non-streaming response:", JSON.stringify(response))

    // Log completion statistics
    if (response.usage) {
      consola.info("Completion statistics:")
      consola.info(`  Prompt tokens: ${response.usage.prompt_tokens}`)
      consola.info(`  Completion tokens: ${response.usage.completion_tokens}`)
      consola.info(`  Total tokens: ${response.usage.total_tokens}`)
      if (response.usage.prompt_tokens_details?.cached_tokens) {
        consola.info(
          `  Cached tokens: ${response.usage.prompt_tokens_details.cached_tokens}`,
        )
      }
    }

    // Log finish reason
    if (response.choices.length > 0) {
      const finishReason = response.choices[0].finish_reason
      consola.info(`  Finish reason: ${finishReason}`)
    }

    return c.json(response)
  }

  consola.debug("Streaming response")
  return streamSSE(c, async (stream) => {
    try {
      for await (const chunk of response) {
        consola.debug("Streaming chunk:", JSON.stringify(chunk))

        // Log usage statistics from streaming chunks
        if (chunk.data && chunk.data !== "[DONE]") {
          logStreamingChunkStats(chunk.data)
        }

        await stream.writeSSE(chunk as SSEMessage)
      }
    } catch (error) {
      consola.error("Error during streaming:", error)
      // Send error event to client
      await stream.writeSSE({
        event: "error",
        data: JSON.stringify({
          error: {
            type: "internal_error",
            message:
              error instanceof Error ?
                error.message
              : "An error occurred during streaming",
          },
        }),
      })
    }
  })
}

function logStreamingChunkStats(data: string) {
  try {
    const parsedChunk = JSON.parse(data) as ChatCompletionChunk
    if (parsedChunk.usage) {
      consola.info("Streaming completion statistics:")
      consola.info(`  Prompt tokens: ${parsedChunk.usage.prompt_tokens}`)
      consola.info(
        `  Completion tokens: ${parsedChunk.usage.completion_tokens}`,
      )
      consola.info(`  Total tokens: ${parsedChunk.usage.total_tokens}`)
      if (parsedChunk.usage.prompt_tokens_details?.cached_tokens) {
        consola.info(
          `  Cached tokens: ${parsedChunk.usage.prompt_tokens_details.cached_tokens}`,
        )
      }
    }
    // Log finish reason from streaming chunks
    const firstChoice = parsedChunk.choices[0]
    if (firstChoice.finish_reason) {
      consola.info(`  Finish reason: ${firstChoice.finish_reason}`)
    }
  } catch {
    // Ignore parsing errors for individual chunks
  }
}

const isNonStreaming = (
  response: Awaited<ReturnType<typeof createChatCompletions>>,
): response is ChatCompletionResponse => Object.hasOwn(response, "choices")
