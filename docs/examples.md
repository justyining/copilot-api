# API 使用示例

本文档提供了 Copilot API 的详细使用示例，包括各种编程语言和使用场景。

## 目录

- [基础示例](#基础示例)
- [高级功能](#高级功能)
- [编程语言示例](#编程语言示例)
- [实际应用场景](#实际应用场景)

## 基础示例

### 简单聊天请求

#### cURL

```bash
curl -X POST http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "解释什么是递归"
      }
    ]
  }'
```

#### Python

```python
import requests

url = "http://localhost:4141/v1/messages"
headers = {"Content-Type": "application/json"}

payload = {
    "model": "gpt-4",
    "max_tokens": 1024,
    "messages": [
        {
            "role": "user",
            "content": "解释什么是递归"
        }
    ]
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()

print(result["content"][0]["text"])
```

#### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

async function chat(message) {
  const response = await fetch('http://localhost:4141/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    })
  });

  const result = await response.json();
  return result.content[0].text;
}

chat('解释什么是递归').then(console.log);
```

### 多轮对话

```python
import requests

url = "http://localhost:4141/v1/messages"

# 构建对话历史
messages = [
    {"role": "user", "content": "我想学习 Python"},
    {"role": "assistant", "content": "太好了！Python 是一门很棒的编程语言。你想从哪里开始？"},
    {"role": "user", "content": "从基础语法开始"}
]

response = requests.post(
    url,
    json={
        "model": "gpt-4",
        "max_tokens": 2048,
        "messages": messages
    }
)

result = response.json()
print(result["content"][0]["text"])

# 继续对话
messages.append({
    "role": "assistant",
    "content": result["content"][0]["text"]
})
```

### 使用系统提示

```python
import requests

response = requests.post(
    "http://localhost:4141/v1/messages",
    json={
        "model": "gpt-4",
        "max_tokens": 1024,
        "system": "你是一位专业的 Python 教师，擅长用简单易懂的方式解释复杂概念。",
        "messages": [
            {
                "role": "user",
                "content": "什么是装饰器？"
            }
        ]
    }
)

print(response.json()["content"][0]["text"])
```

## 高级功能

### 1. 流式传输

#### Python (使用 requests)

```python
import requests
import json

def stream_chat(message):
    url = "http://localhost:4141/v1/messages"

    payload = {
        "model": "gpt-4",
        "max_tokens": 2048,
        "stream": True,
        "messages": [
            {"role": "user", "content": message}
        ]
    }

    response = requests.post(url, json=payload, stream=True)

    for line in response.iter_lines():
        if line:
            line = line.decode('utf-8')
            if line.startswith('data: '):
                data = line[6:]  # 移除 'data: ' 前缀
                if data == '[DONE]':
                    break
                try:
                    event = json.loads(data)
                    if event.get('type') == 'content_block_delta':
                        delta = event.get('delta', {})
                        if delta.get('type') == 'text_delta':
                            print(delta['text'], end='', flush=True)
                except json.JSONDecodeError:
                    continue

    print()  # 换行

# 使用示例
stream_chat("写一首关于编程的诗")
```

#### JavaScript/Node.js

```javascript
async function streamChat(message) {
  const response = await fetch('http://localhost:4141/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      max_tokens: 2048,
      stream: true,
      messages: [
        { role: 'user', content: message }
      ]
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const event = JSON.parse(data);
          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              process.stdout.write(event.delta.text);
            }
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
  console.log();
}

streamChat('写一首关于编程的诗');
```

### 2. 工具使用 (Function Calling)

```python
import requests
import json

def chat_with_tools():
    url = "http://localhost:4141/v1/messages"

    # 定义工具
    tools = [
        {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "input_schema": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称，如'北京'、'上海'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位"
                    }
                },
                "required": ["city"]
            }
        },
        {
            "name": "search_web",
            "description": "搜索网络获取最新信息",
            "input_schema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "搜索查询"
                    }
                },
                "required": ["query"]
            }
        }
    ]

    messages = [
        {
            "role": "user",
            "content": "北京现在的天气怎么样？"
        }
    ]

    # 第一次请求：模型决定使用哪个工具
    response = requests.post(
        url,
        json={
            "model": "gpt-4",
            "max_tokens": 1024,
            "messages": messages,
            "tools": tools,
            "tool_choice": {"type": "auto"}
        }
    )

    result = response.json()
    print("模型响应:", json.dumps(result, indent=2, ensure_ascii=False))

    # 检查是否需要使用工具
    if result["stop_reason"] == "tool_use":
        for block in result["content"]:
            if block["type"] == "tool_use":
                tool_name = block["name"]
                tool_input = block["input"]
                tool_use_id = block["id"]

                print(f"\n模型想要调用工具: {tool_name}")
                print(f"参数: {json.dumps(tool_input, ensure_ascii=False)}")

                # 模拟工具执行
                if tool_name == "get_weather":
                    tool_result = f"{tool_input['city']}今天晴，温度25°C"
                else:
                    tool_result = "搜索结果..."

                # 将工具结果添加到对话
                messages.append({
                    "role": "assistant",
                    "content": result["content"]
                })

                messages.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": tool_use_id,
                            "content": tool_result
                        }
                    ]
                })

                # 第二次请求：使用工具结果生成最终回复
                final_response = requests.post(
                    url,
                    json={
                        "model": "gpt-4",
                        "max_tokens": 1024,
                        "messages": messages,
                        "tools": tools
                    }
                )

                final_result = final_response.json()
                print("\n最终回复:", final_result["content"][0]["text"])

