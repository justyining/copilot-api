# Quickstart Guide

Get up and running with Copilot API proxy in under 5 minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ A GitHub account with an active Copilot subscription (individual, business, or enterprise)
- ✅ Bun runtime installed (>= 1.2.x) - [Install Bun](https://bun.sh/docs/installation)
- ✅ OR Node.js and npm installed (>= 18.x)

## Step 1: Installation

Choose one of the following installation methods:

### Option A: Using npx (Recommended for Quick Testing)

No installation needed! Just run:

```bash
npx copilot-api@latest start
```

### Option B: Global Installation

```bash
npm install -g copilot-api
```

Then run:

```bash
copilot-api start
```

### Option C: From Source

```bash
git clone https://github.com/justyining/copilot-api.git
cd copilot-api
bun install
bun run dev
```

## Step 2: Authentication

When you first start the server, you'll be prompted to authenticate with GitHub.

### Interactive Authentication (Recommended)

1. Run the start command:
   ```bash
   npx copilot-api@latest start
   ```

2. The CLI will display a device code and a URL:
   ```
   Please visit: https://github.com/login/device
   Enter code: XXXX-XXXX
   ```

3. Open the URL in your browser and enter the code

4. Authorize the application

5. The CLI will automatically detect the authorization and continue

### Non-Interactive Authentication (CI/CD)

For automated environments:

1. First, generate a token interactively:
   ```bash
   npx copilot-api@latest auth
   ```

2. Copy the displayed token

3. Use it in your scripts:
   ```bash
   npx copilot-api@latest start --github-token ghp_YOUR_TOKEN_HERE
   ```

## Step 3: Verify the Server is Running

Once authenticated, you should see:

```
✔ Authentication successful!
Server running at http://localhost:4141
Usage Dashboard: https://ericc-ch.github.io/copilot-api?endpoint=http://localhost:4141/usage
```

Test that it's working:

```bash
curl http://localhost:4141/v1/models
```

You should see a JSON response with available models.

## Step 4: Make Your First Request

### Using curl (OpenAI-compatible)

```bash
curl http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy" \
  -d '{
    "model": "gpt-4.1",
    "messages": [
      {
        "role": "user",
        "content": "Say hello!"
      }
    ]
  }'
```

### Using curl (Anthropic-compatible)

```bash
curl http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: dummy" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "gpt-4.1",
    "messages": [
      {
        "role": "user",
        "content": "Say hello!"
      }
    ],
    "max_tokens": 1024
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
        {"role": "user", "content": "Say hello!"}
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
        {"role": "user", "content": "Say hello!"}
    ]
)

print(message.content[0].text)
```

## Step 5: Integrate with Claude Code (Optional)

If you want to use this with Claude Code:

1. Start the server with the Claude Code flag:
   ```bash
   npx copilot-api@latest start --claude-code
   ```

2. Select your preferred models when prompted

3. A command will be copied to your clipboard

4. Open a new terminal and paste the command to launch Claude Code

Alternatively, create a `.claude/settings.json` file in your project:

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
  },
  "permissions": {
    "deny": ["WebSearch"]
  }
}
```

Then just run `claude-code` in your project directory.

## Common Issues and Solutions

### Issue: "Authentication failed"

**Solution:**
- Ensure your GitHub account has an active Copilot subscription
- Try the auth flow again: `npx copilot-api@latest auth`
- Check that you're using the correct account type flag if you have business/enterprise Copilot

### Issue: "Port 4141 already in use"

**Solution:**
```bash
npx copilot-api@latest start --port 8080
```

### Issue: "Rate limit exceeded"

**Solution:**
```bash
# Add rate limiting
npx copilot-api@latest start --rate-limit 30

# Or use wait mode to automatically wait instead of erroring
npx copilot-api@latest start --rate-limit 30 --wait
```

### Issue: Requests are too slow

**Solution:**
- This is expected - the proxy adds overhead and depends on GitHub's API response times
- Consider using rate limiting to avoid triggering abuse detection
- Check your network connection

### Issue: Docker container exits immediately

**Solution:**
- Ensure you've provided authentication or mounted the token directory:
  ```bash
  docker run -p 4141:4141 \
    -v $(pwd)/copilot-data:/home/copilot/.local/share/copilot-api \
    copilot-api
  ```
- Or use the GitHub token environment variable:
  ```bash
  docker run -p 4141:4141 -e GH_TOKEN=your_token copilot-api
  ```

## Next Steps

Now that you're up and running:

1. **Monitor Usage**: Visit the usage dashboard at the URL shown in the console
2. **Read the Docs**: Check out the main [README.md](../README.md) for all features
3. **Security**: Review [SECURITY.md](../SECURITY.md) for security best practices
4. **Explore APIs**: Try the different endpoints (`/v1/models`, `/v1/embeddings`, etc.)
5. **Rate Limiting**: Learn about `--rate-limit` and `--manual` flags for safer usage

## Useful Commands Reference

```bash
# Start with custom port
npx copilot-api@latest start --port 8080

# Start with verbose logging
npx copilot-api@latest start --verbose

# Start with rate limiting
npx copilot-api@latest start --rate-limit 30 --wait

# Start with manual approval for each request
npx copilot-api@latest start --manual

# Check your Copilot usage
npx copilot-api@latest check-usage

# Get debug information
npx copilot-api@latest debug

# Use with business/enterprise account
npx copilot-api@latest start --account-type business
npx copilot-api@latest start --account-type enterprise
```

## Getting Help

- **Documentation**: See the main [README.md](../README.md)
- **Issues**: Report bugs at https://github.com/justyining/copilot-api/issues
- **Upstream**: Original project at https://github.com/ericc-ch/copilot-api
- **Security**: Review [SECURITY.md](../SECURITY.md) for security concerns

## Important Reminders

⚠️ **This is a reverse-engineered proxy** - use responsibly:
- Not officially supported by GitHub
- May break without notice
- Excessive use may trigger abuse detection
- See [Known Limitations](../README.md#known-limitations-and-risks) for details

Enjoy using Copilot API proxy! 🚀
