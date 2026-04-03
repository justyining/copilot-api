# 错误码参考

## 概述

本文档详细描述了 Copilot API 可能返回的所有错误类型、HTTP 状态码以及相应的处理建议。

## 错误响应格式

所有错误响应遵循统一的 JSON 格式：

```json
{
  "error": {
    "type": "error_type",
    "message": "人类可读的错误描述"
  }
}
```

## HTTP 状态码

### 2xx 成功状态码

| 状态码 | 含义 | 描述 |
|-------|------|------|
| 200 | OK | 请求成功，返回正常响应 |

### 4xx 客户端错误

| 状态码 | 含义 | 描述 |
|-------|------|------|
| 400 | Bad Request | 请求格式错误或参数无效 |
| 401 | Unauthorized | 认证失败或令牌无效 |
| 403 | Forbidden | 没有权限访问请求的资源 |
| 404 | Not Found | 请求的端点或资源不存在 |
| 413 | Payload Too Large | 请求体太大 |
| 422 | Unprocessable Entity | 请求格式正确但语义错误 |
| 429 | Too Many Requests | 超过速率限制 |

### 5xx 服务器错误

| 状态码 | 含义 | 描述 |
|-------|------|------|
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 上游服务（GitHub Copilot）返回无效响应 |
| 503 | Service Unavailable | 服务暂时不可用 |
| 504 | Gateway Timeout | 上游服务超时 |

## 常见错误类型

### 1. 认证错误 (401 Unauthorized)

#### 错误示例

```json
{
  "error": {
    "type": "authentication_error",
    "message": "Invalid or expired GitHub Copilot token"
  }
}
```

#### 可能的原因

- GitHub Copilot 令牌已过期
- GitHub Copilot 令牌无效或已被撤销
- 未正确完成 GitHub 认证流程
- GitHub 账户未订阅 Copilot

#### 解决方法

1. 重新运行认证流程：
   ```bash
   npx copilot-api@latest auth
   ```

2. 检查 GitHub Copilot 订阅状态
3. 如果使用 `--github-token` 选项，确保令牌有效
4. 清除旧的认证数据并重新认证

### 2. 请求格式错误 (400 Bad Request)

#### 错误示例

```json
{
  "error": {
    "type": "invalid_request_error",
    "message": "messages: required field missing"
  }
}
```

#### 可能的原因

- 缺少必需的请求参数（如 `messages`, `max_tokens`, `model`）
- 参数类型错误（例如，`max_tokens` 应为数字）
- 请求体不是有效的 JSON
- 消息格式不正确

#### 解决方法

1. 检查所有必需参数是否存在：
   - `model` (string)
   - `messages` (array)
   - `max_tokens` (integer)

2. 验证消息数组格式：
   ```json
   {
     "messages": [
       {
         "role": "user",
         "content": "Hello"
       }
     ]
   }
   ```

3. 确保 `max_tokens` 是正整数
4. 验证 JSON 格式正确性

### 3. 参数验证错误 (422 Unprocessable Entity)

#### 错误示例

```json
{
  "error": {
    "type": "validation_error",
    "message": "max_tokens: must be positive integer"
  }
}
```

#### 可能的原因

- `max_tokens` 值超出允许范围
- `temperature` 不在 0-1 范围内
- `top_p` 不在 0-1 范围内
- 不支持的模型标识符
- 消息的 `role` 值无效（必须是 `user` 或 `assistant`）
- 工具定义格式错误

#### 解决方法

1. 检查数值参数范围：
   - `max_tokens`: > 0 (建议不超过 4096)
   - `temperature`: 0.0 - 1.0
   - `top_p`: 0.0 - 1.0
   - `top_k`: > 0

2. 验证模型名称是否支持：
   ```bash
   curl http://localhost:4141/v1/models
   ```

3. 检查消息角色是否为 `"user"` 或 `"assistant"`

4. 验证工具定义的 JSON Schema 格式

### 4. 速率限制错误 (429 Too Many Requests)

#### 错误示例

```json
{
  "error": {
    "type": "rate_limit_error",
    "message": "Rate limit exceeded. Please wait before making another request."
  }
}
```

#### 可能的原因

- 请求过于频繁，触发了服务器端速率限制
- GitHub Copilot 后端速率限制
- 配置的 `--rate-limit` 限制

