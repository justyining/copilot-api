/**
 * Comprehensive validation utilities for API requests
 * Based on api-reference.md and error-codes.md specifications
 */

import type {
  AnthropicMessage,
  AnthropicMessagesPayload,
  AnthropicTool,
  AnthropicUserContentBlock,
} from "~/routes/messages/anthropic-types"
import type {
  ChatCompletionsPayload,
  Message,
  Tool,
} from "~/services/copilot/create-chat-completions"

import { createInvalidRequestError, createValidationError } from "~/lib/error"

/**
 * Validate Anthropic Messages API payload
 */
export function validateAnthropicPayload(
  payload: unknown,
): asserts payload is AnthropicMessagesPayload {
  if (!payload || typeof payload !== "object") {
    throw createInvalidRequestError("Request body must be a valid JSON object")
  }

  const p = payload as Partial<AnthropicMessagesPayload>

  // Required fields validation
  if (!p.model || typeof p.model !== "string") {
    throw createInvalidRequestError(
      "model: required field missing or invalid type",
    )
  }

  if (!p.messages || !Array.isArray(p.messages)) {
    throw createInvalidRequestError(
      "messages: required field missing or must be an array",
    )
  }

  if (p.messages.length === 0) {
    throw createInvalidRequestError("messages: array must not be empty")
  }

  if (typeof p.max_tokens !== "number") {
    throw createInvalidRequestError(
      "max_tokens: required field missing or must be a number",
    )
  }

  // Validate max_tokens range
  if (p.max_tokens <= 0) {
    throw createValidationError("max_tokens: must be a positive integer")
  }

  if (!Number.isInteger(p.max_tokens)) {
    throw createValidationError("max_tokens: must be an integer")
  }

  // Validate temperature if provided
  if (p.temperature !== undefined && p.temperature !== null) {
    if (typeof p.temperature !== "number") {
      throw createValidationError("temperature: must be a number")
    }
    if (p.temperature < 0 || p.temperature > 1) {
      throw createValidationError("temperature: must be between 0 and 1")
    }
  }

  // Validate top_p if provided
  if (p.top_p !== undefined && p.top_p !== null) {
    if (typeof p.top_p !== "number") {
      throw createValidationError("top_p: must be a number")
    }
    if (p.top_p < 0 || p.top_p > 1) {
      throw createValidationError("top_p: must be between 0 and 1")
    }
  }

  // Validate top_k if provided
  if (p.top_k !== undefined && p.top_k !== null) {
    if (typeof p.top_k !== "number") {
      throw createValidationError("top_k: must be a number")
    }
    if (p.top_k <= 0 || !Number.isInteger(p.top_k)) {
      throw createValidationError("top_k: must be a positive integer")
    }
  }

  // Validate stream if provided
  if (
    p.stream !== undefined
    && p.stream !== null
    && typeof p.stream !== "boolean"
  ) {
    throw createValidationError("stream: must be a boolean")
  }

  // Validate messages array
  for (let i = 0; i < p.messages.length; i++) {
    validateAnthropicMessage(p.messages[i], i)
  }

  // Validate system if provided
  if (p.system !== undefined && p.system !== null) {
    if (typeof p.system !== "string" && !Array.isArray(p.system)) {
      throw createValidationError(
        "system: must be a string or array of text blocks",
      )
    }
    if (Array.isArray(p.system)) {
      for (const block of p.system) {
        if (!block || typeof block !== "object" || block.type !== "text") {
          throw createValidationError(
            "system: array elements must be text blocks with type 'text'",
          )
        }
        if (typeof block.text !== "string") {
          throw createValidationError(
            "system: text blocks must have a 'text' string field",
          )
        }
      }
    }
  }

  // Validate stop_sequences if provided
  if (p.stop_sequences !== undefined && p.stop_sequences !== null) {
    if (!Array.isArray(p.stop_sequences)) {
      throw createValidationError("stop_sequences: must be an array")
    }
    for (const seq of p.stop_sequences) {
      if (typeof seq !== "string") {
        throw createValidationError(
          "stop_sequences: all elements must be strings",
        )
      }
    }
  }

  // Validate tools if provided
  if (p.tools !== undefined && p.tools !== null) {
    if (!Array.isArray(p.tools)) {
      throw createValidationError("tools: must be an array")
    }
    for (let i = 0; i < p.tools.length; i++) {
      validateAnthropicTool(p.tools[i], i)
    }
  }

  // Validate tool_choice if provided
  if (p.tool_choice !== undefined && p.tool_choice !== null) {
    if (typeof p.tool_choice !== "object") {
      throw createValidationError("tool_choice: must be an object")
    }
    const validTypes = ["auto", "any", "tool", "none"]
    if (!validTypes.includes(p.tool_choice.type)) {
      throw createValidationError(
        `tool_choice.type: must be one of ${validTypes.join(", ")}`,
      )
    }
    if (
      p.tool_choice.type === "tool"
      && typeof p.tool_choice.name !== "string"
    ) {
      throw createValidationError(
        "tool_choice.name: required when type is 'tool'",
      )
    }
  }

  // Validate thinking if provided
  if (p.thinking !== undefined && p.thinking !== null) {
    if (typeof p.thinking !== "object") {
      throw createValidationError("thinking: must be an object")
    }
    if (p.thinking.type !== "enabled") {
      throw createValidationError("thinking.type: must be 'enabled'")
    }
    if (
      p.thinking.budget_tokens !== undefined
      && (typeof p.thinking.budget_tokens !== "number"
        || p.thinking.budget_tokens <= 0)
    ) {
      throw createValidationError(
        "thinking.budget_tokens: must be a positive number",
      )
    }
  }

  // Validate service_tier if provided
  if (p.service_tier !== undefined && p.service_tier !== null) {
    const validTiers = ["auto", "standard_only"]
    if (!validTiers.includes(p.service_tier)) {
      throw createValidationError(
        `service_tier: must be one of ${validTiers.join(", ")}`,
      )
    }
  }

  // Validate metadata if provided
  if (p.metadata !== undefined && p.metadata !== null) {
    if (typeof p.metadata !== "object") {
      throw createValidationError("metadata: must be an object")
    }
    if (
      p.metadata.user_id !== undefined
      && typeof p.metadata.user_id !== "string"
    ) {
      throw createValidationError("metadata.user_id: must be a string")
    }
  }
}

