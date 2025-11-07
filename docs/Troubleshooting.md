# Troubleshooting

Append-only ledger of known issues, symptoms, root causes, and solutions.

---

## Authentication Failed

**Context**: Connecting to Odoo.sh API from any environment

**Symptoms**:
```
Error: Authentication failed. Check your API token.
```

**Root Cause**: Invalid or missing `ODOO_SH_API_TOKEN` environment variable

**Fix**:
1. Verify token exists in environment:
   ```bash
   # PowerShell
   $env:ODOO_SH_API_TOKEN
   
   # Bash/Zsh
   echo $ODOO_SH_API_TOKEN
   ```
2. Test token with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://www.odoo.sh/api/projects
   ```
3. If invalid, regenerate token from Odoo.sh project settings
4. Update `.env` file or MCP client configuration

**Verification**:
- curl command returns JSON (not 401 error)
- MCP tools successfully list projects

**Related**: docs/Runbook.md (Environment Configuration)

**Tags**: auth, api, token

---

## Server Not Appearing in MCP Client

**Context**: After configuring server in Claude Desktop or Cline

**Symptoms**:
- "odoo-sh" server not listed in MCP client
- Tools not available to AI assistant
- No error messages

**Root Cause**: Multiple possible causes:
1. MCP client config has syntax error
2. Node.js path incorrect
3. Client not restarted after config change

**Fix**:
1. Validate JSON syntax in config file
2. Check absolute path to `dist/index.js`:
   ```powershell
   # PowerShell
   Test-Path "D:\Dalahmas\Warp-Projects\Odoo.sh MCP\dist\index.js"
   
   # Should return: True
   ```
3. Restart MCP client completely (quit and reopen)
4. Check client logs for errors

**Verification**:
- Server appears in MCP client's server list
- `list_projects` tool available

**Related**: docs/Runbook.md (Configure MCP Client)

**Tags**: mcp, client, config

---

## Module Not Found Error

**Context**: Running compiled server

**Symptoms**:
```
Error: Cannot find module '@modelcontextprotocol/sdk/server/index.js'
```

**Root Cause**: Dependencies not installed or build not completed

**Fix**:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build TypeScript:
   ```bash
   npm run build
   ```
3. Verify `dist/` directory exists with compiled files

**Verification**:
```bash
# Check dist folder
ls dist/

# Should see: index.js, odoo-client.js, and .d.ts files
```

**Related**: docs/Runbook.md (Setup)

**Tags**: build, dependencies, npm

---

## Rate Limit Exceeded

**Context**: Making multiple API calls in short time

**Symptoms**:
```
Error: Rate limit exceeded. Please try again later.
```

**Root Cause**: Odoo.sh API rate limiting triggered

**Fix**:
1. Wait 60 seconds before retrying
2. Enable caching to reduce API calls:
   ```
   ENABLE_CACHE=true
   CACHE_TTL=300
   ```
3. Use `list_builds` sparingly (not cached)

**Verification**:
- API calls succeed after waiting
- Cache hit rate improves (check with `clear_cache` then repeat calls)

**Related**: src/odoo-client.ts (Cache class), docs/DECISIONS.md (dec-20251107T153400Z-caching-strategy)

**Tags**: api, rate-limiting, caching

---

## Resource Not Found (404)

**Context**: Calling tools with project/branch/build IDs

**Symptoms**:
```
Error: Resource not found.
```

**Root Cause**: Invalid IDs or insufficient permissions

**Fix**:
1. Verify IDs by listing first:
   ```
   list_projects → get project_id
   list_branches(project_id) → get branch_id
   list_builds(project_id, branch_id) → get build_id
   ```
2. Check API token has access to the project
3. Ensure IDs are numbers, not strings

**Verification**:
- `list_projects` returns the project
- Subsequent calls with correct IDs succeed

**Related**: docs/Runbook.md (Tool Parameter Types)

**Tags**: api, permissions, ids

---

## Node.js Version Mismatch

**Context**: Installing or running project

**Symptoms**:
```
error: The engine "node" is incompatible with this module
```

**Root Cause**: Node.js version < 18.0.0

**Fix**:
1. Check Node.js version:
   ```bash
   node --version
   ```
2. Install Node.js >= 18.0.0 from https://nodejs.org/
3. Use nvm to manage versions (optional):
   ```bash
   nvm install 18
   nvm use 18
   ```

**Verification**:
```bash
node --version
# Should show: v18.x.x or higher
```

**Related**: package.json (engines), docs/Runbook.md (Prerequisites)

**Tags**: node, environment, version

---

## Cache Serving Stale Data

**Context**: Viewing project/branch data after recent changes

**Symptoms**:
- Changes made in Odoo.sh UI not reflected
- Build status outdated
- Branch list missing new branches

**Root Cause**: Cache TTL not expired

**Fix**:
1. Use `clear_cache` tool to force refresh
2. Reduce `CACHE_TTL` for faster updates:
   ```
   CACHE_TTL=60  # 1 minute instead of 5
   ```
3. Restart server (clears in-memory cache)

**Verification**:
- After `clear_cache`, next call returns fresh data
- Lower TTL results in more frequent API calls

**Related**: src/odoo-client.ts (cachedRequest method)

**Tags**: caching, data, staleness

---

## TypeScript Compilation Errors

**Context**: Running `npm run build`

**Symptoms**:
```
error TS2307: Cannot find module '@modelcontextprotocol/sdk/server/index.js'
```

**Root Cause**: Type definitions not installed

**Fix**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Ensure `tsconfig.json` has correct settings
3. Check TypeScript version:
   ```bash
   npx tsc --version
   # Should be ~5.3.0
   ```

**Verification**:
```bash
npm run build
# Should complete without errors
# dist/ folder created with .js files
```

**Related**: tsconfig.json, package.json (devDependencies)

**Tags**: typescript, build, compilation

---

## Environment Variables Not Loaded

**Context**: Running server with `.env` file

**Symptoms**:
```
ZodError: ODOO_SH_API_TOKEN is required
```

**Root Cause**: `.env` file not in project root or not loaded

**Fix**:
1. Verify `.env` file location:
   ```bash
   ls .env
   # Should exist in project root
   ```
2. Check `.env` file contents:
   ```bash
   cat .env | grep ODOO_SH_API_TOKEN
   # Should show: ODOO_SH_API_TOKEN=...
   ```
3. Ensure `dotenv` package installed:
   ```bash
   npm list dotenv
   ```
4. For MCP clients, set env vars in config (not `.env`)

**Verification**:
- Direct execution: `node dist/index.js` loads from `.env`
- MCP client: Check client config has env vars set

**Related**: .env.example, src/index.ts (dotenv.config)

**Tags**: env, config, dotenv

---

**Index**: Use Ctrl+F / Cmd+F to search by symptoms, tags, or error messages.
