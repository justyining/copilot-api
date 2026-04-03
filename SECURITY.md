# Security Policy

## Overview

This project acts as a reverse-engineered proxy for the GitHub Copilot API. As such, it handles sensitive authentication tokens and credentials. Please read this document carefully to understand the security implications and best practices.

## Supported Versions

Security updates are applied to the latest version only. Please ensure you're running the most recent version of copilot-api.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 0.7.x | :x:                |

## Security Considerations

### 1. Token Handling

#### GitHub Personal Access Tokens
- **Never commit tokens to version control**
- **Never share tokens** with untrusted parties
- Use tokens with the **minimum required permissions**
- Rotate tokens regularly (at least every 90 days)
- Revoke tokens immediately if compromised

#### Copilot Tokens
- Copilot tokens are automatically fetched and refreshed
- These tokens are stored locally in your user data directory
- The `--show-token` flag should **only be used for debugging**
- Never expose Copilot tokens in logs, screenshots, or shared terminals

### 2. API Endpoint Security

#### `/token` Endpoint
The `/token` endpoint exposes the current Copilot token being used by the API.

**Security Recommendations:**
- This endpoint should **only be accessible on localhost** in development
- **Never expose this endpoint to the internet**
- Consider implementing authentication if you must expose it
- Use firewall rules to restrict access
- Monitor access logs for unauthorized usage

**Production Deployment:**
If you deploy this service in production, consider:
- Removing or disabling the `/token` endpoint
- Implementing proper authentication and authorization
- Using a reverse proxy with authentication (e.g., nginx with basic auth)
- Rate limiting all endpoints

#### `/usage` Endpoint
While less sensitive, the usage endpoint can still reveal information about your API consumption patterns. Apply similar protections as the `/token` endpoint.

### 3. Command-Line Flags

#### `--show-token`
- **Only use in debug mode** for troubleshooting
- **Never use in:**
  - Shared terminals or screen sharing sessions
  - CI/CD pipelines with public logs
  - Recorded terminal sessions
  - Screenshots or documentation
- Tokens shown via this flag should be considered exposed and rotated

#### `--github-token`
- Avoid passing tokens via command-line arguments (visible in process lists)
- Prefer the interactive authentication flow
- If you must use this flag, ensure:
  - Your shell history is disabled or secured
  - Process listings are not accessible to other users
  - The environment is properly isolated

### 4. Docker Security

#### Environment Variables
When running via Docker:
- **Never** commit Dockerfiles or compose files with hardcoded tokens
- Use Docker secrets or secure environment variable injection
- Avoid logging environment variables in entrypoint scripts
- Be aware that `docker inspect` can reveal environment variables

#### Container Security
This project's Docker image implements security best practices:
- **Non-root user**: The container runs as user `copilot` (UID 1001), not root
- **Minimal base image**: Uses Alpine Linux for reduced attack surface
- **Multi-stage build**: Separates build and runtime dependencies
- **Health checks**: Monitors container health

**Additional Recommendations:**
- Run containers with `--read-only` filesystem where possible
- Use Docker secrets for sensitive data
- Limit container capabilities with `--cap-drop`
- Use user namespaces for additional isolation
- Scan images regularly for vulnerabilities

### 5. Network Security

#### Localhost Only (Default)
By default, the server binds to `localhost:4141`. This means:
- Only processes on the same machine can access it
- This is the **recommended configuration** for personal use

#### Exposing to Network
If you need to expose the service to your network:
- Use a reverse proxy (nginx, Caddy, Traefik)
- Implement TLS/HTTPS
- Add authentication (OAuth, basic auth, API keys)
- Use firewall rules to restrict access
- Enable rate limiting
- Monitor access logs

### 6. Rate Limiting and Abuse Prevention

GitHub actively monitors for abuse of their services:
- **Excessive automated requests** may trigger abuse detection
- You may receive warnings from GitHub Security
- Your Copilot access may be suspended for anomalous activity

