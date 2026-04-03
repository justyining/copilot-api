# OpenAI API 兼容性文档

## 概述

除了 Anthropic Messages API 兼容接口，Copilot API 还提供了与 OpenAI API 兼容的端点。这使得您可以将 Copilot API 用作任何支持 OpenAI API 的工具的替代品。

## 支持的端点

### 1. 聊天完成 (POST /v1/chat/completions)

与 OpenAI 的 Chat Completions API 兼容。

#### 端点

```
POST /v1/chat/completions
```

#### 请求参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `model` | string | 是 | 模型标识符（如 `gpt-4`, `gpt-3.5-turbo`） |
| `messages` | array | 是 | 对话消息数组 |
| `temperature` | number | 否 | 采样温度（0-2） |
| `top_p` | number | 否 | 核采样参数（0-1） |
| `n` | integer | 否 | 生成的完成数量（默认 1） |
| `stream` | boolean | 否 | 是否流式传输（默认 false） |
| `stop` | string/array | 否 | 停止序列 |
| `max_tokens` | integer | 否 | 最大令牌数 |
| `presence_penalty` | number | 否 | 存在惩罚（-2.0 到 2.0） |
| `frequency_penalty` | number | 否 | 频率惩罚（-2.0 到 2.0） |
| `user` | string | 否 | 用户标识符 |
| `tools` | array | 否 | 可用工具列表 |
| `tool_choice` | string/object | 否 | 工具选择策略 |

#### 消息格式

```json
{
  "role": "system" | "user" | "assistant" | "tool",
  "content": "消息内容",
  "name": "可选的名称",
  "tool_call_id": "工具调用 ID（仅用于 tool 角色）",
  "tool_calls": "工具调用数组（仅用于 assistant 角色）"
}
```

#### 请求示例

```bash
curl -X POST http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "你是一位有帮助的助手。"
      },
      {
        "role": "user",
        "content": "什么是机器学习？"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }'
```

#### 响应格式

**非流式响应**:

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "机器学习是人工智能的一个分支..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 150,
    "total_tokens": 175
  }
}
```

**流式响应** (Server-Sent Events):

```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"gpt-4","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"gpt-4","choices":[{"index":0,"delta":{"content":"机器"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"gpt-4","choices":[{"index":0,"delta":{"content":"学习"},"finish_reason":null}]}

data: [DONE]
```

#### Finish Reasons

| 值 | 描述 |
|----|------|
| `stop` | 模型自然停止或遇到停止序列 |
| `length` | 达到 max_tokens 限制 |
| `tool_calls` | 模型调用了工具 |
| `content_filter` | 内容被过滤 |

### 2. 模型列表 (GET /v1/models)

列出可用的模型。

#### 端点

```
GET /v1/models
```

#### 请求示例

```bash
curl http://localhost:4141/v1/models
```

#### 响应示例

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": 1677649963,
      "owned_by": "github-copilot"
    },
    {
      "id": "gpt-3.5-turbo",
      "object": "model",
      "created": 1677649963,
      "owned_by": "github-copilot"
    }
  ]
}
```

### 3. 嵌入 (POST /v1/embeddings)

创建输入文本的嵌入向量。

#### 端点

```
POST /v1/embeddings
```

#### 请求参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `model` | string | 是 | 模型标识符（如 `text-embedding-ada-002`） |
| `input` | string/array | 是 | 要嵌入的文本或文本数组 |
| `user` | string | 否 | 用户标识符 |

#### 请求示例

```bash
curl -X POST http://localhost:4141/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-ada-002",
    "input": "这是一段要嵌入的文本"
  }'
```

#### 响应示例

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        0.0023064255,
        -0.009327292,
        ...
        -0.0028842222
      ]
    }
  ],
  "model": "text-embedding-ada-002",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}
```

## 编程语言示例

### Python (使用 openai 库)

```python
from openai import OpenAI

# 配置客户端使用 Copilot API
client = OpenAI(
    base_url="http://localhost:4141/v1",
    api_key="dummy"  # 可以使用任意值
)

# 聊天完成
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "你是一位有帮助的助手。"},
        {"role": "user", "content": "什么是 Python？"}
    ]
)

print(response.choices[0].message.content)

# 流式响应
stream = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "写一首诗"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
print()

# 获取模型列表
models = client.models.list()
for model in models.data:
    print(model.id)

# 创建嵌入
embedding = client.embeddings.create(
    model="text-embedding-ada-002",
    input="Hello, world!"
)

print(f"嵌入维度: {len(embedding.data[0].embedding)}")
```

### JavaScript/TypeScript (使用 openai 库)

```typescript
import OpenAI from 'openai';

// 配置客户端
const openai = new OpenAI({
  baseURL: 'http://localhost:4141/v1',
  apiKey: 'dummy', // 可以使用任意值
});

async function main() {
  // 聊天完成
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '你是一位有帮助的助手。' },
      { role: 'user', content: '什么是 JavaScript？' }
    ],
  });

  console.log(completion.choices[0].message.content);

  // 流式响应
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: '写一首诗' }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
  console.log();

  // 获取模型列表
  const models = await openai.models.list();
  models.data.forEach(model => {
    console.log(model.id);
  });

  // 创建嵌入
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: 'Hello, world!',
  });

  console.log(`嵌入维度: ${embedding.data[0].embedding.length}`);
}

main();
```

### cURL 完整示例

#### 基础聊天

```bash
curl -X POST http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

#### 流式聊天

