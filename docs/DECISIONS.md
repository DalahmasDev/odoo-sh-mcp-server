# Decisions

Append-only record of architectural and implementation decisions for the Odoo.sh MCP server project.

---

## dec-20251107T152800Z-mcp-framework

**Title**: Model Context Protocol as Integration Framework

**Context**: Need to enable AI assistants to interact with Odoo.sh infrastructure. Several integration approaches possible: REST API wrapper, CLI tool, or MCP server.

**Options**:
1. **REST API wrapper** - Standard HTTP API service
2. **CLI tool** - Command-line interface
3. **MCP server** - Model Context Protocol server

**Decision**: MCP server (Option 3)

**Rationale**:
- MCP provides standardized protocol for AI assistant integration
- Supports tools (direct actions), resources (structured data), and prompts (guided workflows)
- Better suited for AI-driven interactions than traditional APIs
- Growing ecosystem with clients like Claude Desktop, Cline, Continue

**Consequences**:
- Requires MCP SDK (`@modelcontextprotocol/sdk`)
- Communication via stdio transport
- AI assistants can directly interact with Odoo.sh
- Limited to MCP-compatible clients

**Links**: package.json, src/index.ts

**Status**: accepted

**Tags**: architecture, mcp, integration

---

## dec-20251107T153000Z-typescript-nodejs

**Title**: TypeScript with Node.js Runtime

**Context**: Need to choose implementation language and runtime for MCP server.

**Options**:
1. **TypeScript with Node.js** - Type-safe JavaScript
2. **Python** - Alternative MCP SDK available
3. **Go** - Compiled language option

**Decision**: TypeScript with Node.js (Option 1)

**Rationale**:
- Strong typing with TypeScript prevents runtime errors
- MCP SDK has excellent TypeScript support
- Large ecosystem for HTTP clients (axios)
- Good validation libraries (zod)
- ES modules support in Node 18+
- Familiar to web developers

**Consequences**:
- Requires Node.js >= 18.0.0
- Build step required (TypeScript compilation)
- Strong type safety throughout codebase
- Better IDE support and autocomplete

**Links**: tsconfig.json, package.json

**Status**: accepted

**Tags**: language, runtime, typescript

---

## dec-20251107T153200Z-api-token-auth

**Title**: Bearer Token Authentication for Odoo.sh API

**Context**: Need secure method to authenticate with Odoo.sh API. Must avoid exposing tokens in logs or command history.

**Options**:
1. **Environment variables** (plain) - Standard approach
2. **Dynamic environment variables** (Warp) - Command-based secret retrieval
3. **Config file** - .ini or .json configuration

**Decision**: Environment variables with dynamic Warp support (Option 2 preferred, Option 1 as fallback)

**Rationale**:
- Odoo.sh uses Bearer token authentication
- Dynamic env vars keep secrets out of .env files
- Compatible with Warp's security model
- Falls back to standard env vars for compatibility
- Tokens never echoed or logged
- Easy to rotate without code changes

**Consequences**:
- Users must configure ODOO_SH_API_TOKEN
- Recommend dynamic env vars in documentation
- .env.example provides setup guidance
- Token validation on startup
- API errors clearly indicate auth failures

**Links**: .env.example, src/odoo-client.ts, docs/Runbook.md

**Status**: accepted

**Tags**: security, authentication, secrets

---

## dec-20251107T153400Z-caching-strategy

**Title**: In-Memory Caching with Configurable TTL

**Context**: Odoo.sh API calls have latency. Projects and branches change infrequently, but builds change often.

**Options**:
1. **No caching** - Always fresh data
2. **In-memory cache with TTL** - Time-based invalidation
3. **Redis cache** - External cache service
4. **HTTP cache headers** - Rely on HTTP caching

**Decision**: In-memory cache with TTL (Option 2)

**Rationale**:
- Projects/branches rarely change (good candidates for caching)
- Builds change frequently (skip caching)
- In-memory is simple, no external dependencies
- TTL provides automatic invalidation (default 300s)
- Can be disabled via ENABLE_CACHE=false
- Manual clear_cache tool for immediate invalidation

**Consequences**:
- Cache is per-process (not shared)
- Memory usage increases with project count
- Stale data possible during TTL window
- No persistence across restarts
- Simple implementation, easy to debug

**Links**: src/odoo-client.ts (Cache class)

**Status**: accepted

**Tags**: performance, caching, optimization

---

## dec-20251107T153600Z-error-handling

**Title**: Comprehensive Error Handling with Specific Messages

**Context**: API calls can fail for many reasons. Users need actionable error messages.

**Options**:
1. **Pass through raw errors** - Expose underlying errors
2. **Generic error messages** - Simple consistent messages
3. **Status-code specific errors** - Detailed contextual errors

**Decision**: Status-code specific errors (Option 3)

**Rationale**:
- Different HTTP status codes have different meanings
- 401: Authentication issue - check token
- 403: Permission issue - check access
- 404: Resource not found - check IDs
- 429: Rate limiting - retry later
- Users can self-diagnose based on specific messages
- Maintains security (doesn't expose internals)

**Consequences**:
- Error handler maps status codes to user-friendly messages
- Network errors distinguished from API errors
- Error responses include `isError: true` flag
- Logging can be added for debugging
- Better user experience

**Links**: src/odoo-client.ts (handleError method)

**Status**: accepted

**Tags**: error-handling, ux, reliability

---

## dec-20251107T153800Z-tool-design

**Title**: Granular Tools for Each API Operation

**Context**: MCP tools should be well-scoped. Could combine operations or keep them separate.

**Options**:
1. **Monolithic tool** - Single "odoo_sh_api" tool with operation parameter
2. **Service-grouped tools** - One tool per service (projects, builds, etc.)
3. **Granular tools** - One tool per operation

**Decision**: Granular tools (Option 3)

**Rationale**:
- Each operation has distinct purpose and parameters
- Easier for AI to understand and use
- Better autocomplete and validation
- Clearer documentation
- Follows MCP best practices
- More composable in AI workflows

**Consequences**:
- More tools in tool list (10 tools total)
- Each tool has focused input schema
- Clear naming: list_projects, get_build, trigger_build
- Easy to add new operations
- Better error messages (per-tool validation)

**Links**: src/index.ts (TOOLS section)

**Status**: accepted

**Tags**: mcp, tools, api-design

---

## dec-20251107T154000Z-prompts-for-workflows

**Title**: Guided Prompts for Common Workflows

**Context**: Certain Odoo.sh tasks involve multiple steps. Users need guidance.

**Options**:
1. **No prompts** - Tools only
2. **Documentation only** - Written guides
3. **MCP prompts** - Interactive guided workflows

**Decision**: MCP prompts for common workflows (Option 3)

**Rationale**:
- check_build_status prompt guides through build monitoring
- deploy_workflow prompt walks through deployment steps
- AI can execute multi-step procedures
- Reduces user cognitive load
- Prompts can be extended for more workflows
- Combines tools with guidance

**Consequences**:
- Two initial prompts: check_build_status, deploy_workflow
- Prompts generate structured queries for AI
- Users can invoke by name with parameters
- More prompts can be added for other workflows
- Documentation should reference available prompts

**Links**: src/index.ts (PROMPTS section)

**Status**: accepted

**Tags**: mcp, prompts, ux, workflows

---