chat_with_tools()
```

### 3. 多模态输入（图像）

```python
import requests
import base64

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def analyze_image(image_path, question):
    url = "http://localhost:4141/v1/messages"

    # 读取并编码图像
    image_data = encode_image(image_path)

    # 检测图像类型
    if image_path.lower().endswith('.png'):
        media_type = "image/png"
    elif image_path.lower().endswith('.jpg') or image_path.lower().endswith('.jpeg'):
        media_type = "image/jpeg"
    elif image_path.lower().endswith('.gif'):
        media_type = "image/gif"
    elif image_path.lower().endswith('.webp'):
        media_type = "image/webp"
    else:
        raise ValueError("不支持的图像格式")

    response = requests.post(
        url,
        json={
            "model": "gpt-4",
            "max_tokens": 2048,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data
                            }
                        },
                        {
                            "type": "text",
                            "text": question
                        }
                    ]
                }
            ]
        }
    )

    result = response.json()
    return result["content"][0]["text"]

# 使用示例
answer = analyze_image("screenshot.png", "这张图片显示了什么？")
print(answer)
```

### 4. 温度和采样参数

```python
import requests

def generate_with_params(prompt, temperature=0.7, top_p=0.9, top_k=40):
    """
    temperature: 控制随机性（0.0-1.0）
    - 0.0: 完全确定性，总是选择最可能的词
    - 1.0: 最大随机性

    top_p: 核采样，只考虑累积概率达到 top_p 的词
    top_k: 只考虑概率最高的 k 个词
    """

    response = requests.post(
        "http://localhost:4141/v1/messages",
        json={
            "model": "gpt-4",
            "max_tokens": 1024,
            "temperature": temperature,
            "top_p": top_p,
            "top_k": top_k,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
    )

    return response.json()["content"][0]["text"]

# 示例：生成创意内容（高温度）
creative = generate_with_params(
    "写一个科幻故事的开头",
    temperature=0.9
)
print("创意版本:", creative)

# 示例：生成精确内容（低温度）
precise = generate_with_params(
    "什么是快速排序算法？",
    temperature=0.2
)
print("\n精确版本:", precise)
```

### 5. 停止序列

```python
import requests

def generate_with_stop_sequences():
    response = requests.post(
        "http://localhost:4141/v1/messages",
        json={
            "model": "gpt-4",
            "max_tokens": 2048,
            "stop_sequences": ["```", "---", "完毕"],
            "messages": [
                {
                    "role": "user",
                    "content": "写一段 Python 代码来计算斐波那契数列"
                }
            ]
        }
    )

    result = response.json()
    print("生成的代码:")
    print(result["content"][0]["text"])
    print(f"\n停止原因: {result['stop_reason']}")
    if result["stop_sequence"]:
        print(f"停止序列: {result['stop_sequence']}")

generate_with_stop_sequences()
```

### 6. 令牌计数

```python
import requests

def count_tokens(messages, model="gpt-4"):
    """计算消息的令牌数"""
    response = requests.post(
        "http://localhost:4141/v1/messages/count_tokens",
        json={
            "model": model,
            "messages": messages
        }
    )

    return response.json()["input_tokens"]

# 示例
messages = [
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！有什么我可以帮助你的吗？"},
    {"role": "user", "content": "介绍一下 Python"}
]

token_count = count_tokens(messages)
print(f"这段对话包含 {token_count} 个令牌")

# 在发送实际请求前检查
if token_count > 4000:
    print("警告：消息太长，可能需要截断")
```

## 编程语言示例

### Python 完整客户端

```python
import requests
from typing import List, Dict, Optional, Generator
import json

class CopilotAPIClient:
    def __init__(self, base_url: str = "http://localhost:4141"):
        self.base_url = base_url
        self.session = requests.Session()

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4",
        max_tokens: int = 1024,
        temperature: float = 0.7,
        system: Optional[str] = None,
        stream: bool = False
    ) -> Dict:
        """发送聊天请求"""
        payload = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages,
            "stream": stream
        }

        if system:
            payload["system"] = system

        if stream:
            return self._stream_chat(payload)
        else:
            response = self.session.post(
                f"{self.base_url}/v1/messages",
                json=payload
            )
            response.raise_for_status()
            return response.json()

    def _stream_chat(self, payload: Dict) -> Generator[Dict, None, None]:
        """流式聊天"""
        response = self.session.post(
            f"{self.base_url}/v1/messages",
            json=payload,
            stream=True
        )
        response.raise_for_status()

        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    data = line[6:]
                    if data == '[DONE]':
                        break
                    try:
                        yield json.loads(data)
                    except json.JSONDecodeError:
                        continue

    def count_tokens(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4"
    ) -> int:
        """计算令牌数"""
        response = self.session.post(
            f"{self.base_url}/v1/messages/count_tokens",
            json={
                "model": model,
                "messages": messages
            }
        )
        response.raise_for_status()
        return response.json()["input_tokens"]

    def get_models(self) -> List[Dict]:
        """获取可用模型列表"""
        response = self.session.get(f"{self.base_url}/v1/models")
        response.raise_for_status()
        return response.json()["data"]