#### 解决方法

1. 使用 `--rate-limit` 选项设置请求间隔：
   ```bash
   npx copilot-api@latest start --rate-limit 30
   ```

2. 使用 `--wait` 选项自动等待：
   ```bash
   npx copilot-api@latest start --rate-limit 30 --wait
   ```

3. 在应用中实现指数退避重试策略

4. 使用 `--manual` 选项手动控制请求：
   ```bash
   npx copilot-api@latest start --manual
   ```

5. 检查您的使用情况：
   ```bash
   npx copilot-api@latest check-usage
   ```

### 5. 令牌限制错误

#### 错误示例

```json
{
  "error": {
    "type": "invalid_request_error",
    "message": "Input tokens exceed model's context window"
  }
}
```

#### 可能的原因

- 输入消息太长，超过模型上下文窗口
- `max_tokens` 设置过高，无法容纳输入

#### 解决方法

1. 使用 `/v1/messages/count_tokens` 检查令牌数：
   ```bash
   curl -X POST http://localhost:4141/v1/messages/count_tokens \
     -H "Content-Type: application/json" \
     -d '{
       "model": "gpt-4",
       "messages": [...]
     }'
   ```

2. 减少输入消息的长度或数量

3. 降低 `max_tokens` 值

4. 考虑使用更大上下文窗口的模型

### 6. 内容过滤错误

#### 错误示例

```json
{
  "error": {
    "type": "invalid_request_error",
    "message": "Content filtered by safety system"
  }
}
```

#### 可能的原因

- 输入或输出内容触发了安全过滤器
- 请求包含不适当或有害的内容

#### 解决方法

1. 检查输入内容，移除可能触发过滤器的内容
2. 修改提示词以避免敏感话题
3. 如果是误判，重新表述您的请求

### 7. 服务不可用错误 (503 Service Unavailable)

#### 错误示例

```json
{
  "error": {
    "type": "service_unavailable",
    "message": "GitHub Copilot service is temporarily unavailable"
  }
}
```

#### 可能的原因

- GitHub Copilot 后端服务暂时不可用
- 网络连接问题
- 服务器正在维护

#### 解决方法

1. 等待几分钟后重试
2. 检查网络连接
3. 查看 GitHub Status 页面：https://www.githubstatus.com/
4. 实现自动重试机制（建议指数退避）

### 8. 网关超时错误 (504 Gateway Timeout)

#### 错误示例

```json
{
  "error": {
    "type": "timeout_error",
    "message": "Request to GitHub Copilot timed out"
  }
}
```

#### 可能的原因

- 请求处理时间过长
- GitHub Copilot 后端响应缓慢
- 网络延迟过高

#### 解决方法

1. 减少输入消息长度
2. 降低 `max_tokens` 值
3. 考虑使用流式传输以获得部分响应
4. 检查网络连接质量
5. 如果使用代理，检查代理配置

### 9. 内部服务器错误 (500 Internal Server Error)

#### 错误示例

```json
{
  "error": {
    "type": "internal_error",
    "message": "An unexpected error occurred"
  }
}
```

#### 可能的原因

- 服务器端代码错误
- 未处理的异常
- 配置问题

#### 解决方法

1. 启用详细日志记录：
   ```bash
   npx copilot-api@latest start --verbose
   ```

2. 检查服务器日志以获取更多信息

3. 如果问题持续存在，提交 Issue 到 GitHub 仓库

4. 尝试使用不同的请求参数

## 流式传输错误

### 流式错误事件

当使用流式传输时，错误会作为 SSE 事件返回：

```
event: error
data: {"type":"error","error":{"type":"error_type","message":"错误描述"}}
```

### 处理流式错误

```javascript
const eventSource = new EventSource('/v1/messages');

eventSource.addEventListener('error', (event) => {
  const errorData = JSON.parse(event.data);
  console.error('Stream error:', errorData.error);

  // 根据错误类型采取适当行动
  if (errorData.error.type === 'rate_limit_error') {
    // 实现退避策略
  }

  eventSource.close();
});
```

## 错误处理最佳实践

### 1. 实现重试逻辑

