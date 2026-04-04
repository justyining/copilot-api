# Fork Notes

## About This Fork

This repository is a fork of [ericc-ch/copilot-api](https://github.com/ericc-ch/copilot-api), maintained by [@justyining](https://github.com/justyining).

## Purpose

This fork serves the following purposes:

- **Experimental Features**: Testing and implementing experimental features before potentially contributing them upstream
- **Personal Customizations**: Maintaining specific configurations and customizations for personal use cases
- **Continuous Improvement**: Exploring code quality improvements, security enhancements, and documentation updates

## Relationship with Upstream

- **Synchronization**: This fork aims to stay synchronized with the upstream repository
- **Contributions**: Improvements and bug fixes may be contributed back to the upstream project
- **Versioning**: This fork follows its own versioning scheme but references the upstream version it's based on

## Key Differences from Upstream

### Current Differences

As of the latest update, this fork includes:

1. **Enhanced Documentation**
   - Improved fork identity clarity in README and package.json
   - Added SECURITY.md with token security best practices
   - Created comprehensive quickstart guide
   - Added API compatibility matrix

2. **Security Improvements**
   - Docker non-root user implementation
   - Enhanced health check endpoints (/health and /ready)
   - Improved token handling documentation

3. **Code Quality**
   - Consistent branch strategy (unified to master)
   - Enhanced error handling patterns
   - Improved test coverage

4. **Developer Experience**
   - Better CI/CD workflow consistency
   - Clearer contribution guidelines
   - Enhanced debugging capabilities

### Planned Features

Features under consideration for future implementation:

- Enhanced rate limiting strategies
- Additional API compatibility layers
- Improved monitoring and observability
- Extended test coverage for edge cases

## Using This Fork

### Installation

You can use this fork directly via npx:

```bash
npx copilot-api@latest start
```

Or install it globally:

```bash
npm install -g copilot-api
```

### Switching Between Upstream and Fork

If you want to switch back to the upstream version:

```bash
npm uninstall -g copilot-api
npm install -g copilot-api  # This will install from the main npm registry
```

## Contributing

### To This Fork

Issues and pull requests specific to this fork should be opened in this repository:
- Issues: https://github.com/justyining/copilot-api/issues
- Pull Requests: https://github.com/justyining/copilot-api/pulls

### To Upstream

If you'd like to contribute to the original project, please visit:
- Upstream Repository: https://github.com/ericc-ch/copilot-api
- Upstream Issues: https://github.com/ericc-ch/copilot-api/issues

## Changelog

### Fork-Specific Changes

See the commit history for detailed changes specific to this fork.

### Upstream Sync History

This fork is regularly synchronized with upstream changes. Check the merge commits for upstream synchronization points.

## Support

For issues specific to this fork, please open an issue in this repository.

For general questions about the Copilot API proxy functionality, you may also refer to the upstream repository's documentation and community.

## License

This fork maintains the same license as the upstream project. See [LICENSE](LICENSE) for details.

## Acknowledgments

Special thanks to:
- [@ericc-ch](https://github.com/ericc-ch) and all contributors to the original copilot-api project
- The GitHub Copilot team for providing the underlying service
- All users and contributors who help improve this project
