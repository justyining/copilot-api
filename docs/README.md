# Copilot API 文档中心

欢迎来到 Copilot API 的完整文档！本目录包含了使用 Copilot API 所需的所有参考资料和指南。

## 📚 文档导航

### 核心文档

#### [API 参考文档](./api-reference.md)
完整的 Anthropic Claude Messages API 兼容接口文档，包括：
- 创建消息端点 (POST /v1/messages)
- 令牌计数端点 (POST /v1/messages/count_tokens)
- 请求和响应格式详解
- 流式传输详细说明
- 工具使用（Function Calling）
- 多模态支持（图像输入）
- 扩展思考（Extended Thinking）

#### [错误码参考](./error-codes.md)
详细的错误处理指南，涵盖：
- 所有 HTTP 状态码说明
- 常见错误类型和解决方法
- 速率限制处理
- 认证错误处理
- 调试技巧
- 错误处理最佳实践

#### [使用示例](./examples.md)
丰富的代码示例和实践指南：
- 基础和高级功能示例
- 多种编程语言实现（Python, JavaScript, Go）
- 完整客户端库实现
- 实际应用场景
- 性能优化技巧

#### [OpenAI API 兼容性](./openai-compatibility.md)
OpenAI API 格式的接口文档：
- Chat Completions API
- Models API
- Embeddings API
- 与 OpenAI API 的差异
- 迁移指南
- 第三方工具集成（LangChain, LlamaIndex 等）

## 🚀 快速开始

### 安装和启动

```bash
# 使用 npx 直接运行
npx copilot-api@latest start

# 或安装后使用
npm install -g copilot-api
copilot-api start
```

### 第一个请求

```bash
curl -X POST http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'
```

### Python 示例

```python
import requests

response = requests.post(
    "http://localhost:4141/v1/messages",
    json={
        "model": "gpt-4",
        "max_tokens": 1024,
        "messages": [
            {"role": "user", "content": "Hello!"}
        ]
    }
)

result = response.json()
print(result["content"][0]["text"])
```

## 📖 按场景查找

### 我想...

