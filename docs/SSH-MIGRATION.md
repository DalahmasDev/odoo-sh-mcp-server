# SSH Migration Summary

## Decision: dec-20251107T160000Z-ssh-over-api

**Title**: SSH-Based Architecture Instead of REST API

**Context**: Initial implementation assumed Odoo.sh provided a public REST API with token-based authentication. After investigation, discovered that Odoo.sh's primary interface is SSH access to individual project environments.

**Discovery**:
- Odoo.sh does NOT provide a public REST API
- Each project/branch has SSH access
- GitHub integration exists but only covers Git operations, not Odoo-specific features
- SSH provides full access to: Git, databases, logs, Odoo shell, system info

**Options**:
1. **REST API wrapper** - Not viable (no public API exists)
2. **GitHub MCP integration** - Limited scope (only Git, no Odoo operations)
3. **SSH-based MCP server** - Full access to Odoo.sh capabilities

**Decision**: SSH-based MCP server (Option 3)

**Rationale**:
- SSH is the official Odoo.sh access method
- Provides complete operational access:
  - Git operations (branches, commits, push to trigger builds)
  - Database access (psql commands)
  - Log viewing (~/logs/ directory)
  - Odoo shell execution (odoo-bin shell)
  - System monitoring (disk, memory, uptime)
- More powerful than hypothetical REST API would be
- Direct command execution = real-time, accurate data

**Implementation Changes**:
1. Replaced `axios` with `ssh2` library
2. Created `OdooShSSHClient` with command execution
3. Changed authentication from API tokens to SSH private keys
4. Updated all 9 tools to use SSH commands
5. Removed caching (not needed with direct SSH)

**Consequences**:
- **Pros**:
  - Real operational control over Odoo.sh environment
  - Can execute any shell command available to SSH user
  - Direct access to Odoo internals (odoo-bin shell)
  - No API rate limits or restrictions
  - More comprehensive than API would provide

- **Cons**:
  - Requires SSH key management
  - SSH connection overhead per command
  - Depends on command output parsing (less structured than JSON API)
  - User must have SSH access configured

**Migration Steps Completed**:
1. ✅ Updated package.json (ssh2, removed axios)
2. ✅ Created odoo-ssh-client.ts
3. ✅ Updated index.ts with SSH-based tools
4. ✅ Changed environment variables (SSH credentials)
5. ✅ Updated .env.example
6. ✅ Updated WARP.md
7. ⏳ Updating remaining documentation

**Links**: 
- src/odoo-ssh-client.ts
- src/index.ts
- .env.example
- docs/WARP.md

**Status**: accepted

**Tags**: architecture, ssh, odoo-sh, authentication

---

## New Tools (SSH-based)

1. **get_project_info** - Git remote URL and branches
2. **list_branches** - All branches with last commits
3. **get_current_branch** - Currently checked out branch
4. **get_build_history** - Commit history for a branch
5. **trigger_build** - Empty commit + push to trigger build
6. **list_databases** - PostgreSQL databases via psql
7. **get_logs** - Odoo logs (odoo.log, install.log, pip.log)
8. **execute_odoo_shell** - Run Python in Odoo environment
9. **get_system_info** - Hostname, uptime, disk, memory, versions

## Removed Tools

- list_projects (single SSH connection = single project)
- get_project (replaced by get_project_info)
- get_branch (merged into list_branches)
- get_build (replaced by get_build_history)
- get_build_log (replaced by get_logs)
- get_database_info (replaced by list_databases)
- clear_cache (no caching in SSH mode)
