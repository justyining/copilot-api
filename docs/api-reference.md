# Copilot API - Claude Messages API 参考文档

## 概述

Copilot API 提供了与 Anthropic Claude Messages API 兼容的接口，允许您通过 GitHub Copilot 后端使用 Claude 风格的 API。本文档详细描述了所有可用的端点、参数、响应格式和错误处理。

## 基础信息

- **基础 URL**: `http://localhost:4141` (默认端口，可通过 `--port` 参数配置)
- **API 版本**: v1
- **支持的协议**: HTTP/HTTPS
- **内容类型**: `application/json`

## 认证

虽然 Copilot API 与 Anthropic API 兼容，但不需要 Anthropic API 密钥。相反，它使用 GitHub Copilot 凭证进行认证。启动服务器时会自动处理认证流程。

如果您在使用 Claude Code 等工具时需要提供 API 密钥，可以使用任意占位符值（如 `"dummy"`），因为实际认证通过 GitHub Copilot 令牌处理。

## API 端点

### 1. 创建消息 (POST /v1/messages)

创建模型响应以进行给定的对话。这是主要的聊天完成端点。

#### 端点

```
POST /v1/messages
```

#### 请求头

```
Content-Type: application/json
```

#### 请求体参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `model` | string | 是 | 要使用的模型标识符。支持的模型包括 `gpt-4`, `gpt-4.1`, `gpt-3.5-turbo` 等 |
| `messages` | array | 是 | 对话消息数组。每条消息必须包含 `role` 和 `content` |
| `max_tokens` | integer | 是 | 生成响应的最大令牌数 |
| `system` | string \| array | 否 | 系统提示。可以是字符串或文本块数组 |
| `temperature` | number | 否 | 采样温度，范围 0-1。较高的值使输出更随机 |
| `top_p` | number | 否 | 核采样参数，范围 0-1 |
| `top_k` | number | 否 | 只考虑前 k 个概率最高的令牌 |
| `stream` | boolean | 否 | 是否流式传输响应。默认为 `false` |
| `stop_sequences` | array | 否 | 停止序列数组。遇到这些序列时停止生成 |
| `metadata` | object | 否 | 元数据对象，可包含 `user_id` 等字段 |
| `tools` | array | 否 | 可用工具的数组定义 |
| `tool_choice` | object | 否 | 工具选择策略配置 |
| `thinking` | object | 否 | 思考模式配置（Extended Thinking） |
| `service_tier` | string | 否 | 服务层级：`"auto"` 或 `"standard_only"` |

#### Messages 消息格式

消息数组中的每条消息必须包含以下字段：

**用户消息**:
```json
{
  "role": "user",
  "content": "你好，请介绍一下你自己"
}
```

**助手消息**:
```json
{
  "role": "assistant",
  "content": "你好！我是 AI 助手..."
}
```

**内容可以是字符串或内容块数组**:

文本块:
```json
{
  "type": "text",
  "text": "这是文本内容"
}
```

图像块:
```json
{
  "type": "image",
  "source": {
    "type": "base64",
    "media_type": "image/jpeg",
    "data": "base64编码的图像数据"
  }
}
```

工具结果块:
```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
  "content": "工具执行结果",
  "is_error": false
}
```

#### Tools 工具定义

如果您想让模型能够调用工具/函数，可以提供工具定义：

```json
{
  "name": "get_weather",
  "description": "获取指定位置的天气信息",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "城市名称"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "温度单位"
      }
    },
    "required": ["location"]
  }
}
```

**Tool Choice 工具选择策略**:

```json
{
  "type": "auto"  // 自动选择 | "any" | "tool" | "none"
}
```

#### Thinking 思考模式

启用扩展思考功能（Extended Thinking）：

```json
{
  "type": "enabled",
  "budget_tokens": 1000  // 可选：思考预算令牌数
}
```

#### 请求示例

**基础请求**:

```bash
curl -X POST http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "用 Python 写一个快速排序算法"
      }
    ]
  }'
```

**带系统提示的请求**:

```bash
curl -X POST http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "max_tokens": 2048,
    "system": "你是一位经验丰富的 Python 开发者，擅长算法和数据结构。",
    "temperature": 0.7,
    "messages": [
      {
        "role": "user",
        "content": "解释快速排序的时间复杂度"
      }
    ]
  }'
```