# 使用示例
if __name__ == "__main__":
    client = CopilotAPIClient()

    # 简单聊天
    result = client.chat(
        messages=[
            {"role": "user", "content": "Hello!"}
        ]
    )
    print(result["content"][0]["text"])

    # 流式聊天
    print("\n流式输出:")
    for event in client.chat(
        messages=[
            {"role": "user", "content": "写一首诗"}
        ],
        stream=True
    ):
        if event.get("type") == "content_block_delta":
            delta = event.get("delta", {})
            if delta.get("type") == "text_delta":
                print(delta["text"], end="", flush=True)
    print()

    # 计算令牌
    tokens = client.count_tokens([
        {"role": "user", "content": "Hello, world!"}
    ])
    print(f"\n令牌数: {tokens}")
```

### JavaScript/TypeScript 客户端

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

interface ContentBlock {
  type: string;
  text?: string;
  [key: string]: any;
}

interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
  stream?: boolean;
  tools?: Tool[];
}

interface Tool {
  name: string;
  description?: string;
  input_schema: Record<string, any>;
}

class CopilotAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:4141') {
    this.baseUrl = baseUrl;
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<any> {
    const {
      model = 'gpt-4',
      maxTokens = 1024,
      temperature = 0.7,
      system,
      stream = false,
      tools
    } = options;

    const payload: any = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
      stream
    };

    if (system) payload.system = system;
    if (tools) payload.tools = tools;

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Request failed');
    }

    if (stream) {
      return this.streamResponse(response);
    }

    return response.json();
  }

  private async *streamResponse(response: Response): AsyncGenerator<any> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            yield JSON.parse(data);
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }

  async countTokens(messages: Message[], model: string = 'gpt-4'): Promise<number> {
    const response = await fetch(`${this.baseUrl}/v1/messages/count_tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages })
    });

    if (!response.ok) {
      throw new Error('Failed to count tokens');
    }

    const result = await response.json();
    return result.input_tokens;
  }

  async getModels(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/v1/models`);
    const result = await response.json();
    return result.data;
  }
}

// 使用示例
(async () => {
  const client = new CopilotAPIClient();

  // 简单聊天
  const result = await client.chat([
    { role: 'user', content: 'Hello!' }
  ]);
  console.log(result.content[0].text);

  // 流式聊天
  console.log('\n流式输出:');
  const stream = await client.chat(
    [{ role: 'user', content: '写一首诗' }],
    { stream: true }
  );

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      if (event.delta.type === 'text_delta') {
        process.stdout.write(event.delta.text);
      }
    }
  }
  console.log();
})();
```

### Go 客户端

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type Message struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type ChatRequest struct {
    Model      string    `json:"model"`
    MaxTokens  int       `json:"max_tokens"`
    Messages   []Message `json:"messages"`
    Stream     bool      `json:"stream,omitempty"`
    System     string    `json:"system,omitempty"`
    Temperature float64  `json:"temperature,omitempty"`
}

type ContentBlock struct {
    Type string `json:"type"`
    Text string `json:"text"`
}

type ChatResponse struct {
    ID         string         `json:"id"`
    Type       string         `json:"type"`
    Role       string         `json:"role"`
    Content    []ContentBlock `json:"content"`
    Model      string         `json:"model"`
    StopReason string         `json:"stop_reason"`
    Usage      Usage          `json:"usage"`
}

type Usage struct {
    InputTokens  int `json:"input_tokens"`
    OutputTokens int `json:"output_tokens"`
}

type Client struct {
    BaseURL    string
    HTTPClient *http.Client
}

func NewClient(baseURL string) *Client {
    return &Client{
        BaseURL:    baseURL,
        HTTPClient: &http.Client{},
    }
}

func (c *Client) Chat(req ChatRequest) (*ChatResponse, error) {
    jsonData, err := json.Marshal(req)
    if err != nil {
        return nil, err
    }

    resp, err := c.HTTPClient.Post(
        c.BaseURL+"/v1/messages",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("API error: %s", string(body))
    }

    var chatResp ChatResponse
    if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
        return nil, err
    }

    return &chatResp, nil
}