```javascript
async function makeRequestWithRetry(payload, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:4141/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return await response.json();
      }

      const errorData = await response.json();
      lastError = errorData.error;

      // 不重试客户端错误（4xx），除了 429
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(lastError.message);
      }

      // 指数退避
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Request failed after ${maxRetries} retries: ${lastError.message}`);
}
```

### 2. 验证请求参数

```javascript
function validateRequest(payload) {
  // 检查必需字段
  if (!payload.model) {
    throw new Error('model is required');
  }
  if (!payload.messages || !Array.isArray(payload.messages)) {
    throw new Error('messages must be an array');
  }
  if (!payload.max_tokens || payload.max_tokens <= 0) {
    throw new Error('max_tokens must be a positive integer');
  }

  // 检查消息格式
  for (const msg of payload.messages) {
    if (!['user', 'assistant'].includes(msg.role)) {
      throw new Error('message role must be "user" or "assistant"');
    }
    if (!msg.content) {
      throw new Error('message content is required');
    }
  }

  // 检查数值范围
  if (payload.temperature !== undefined) {
    if (payload.temperature < 0 || payload.temperature > 1) {
      throw new Error('temperature must be between 0 and 1');
    }
  }

  return true;
}
```

### 3. 监控和日志记录

```javascript
class APIClient {
  async makeRequest(payload) {
    const startTime = Date.now();

    try {
      const response = await fetch('http://localhost:4141/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', {
          status: response.status,
          error: errorData.error,
          duration,
          payload: payload
        });
        throw new Error(errorData.error.message);
      }

      const result = await response.json();

      console.log('API Success:', {
        duration,
        inputTokens: result.usage.input_tokens,
        outputTokens: result.usage.output_tokens
      });

      return result;

    } catch (error) {
      console.error('Request failed:', {
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }
}
```

### 4. 优雅降级

```javascript
async function getCompletion(messages, options = {}) {
  try {
    // 首先尝试使用最好的模型
    return await makeRequest({
      model: 'gpt-4',
      messages,
      max_tokens: 2048,
      ...options
    });
  } catch (error) {
    // 如果失败，尝试备用模型
    console.warn('Primary model failed, trying fallback:', error.message);

    return await makeRequest({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 1024,
      ...options
    });
  }
}
```

## 调试技巧

### 1. 启用详细日志

```bash
npx copilot-api@latest start --verbose
```

### 2. 使用调试命令

```bash
# 显示详细的调试信息
npx copilot-api@latest debug

# JSON 格式输出（便于程序处理）
npx copilot-api@latest debug --json
```

### 3. 检查使用情况

```bash
# 查看当前配额和使用情况
npx copilot-api@latest check-usage
```

### 4. 测试认证

```bash
# 获取当前令牌信息
curl http://localhost:4141/token
```

### 5. 查看可用模型

```bash
# 列出所有可用模型
curl http://localhost:4141/v1/models
```

## 特定场景的错误处理

### Claude Code 集成

如果在使用 Claude Code 时遇到错误：

1. 检查环境变量配置：
   ```json
   {
     "env": {
       "ANTHROPIC_BASE_URL": "http://localhost:4141",
       "ANTHROPIC_AUTH_TOKEN": "dummy"
     }
   }
   ```

2. 确保 Copilot API 服务器正在运行

3. 验证端口号匹配

### Docker 环境

Docker 容器中的常见问题：

1. **认证数据持久化**：
   ```bash
   docker run -v $(pwd)/copilot-data:/root/.local/share/copilot-api copilot-api
   ```

2. **网络访问**：
   ```bash
   docker run -p 4141:4141 copilot-api
   ```

3. **环境变量**：
   ```bash
   docker run -e GH_TOKEN=your_token copilot-api
   ```

## 获取帮助

如果遇到文档中未涵盖的错误：

1. 查看 [GitHub Issues](https://github.com/ericc-ch/copilot-api/issues)
2. 启用 `--verbose` 模式收集日志
3. 运行 `debug` 命令收集系统信息
4. 提交新的 Issue，包含：
   - 错误消息
   - 完整的请求参数（移除敏感信息）
   - 系统信息（从 `debug` 命令）
   - 日志输出

## 相关资源

- [API 参考文档](./api-reference.md)
- [使用示例](./examples.md)
- [GitHub Copilot 使用政策](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot)