/**
 * Validate Anthropic Messages API payload for count_tokens endpoint
 * Same as validateAnthropicPayload but doesn't require max_tokens
 */
export function validateAnthropicCountTokensPayload(
  payload: unknown,
): asserts payload is Omit<AnthropicMessagesPayload, "max_tokens"> & {
  max_tokens?: number
} {
  if (!payload || typeof payload !== "object") {
    throw createInvalidRequestError("Request body must be a valid JSON object")
  }

  const p = payload as Partial<AnthropicMessagesPayload>

  // Required fields validation (max_tokens is optional for count_tokens)
  if (!p.model || typeof p.model !== "string") {
    throw createInvalidRequestError(
      "model: required field missing or invalid type",
    )
  }

  if (!p.messages || !Array.isArray(p.messages)) {
    throw createInvalidRequestError(
      "messages: required field missing or must be an array",
    )
  }

  if (p.messages.length === 0) {
    throw createInvalidRequestError("messages: array must not be empty")
  }

  // Validate max_tokens if provided, but don't require it
  if (p.max_tokens !== undefined && p.max_tokens !== null) {
    if (typeof p.max_tokens !== "number") {
      throw createValidationError("max_tokens: must be a number")
    }
    if (p.max_tokens <= 0) {
      throw createValidationError("max_tokens: must be a positive integer")
    }
    if (!Number.isInteger(p.max_tokens)) {
      throw createValidationError("max_tokens: must be an integer")
    }
  }

  // All other validations are the same as validateAnthropicPayload
  // Validate temperature if provided
  if (p.temperature !== undefined && p.temperature !== null) {
    if (typeof p.temperature !== "number") {
      throw createValidationError("temperature: must be a number")
    }
    if (p.temperature < 0 || p.temperature > 1) {
      throw createValidationError("temperature: must be between 0 and 1")
    }
  }

  // Validate top_p if provided
  if (p.top_p !== undefined && p.top_p !== null) {
    if (typeof p.top_p !== "number") {
      throw createValidationError("top_p: must be a number")
    }
    if (p.top_p < 0 || p.top_p > 1) {
      throw createValidationError("top_p: must be between 0 and 1")
    }
  }

  // Validate top_k if provided
  if (p.top_k !== undefined && p.top_k !== null) {
    if (typeof p.top_k !== "number") {
      throw createValidationError("top_k: must be a number")
    }
    if (p.top_k <= 0 || !Number.isInteger(p.top_k)) {
      throw createValidationError("top_k: must be a positive integer")
    }
  }

  // Validate messages array
  for (let i = 0; i < p.messages.length; i++) {
    validateAnthropicMessage(p.messages[i], i)
  }

  // Validate system if provided
  if (p.system !== undefined && p.system !== null) {
    if (typeof p.system !== "string" && !Array.isArray(p.system)) {
      throw createValidationError(
        "system: must be a string or array of text blocks",
      )
    }
    if (Array.isArray(p.system)) {
      for (const block of p.system) {
        if (!block || typeof block !== "object" || block.type !== "text") {
          throw createValidationError(
            "system: array elements must be text blocks with type 'text'",
          )
        }
        if (typeof block.text !== "string") {
          throw createValidationError(
            "system: text blocks must have a 'text' string field",
          )
        }
      }
    }
  }

  // Validate stop_sequences if provided
  if (p.stop_sequences !== undefined && p.stop_sequences !== null) {
    if (!Array.isArray(p.stop_sequences)) {
      throw createValidationError("stop_sequences: must be an array")
    }
    for (const seq of p.stop_sequences) {
      if (typeof seq !== "string") {
        throw createValidationError(
          "stop_sequences: all elements must be strings",
        )
      }
    }
  }

  // Validate tools if provided
  if (p.tools !== undefined && p.tools !== null) {
    if (!Array.isArray(p.tools)) {
      throw createValidationError("tools: must be an array")
    }
    for (let i = 0; i < p.tools.length; i++) {
      validateAnthropicTool(p.tools[i], i)
    }
  }

  // Validate tool_choice if provided
  if (p.tool_choice !== undefined && p.tool_choice !== null) {
    if (typeof p.tool_choice !== "object") {
      throw createValidationError("tool_choice: must be an object")
    }
    const validTypes = ["auto", "any", "tool", "none"]
    if (!validTypes.includes(p.tool_choice.type)) {
      throw createValidationError(
        `tool_choice.type: must be one of ${validTypes.join(", ")}`,
      )
    }
    if (
      p.tool_choice.type === "tool"
      && typeof p.tool_choice.name !== "string"
    ) {
      throw createValidationError(
        "tool_choice.name: required when type is 'tool'",
      )
    }
  }

  // Validate thinking if provided
  if (p.thinking !== undefined && p.thinking !== null) {
    if (typeof p.thinking !== "object") {
      throw createValidationError("thinking: must be an object")
    }
    if (p.thinking.type !== "enabled") {
      throw createValidationError("thinking.type: must be 'enabled'")
    }
    if (
      p.thinking.budget_tokens !== undefined
      && (typeof p.thinking.budget_tokens !== "number"
        || p.thinking.budget_tokens <= 0)
    ) {
      throw createValidationError(
        "thinking.budget_tokens: must be a positive number",
      )
    }
  }

  // Validate service_tier if provided
  if (p.service_tier !== undefined && p.service_tier !== null) {
    const validTiers = ["auto", "standard_only"]
    if (!validTiers.includes(p.service_tier)) {
      throw createValidationError(
        `service_tier: must be one of ${validTiers.join(", ")}`,
      )
    }
  }

  // Validate metadata if provided
  if (p.metadata !== undefined && p.metadata !== null) {
    if (typeof p.metadata !== "object") {
      throw createValidationError("metadata: must be an object")
    }
    if (
      p.metadata.user_id !== undefined
      && typeof p.metadata.user_id !== "string"
    ) {
      throw createValidationError("metadata.user_id: must be a string")
    }
  }
}