**Best Practices:**
- Use `--rate-limit` flag to throttle requests
- Use `--manual` flag for manual approval during testing
- Avoid bulk or automated requests
- Monitor your usage via the `/usage` endpoint
- Review [GitHub's Acceptable Use Policies](https://docs.github.com/site-policy/acceptable-use-policies/github-acceptable-use-policies)

### 7. Logging and Monitoring

#### What Gets Logged
By default, the application logs:
- Request paths and methods
- Authentication flow steps
- Error messages
- Usage statistics

#### Verbose Mode (`--verbose`)
Verbose mode may log additional information:
- Request and response headers
- Token fetch/refresh events (without token values unless `--show-token` is used)
- Detailed error stack traces

**Security Practices:**
- Review logs before sharing for support
- Redact any sensitive information
- Avoid enabling verbose logging in production
- Implement log rotation and secure log storage
- Monitor logs for suspicious activity

### 8. Data Storage

#### Local Data Directory
The application stores data in:
- Linux/Mac: `~/.local/share/copilot-api`
- Windows: `%LOCALAPPDATA%\copilot-api`
- Docker: `/home/copilot/.local/share/copilot-api`

**Security Recommendations:**
- Ensure proper file permissions (600 or 700)
- Exclude this directory from cloud sync services
- Include this directory in your backup encryption
- Securely wipe this directory when decommissioning

### 9. Known Risks and Limitations

#### This is a Reverse-Engineered Proxy
- **Not officially supported** by GitHub
- **May break** without notice if GitHub changes their API
- **May trigger** GitHub's abuse detection systems
- **No security guarantees** from GitHub for unofficial usage

#### Token Exposure Risks
- Tokens are stored in memory during operation
- Memory dumps could potentially expose tokens
- Tokens are transmitted over HTTPS to GitHub servers
- Local storage uses filesystem permissions for protection

#### Third-Party Dependencies
This project relies on third-party npm packages:
- Dependencies may have vulnerabilities
- Regularly update dependencies
- Review dependency security advisories
- Use tools like `npm audit` or `bun audit`

## Reporting a Vulnerability

### For This Fork
If you discover a security vulnerability in this fork, please:

1. **Do not** open a public issue
2. Email the maintainer: [Create a private security advisory on GitHub]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### For Upstream Project
For vulnerabilities in the upstream project, please report to the original repository:
- https://github.com/ericc-ch/copilot-api

## Security Best Practices Summary

### For Personal Use
- ✅ Use the default localhost binding
- ✅ Use interactive authentication flow
- ✅ Enable rate limiting (`--rate-limit`)
- ✅ Keep the software updated
- ✅ Protect your local data directory
- ❌ Don't expose to the internet
- ❌ Don't use `--show-token` unless debugging
- ❌ Don't commit tokens to version control

### For Development
- ✅ Use `--manual` flag for testing
- ✅ Review logs before sharing
- ✅ Use environment-specific configurations
- ✅ Rotate test tokens regularly
- ❌ Don't use production tokens in development
- ❌ Don't commit `.env` files with tokens
- ❌ Don't share terminal sessions with tokens visible

### For Production (Not Recommended)
If you must deploy to production despite risks:
- ✅ Use Docker with non-root user
- ✅ Implement authentication/authorization
- ✅ Use TLS/HTTPS
- ✅ Implement rate limiting
- ✅ Use monitoring and alerting
- ✅ Regular security audits
- ✅ Disable `/token` endpoint
- ❌ Don't expose without proper security measures
- ❌ Don't use for critical services
- ❌ Don't rely on this for production workloads

## Security Compliance

### Data Privacy
- This proxy does not collect or transmit user data except to GitHub
- All requests are proxied directly to GitHub Copilot API
- No telemetry or analytics are collected by this application
- Token storage is local only

### Third-Party Services
This application communicates with:
- GitHub API (api.github.com) - for authentication
- GitHub Copilot API - for AI completions
- No other third-party services

## Disclaimer

This project is a reverse-engineered proxy and is **not affiliated with, endorsed by, or supported by GitHub**. Use at your own risk. The maintainers are not responsible for:
- Account suspensions or restrictions
- Token exposure or misuse
- Violations of GitHub's Terms of Service
- Any damages resulting from use of this software

By using this software, you acknowledge these risks and agree to use it responsibly and in compliance with GitHub's policies.

## License

See [LICENSE](LICENSE) for the full license text.
