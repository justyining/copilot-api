# Fork Notes

## Overview

This repository is a fork of [ericc-ch/copilot-api](https://github.com/ericc-ch/copilot-api) maintained by [@justyining](https://github.com/justyining).

## Fork Purpose

This fork is maintained as an **independent experimental version** focused on:

- **Code Quality Improvements**: Enhanced code organization, error handling, and maintainability
- **Security Enhancements**: Better token handling, security documentation, and secure defaults
- **Testing Improvements**: Expanded test coverage for edge cases and failure scenarios
- **Documentation**: Comprehensive guides, API compatibility matrices, and usage examples
- **CI/CD Enhancements**: Improved quality gates and release processes

## Key Differences from Upstream

### Repository Metadata
- Updated `package.json` to point to this fork's repository
- Added fork identification in README
- Clarified relationship with upstream project

### Branch Strategy
- Uses `master` as the default branch (unified across all workflows)
- Consistent branch references in GitHub Actions workflows

### Documentation Additions
- **FORK_NOTES.md** (this file): Documents fork-specific information
- **SECURITY.md**: Security best practices and responsible disclosure
- Enhanced README with fork information and security warnings

### Security Improvements
- Added comprehensive security documentation
- Token handling best practices
- Documented API endpoint security considerations
- Enhanced security warnings for `/token` endpoint

### Testing Strategy
- Documented test expansion roadmap
- Focus areas include:
  - Token lifecycle and failure scenarios
  - Rate limiting behavior
  - Streaming edge cases
  - Error handling paths
  - Multi-tool call scenarios

### Code Quality
- Documented error handling standards
- Unified error response formats
- Structured logging approach

## Upstream Synchronization

This fork periodically reviews and selectively merges changes from the upstream repository at [ericc-ch/copilot-api](https://github.com/ericc-ch/copilot-api). However, not all upstream changes may be incorporated if they conflict with the fork's goals.

## Release Strategy

This fork follows an **independent release strategy**:

- **Versioning**: May diverge from upstream versioning to reflect fork-specific changes
- **NPM Publishing**: Not intended for npm publication (use upstream package)
- **Docker Images**: Uses GitHub Container Registry at `ghcr.io/justyining/copilot-api`
- **Releases**: Tagged releases document fork-specific improvements

## Using This Fork

### When to Use This Fork
- You want to experiment with enhanced security features
- You're interested in the documented improvements and best practices
- You want to contribute to fork-specific enhancements

### When to Use Upstream
- You want the official, actively maintained version
- You prefer stability over experimental features
- You need the published npm package

## Contributing

Contributions to this fork are welcome! Please note:

- This fork accepts contributions aligned with its goals
- For general features, consider contributing to [upstream](https://github.com/ericc-ch/copilot-api) instead
- See contribution guidelines in the upstream project

## Acknowledgments

This fork builds on the excellent work by [@ericc-ch](https://github.com/ericc-ch) and the original copilot-api contributors. All core functionality and original implementation credit belongs to the upstream project.

## License

This fork maintains the same license as the upstream project. See [LICENSE](./LICENSE) for details.
