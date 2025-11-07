# Odoo.sh MCP Server

> 🚀 SSH-based Model Context Protocol server for Odoo.sh - Build custom apps with AI assistance using Git workflow tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![GitHub Issues](https://img.shields.io/github/issues/DalahmasDev/odoo-sh-mcp-server)](https://github.com/DalahmasDev/odoo-sh-mcp-server/issues)
[![GitHub Stars](https://img.shields.io/github/stars/DalahmasDev/odoo-sh-mcp-server?style=social)](https://github.com/DalahmasDev/odoo-sh-mcp-server)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## ✨ Features

### Core Operations (v1.0)
- **🔐 SSH-Based Access**: Secure connection via SSH keys (no API token needed)
- **🌿 Branch Operations**: View branches, get current branch, commit history
- **🏗️ Build Management**: Trigger builds, monitor status, view logs
- **💾 Database Access**: List PostgreSQL databases and sizes
- **💻 System Monitoring**: Hostname, uptime, disk, memory, versions
- **🐍 Odoo Shell**: Execute Python code in Odoo environment

### 🆕 Git Workflow & App Development (NEW in v1.0)
- **📁 File Management**: Create, read, update files with base64 encoding
- **📂 Directory Operations**: Create directory structures for modules
- **📖 Git Status**: Check modified, staged, and untracked files
- **➕ Git Add**: Stage files for commit (single or multiple)
- **✅ Git Commit**: Commit changes with custom messages
- **🚀 Git Push**: Push commits to remote Odoo.sh repository
- **🌿 Git Checkout**: Switch branches or create new feature branches
- **🔄 Git Pull**: Sync changes from remote
- **🛠️ AI-Assisted Development**: Let AI agents build complete Odoo modules

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
- **Odoo.sh Account** with SSH access
- **OpenSSH** client installed (included in Windows 10+, macOS, Linux)
- **MCP Client** (Warp, Claude Desktop, Cline, Continue, etc.)

### Steps

1. **Clone or download this repository**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up SSH access**:
   - Add your SSH public key to Odoo.sh (Settings → Collaborators → SSH Keys)
   - Get your build ID and hostname from Odoo.sh (format: `BUILD_ID@project-name.dev.odoo.com`)
   - Save your private key to a secure location

4. **Build the project**:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Create a `.env` file or set environment variables:

```env
ODOO_SH_SSH_HOST=project-name.dev.odoo.com
ODOO_SH_SSH_USER=BUILD_ID              # e.g., 25357858
ODOO_SH_SSH_KEY_PATH=/path/to/ssh/key  # Absolute path to private key
ODOO_SH_SSH_PORT=22                    # Optional: default 22
ODOO_SH_SSH_PASSPHRASE=                # Optional: if key has passphrase
SSH_TIMEOUT=30000                      # Optional: milliseconds
LOG_LEVEL=info                         # Optional: debug, info, warn, error
```

**🔐 Security Tip**: Never commit your private SSH key. Use absolute paths and secure permissions (chmod 600).

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
        "ODOO_SH_SSH_HOST": "project-name.dev.odoo.com",
        "ODOO_SH_SSH_USER": "BUILD_ID",
        "ODOO_SH_SSH_KEY_PATH": "/absolute/path/to/ssh/key"
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
        "ODOO_SH_SSH_HOST": "${env:ODOO_SH_SSH_HOST}",
        "ODOO_SH_SSH_USER": "${env:ODOO_SH_SSH_USER}",
        "ODOO_SH_SSH_KEY_PATH": "${env:ODOO_SH_SSH_KEY_PATH}"
      }
    }
  }
}
```

**Note**: Use absolute paths to `dist/index.js`.

## Usage

Once configured, your AI assistant can use Odoo.sh tools directly:

### Example Interactions

#### Basic Operations

**Check project info**:
```
"Show me my Odoo.sh project information"
```

**Check build status**:
```
"What's the status of recent builds?"
```

**View build logs**:
```
"Show me the recent Odoo logs"
```

#### Building Custom Apps (NEW)

**Create a new Odoo module**:
```
"Create a new custom Odoo module called 'my_custom_app' with the basic structure"
```

The AI agent can:
1. Create directory structure: `my_custom_app/`, `my_custom_app/models/`, etc.
2. Create `__init__.py`, `__manifest__.py` files
3. Create model files with Python code
4. Create XML view files
5. Stage all files with `git add`
6. Commit with descriptive message
7. Push to trigger Odoo.sh build

**Modify existing module**:
```
"Add a new field 'phone' to the Partner model in my_custom_app"
```

**Complete development workflow example**:
```
"I want to build a customer feedback module:
1. Create module structure for 'customer_feedback'
2. Add a Feedback model with fields: customer_id, rating, comment, date
3. Create list and form views
4. Add menu items
5. Commit and push to main branch"
```

## Available Tools

The server provides 19 tools for Odoo.sh operations via SSH, including complete Git workflow support for building custom apps:

### Project & Branches
- **`get_project_info`**: Get project information including branch list
  - Returns: project name, repository, list of branches
  - **💡 Use this to list branches** (recommended over `list_branches`)
- **`get_current_branch`**: Get the currently checked out branch
  - Returns: current branch name
- **`list_branches`**: List branches with commit info
  - Returns: branch names with last commit hash and message
  - ⚠️ Known issue: May not work in some MCP clients (use `get_project_info` instead)

### Builds
- **`get_build_history`**: Get commit/build history for a branch
  - Parameters: `branch` (e.g., "main"), `limit` (default: 10)
  - Returns: commit hash, author, date, message
- **`trigger_build`**: Trigger a new build by creating empty commit
  - Parameters: `branch`
  - Returns: git push output

### Database
- **`list_databases`**: List all PostgreSQL databases
  - Returns: database names and sizes

### Logs & Shell
- **`get_logs`**: Get Odoo logs from the server
  - Parameters: `log_type` ("odoo", "install", "pip"), `lines` (default: 100)
  - Returns: log entries with timestamps
- **`execute_odoo_shell`**: Execute Python code in Odoo shell
  - Parameters: `python_code`
  - Returns: shell output

### System
- **`get_system_info`**: Get system information
  - Returns: hostname, uptime, disk usage, memory, Python version, Odoo version

### Git Workflow & File Management (NEW - for building custom apps)
- **`git_status`**: Get git status showing modified, staged, and untracked files
  - Returns: git status output
- **`write_file`**: Create or update a file with given content
  - Parameters: `filePath` (relative to `~/src/user`), `content`
  - Returns: success message
  - **💡 Uses base64 encoding** to safely transfer file content via SSH
- **`read_file`**: Read the contents of a file
  - Parameters: `filePath` (relative to `~/src/user`)
  - Returns: file content
- **`list_files`**: List files and directories in a path
  - Parameters: `dirPath` (optional, default: `.`, relative to `~/src/user`)
  - Returns: `ls -la` output
- **`create_directory`**: Create a directory (including parent directories)
  - Parameters: `dirPath` (relative to `~/src/user`)
  - Returns: success message
- **`git_add`**: Stage files for commit
  - Parameters: `files` (array of file paths or `.` for all)
  - Returns: git add output
- **`git_commit`**: Commit staged changes
  - Parameters: `message`
  - Returns: git commit output
- **`git_push`**: Push commits to remote repository
  - Parameters: `branch` (optional, defaults to current branch)
  - Returns: git push output
- **`git_checkout`**: Switch to a branch or create a new branch
  - Parameters: `branch`, `createNew` (optional, default: false)
  - Returns: git checkout output
- **`git_pull`**: Pull changes from remote repository
  - Returns: git pull output

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

**1. SSH Connection Failed**
```
Error: SSH connection error
```
**Solution**: 
- Verify SSH key path is correct and absolute
- Check key permissions: `chmod 600 /path/to/key` (Unix) or `icacls` (Windows)
- Verify hostname format: `BUILD_ID@project-name.dev.odoo.com`
- Test manually: `ssh -i /path/to/key BUILD_ID@host`

**2. list_branches Tool Not Working in Warp**
```
Empty response from list_branches
```
**Solution**: Use `get_project_info` instead - it returns the branch list and works reliably in all MCP clients.

**3. Antivirus Blocking SSH Commands (Windows)**
```
Bitdefender: Malicious command line detected
```
**Solution**: Whitelist the SSH command or the project directory in your antivirus settings.

**4. Server Not Appearing**
- Verify JSON syntax in MCP client config
- Check absolute path to `dist/index.js`
- Verify environment variables are set
- Restart MCP client

**5. Module Not Found**
```
Error: Cannot find module '@modelcontextprotocol/sdk/server/index.js'
```
**Solution**: Run `npm install` and `npm run build`

See [docs/Troubleshooting.md](./docs/Troubleshooting.md) for more issues and solutions.

## Architecture

### Technology Stack

- **Runtime**: Node.js >= 18.0.0
- **Language**: TypeScript 5.3
- **Protocol**: Model Context Protocol (MCP)
- **SSH Client**: OpenSSH (subprocess)
- **Validation**: Zod
- **Transport**: stdio

### Design Decisions

Key architectural decisions are documented in [docs/DECISIONS.md](./docs/DECISIONS.md) and [docs/SSH-MIGRATION.md](./docs/SSH-MIGRATION.md):

- **dec-20251107T160000Z-ssh-over-api**: SSH-based access instead of REST API
- Why OpenSSH subprocess was chosen over Node.js ssh2 library
- How Windows % escaping issues were resolved
- Git command optimization for performance

## Contributing

Contributions are welcome! Please:

1. Follow existing code style (use `npm run format`)
2. Add tests for new features
3. Update documentation (README, Runbook, DECISIONS.md)
4. Document issues in Troubleshooting.md

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Links

- **Odoo.sh Documentation**: https://www.odoo.com/documentation/17.0/administration/odoo_sh.html
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **MCP TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk

---

**Maintained by**: Odoo MCP Server Contributors  
**Version**: 0.1.0