#### 开始使用
- 📘 查看 [API 参考文档](./api-reference.md#基础信息) 了解基础配置
- 🔑 了解 [认证方式](./api-reference.md#认证)
- 🎯 尝试[第一个请求示例](./examples.md#简单聊天请求)

#### 发送聊天消息
- 📝 [基础聊天请求](./examples.md#简单聊天请求)
- 💬 [多轮对话](./examples.md#多轮对话)
- 🎨 [使用系统提示](./examples.md#使用系统提示)
- ⚙️ [调整参数（温度、top_p 等）](./examples.md#温度和采样参数)

#### 实现高级功能
- 🌊 [流式传输](./examples.md#1-流式传输)
- 🔧 [工具使用/函数调用](./examples.md#2-工具使用-function-calling)
- 🖼️ [多模态输入（图像）](./examples.md#3-多模态输入图像)
- 🧮 [计算令牌数](./examples.md#6-令牌计数)

#### 处理错误
- ⚠️ [错误类型和处理](./error-codes.md#常见错误类型)
- 🔄 [重试策略](./error-codes.md#1-实现重试逻辑)
- 🚦 [速率限制处理](./error-codes.md#4-速率限制错误-429-too-many-requests)
- 🔍 [调试技巧](./error-codes.md#调试技巧)

#### 使用特定编程语言
- 🐍 [Python 完整客户端](./examples.md#python-完整客户端)
- 📜 [JavaScript/TypeScript 客户端](./examples.md#javascripttypescript-客户端)
- 🔵 [Go 客户端](./examples.md#go-客户端)

#### 兼容 OpenAI
- 🔄 [OpenAI API 格式](./openai-compatibility.md)
- 📦 [使用 openai 库](./openai-compatibility.md#python-使用-openai-库)
- 🔗 [集成第三方工具](./openai-compatibility.md#与其他工具集成)
- 🚚 [迁移指南](./openai-compatibility.md#迁移指南)

#### 实际应用
- 🔍 [代码审查助手](./examples.md#1-代码审查助手)
- 📚 [文档生成](./examples.md#2-智能文档生成)
- 🎓 [学习助手](./examples.md#3-交互式学习助手)
- 🧪 [测试用例生成](./examples.md#4-测试用例生成器)
- 🤖 [聊天机器人](./examples.md#5-命令行聊天机器人)

## 🔧 命令行选项

### 启动服务器

```bash
npx copilot-api@latest start [选项]
```

**常用选项**:
- `--port, -p <number>` - 服务器端口（默认: 4141）
- `--verbose, -v` - 启用详细日志
- `--rate-limit, -r <seconds>` - 请求间隔限制
- `--wait, -w` - 达到限制时等待而非报错
- `--manual` - 手动批准每个请求
- `--claude-code, -c` - 生成 Claude Code 启动命令
- `--account-type, -a <type>` - 账户类型（individual/business/enterprise）

### 其他命令

```bash
# 仅认证，不启动服务器
npx copilot-api@latest auth

# 查看使用情况和配额
npx copilot-api@latest check-usage

# 显示调试信息
npx copilot-api@latest debug
```

详细选项说明见主 [README.md](../README.md#command-line-options)。

## 📋 API 端点概览

### Anthropic 兼容端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/v1/messages` | POST | 创建聊天完成 |
| `/v1/messages/count_tokens` | POST | 计算令牌数 |

### OpenAI 兼容端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/v1/chat/completions` | POST | OpenAI 格式聊天完成 |
| `/v1/models` | GET | 获取可用模型列表 |
| `/v1/embeddings` | POST | 创建文本嵌入 |

### 监控端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/usage` | GET | 获取使用统计 |
| `/token` | GET | 获取当前令牌 |

## 🎓 学习路径

### 初学者

1. 阅读 [API 参考 - 基础信息](./api-reference.md#基础信息)
2. 尝试[简单聊天请求](./examples.md#简单聊天请求)
3. 了解[错误处理基础](./error-codes.md#错误响应格式)
4. 实践[多轮对话](./examples.md#多轮对话)

### 中级用户

1. 学习[流式传输](./examples.md#1-流式传输)
2. 掌握[工具使用](./examples.md#2-工具使用-function-calling)
3. 实现[错误重试逻辑](./error-codes.md#1-实现重试逻辑)
4. 优化[令牌使用](./api-reference.md#最佳实践)

### 高级用户

1. 深入[流式事件类型](./api-reference.md#流式事件类型-stream-event-types)
2. 构建[完整客户端](./examples.md#python-完整客户端)
3. 集成[第三方工具](./openai-compatibility.md#与其他工具集成)
4. 实现[性能优化](./examples.md#性能优化)

## 💡 最佳实践

### 性能优化

1. **使用流式传输** - 获得更快的首字节响应
2. **令牌管理** - 使用 count_tokens 端点预估成本
3. **合理设置 max_tokens** - 避免不必要的长响应
4. **批处理** - 使用异步并发处理多个请求

### 稳定性

1. **实现重试逻辑** - 处理暂时性错误
2. **速率限制** - 使用 `--rate-limit` 和 `--wait` 选项
3. **错误处理** - 区分可重试和不可重试的错误
4. **监控使用** - 定期检查配额和使用情况

### 安全性

1. **保护令牌** - 不要在代码中硬编码 GitHub 令牌
2. **验证输入** - 在发送前验证所有参数
3. **内容过滤** - 注意可能触发安全过滤器的内容
4. **遵守政策** - 遵循 GitHub Copilot 使用政策

## 🔗 相关链接

### 官方资源

- [GitHub 仓库](https://github.com/ericc-ch/copilot-api)
- [Issue 追踪](https://github.com/ericc-ch/copilot-api/issues)
- [更新日志](https://github.com/ericc-ch/copilot-api/releases)

### 外部文档

- [Anthropic Messages API 文档](https://docs.anthropic.com/en/api/messages)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [GitHub Copilot 文档](https://docs.github.com/en/copilot)
- [Claude Code 文档](https://docs.anthropic.com/en/docs/claude-code/overview)

### 社区

- [讨论区](https://github.com/ericc-ch/copilot-api/discussions)
- [问题反馈](https://github.com/ericc-ch/copilot-api/issues/new)

## ❓ 常见问题

### 一般问题

**Q: Copilot API 是官方支持的吗？**
A: 不是。这是 GitHub Copilot API 的反向工程代理，非 GitHub 官方支持。

**Q: 需要 Anthropic API 密钥吗？**
A: 不需要。Copilot API 使用 GitHub Copilot 凭证，不需要 Anthropic API 密钥。

**Q: 可以商业使用吗？**
A: 请遵守 GitHub Copilot 的使用条款和政策。

### 技术问题

**Q: 如何解决认证错误？**
A: 参见 [认证错误处理](./error-codes.md#1-认证错误-401-unauthorized)

**Q: 如何处理速率限制？**
A: 参见 [速率限制处理](./error-codes.md#4-速率限制错误-429-too-many-requests)

**Q: 支持哪些模型？**
A: 取决于您的 GitHub Copilot 订阅。使用 `GET /v1/models` 查看可用模型。

**Q: 如何调试问题？**
A: 使用 `--verbose` 选项启动服务器，并查看[调试技巧](./error-codes.md#调试技巧)。

### 功能问题

**Q: 支持图像输入吗？**
A: 是的，参见 [多模态输入示例](./examples.md#3-多模态输入图像)

**Q: 支持函数调用吗？**
A: 是的，参见 [工具使用示例](./examples.md#2-工具使用-function-calling)

**Q: 支持流式传输吗？**
A: 是的，参见 [流式传输示例](./examples.md#1-流式传输)

## 🤝 贡献

发现文档错误或有改进建议？

1. [提交 Issue](https://github.com/ericc-ch/copilot-api/issues/new)
2. [创建 Pull Request](https://github.com/ericc-ch/copilot-api/compare)
3. 在[讨论区](https://github.com/ericc-ch/copilot-api/discussions)分享想法

## 📄 许可

本项目遵循 MIT 许可证。详见 [LICENSE](../LICENSE) 文件。

---

**最后更新**: 2026-04-03

如果您有任何问题或需要帮助，请查看相应的文档章节或在 GitHub 上提出问题。
