# Quickstart Guide

Get up and running with Copilot API in 5 minutes.

## Prerequisites

- Node.js or Bun installed
- GitHub account with active Copilot subscription (individual, business, or enterprise)

## Step 1: Installation

The fastest way to get started is using `npx` (no installation required):

```bash
npx copilot-api@latest start
```

Alternatively, you can install globally:

```bash
npm install -g copilot-api
# or
bun install -g copilot-api
```

## Step 2: Authentication

On first run, you'll be prompted to authenticate with GitHub:

1. The CLI will display a device code and open your browser
2. Sign in to GitHub and enter the device code
3. Authorize the application

The authentication token is saved locally and will be reused on subsequent runs.

**Alternative**: If you already have a GitHub token, you can provide it directly:

```bash
npx copilot-api@latest auth           # Generate a token
npx copilot-api@latest start --github-token YOUR_TOKEN
```

## Step 3: Verify It's Running

Once started, you should see:

```
✔ Server started
ℹ Available models:
  - gpt-4.1
  - gpt-3.5-turbo
  ...

╭──────────────────────────────────────────────────────────────────╮
│ 🌐 Usage Viewer: https://ericc-ch.github.io/copilot-api?endpoint=...│
╰──────────────────────────────────────────────────────────────────╯
```

The server is now running on `http://localhost:4141`.

## Step 4: Test with a Request

### Using curl (OpenAI Format)

```bash
curl http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy" \
  -d '{
    "model": "gpt-4.1",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Using curl (Anthropic Format)

```bash
curl http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: dummy" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "gpt-4.1",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Using Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4141/v1",
    api_key="dummy"  # Any value works
)

response = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ]
)

print(response.choices[0].message.content)
```

### Using Python (Anthropic SDK)

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="http://localhost:4141",
    api_key="dummy"  # Any value works
)

message = client.messages.create(
    model="gpt-4.1",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ]
)

print(message.content[0].text)
```

## Step 5: Use with Your Tools

### With Claude Code

The easiest way to use with Claude Code is the `--claude-code` flag:

```bash
npx copilot-api@latest start --claude-code
```

This will:
1. Prompt you to select models
2. Generate a command to launch Claude Code
3. Copy it to your clipboard

Just paste and run the command in a new terminal!

**Manual Configuration**: Alternatively, create `.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:4141",
    "ANTHROPIC_AUTH_TOKEN": "dummy",
    "ANTHROPIC_MODEL": "gpt-4.1",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "gpt-4.1",
    "ANTHROPIC_SMALL_FAST_MODEL": "gpt-4.1",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "gpt-4.1",
    "DISABLE_NON_ESSENTIAL_MODEL_CALLS": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  }
}
```

### With Other OpenAI-Compatible Tools

Point any tool that supports OpenAI API to:
- **Base URL**: `http://localhost:4141/v1`
- **API Key**: Any value (e.g., `"dummy"`)
- **Model**: Use one of the models from the server startup output

## Common Options

### Change Port

```bash
npx copilot-api@latest start --port 8080
```

### Enable Rate Limiting (Recommended)

```bash
# Wait 30 seconds between requests
npx copilot-api@latest start --rate-limit 30

# Wait instead of erroring when rate limit is hit
npx copilot-api@latest start --rate-limit 30 --wait
```

### Use Business/Enterprise Account

```bash
npx copilot-api@latest start --account-type business
# or
npx copilot-api@latest start --account-type enterprise
```

### Enable Verbose Logging

```bash
npx copilot-api@latest start --verbose
```

## Check Your Usage

View your Copilot usage and quotas:

```bash
# In terminal
npx copilot-api@latest check-usage

# Or visit the web dashboard (URL shown at startup)
```

## Troubleshooting

### Authentication Failed

```bash
# Re-authenticate
npx copilot-api@latest auth

# Or provide token directly
npx copilot-api@latest start --github-token YOUR_TOKEN
```

### Token Expired

The token is automatically refreshed. If you see persistent auth errors:

```bash
# Re-run authentication
npx copilot-api@latest auth
```

### Port Already in Use

```bash
# Use a different port
npx copilot-api@latest start --port 8080
```

### Models Not Loading

```bash
# Enable verbose logging to see what's happening
npx copilot-api@latest start --verbose
```

### Rate Limit Warnings from GitHub

You're making too many requests. Use rate limiting:

```bash
npx copilot-api@latest start --rate-limit 30 --wait
```

## Next Steps

- Read the [full README](../README.md) for all options and features
- Check out [SECURITY.md](../SECURITY.md) for security best practices
- Review the [API Compatibility Matrix](../README.md#api-compatibility-matrix) to understand limitations
- See [DEVELOPMENT.md](./DEVELOPMENT.md) for contributing and development guidelines

## Important Warnings

⚠️ **This is a reverse-engineered proxy** - not officially supported by GitHub

⚠️ **Excessive usage may trigger GitHub's abuse detection** - use responsibly and enable rate limiting

⚠️ **Keep your tokens secure** - never share them or commit them to version control

For more details, see [SECURITY.md](../SECURITY.md).