**流式请求**:

```bash
curl -X POST http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "max_tokens": 1024,
    "stream": true,
    "messages": [
      {
        "role": "user",
        "content": "写一首关于编程的诗"
      }
    ]
  }'
```

#### 响应格式

**非流式响应**:

```json
{
  "id": "msg_01XFDUDYJgAACyzwYAYXby",
  "type": "message",
  "role": "assistant",
  "model": "gpt-4",
  "content": [
    {
      "type": "text",
      "text": "这是模型的响应内容..."
    }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 25,
    "output_tokens": 150,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}
```

**流式响应** (Server-Sent Events):

流式响应以 SSE 格式返回，每个事件的格式为：

```
event: message_start
data: {"type":"message_start","message":{"id":"msg_123","type":"message","role":"assistant","content":[],"model":"gpt-4","stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":25,"output_tokens":0}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"这"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"是"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":150}}

event: message_stop
data: {"type":"message_stop"}
```

#### 响应字段说明

| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | string | 消息的唯一标识符 |
| `type` | string | 始终为 `"message"` |
| `role` | string | 始终为 `"assistant"` |
| `model` | string | 使用的模型标识符 |
| `content` | array | 响应内容块数组 |
| `stop_reason` | string \| null | 停止原因：`end_turn`, `max_tokens`, `stop_sequence`, `tool_use`, `pause_turn`, `refusal` |
| `stop_sequence` | string \| null | 触发停止的序列（如果适用） |
| `usage` | object | 令牌使用统计 |

**Usage 对象字段**:

| 字段 | 类型 | 描述 |
|------|------|------|
| `input_tokens` | integer | 输入使用的令牌数 |
| `output_tokens` | integer | 输出生成的令牌数 |
| `cache_creation_input_tokens` | integer | 用于创建缓存的令牌数（可选） |
| `cache_read_input_tokens` | integer | 从缓存读取的令牌数（可选） |
| `service_tier` | string | 使用的服务层级（可选） |

### 2. 计算令牌数 (POST /v1/messages/count_tokens)

计算给定消息集的令牌数量，用于估算成本或检查是否超过限制。

#### 端点

```
POST /v1/messages/count_tokens
```

#### 请求体参数

接受与创建消息端点相同的参数（除了 `stream`）。

#### 请求示例

```bash
curl -X POST http://localhost:4141/v1/messages/count_tokens \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ]
  }'
```

#### 响应示例

```json
{
  "input_tokens": 15
}
```

## 停止原因 (Stop Reasons)

模型可能因以下原因停止生成：

| 停止原因 | 描述 |
|---------|------|
| `end_turn` | 模型自然地结束了回复 |
| `max_tokens` | 达到了 `max_tokens` 限制 |
| `stop_sequence` | 遇到了指定的停止序列 |
| `tool_use` | 模型想要使用工具/函数 |
| `pause_turn` | 模型暂停等待更多输入 |
| `refusal` | 模型拒绝回答请求 |

## 内容块类型 (Content Block Types)

### 文本块 (Text Block)

```json
{
  "type": "text",
  "text": "这是文本内容"
}
```

### 工具使用块 (Tool Use Block)

当模型决定使用工具时返回：

```json
{
  "type": "tool_use",
  "id": "toolu_01A09q90qw90lq917835lq9",
  "name": "get_weather",
  "input": {
    "location": "北京",
    "unit": "celsius"
  }
}
```

### 思考块 (Thinking Block)

当启用扩展思考时返回：

```json
{
  "type": "thinking",
  "thinking": "让我思考一下这个问题..."
}
```

## 流式事件类型 (Stream Event Types)

### message_start

流的开始，包含初始消息元数据：

```json
{
  "type": "message_start",
  "message": {
    "id": "msg_123",
    "type": "message",
    "role": "assistant",
    "content": [],
    "model": "gpt-4",
    "stop_reason": null,
    "stop_sequence": null,
    "usage": {
      "input_tokens": 25,
      "output_tokens": 0
    }
  }
}
```

### content_block_start

新内容块的开始：

```json
{
  "type": "content_block_start",
  "index": 0,
  "content_block": {
    "type": "text",
    "text": ""
  }
}
```

### content_block_delta

内容块的增量更新：