```bash
curl -X POST http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "写一首诗"}
    ],
    "stream": true
  }'
```

#### 使用函数调用

```bash
curl -X POST http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "北京现在天气怎么样？"}
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "获取指定城市的天气",
          "parameters": {
            "type": "object",
            "properties": {
              "city": {
                "type": "string",
                "description": "城市名称"
              },
              "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"]
              }
            },
            "required": ["city"]
          }
        }
      }
    ],
    "tool_choice": "auto"
  }'
```

#### 获取嵌入

```bash
curl -X POST http://localhost:4141/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-ada-002",
    "input": "Hello, world!"
  }'
```

## 工具/函数调用

### 定义工具

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "获取指定位置的当前天气",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "城市和省份，例如：北京"
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
    }
  ],
  "tool_choice": "auto"
}
```

### 工具调用响应

当模型决定调用工具时，响应将包含：

```json
{
  "id": "chatcmpl-123",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "get_current_weather",
              "arguments": "{\"location\": \"北京\", \"unit\": \"celsius\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}
```

### 发送工具结果

```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "北京现在天气怎么样？"},
    {
      "role": "assistant",
      "content": null,
      "tool_calls": [
        {
          "id": "call_abc123",
          "type": "function",
          "function": {
            "name": "get_current_weather",
            "arguments": "{\"location\": \"北京\", \"unit\": \"celsius\"}"
          }
        }
      ]
    },
    {
      "role": "tool",
      "tool_call_id": "call_abc123",
      "content": "北京当前天气：晴，温度 25°C"
    }
  ]
}
```

## 与标准 OpenAI API 的差异

虽然 Copilot API 兼容 OpenAI API 格式，但存在一些差异：

### 1. 认证

- **OpenAI**: 需要 OpenAI API 密钥
- **Copilot API**: 使用 GitHub Copilot 凭证，API 密钥可以是任意值

### 2. 可用模型

- **OpenAI**: OpenAI 的模型（gpt-4, gpt-3.5-turbo 等）
- **Copilot API**: GitHub Copilot 支持的模型（取决于订阅类型）

### 3. 速率限制

- **OpenAI**: 基于账户和模型的速率限制
- **Copilot API**: 受 GitHub Copilot 速率限制约束

### 4. 部分参数支持

某些 OpenAI API 参数可能不完全支持或有不同的行为：

- `presence_penalty` 和 `frequency_penalty` 可能效果有限
- `logprobs` 和 `top_logprobs` 可能不支持
- `response_format` 可能不支持

### 5. 嵌入向量维度

嵌入向量的维度可能与 OpenAI 的标准嵌入不同。

## 迁移指南

### 从 OpenAI API 迁移到 Copilot API

#### 1. Python 应用

**之前**:
```python
from openai import OpenAI

client = OpenAI(api_key="sk-...")
```

**之后**:
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4141/v1",
    api_key="dummy"
)
```

#### 2. JavaScript 应用

**之前**:
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'sk-...',
});
```

**之后**:
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:4141/v1',
  apiKey: 'dummy',
});
```

#### 3. cURL 请求

**之前**:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '...'
```

**之后**:
```bash
curl http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '...'
```

## 常见问题

### Q: 所有 OpenAI 功能都支持吗？

不是所有功能都完全支持。核心的聊天完成、模型列表和嵌入功能是支持的，但某些高级功能可能受限于底层 GitHub Copilot 的能力。

### Q: 可以使用哪些模型？

可用模型取决于您的 GitHub Copilot 订阅。使用 `GET /v1/models` 端点查看可用模型。

### Q: API 密钥是什么？

Copilot API 不需要真实的 API 密钥，因为它使用 GitHub Copilot 认证。您可以在客户端库中使用任意字符串（如 `"dummy"`）。

### Q: 如何处理速率限制？

使用 Copilot API 的速率限制选项：
```bash
npx copilot-api@latest start --rate-limit 30 --wait
```

### Q: 支持 GPT-4 Vision 吗？

如果底层 GitHub Copilot 后端支持视觉模型，则支持。检查可用模型列表确认。

## 与其他工具集成

### LangChain

```python
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

# 配置 LangChain 使用 Copilot API
llm = ChatOpenAI(
    base_url="http://localhost:4141/v1",
    api_key="dummy",
    model="gpt-4"
)

# 使用
response = llm.invoke([HumanMessage(content="你好！")])
print(response.content)
```

### LlamaIndex

```python
from llama_index import OpenAI

# 配置 LlamaIndex 使用 Copilot API
llm = OpenAI(
    api_base="http://localhost:4141/v1",
    api_key="dummy",
    model="gpt-4"
)

# 使用
response = llm.complete("解释机器学习")
print(response.text)
```

### AutoGPT

在 AutoGPT 配置中设置：

```bash
export OPENAI_API_BASE=http://localhost:4141/v1
export OPENAI_API_KEY=dummy
```

## 测试和调试

### 测试端点可用性

```bash
# 测试模型列表
curl http://localhost:4141/v1/models

# 测试聊天完成
curl -X POST http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 5
  }'

# 测试嵌入
curl -X POST http://localhost:4141/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-ada-002",
    "input": "test"
  }'
```

### 启用详细日志

```bash
npx copilot-api@latest start --verbose
```

## 相关资源

- [API 参考文档](./api-reference.md) - Claude Messages API 格式的文档
- [错误码参考](./error-codes.md) - 错误处理指南
- [使用示例](./examples.md) - 更多代码示例
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference) - 官方 OpenAI API 文档
