# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an **Odoo.sh MCP (Model Context Protocol) Server** that enables AI assistants to interact with Odoo.sh infrastructure via **SSH** through standardized MCP protocol. It's built with TypeScript/Node.js and provides tools for managing Git branches, viewing logs, executing Odoo shell commands, and monitoring system status.

## Core Commands

### Build & Development
```bash
# Build TypeScript to JavaScript (required before first run)
npm run build

# Development mode with auto-rebuild on changes
npm run dev

# Start the compiled server
npm start

# Direct execution (for testing)
node dist/index.js
```

### Testing & Quality
```bash
# Run tests
npm test

# Watch mode for tests
npm run test:watch

# Lint TypeScript code
npm run lint

# Format code with Prettier
npm run format
```

### Environment Setup
```bash
# Copy example environment file
cp .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env
```

## Architecture

### High-Level Structure

The project follows a **layered architecture**:

1. **MCP Server Layer** (`src/index.ts`): 
   - Implements Model Context Protocol server
   - Registers 9 tools (get_project_info, list_branches, get_current_branch, get_build_history, trigger_build, list_databases, get_logs, execute_odoo_shell, get_system_info)
   - Exposes 1 resource (`odoo://project`)
   - Provides 3 guided prompts (check_build_status, deploy_workflow, investigate_errors)
   - Uses stdio transport for communication with MCP clients

2. **SSH Client Layer** (`src/odoo-ssh-client.ts`):
   - Executes commands via SSH using ssh2 library
   - Handles authentication via SSH private key
   - Parses command output (Git, logs, database queries)
   - No caching (direct SSH execution each time)
   - Provides real-time access to Odoo.sh environment

### Key Design Patterns

- **Environment Validation**: Uses Zod schemas for runtime environment variable validation
- **SSH Connection**: Creates new connection per command execution, reads private key from filesystem
- **Error Handling**: Captures SSH errors, command exit codes, and stderr output
- **Type Safety**: Full TypeScript with strict mode, exported interfaces for SSH responses
- **ES Modules**: Uses Node16 module resolution with .js extensions in imports
- **Command Execution**: Runs shell commands via SSH (git, psql, tail, odoo-bin)

### Important Architectural Decisions

