# Contributing to Odoo.sh MCP Server

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment

## How to Contribute

### Reporting Issues

When reporting bugs or requesting features:

1. **Search existing issues** to avoid duplicates
2. **Provide detailed information**:
   - Clear description of the issue/feature
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Relevant logs or error messages

### Submitting Pull Requests

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed
   - Keep commits focused and atomic

3. **Test your changes**:
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit with clear messages**:
   ```bash
   git commit -m "Add feature: brief description
   
   - Detailed change 1
   - Detailed change 2"
   ```

5. **Push and create pull request**:
   - Provide clear PR description
   - Reference any related issues
   - Wait for review and address feedback

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/odoo-sh-mcp.git
   cd odoo-sh-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Odoo.sh SSH credentials
   ```

4. Build and test:
   ```bash
   npm run build
   npm test
   ```

## Development Guidelines

### Code Style

- Use TypeScript for all source code
- Follow existing formatting (Prettier/ESLint)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage
- Use descriptive test names

### Documentation

- Update README.md for user-facing changes
- Update docs/ for architectural changes
- Add inline comments for complex logic
- Update CHANGELOG.md (if applicable)

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

## Pull Request Review Process

1. **Automated checks** must pass:
   - Build succeeds
   - Tests pass
   - Linting passes

2. **Code review** by maintainers:
   - Code quality and style
   - Test coverage
   - Documentation completeness

3. **Approval and merge**:
   - At least one maintainer approval required
   - Squash merge for clean history

## Areas for Contribution

### High Priority

- Additional MCP tools for Odoo operations
- Improved error handling and logging
- Performance optimizations
- Test coverage improvements

### Documentation

- Usage examples and tutorials
- Video demonstrations
- Translation to other languages
- API documentation improvements

### Features

- Support for multiple Odoo.sh projects
- Advanced Git operations
- Odoo module scaffolding
- Integration tests

### Bug Fixes

- Check open issues for bugs
- Improve SSH connection reliability
- Handle edge cases better

## Questions?

- **Issues**: Open an issue for questions
- **Discussions**: Use GitHub Discussions for general questions
- **Security**: Email security issues privately (see SECURITY.md if available)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this project better! 🚀
