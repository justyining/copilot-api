# 快速参考指南

本文档为 Copilot API 的快速参考，适合需要快速查找信息的用户。

## 基础信息

- **默认端口**: 4141
- **基础 URL**: `http://localhost:4141`
- **API 版本**: v1
- **认证**: 使用 GitHub Copilot 凭证（自动处理）

## 快速命令

```bash
# 启动服务
npx copilot-api@latest start

# 自定义端口
npx copilot-api@latest start --port 8080

# 启用速率限制
npx copilot-api@latest start --rate-limit 30 --wait

# 详细日志
npx copilot-api@latest start --verbose

# 认证
npx copilot-api@latest auth

# 查看使用情况
npx copilot-api@latest check-usage
```

## API 端点速查

### Anthropic 格式

```bash
# 创建消息
POST /v1/messages

# 计算令牌
POST /v1/messages/count_tokens
```

### OpenAI 格式

```bash
# 聊天完成
POST /v1/chat/completions

# 模型列表
GET /v1/models

# 嵌入
POST /v1/embeddings
```

## 最小请求示例

### cURL

```bash
curl -X POST http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python

```python
import requests

requests.post(
    "http://localhost:4141/v1/messages",
    json={
        "model": "gpt-4",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": "你好"}]
    }
).json()
```

### JavaScript

```javascript
fetch('http://localhost:4141/v1/messages', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    model: 'gpt-4',
    max_tokens: 1024,
    messages: [{role: 'user', content: '你好'}]
  })
}).then(r => r.json())
```

## 请求参数速查

### 必需参数

| 参数 | 类型 | 示例 |
|------|------|------|
| `model` | string | `"gpt-4"` |
| `messages` | array | `[{"role": "user", "content": "..."}]` |
| `max_tokens` | integer | `1024` |

### 常用可选参数

| 参数 | 类型 | 默认值 | 范围 |
|------|------|--------|------|
| `temperature` | number | 0.7 | 0-1 |
| `top_p` | number | 1.0 | 0-1 |
| `stream` | boolean | false | - |
| `stop_sequences` | array | null | - |
| `system` | string | null | - |

## 响应字段速查

```javascript
{
  "id": "msg_...",           // 消息ID
  "type": "message",         // 类型
  "role": "assistant",       // 角色
  "model": "gpt-4",         // 使用的模型
  "content": [              // 内容数组
    {
      "type": "text",
      "text": "响应内容..."
    }
  ],
  "stop_reason": "end_turn", // 停止原因
  "usage": {                // 令牌使用
    "input_tokens": 10,
    "output_tokens": 20
  }
}
```

## 停止原因

- `end_turn` - 自然结束
- `max_tokens` - 达到限制
- `stop_sequence` - 遇到停止序列
- `tool_use` - 调用工具
- `pause_turn` - 暂停
- `refusal` - 拒绝回答

## HTTP 状态码

| 代码 | 含义 | 处理 |
|------|------|------|
| 200 | 成功 | 正常处理 |
| 400 | 请求错误 | 检查参数 |
| 401 | 认证失败 | 重新认证 |
| 429 | 速率限制 | 等待重试 |
| 500 | 服务器错误 | 重试 |

## 流式传输

### 事件类型

1. `message_start` - 流开始
2. `content_block_start` - 内容块开始
3. `content_block_delta` - 内容增量
4. `content_block_stop` - 内容块结束
5. `message_delta` - 消息增量
6. `message_stop` - 流结束

### Python 流式示例

```python
import requests

response = requests.post(
    "http://localhost:4141/v1/messages",
    json={
        "model": "gpt-4",
        "max_tokens": 1024,
        "stream": True,
        "messages": [{"role": "user", "content": "你好"}]
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

## 工具使用

### 定义工具

```json
{
  "tools": [{
    "name": "get_weather",
    "description": "获取天气",
    "input_schema": {
      "type": "object",
      "properties": {
        "city": {"type": "string"}
      },
      "required": ["city"]
    }
  }]
}
```

### 工具响应

```json
{
  "content": [{
    "type": "tool_use",
    "id": "toolu_...",
    "name": "get_weather",
    "input": {"city": "北京"}
  }],
  "stop_reason": "tool_use"
}
```

### 发送结果

```json
{
  "messages": [
    ...,
    {
      "role": "user",
      "content": [{
        "type": "tool_result",
        "tool_use_id": "toolu_...",
        "content": "晴，25°C"
      }]
    }
  ]
}
```

## 错误处理模板

```python
import time
import requests

def safe_request(payload, max_retries=3):
    for i in range(max_retries):
        try:
            r = requests.post(
                "http://localhost:4141/v1/messages",
                json=payload,
                timeout=30
            )
            if r.status_code == 200:
                return r.json()
            elif r.status_code == 429:
                time.sleep(2 ** i)
                continue
            else:
                raise Exception(r.json()["error"]["message"])
        except requests.exceptions.Timeout:
            if i == max_retries - 1:
                raise
            time.sleep(2 ** i)
    raise Exception("Max retries exceeded")
```

## OpenAI 库配置

### Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4141/v1",
    api_key="dummy"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "你好"}]
)
```

### JavaScript

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:4141/v1',
  apiKey: 'dummy',
});

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{role: 'user', content: '你好'}],
});
```

## 计算令牌

```bash
curl -X POST http://localhost:4141/v1/messages/count_tokens \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

响应: `{"input_tokens": 5}`

## 查看使用情况

```bash
# 命令行
npx copilot-api@latest check-usage

# API
curl http://localhost:4141/usage

# Web 界面
# 启动服务器时会显示 URL
```

## 常见问题快速解决

| 问题 | 解决方法 |
|------|---------|
| 认证失败 | `npx copilot-api@latest auth` |
| 速率限制 | 添加 `--rate-limit 30 --wait` |
| 连接错误 | 检查服务器是否运行 |
| 令牌过期 | 重新运行 `auth` 命令 |
| 模型不可用 | 检查 `GET /v1/models` |

## 调试技巧

```bash
# 详细日志
npx copilot-api@latest start --verbose

# 显示令牌
npx copilot-api@latest start --show-token

# 调试信息
npx copilot-api@latest debug

# JSON 格式调试信息
npx copilot-api@latest debug --json
```

## 性能优化

1. **流式传输** - 设置 `stream: true`
2. **控制令牌** - 合理设置 `max_tokens`
3. **并发请求** - 使用异步/并发
4. **缓存响应** - 缓存相同请求
5. **批处理** - 合并多个小请求

## 环境变量

```bash
# Docker
docker run -e GH_TOKEN=your_token copilot-api

# Claude Code
export ANTHROPIC_BASE_URL=http://localhost:4141
export ANTHROPIC_AUTH_TOKEN=dummy
export ANTHROPIC_MODEL=gpt-4
```

## 更多信息

- 📖 [完整 API 参考](./api-reference.md)
- ❌ [错误码详解](./error-codes.md)
- 💡 [使用示例](./examples.md)
- 🔄 [OpenAI 兼容](./openai-compatibility.md)
- 📚 [文档首页](./README.md)

---

**提示**: 这是快速参考。详细信息请查看对应的完整文档。