**文本增量**:
```json
{
  "type": "content_block_delta",
  "index": 0,
  "delta": {
    "type": "text_delta",
    "text": "Hello"
  }
}
```

**工具输入 JSON 增量**:
```json
{
  "type": "content_block_delta",
  "index": 1,
  "delta": {
    "type": "input_json_delta",
    "partial_json": "{\"location\":"
  }
}
```

**思考增量**:
```json
{
  "type": "content_block_delta",
  "index": 0,
  "delta": {
    "type": "thinking_delta",
    "thinking": "让我考虑..."
  }
}
```

### content_block_stop

内容块结束：

```json
{
  "type": "content_block_stop",
  "index": 0
}
```

### message_delta

消息级别的增量更新（通常包含最终的停止原因和使用统计）：

```json
{
  "type": "message_delta",
  "delta": {
    "stop_reason": "end_turn",
    "stop_sequence": null
  },
  "usage": {
    "output_tokens": 150
  }
}
```

### message_stop

流结束：

```json
{
  "type": "message_stop"
}
```

### ping

心跳事件（保持连接活跃）：

```json
{
  "type": "ping"
}
```

### error

流式传输过程中的错误：

```json
{
  "type": "error",
  "error": {
    "type": "error_type",
    "message": "错误描述"
  }
}
```

## 支持的模型

Copilot API 支持多种模型，这些模型实际上由 GitHub Copilot 后端支持：

- `gpt-4` - GPT-4 模型
- `gpt-4.1` - GPT-4 改进版本
- `gpt-3.5-turbo` - GPT-3.5 Turbo 模型
- `claude-3.5-sonnet` - Claude 3.5 Sonnet (如果后端支持)
- 其他 GitHub Copilot 支持的模型

具体可用的模型取决于您的 GitHub Copilot 订阅类型（个人版、商业版或企业版）。

您可以通过 `/v1/models` 端点查询可用模型列表：

```bash
curl http://localhost:4141/v1/models
```

## 最佳实践

### 1. 令牌管理

- 使用 `/v1/messages/count_tokens` 端点在发送请求前估算令牌使用
- 为 `max_tokens` 设置合理的值以控制成本
- 考虑使用流式传输以便提前停止不需要的长响应

### 2. 速率限制

为避免触发 GitHub Copilot 的速率限制，建议：

- 使用 `--rate-limit` 选项设置请求间隔
- 使用 `--wait` 选项在达到速率限制时等待而不是报错
- 使用 `--manual` 选项手动批准每个请求以完全控制使用量

### 3. 错误处理

- 始终检查响应的 `stop_reason` 字段
- 实现重试逻辑以处理暂时性错误
- 监控 `usage` 字段以跟踪令牌消耗

### 4. 工具使用

当使用工具时：

1. 在请求中提供清晰的工具定义
2. 检查 `stop_reason` 是否为 `tool_use`
3. 在 `content` 数组中查找 `tool_use` 块
4. 执行请求的工具调用
5. 将结果作为 `tool_result` 块发送回模型

### 5. 流式传输

使用流式传输时：

- 正确处理所有事件类型
- 实现超时机制
- 优雅地处理连接中断
- 考虑使用客户端库来简化 SSE 处理

## 与标准 Anthropic API 的差异

虽然此 API 设计为与 Anthropic Messages API 兼容，但有一些关键差异：

1. **认证**: 使用 GitHub Copilot 凭证而不是 Anthropic API 密钥
2. **模型**: 可用模型取决于 GitHub Copilot 后端，而不是 Anthropic 的模型
3. **速率限制**: 受 GitHub Copilot 的速率限制约束
4. **功能支持**: 某些高级功能可能取决于底层 Copilot 模型的支持

## 相关资源

- [GitHub Copilot 文档](https://docs.github.com/en/copilot)
- [Anthropic Messages API 文档](https://docs.anthropic.com/en/api/messages)
- [Claude Code 集成指南](https://docs.anthropic.com/en/docs/claude-code/overview)
- [项目 GitHub 仓库](https://github.com/ericc-ch/copilot-api)

## 下一步

- [错误码参考](./error-codes.md) - 详细的错误码和处理建议
- [使用示例](./examples.md) - 更多实用示例和代码片段
- [OpenAI 兼容端点](./openai-compatibility.md) - OpenAI 格式的 API 端点文档