func (c *Client) CountTokens(messages []Message, model string) (int, error) {
    reqBody := map[string]interface{}{
        "model":    model,
        "messages": messages,
    }

    jsonData, err := json.Marshal(reqBody)
    if err != nil {
        return 0, err
    }

    resp, err := c.HTTPClient.Post(
        c.BaseURL+"/v1/messages/count_tokens",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        return 0, err
    }
    defer resp.Body.Close()

    var result struct {
        InputTokens int `json:"input_tokens"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return 0, err
    }

    return result.InputTokens, nil
}

func main() {
    client := NewClient("http://localhost:4141")

    // 简单聊天
    resp, err := client.Chat(ChatRequest{
        Model:     "gpt-4",
        MaxTokens: 1024,
        Messages: []Message{
            {Role: "user", Content: "Hello!"},
        },
    })

    if err != nil {
        panic(err)
    }

    fmt.Println(resp.Content[0].Text)

    // 计算令牌
    tokens, err := client.CountTokens(
        []Message{{Role: "user", Content: "Hello, world!"}},
        "gpt-4",
    )
    if err != nil {
        panic(err)
    }

    fmt.Printf("令牌数: %d\n", tokens)
}
```

## 实际应用场景

### 1. 代码审查助手

```python
import requests

def review_code(code: str, language: str = "python"):
    """代码审查助手"""
    response = requests.post(
        "http://localhost:4141/v1/messages",
        json={
            "model": "gpt-4",
            "max_tokens": 2048,
            "system": "你是一位经验丰富的代码审查专家。请仔细检查代码并提供建设性的反馈。",
            "messages": [
                {
                    "role": "user",
                    "content": f"请审查以下 {language} 代码，指出潜在问题、改进建议和最佳实践：\n\n```{language}\n{code}\n```"
                }
            ]
        }
    )

    return response.json()["content"][0]["text"]

# 示例
code = """
def calculate_sum(numbers):
    total = 0
    for i in range(len(numbers)):
        total = total + numbers[i]
    return total
"""

review = review_code(code)
print(review)
```

### 2. 智能文档生成

```python
def generate_documentation(code: str):
    """为代码生成文档"""
    response = requests.post(
        "http://localhost:4141/v1/messages",
        json={
            "model": "gpt-4",
            "max_tokens": 2048,
            "system": "你是一位技术文档写作专家。为代码生成清晰、专业的文档。",
            "messages": [
                {
                    "role": "user",
                    "content": f"为以下代码生成详细的文档字符串（docstring）：\n\n```python\n{code}\n```\n\n包括：\n1. 函数/类的简要描述\n2. 参数说明\n3. 返回值说明\n4. 使用示例\n5. 可能的异常"
                }
            ]
        }
    )

    return response.json()["content"][0]["text"]
```

### 3. 交互式学习助手

```python
class LearningAssistant:
    def __init__(self):
        self.conversation_history = []
        self.system_prompt = """你是一位耐心的编程导师。
- 根据学生的水平调整解释的复杂度
- 提供清晰的示例
- 鼓励学生思考
- 在必要时提出引导性问题"""

    def ask(self, question: str) -> str:
        """向助手提问"""
        self.conversation_history.append({
            "role": "user",
            "content": question
        })

        response = requests.post(
            "http://localhost:4141/v1/messages",
            json={
                "model": "gpt-4",
                "max_tokens": 2048,
                "system": self.system_prompt,
                "messages": self.conversation_history
            }
        )

        result = response.json()
        answer = result["content"][0]["text"]

        self.conversation_history.append({
            "role": "assistant",
            "content": answer
        })

        return answer

    def reset(self):
        """重置对话"""
        self.conversation_history = []

# 使用示例
assistant = LearningAssistant()

print(assistant.ask("我想学习递归，应该从哪里开始？"))
print("\n" + "="*50 + "\n")
print(assistant.ask("能给我一个简单的递归例子吗？"))
print("\n" + "="*50 + "\n")
print(assistant.ask("这个例子中的基准情况是什么？"))
```

### 4. 测试用例生成器

```python
def generate_test_cases(function_code: str):
    """生成测试用例"""
    response = requests.post(
        "http://localhost:4141/v1/messages",
        json={
            "model": "gpt-4",
            "max_tokens": 2048,
            "system": "你是测试工程师。为给定的函数生成全面的测试用例。",
            "messages": [
                {
                    "role": "user",
                    "content": f"""为以下函数生成 pytest 测试用例：

```python
{function_code}
```

请包括：
1. 正常情况测试
2. 边界情况测试
3. 异常情况测试
4. 测试夹具（如需要）"""
                }
            ]
        }
    )

    return response.json()["content"][0]["text"]

# 示例
function = """
def divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
"""

tests = generate_test_cases(function)
print(tests)
```

### 5. 命令行聊天机器人

```python
import requests

def chat_bot():
    """命令行聊天机器人"""
    print("聊天机器人已启动！输入 'quit' 退出。\n")

    conversation = []

    while True:
        user_input = input("你: ").strip()

        if user_input.lower() in ['quit', 'exit', '退出']:
            print("再见！")
            break

        if not user_input:
            continue

        conversation.append({
            "role": "user",
            "content": user_input
        })

        try:
            response = requests.post(
                "http://localhost:4141/v1/messages",
                json={
                    "model": "gpt-4",
                    "max_tokens": 1024,
                    "temperature": 0.8,
                    "messages": conversation
                }
            )

            result = response.json()
            assistant_message = result["content"][0]["text"]

            conversation.append({
                "role": "assistant",
                "content": assistant_message
            })

            print(f"\n机器人: {assistant_message}\n")

        except Exception as e:
            print(f"\n错误: {str(e)}\n")

if __name__ == "__main__":
    chat_bot()
```

## 错误处理示例

### 完整的错误处理

```python
import requests
import time
from typing import Dict, Optional

class APIError(Exception):
    """API 错误基类"""
    pass

class RateLimitError(APIError):
    """速率限制错误"""
    pass

class AuthenticationError(APIError):
    """认证错误"""
    pass

def make_request_with_retry(
    payload: Dict,
    max_retries: int = 3,
    initial_delay: float = 1.0
) -> Dict:
    """带重试的请求"""

    for attempt in range(max_retries):
        try:
            response = requests.post(
                "http://localhost:4141/v1/messages",
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                return response.json()

            elif response.status_code == 429:
                # 速率限制
                delay = initial_delay * (2 ** attempt)
                print(f"速率限制，等待 {delay} 秒...")
                time.sleep(delay)
                continue

            elif response.status_code == 401:
                raise AuthenticationError("认证失败")

            elif response.status_code >= 500:
                # 服务器错误，可重试
                delay = initial_delay * (2 ** attempt)
                print(f"服务器错误，等待 {delay} 秒后重试...")
                time.sleep(delay)
                continue

            else:
                # 其他错误，不重试
                error_data = response.json()
                raise APIError(f"API 错误: {error_data.get('error', {}).get('message')}")

        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                delay = initial_delay * (2 ** attempt)
                print(f"请求超时，等待 {delay} 秒后重试...")
                time.sleep(delay)
            else:
                raise APIError("请求超时")

        except requests.exceptions.ConnectionError:
            if attempt < max_retries - 1:
                delay = initial_delay * (2 ** attempt)
                print(f"连接错误，等待 {delay} 秒后重试...")
                time.sleep(delay)
            else:
                raise APIError("无法连接到服务器")

    raise APIError("达到最大重试次数")

# 使用示例
try:
    result = make_request_with_retry({
        "model": "gpt-4",
        "max_tokens": 1024,
        "messages": [
            {"role": "user", "content": "Hello!"}
        ]
    })
    print(result["content"][0]["text"])

except AuthenticationError as e:
    print(f"认证错误: {e}")
    print("请运行: npx copilot-api@latest auth")

except RateLimitError as e:
    print(f"速率限制: {e}")
    print("请稍后再试或使用 --rate-limit 选项")

except APIError as e:
    print(f"API 错误: {e}")
```

## 性能优化

### 批处理请求

```python
import asyncio
import aiohttp
from typing import List, Dict

async def process_batch(
    messages_list: List[List[Dict]],
    model: str = "gpt-4"
) -> List[Dict]:
    """并行处理多个请求"""

    async def make_request(session, messages):
        async with session.post(
            "http://localhost:4141/v1/messages",
            json={
                "model": model,
                "max_tokens": 1024,
                "messages": messages
            }
        ) as response:
            return await response.json()

    async with aiohttp.ClientSession() as session:
        tasks = [make_request(session, msgs) for msgs in messages_list]
        return await asyncio.gather(*tasks)

# 使用示例
async def main():
    batch = [
        [{"role": "user", "content": "What is Python?"}],
        [{"role": "user", "content": "What is JavaScript?"}],
        [{"role": "user", "content": "What is Go?"}]
    ]

    results = await process_batch(batch)

    for i, result in enumerate(results):
        print(f"\n问题 {i+1}:")
        print(result["content"][0]["text"])

asyncio.run(main())
```

## 总结

本文档提供了 Copilot API 的全面使用示例，涵盖：

- 基础的聊天请求
- 高级功能（流式传输、工具使用、多模态）
- 多种编程语言的客户端实现
- 实际应用场景
- 错误处理和性能优化

更多信息请参考：
- [API 参考文档](./api-reference.md)
- [错误码参考](./error-codes.md)