Documented in `docs/DECISIONS.md`:
- **dec-20251107T152800Z-mcp-framework**: Why MCP over REST/CLI
- **dec-20251107T153000Z-typescript-nodejs**: Why TypeScript/Node.js
- **dec-20251107T160000Z-ssh-over-api**: Why SSH instead of REST API (Odoo.sh doesn't provide public API)
- **dec-20251107T153800Z-tool-design**: Granular tool design philosophy
- **dec-20251107T154000Z-prompts-for-workflows**: Guided prompt workflows

## Development Practices

### Adding New Tools

When adding a new MCP tool:

1. **Add tool definition** in `ListToolsRequestSchema` handler (src/index.ts)
   - Include name, description, and inputSchema (JSON Schema)
   - Use descriptive names: `verb_noun` pattern (e.g., `get_branch`, `list_builds`)

2. **Implement handler** in `CallToolRequestSchema` handler
   - Extract typed parameters from `args`
   - Call corresponding OdooShClient method
   - Return formatted JSON response
   - Wrap in try-catch for error handling

3. **Add API method** to OdooShClient (src/odoo-client.ts)
   - Consider caching strategy (use `cachedRequest` for static data)
   - Define TypeScript interfaces for request/response
   - Handle errors via axios interceptor

### Security Best Practices

- **NEVER expose SSH private keys** - store them securely with proper permissions:
  ```bash
  # Set proper permissions on private key (macOS/Linux)
  chmod 600 ~/.ssh/id_rsa
  
  # On Windows, use icacls to restrict access
  icacls $env:USERPROFILE\.ssh\id_rsa /inheritance:r /grant:r "$env:USERNAME:R"
  ```

- **Use SSH key passphrases** - retrieve from password manager via dynamic env vars:
  ```bash
  # Good: Retrieve passphrase securely
  ODOO_SH_SSH_PASSPHRASE=$(pass show odoo/ssh-passphrase)
  ```

- **Environment variables are validated** on startup using Zod schemas
- **SSH connections** are created per-command and immediately closed
- **.env files** are in .gitignore and never committed

### Testing Approach

- Test files in `tests/` directory
- Use Jest for testing framework
- Mock Odoo.sh API responses for unit tests
- Test error handling paths (401, 403, 404, 429, 500)

### TypeScript Configuration

- **Target**: ES2022 with Node16 modules
- **Strict mode**: Enabled (full type checking)
- **Output**: `dist/` directory (gitignored)
- **Source maps**: Generated for debugging
- **Import extensions**: Must use `.js` extension for ES modules (e.g., `import { X } from './file.js'`)

## Common Tasks

### Debugging MCP Server

The server communicates via stdio, logs go to stderr:
```bash
# Check if server is running
node dist/index.js
# Expected: "Odoo.sh MCP Server running on stdio"
```

### Testing SSH Connection
```bash
# Test SSH connection manually
ssh -i ~/.ssh/id_rsa username@project.odoo.sh

# Test command execution
ssh -i ~/.ssh/id_rsa username@project.odoo.sh "git branch -a"
```

### Viewing Logs
Use the `get_logs` tool to retrieve Odoo logs (odoo.log, install.log, pip.log).

### Adding a New Guided Prompt

1. Add to `ListPromptsRequestSchema` handler with name, description, and arguments
2. Implement in `GetPromptRequestSchema` handler with structured guidance text
3. Update README.md prompts section

## Configuration

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `ODOO_SH_SSH_HOST` | ✅ Yes | - | SSH host (e.g., project.odoo.sh) |
| `ODOO_SH_SSH_PORT` | No | `22` | SSH port |
| `ODOO_SH_SSH_USER` | ✅ Yes | - | SSH username |
| `ODOO_SH_SSH_KEY_PATH` | ✅ Yes | - | Path to SSH private key |
| `ODOO_SH_SSH_PASSPHRASE` | No | - | SSH key passphrase (if encrypted) |
| `SSH_TIMEOUT` | No | `30000` | SSH connection timeout (milliseconds) |
| `LOG_LEVEL` | No | `info` | Logging verbosity (debug/info/warn/error) |

### MCP Client Setup

The server must be registered in your MCP client config. Absolute paths required:

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "odoo-sh": {
      "command": "node",
      "args": ["D:\\Dalahmas\\Warp-Projects\\Odoo.sh MCP\\dist\\index.js"],
      "env": {
        "ODOO_SH_SSH_HOST": "your-project.odoo.sh",
        "ODOO_SH_SSH_USER": "your_username",
        "ODOO_SH_SSH_KEY_PATH": "C:\\Users\\YourName\\.ssh\\id_rsa"
      }
    }
  }
}
```

## Project Documentation

- **docs/Runbook.md**: Canonical setup and operational guide
- **docs/DECISIONS.md**: Architectural decision records (ADR)
- **docs/Troubleshooting.md**: Known issues and solutions
- **docs/Docs-Index.md**: External documentation references
- **README.md**: User-facing documentation and quick start

## File Organization

```
├── src/
│   ├── index.ts              # MCP server implementation (tools, resources, prompts)
│   └── odoo-ssh-client.ts    # SSH client (command execution, output parsing)
├── tests/                    # Jest test files
│   └── odoo-client.test.ts   # (needs updating for SSH)
├── docs/                     # Project documentation
│   ├── Runbook.md
│   ├── DECISIONS.md
│   ├── Troubleshooting.md
│   └── Docs-Index.md
├── dist/                     # Compiled JavaScript (gitignored)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment template
└── .env                      # Local environment (gitignored)
```

## Important Notes

- **Node.js >= 18.0.0 required** for ES modules support
- **Always rebuild** after TypeScript changes: `npm run build`
- **MCP communication** is via stdio - no HTTP endpoints
- **SSH connections** are created per-command and immediately closed
- **Build artifacts** (`dist/`) are gitignored, must rebuild on clone
- **No caching** - all data retrieved fresh via SSH each time
- **Requires valid SSH credentials** - private key with appropriate permissions

## External References

- **Odoo.sh Documentation**: https://www.odoo.com/documentation/17.0/administration/odoo_sh.html
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **MCP TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
