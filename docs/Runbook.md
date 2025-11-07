# Runbook: Odoo.sh MCP Server

Canonical guide for setting up and running the Odoo.sh MCP server.

## Supported Environments

- **OS**: Windows (PowerShell), macOS (zsh/bash), Linux (bash)
- **Node.js**: >= 18.0.0
- **MCP Clients**: Claude Desktop, Cline, Continue, or any MCP-compatible client

## Prerequisites

### Required Tools
- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Odoo.sh API Token** (see [Obtaining API Token](#obtaining-api-token))

### Obtaining API Token

1. Log in to your Odoo.sh project: `https://www.odoo.sh/project/YOUR_PROJECT`
2. Navigate to **Settings** tab
3. Find **API Access** section
4. Generate or copy your API token
5. **Important**: Store this token securely (see [Environment Configuration](#environment-configuration))

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

**Option A: Dynamic Environment Variables (Recommended for Warp)**

Create a dynamic environment variable in Warp to securely retrieve your token:

```bash
# Example using a password manager
ODOO_SH_API_TOKEN=$(pass show odoo/api-token)

# Example using macOS Keychain
ODOO_SH_API_TOKEN=$(security find-generic-password -a odoo-api -w)

# Example using Windows Credential Manager (PowerShell)
$ODOO_SH_API_TOKEN=$(cmdkey /list:odoo-api | Select-String "Password").ToString().Split(":")[1].Trim()
```

**Option B: Standard Environment Variables**

Copy the example file and configure:

```bash
cp .env.example .env
```

Edit `.env` and set your token:
```
ODOO_SH_API_TOKEN=your_actual_token_here
```

**⚠️ Security Warning**: Never commit `.env` files or echo tokens to console.

### 3. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 4. Configure MCP Client

Add the server to your MCP client configuration.

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "odoo-sh": {
      "command": "node",
      "args": [
        "D:\\Dalahmas\\Warp-Projects\\Odoo.sh MCP\\dist\\index.js"
      ],
      "env": {
        "ODOO_SH_API_TOKEN": "your_token_or_command_here"
      }
    }
  }
}
```

**Cline** (VSCode extension settings):
```json
{
  "cline.mcpServers": {
    "odoo-sh": {
      "command": "node",
      "args": ["D:\\Dalahmas\\Warp-Projects\\Odoo.sh MCP\\dist\\index.js"],
      "env": {
        "ODOO_SH_API_TOKEN": "${env:ODOO_SH_API_TOKEN}"
      }
    }
  }
}
```

## Running the Server

### Development Mode (with auto-rebuild)

```bash
npm run dev
```

This watches for TypeScript changes and recompiles automatically.

### Production Mode

```bash
npm start
```

Runs the compiled server from `dist/index.js`.

### Direct Execution

```bash
node dist/index.js
```

The server communicates via stdio and will log to stderr:
```
Odoo.sh MCP Server running on stdio
```

## Verification

### Test MCP Server

The server is running correctly when your MCP client recognizes it. Verify by:

1. **Check Server Registration**: Ensure your MCP client shows "odoo-sh" in available servers
2. **List Tools**: Ask your AI assistant to list available Odoo.sh tools (should show 10 tools)
3. **Test Basic Operation**: Try `list_projects` tool to fetch your projects

### Expected Output

**Tools** (10 total):
- `list_projects`
- `get_project`
- `list_branches`
- `get_branch`
- `list_builds`
- `get_build`
- `trigger_build`
- `get_build_log`
- `get_database_info`
- `clear_cache`

**Resources** (1 total):
- `odoo://projects` - All accessible projects

**Prompts** (2 total):
- `check_build_status` - Monitor build status
- `deploy_workflow` - Guided deployment

### Troubleshooting Connection

If tools don't appear:

1. **Check Node.js version**: `node --version` (must be >= 18.0.0)
2. **Verify build**: Ensure `dist/index.js` exists
3. **Check API token**: Test token with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://www.odoo.sh/api/projects
   ```
4. **Review client logs**: Check your MCP client's error logs
5. **Restart client**: Restart your MCP client after configuration changes

See [Troubleshooting.md](./Troubleshooting.md) for known issues.

## Environment Matrix

### Local Development
- **Node**: System Node.js
- **Config**: `.env` file or dynamic env vars
- **Port**: N/A (stdio communication)

### Production/CI
- **Node**: Specified in `package.json` engines
- **Config**: Environment variables (never files in version control)
- **Port**: N/A (stdio communication)

## Cleanup / Rollback

### Stop Server
The server runs as part of your MCP client. Stop the client to stop the server.

### Clear Cache
Use the `clear_cache` tool via your MCP client, or restart the server (cache is in-memory).

### Remove Configuration
Delete or comment out the server entry in your MCP client config.

### Uninstall
```bash
# Remove node_modules
rm -rf node_modules

# Remove build artifacts
rm -rf dist
```

## Change Impact

When this runbook changes, also update:

- **README.md** - Quick start section
- **Troubleshooting.md** - Add new known issues
- **.env.example** - Update configuration options
- **DECISIONS.md** - Document decision rationale

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ODOO_SH_API_TOKEN` | ✅ Yes | - | Odoo.sh API authentication token |
| `ODOO_SH_API_URL` | No | `https://www.odoo.sh/api` | API base URL |
| `LOG_LEVEL` | No | `info` | Logging level (debug, info, warn, error) |
| `API_TIMEOUT` | No | `30000` | API request timeout (milliseconds) |
| `ENABLE_CACHE` | No | `true` | Enable in-memory caching |
| `CACHE_TTL` | No | `300` | Cache time-to-live (seconds) |

### Tool Parameter Types

All tools expect numeric IDs:
- `project_id`: number
- `branch_id`: number
- `build_id`: number

## Common Workflows

### Check Build Status
```
Use prompt: check_build_status
Parameters: project_id=123
```

### Deploy to Production
```
Use prompt: deploy_workflow
Parameters: project_id=123, environment=production
```

### Manual Operations
1. List projects: `list_projects` (no parameters)
2. Get project details: `get_project(project_id=123)`
3. Trigger build: `trigger_build(project_id=123, branch_id=456)`
4. View build log: `get_build_log(project_id=123, branch_id=456, build_id=789)`

---

**Related Documentation**:
- [DECISIONS.md](./DECISIONS.md) - Architectural decisions
- [Troubleshooting.md](./Troubleshooting.md) - Known issues and solutions
- [Docs-Index.md](./Docs-Index.md) - External references