/**
 * Validate a single Anthropic message
 */
function validateAnthropicMessage(
  message: unknown,
  index: number,
): asserts message is AnthropicMessage {
  if (!message || typeof message !== "object") {
    throw createValidationError(`messages[${index}]: must be an object`)
  }

  const m = message as Partial<AnthropicMessage>

  // Validate role
  const validRoles = ["user", "assistant"]
  if (!m.role || !validRoles.includes(m.role)) {
    throw createValidationError(
      `messages[${index}].role: must be one of ${validRoles.join(", ")}`,
    )
  }

  // Validate content
  if (m.content === undefined || m.content === null) {
    throw createValidationError(
      `messages[${index}].content: required field missing`,
    )
  }

  if (typeof m.content !== "string" && !Array.isArray(m.content)) {
    throw createValidationError(
      `messages[${index}].content: must be a string or array`,
    )
  }

  // Validate content blocks if array
  if (Array.isArray(m.content)) {
    if (m.content.length === 0) {
      throw createValidationError(
        `messages[${index}].content: array must not be empty`,
      )
    }

    for (let i = 0; i < m.content.length; i++) {
      validateAnthropicContentBlock(m.content[i], index, i, m.role)
    }
  }
}

/**
 * Validate Anthropic content block
 */
function validateAnthropicContentBlock(
  block: unknown,
  messageIndex: number,
  blockIndex: number,
  role?: string,
): void {
  if (!block || typeof block !== "object") {
    throw createValidationError(
      `messages[${messageIndex}].content[${blockIndex}]: must be an object`,
    )
  }

  const b = block as Partial<AnthropicUserContentBlock>

  if (!b.type || typeof b.type !== "string") {
    throw createValidationError(
      `messages[${messageIndex}].content[${blockIndex}].type: required field missing`,
    )
  }

  // Validate based on block type
  switch (b.type) {
    case "text": {
      if (typeof b.text !== "string") {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].text: must be a string`,
        )
      }

      break
    }
    case "image": {
      const imgBlock = b as any
      if (!imgBlock.source || typeof imgBlock.source !== "object") {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].source: required for image blocks`,
        )
      }
      if (imgBlock.source.type !== "base64") {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].source.type: must be 'base64'`,
        )
      }
      const validMediaTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ]
      if (!validMediaTypes.includes(imgBlock.source.media_type)) {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].source.media_type: must be one of ${validMediaTypes.join(", ")}`,
        )
      }
      if (typeof imgBlock.source.data !== "string") {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].source.data: must be a base64 string`,
        )
      }

      break
    }
    case "tool_result": {
      const toolBlock = b as any
      if (typeof toolBlock.tool_use_id !== "string") {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].tool_use_id: required for tool_result blocks`,
        )
      }
      if (toolBlock.content === undefined) {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].content: required for tool_result blocks`,
        )
      }
      if (
        toolBlock.is_error !== undefined
        && typeof toolBlock.is_error !== "boolean"
      ) {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].is_error: must be a boolean`,
        )
      }

      break
    }
    case "tool_use": {
      // Tool use blocks are typically in assistant messages
      const toolBlock = b as any
      if (typeof toolBlock.id !== "string") {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].id: required for tool_use blocks`,
        )
      }
      if (typeof toolBlock.name !== "string") {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].name: required for tool_use blocks`,
        )
      }
      if (!toolBlock.input || typeof toolBlock.input !== "object") {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].input: must be an object`,
        )
      }

      break
    }
    case "thinking": {
      const thinkingBlock = b as any
      if (typeof thinkingBlock.thinking !== "string") {
        throw createValidationError(
          `messages[${messageIndex}].content[${blockIndex}].thinking: must be a string`,
        )
      }

      break
    }
    default: {
      throw createValidationError(
        `messages[${messageIndex}].content[${blockIndex}].type: unsupported block type '${b.type}'`,
      )
    }
  }
}

/**
 * Validate Anthropic tool definition
 */
function validateAnthropicTool(
  tool: unknown,
  index: number,
): asserts tool is AnthropicTool {
  if (!tool || typeof tool !== "object") {
    throw createValidationError(`tools[${index}]: must be an object`)
  }

  const t = tool as Partial<AnthropicTool>

  if (!t.name || typeof t.name !== "string") {
    throw createValidationError(`tools[${index}].name: required field missing`)
  }

  if (t.description !== undefined && typeof t.description !== "string") {
    throw createValidationError(`tools[${index}].description: must be a string`)
  }

  if (!t.input_schema || typeof t.input_schema !== "object") {
    throw createValidationError(
      `tools[${index}].input_schema: required and must be an object (JSON Schema)`,
    )
  }
}

/**
 * Validate OpenAI Chat Completions payload
 */
export function validateChatCompletionsPayload(
  payload: unknown,
): asserts payload is ChatCompletionsPayload {
  if (!payload || typeof payload !== "object") {
    throw createInvalidRequestError("Request body must be a valid JSON object")
  }

  const p = payload as Partial<ChatCompletionsPayload>

  // Required fields
  if (!p.model || typeof p.model !== "string") {
    throw createInvalidRequestError(
      "model: required field missing or invalid type",
    )
  }

  if (!p.messages || !Array.isArray(p.messages)) {
    throw createInvalidRequestError(
      "messages: required field missing or must be an array",
    )
  }

  if (p.messages.length === 0) {
    throw createInvalidRequestError("messages: array must not be empty")
  }

  // Validate optional numeric parameters
  if (p.temperature !== undefined && p.temperature !== null) {
    if (typeof p.temperature !== "number") {
      throw createValidationError("temperature: must be a number")
    }
    if (p.temperature < 0 || p.temperature > 2) {
      throw createValidationError("temperature: must be between 0 and 2")
    }
  }

  if (p.top_p !== undefined && p.top_p !== null) {
    if (typeof p.top_p !== "number") {
      throw createValidationError("top_p: must be a number")
    }
    if (p.top_p < 0 || p.top_p > 1) {
      throw createValidationError("top_p: must be between 0 and 1")
    }
  }

  if (p.max_tokens !== undefined && p.max_tokens !== null) {
    if (typeof p.max_tokens !== "number") {
      throw createValidationError("max_tokens: must be a number")
    }
    if (p.max_tokens <= 0 || !Number.isInteger(p.max_tokens)) {
      throw createValidationError("max_tokens: must be a positive integer")
    }
  }

  if (p.frequency_penalty !== undefined && p.frequency_penalty !== null) {
    if (typeof p.frequency_penalty !== "number") {
      throw createValidationError("frequency_penalty: must be a number")
    }
    if (p.frequency_penalty < -2 || p.frequency_penalty > 2) {
      throw createValidationError("frequency_penalty: must be between -2 and 2")
    }
  }

  if (p.presence_penalty !== undefined && p.presence_penalty !== null) {
    if (typeof p.presence_penalty !== "number") {
      throw createValidationError("presence_penalty: must be a number")
    }
    if (p.presence_penalty < -2 || p.presence_penalty > 2) {
      throw createValidationError("presence_penalty: must be between -2 and 2")
    }
  }

  if (
    p.n !== undefined
    && p.n !== null
    && (typeof p.n !== "number" || !Number.isInteger(p.n) || p.n < 1)
  ) {
    throw createValidationError("n: must be a positive integer")
  }

  // Validate messages
  for (let i = 0; i < p.messages.length; i++) {
    validateChatMessage(p.messages[i], i)
  }

  // Validate tools if provided
  if (p.tools !== undefined && p.tools !== null) {
    if (!Array.isArray(p.tools)) {
      throw createValidationError("tools: must be an array")
    }
    for (let i = 0; i < p.tools.length; i++) {
      validateChatTool(p.tools[i], i)
    }
  }

  // Validate tool_choice if provided
  if (p.tool_choice !== undefined && p.tool_choice !== null) {
    if (typeof p.tool_choice === "string") {
      const validChoices = ["none", "auto", "required"]
      if (!validChoices.includes(p.tool_choice)) {
        throw createValidationError(
          `tool_choice: must be one of ${validChoices.join(", ")} or an object`,
        )
      }
    } else if (typeof p.tool_choice === "object") {
      if (p.tool_choice.type !== "function") {
        throw createValidationError("tool_choice.type: must be 'function'")
      }
      if (
        !p.tool_choice.function
        || typeof p.tool_choice.function.name !== "string"
      ) {
        throw createValidationError(
          "tool_choice.function.name: required when specifying a function",
        )
      }
    } else {
      throw createValidationError("tool_choice: must be a string or object")
    }
  }

  // Validate stop sequences
  if (p.stop !== undefined && p.stop !== null) {
    if (typeof p.stop !== "string" && !Array.isArray(p.stop)) {
      throw createValidationError("stop: must be a string or array of strings")
    }
    if (Array.isArray(p.stop)) {
      for (const seq of p.stop) {
        if (typeof seq !== "string") {
          throw createValidationError(
            "stop: all array elements must be strings",
          )
        }
      }
    }
  }

  // Validate stream
  if (
    p.stream !== undefined
    && p.stream !== null
    && typeof p.stream !== "boolean"
  ) {
    throw createValidationError("stream: must be a boolean")
  }
}

/**
 * Validate a single chat message
 */
function validateChatMessage(
  message: unknown,
  index: number,
): asserts message is Message {
  if (!message || typeof message !== "object") {
    throw createValidationError(`messages[${index}]: must be an object`)
  }

  const m = message as Partial<Message>

  // Validate role
  const validRoles = ["user", "assistant", "system", "tool", "developer"]
  if (!m.role || !validRoles.includes(m.role)) {
    throw createValidationError(
      `messages[${index}].role: must be one of ${validRoles.join(", ")}`,
    )
  }

  // Content validation depends on role
  if (m.role === "tool" && typeof m.tool_call_id !== "string") {
    throw createValidationError(
      `messages[${index}].tool_call_id: required for tool messages`,
    )
  }

  // Validate content if present
  if (m.content !== undefined && m.content !== null) {
    if (typeof m.content !== "string" && !Array.isArray(m.content)) {
      throw createValidationError(
        `messages[${index}].content: must be a string, array, or null`,
      )
    }

    if (Array.isArray(m.content)) {
      for (let i = 0; i < m.content.length; i++) {
        const part = m.content[i]
        if (!part || typeof part !== "object") {
          throw createValidationError(
            `messages[${index}].content[${i}]: must be an object`,
          )
        }

        if (part.type === "text") {
          if (typeof part.text !== "string") {
            throw createValidationError(
              `messages[${index}].content[${i}].text: must be a string`,
            )
          }
        } else if (part.type === "image_url") {
          if (!part.image_url || typeof part.image_url.url !== "string") {
            throw createValidationError(
              `messages[${index}].content[${i}].image_url.url: required`,
            )
          }
          if (part.image_url.detail !== undefined) {
            const validDetails = ["low", "high", "auto"]
            if (!validDetails.includes(part.image_url.detail)) {
              throw createValidationError(
                `messages[${index}].content[${i}].image_url.detail: must be one of ${validDetails.join(", ")}`,
              )
            }
          }
        } else {
          throw createValidationError(
            `messages[${index}].content[${i}].type: must be 'text' or 'image_url'`,
          )
        }
      }
    }
  }

  // Validate tool_calls if present
  if (m.tool_calls !== undefined && m.tool_calls !== null) {
    if (!Array.isArray(m.tool_calls)) {
      throw createValidationError(
        `messages[${index}].tool_calls: must be an array`,
      )
    }

    for (let i = 0; i < m.tool_calls.length; i++) {
      const toolCall = m.tool_calls[i]
      if (!toolCall || typeof toolCall !== "object") {
        throw createValidationError(
          `messages[${index}].tool_calls[${i}]: must be an object`,
        )
      }
      if (typeof toolCall.id !== "string") {
        throw createValidationError(
          `messages[${index}].tool_calls[${i}].id: required`,
        )
      }
      if (toolCall.type !== "function") {
        throw createValidationError(
          `messages[${index}].tool_calls[${i}].type: must be 'function'`,
        )
      }
      if (!toolCall.function || typeof toolCall.function.name !== "string") {
        throw createValidationError(
          `messages[${index}].tool_calls[${i}].function.name: required`,
        )
      }
      if (typeof toolCall.function.arguments !== "string") {
        throw createValidationError(
          `messages[${index}].tool_calls[${i}].function.arguments: must be a JSON string`,
        )
      }
    }
  }
}

/**
 * Validate a chat tool definition
 */
function validateChatTool(tool: unknown, index: number): asserts tool is Tool {
  if (!tool || typeof tool !== "object") {
    throw createValidationError(`tools[${index}]: must be an object`)
  }

  const t = tool as Partial<Tool>

  if (t.type !== "function") {
    throw createValidationError(`tools[${index}].type: must be 'function'`)
  }

  if (!t.function || typeof t.function !== "object") {
    throw createValidationError(
      `tools[${index}].function: required and must be an object`,
    )
  }

  if (typeof t.function.name !== "string") {
    throw createValidationError(`tools[${index}].function.name: required`)
  }

  if (
    t.function.description !== undefined
    && typeof t.function.description !== "string"
  ) {
    throw createValidationError(
      `tools[${index}].function.description: must be a string`,
    )
  }

  if (!t.function.parameters || typeof t.function.parameters !== "object") {
    throw createValidationError(
      `tools[${index}].function.parameters: required and must be an object (JSON Schema)`,
    )
  }
}
