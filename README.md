# Odoo.sh MCP Server

> Model Context Protocol server for Odoo.sh platform integration, enabling AI assistants to manage projects, monitor builds, and automate deployments.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## Features

- **🔧 Project Management**: List and inspect Odoo.sh projects
- **🌿 Branch Operations**: View branches and their configurations
- **🏗️ Build Monitoring**: Track builds, view logs, trigger new builds
- **💾 Database Info**: Access database details and backup status
- **⚡ Performance**: Built-in caching with configurable TTL
- **🔒 Secure**: Dynamic environment variable support for API tokens
- **🤖 AI-Ready**: Guided prompts for common workflows
- **📦 Easy Setup**: Simple npm install and configuration

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Available Tools](#available-tools)
- [Prompts](#prompts)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and add your ODOO_SH_API_TOKEN

# 3. Build
npm run build

# 4. Add to your MCP client config (e.g., Claude Desktop)
# See Configuration section below
```

## Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** (comes with Node.js)
- **Odoo.sh Account** with API access
- **MCP Client** (Claude Desktop, Cline, Continue, etc.)

### Steps

1. **Clone or download this repository**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Get your Odoo.sh API token**:
   - Visit: `https://www.odoo.sh/project/YOUR_PROJECT#settings`
   - Navigate to **Settings** → **API Access**
   - Copy your API token

4. **Build the project**:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Create a `.env` file or set environment variables:

```env
ODOO_SH_API_TOKEN=your_api_token_here
ODOO_SH_API_URL=https://www.odoo.sh/api  # Optional
LOG_LEVEL=info                           # Optional: debug, info, warn, error
API_TIMEOUT=30000                        # Optional: milliseconds
ENABLE_CACHE=true                        # Optional: enable/disable caching
CACHE_TTL=300                            # Optional: cache lifetime in seconds
```

**🔐 Security Tip**: Use dynamic environment variables in Warp:
```bash
ODOO_SH_API_TOKEN=$(pass show odoo/api-token)
```

### MCP Client Configuration

#### Claude Desktop

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "odoo-sh": {
      "command": "node",
      "args": [
        "/absolute/path/to/Odoo.sh MCP/dist/index.js"
      ],
      "env": {
        "ODOO_SH_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

#### Cline (VSCode)

Add to VSCode settings:

```json
{
  "cline.mcpServers": {
    "odoo-sh": {
      "command": "node",
      "args": ["/absolute/path/to/Odoo.sh MCP/dist/index.js"],
      "env": {
        "ODOO_SH_API_TOKEN": "${env:ODOO_SH_API_TOKEN}"
      }
    }
  }
}
```

**Note**: Use absolute paths to `dist/index.js`.

## Usage

Once configured, your AI assistant can use Odoo.sh tools directly:

### Example Interactions

**List all projects**:
```
"Show me all my Odoo.sh projects"
```

**Check build status**:
```
"What's the status of recent builds for project 123?"
```

**Trigger a build**:
```
"Trigger a new build for project 123, branch 456"
```

**View build logs**:
```
"Show me the build log for build 789 in project 123"
```

## Available Tools

The server provides 10 tools for Odoo.sh operations:

### Projects
- **`list_projects`**: List all accessible projects
- **`get_project`**: Get detailed project information
  - Parameters: `project_id`

### Branches
- **`list_branches`**: List branches for a project
  - Parameters: `project_id`
- **`get_branch`**: Get detailed branch information
  - Parameters: `project_id`, `branch_id`

### Builds
- **`list_builds`**: List builds for a branch
  - Parameters: `project_id`, `branch_id`
- **`get_build`**: Get detailed build information
  - Parameters: `project_id`, `branch_id`, `build_id`
- **`trigger_build`**: Trigger a new build
  - Parameters: `project_id`, `branch_id`
- **`get_build_log`**: Get build log content
  - Parameters: `project_id`, `branch_id`, `build_id`

### Database
- **`get_database_info`**: Get database information
  - Parameters: `project_id`, `branch_id`

### Utility
- **`clear_cache`**: Clear internal cache (forces fresh data fetch)

## Prompts

Guided workflows for common tasks:

### `check_build_status`
Comprehensive build status check for a project:
- Lists all branches
- Shows recent builds
- Highlights failures
- Displays build trends

**Usage**: `check_build_status` with `project_id`

### `deploy_workflow`
Step-by-step deployment guidance:
- Checks current branch status
- Verifies pending builds
- Validates database backups
- Guides through deployment
- Provides verification steps

**Usage**: `deploy_workflow` with `project_id` and `environment`

## Development

### Scripts

```bash
# Build TypeScript
npm run build

# Development mode (auto-rebuild)
npm run dev

# Run tests
npm test

# Watch tests
npm test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
odoo-mcp-server/
├── src/
│   ├── index.ts          # MCP server implementation
│   └── odoo-client.ts    # Odoo.sh API client
├── tests/                # Test files (to be added)
├── docs/
│   ├── Runbook.md        # Setup and usage guide
│   ├── DECISIONS.md      # Architectural decisions
│   ├── Troubleshooting.md # Known issues
│   └── Docs-Index.md     # External references
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env.example
```

### Testing

Tests are located in the `tests/` directory. Run with:

```bash
npm test
```

## Troubleshooting

### Common Issues

**1. Authentication Failed**
```
Error: Authentication failed. Check your API token.
```
**Solution**: Verify `ODOO_SH_API_TOKEN` is set correctly.

**2. Server Not Appearing**
- Verify JSON syntax in MCP client config
- Check absolute path to `dist/index.js`
- Restart MCP client

**3. Module Not Found**
```
Error: Cannot find module '@modelcontextprotocol/sdk/server/index.js'
```
**Solution**: Run `npm install` and `npm run build`

**4. Rate Limit Exceeded**
```
Error: Rate limit exceeded. Please try again later.
```
**Solution**: Enable caching (`ENABLE_CACHE=true`) and wait 60 seconds.

See [docs/Troubleshooting.md](./docs/Troubleshooting.md) for more issues and solutions.

## Architecture

### Technology Stack

- **Runtime**: Node.js >= 18.0.0
- **Language**: TypeScript 5.3
- **Protocol**: Model Context Protocol (MCP)
- **HTTP Client**: Axios
- **Validation**: Zod
- **Transport**: stdio

### Design Decisions

Key architectural decisions are documented in [docs/DECISIONS.md](./docs/DECISIONS.md):

- **dec-20251107T152800Z-mcp-framework**: Why MCP over REST API
- **dec-20251107T153000Z-typescript-nodejs**: TypeScript and Node.js choice
- **dec-20251107T153200Z-api-token-auth**: Bearer token authentication
- **dec-20251107T153400Z-caching-strategy**: In-memory caching approach
- **dec-20251107T153600Z-error-handling**: Status-code specific errors
- **dec-20251107T153800Z-tool-design**: Granular tool design
- **dec-20251107T154000Z-prompts-for-workflows**: Guided prompt workflows

### Caching Strategy

- **Projects/Branches**: Cached (TTL: 300s default)
- **Builds**: Not cached (dynamic data)
- **Cache Control**: Use `clear_cache` tool or restart server

## Contributing

Contributions are welcome! Please:

1. Follow existing code style (use `npm run format`)
2. Add tests for new features
3. Update documentation (README, Runbook, DECISIONS.md)
4. Document issues in Troubleshooting.md

## Documentation

- **[Runbook](./docs/Runbook.md)**: Canonical setup and usage guide
- **[Decisions](./docs/DECISIONS.md)**: Architectural decision records
- **[Troubleshooting](./docs/Troubleshooting.md)**: Known issues and solutions
- **[Docs Index](./docs/Docs-Index.md)**: External documentation links

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Links

- **Odoo.sh Documentation**: https://www.odoo.com/documentation/17.0/administration/odoo_sh.html
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **MCP TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk

---

**Maintained by**: Odoo MCP Server Contributors  
**Version**: 0.1.0
