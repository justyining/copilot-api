# Security Policy

## Overview

This project is a reverse-engineered proxy for the GitHub Copilot API. Due to its nature and the sensitive tokens it handles, security considerations are paramount.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.7.x   | :white_check_mark: |
| < 0.7   | :x:                |

## Security Considerations

### This is Unofficial and Reverse-Engineered

> [!WARNING]
> This proxy is **not officially supported by GitHub**. It relies on reverse-engineered API endpoints that may change or break at any time. Use at your own risk.

### Potential Risks

1. **Account Restrictions**: Excessive or automated usage may trigger GitHub's abuse detection systems, potentially leading to:
   - Security warnings from GitHub
   - Temporary suspension of Copilot access
   - Account restrictions

2. **Token Exposure**: This proxy handles sensitive authentication tokens:
   - GitHub personal access tokens
   - GitHub Copilot API tokens
   - Session tokens

3. **Network Security**: The proxy exposes endpoints that could be exploited if not properly secured.

## Token Security Best Practices

### Never Share Tokens

- **`--show-token` flag**: Only use for local debugging. Never use in:
  - Shared terminals or tmux/screen sessions
  - CI/CD pipelines with visible logs
  - Screenshots or screen recordings
  - Shared development environments

### Secure Token Storage

- Tokens are stored in `~/.local/share/copilot-api/` (or equivalent OS-specific directory)
- Ensure this directory has proper file permissions (0700)
- Do not commit token files to version control
- Rotate tokens regularly

### Docker Security

When using Docker with environment variables:

```bash
# ❌ BAD: Token visible in process list and logs
docker run -e GH_TOKEN=ghp_very_secret_token copilot-api

# ✅ BETTER: Use Docker secrets or mounted files
docker run -v ~/.github-token:/run/secrets/gh_token copilot-api
```

Additional Docker security measures:
- Run containers with minimal privileges
- Use non-root users (see Improvement Point 5 in roadmap)
- Limit container network access
- Use read-only filesystems where possible
- Scan images for vulnerabilities regularly

## API Endpoint Security

### `/token` Endpoint

**Risk Level: HIGH**

This endpoint returns the current Copilot API token. In production deployments:

1. **Disable the endpoint** by not exposing it publicly
2. **Restrict to localhost** only:
   ```bash
   # Use a reverse proxy to block /token
   # Example nginx configuration:
   location /token {
       deny all;
   }
   ```
3. **Add authentication** if you must expose it:
   - Use API keys
   - Implement OAuth
   - Use mutual TLS

### `/usage` Endpoint

**Risk Level: MEDIUM**

While less sensitive than `/token`, this endpoint reveals usage patterns. Consider:
- Rate limiting access
- Authentication for production deployments
- Monitoring for unusual access patterns

### Chat Completions and Messages Endpoints

**Risk Level: MEDIUM**

These endpoints:
- Process potentially sensitive prompts and responses
- Can be resource-intensive
- Should be rate-limited
- May log request data

Recommendations:
- Use `--rate-limit` flag
- Enable `--manual` mode for sensitive operations
- Review logs for sensitive information before sharing
- Implement request/response filtering if logging

## Deployment Security

### Development Environment

For local development:
```bash
# Use with manual approval for sensitive work
copilot-api start --manual --rate-limit 30

# Avoid verbose logging with sensitive data
copilot-api start --verbose  # ⚠️ May log tokens if --show-token is used
```

### Production Environment

**Not Recommended**: This proxy is not designed for production use. If you must deploy it:

1. **Network Security**:
   - Deploy behind VPN or private network
   - Use reverse proxy with authentication (nginx, traefik, etc.)
   - Implement IP allowlisting
   - Use HTTPS/TLS for all connections

2. **Access Control**:
   - Implement authentication (OAuth, API keys, mutual TLS)
   - Use principle of least privilege
   - Regular access audits

3. **Monitoring**:
   - Log all access attempts
   - Monitor for unusual patterns
   - Set up alerts for rate limit violations
   - Track token refresh failures

4. **Container Security**:
   - Use minimal base images
   - Run as non-root user
   - Implement security scanning
   - Keep dependencies updated
   - Use resource limits

### CI/CD Environments

**Strongly Discouraged**: Using this proxy in CI/CD is risky and may violate GitHub's acceptable use policies.

If you must:
- Use GitHub token only, not device auth flow
- Implement strict rate limiting
- Use dedicated service accounts
- Monitor for abuse warnings
- Have fallback mechanisms

## Rate Limiting and Abuse Prevention

### Always Use Rate Limiting

```bash
# Minimum recommended rate limit
copilot-api start --rate-limit 30

# With wait mode (better for automated tools)
copilot-api start --rate-limit 30 --wait
```

### Manual Approval Mode

For sensitive operations or learning the tool:
```bash
copilot-api start --manual
```

This allows you to review each request before it's sent to GitHub.

### Monitoring Your Usage

Regularly check your usage:
```bash
copilot-api check-usage
```

Or visit the usage dashboard at startup.

## Known Security Limitations

1. **No built-in authentication**: The API endpoints have no authentication by default
2. **Token endpoint exposure**: The `/token` endpoint is publicly accessible when the server runs
3. **No request sanitization**: Prompts and responses are passed through without filtering
4. **Limited audit logging**: No comprehensive audit trail by default
5. **No rate limiting by default**: Must be explicitly enabled via flags
6. **Verbose logging risks**: May log sensitive information when `--verbose` is used

## Recommended Use Cases

### ✅ Appropriate Use

- Personal development and learning
- Local AI-assisted coding with Claude Code or similar tools
- Experimentation with AI models
- Educational purposes
- Temporary testing

### ❌ Inappropriate Use

- Production services
- High-frequency automated requests
- Public-facing APIs
- Shared/multi-tenant environments without proper security
- Any usage that violates GitHub's Acceptable Use Policies
- Bulk/batch processing at scale

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this fork, please:

1. **Do not** open a public issue
2. Email the maintainer directly (check GitHub profile for contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

For vulnerabilities in the upstream project, report to the [upstream repository](https://github.com/ericc-ch/copilot-api).

## Security Checklist

Before deploying or using this proxy:

- [ ] Read and understand GitHub's [Acceptable Use Policies](https://docs.github.com/site-policy/acceptable-use-policies/github-acceptable-use-policies)
- [ ] Read the [GitHub Copilot Terms](https://docs.github.com/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot)
- [ ] Enable rate limiting (`--rate-limit`)
- [ ] Avoid using `--show-token` except for debugging
- [ ] Secure the `/token` endpoint if exposing the server
- [ ] Use HTTPS if accessing over network
- [ ] Implement authentication for non-local deployments
- [ ] Review logs before sharing (avoid token leakage)
- [ ] Monitor your GitHub account for security notices
- [ ] Keep dependencies updated
- [ ] Use Docker with proper security hardening if containerizing

## Related Documentation

- [GitHub Acceptable Use Policies](https://docs.github.com/site-policy/acceptable-use-policies/github-acceptable-use-policies)
- [GitHub Copilot Terms](https://docs.github.com/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot)
- [README.md - Security Best Practices](./README.md#security-best-practices)
- [FORK_NOTES.md](./FORK_NOTES.md)

## Disclaimer

This project is provided "as is" without warranty of any kind. The maintainers are not responsible for any damage, account restrictions, or other consequences resulting from the use of this software. Users are solely responsible for ensuring their use complies with GitHub's terms of service and acceptable use policies.
