# Fork Notes

## About This Fork

- Fork of [ericc-ch/copilot-api](https://github.com/ericc-ch/copilot-api), maintained by [@justyining](https://github.com/justyining).
- Regularly synced with upstream but released independently.

## How This Fork Differs

- Anthropic parity and stricter request validation for OpenAI- and Anthropic-style payloads, including `/v1/messages` and `/v1/messages/count_tokens`.
- Tooling for visibility and integration: `/usage` dashboard, `check-usage` and `debug` commands, manual/rate-limit controls, and a `--claude-code` helper for Claude Code setup.
- Runtime and security hardening: non-root Docker image, health/ready endpoints, and clearer token guidance in [SECURITY.md](./SECURITY.md).
- Documentation additions: quickstart guide, compatibility matrix, and fork-focused notes instead of duplicating upstream instructions.

## Usage

- Run directly with `npx copilot-api@latest start` or install globally with `npm install -g copilot-api`.
- Prefer the official upstream? Follow their README at [ericc-ch/copilot-api](https://github.com/ericc-ch/copilot-api) for installation instructions.

## Contributing

- Fork issues/PRs: https://github.com/justyining/copilot-api/issues and https://github.com/justyining/copilot-api/pulls
- Upstream issues/PRs: https://github.com/ericc-ch/copilot-api/issues and https://github.com/ericc-ch/copilot-api/pulls

## Sync & License

- Sync points are tracked via merge commits from upstream.
- License matches upstream—see [LICENSE](LICENSE).
