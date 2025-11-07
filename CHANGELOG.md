# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-07

### Added
- **SSH-based architecture** replacing API-based approach
- **10 new Git workflow tools** for custom app development:
  - `git_status` - Check modified, staged, and untracked files
  - `write_file` - Create/update files with base64 encoding
  - `read_file` - Read file contents
  - `list_files` - List directory contents
  - `create_directory` - Create directories
  - `git_add` - Stage files for commit
  - `git_commit` - Commit staged changes
  - `git_push` - Push to remote repository
  - `git_checkout` - Switch/create branches
  - `git_pull` - Pull changes from remote
- **Comprehensive documentation**:
  - `docs/App-Development-Guide.md` - 469-line guide for building Odoo apps
  - `docs/SETUP-SSH.md` - SSH setup instructions
  - `docs/SSH-MIGRATION.md` - Migration notes from API to SSH
  - `docs/WARP.md` - Warp terminal integration guide
- **19 total MCP tools** (9 original + 10 new)
- OpenSSH subprocess implementation for reliable SSH connections
- Base64 file encoding for safe content transfer

### Changed
- **Breaking**: Replaced API-based client with SSH-based client
- **Breaking**: Changed environment variables to SSH credentials format
- Updated README with Git workflow examples and 19 tools
- Reorganized all documentation into `docs/` directory
- Updated `.gitignore` to exclude SSH keys and sensitive config
- Improved error handling and logging

### Removed
- API-based `odoo-client.ts` (replaced with `odoo-ssh-client.ts`)
- ssh2 library dependency (OpenSSH subprocess used instead)
- axios dependency (no longer needed without API)

### Fixed
- SSH connection issues with Odoo.sh's custom SSH implementation
- Windows cmd.exe shell escaping problems
- Bitdefender antivirus blocking (documented workaround)
- `list_branches` tool in Warp MCP client (documented workaround)

### Technical Details
- **SSH Connection Format**: `BUILD_ID@hostname`
- **Working Directory**: `~/src/user` for custom app code
- **Implementation**: Node.js `child_process.exec` with OpenSSH
- **File Transfer**: Base64 encoding to avoid shell escaping issues

## [0.1.0] - Initial Release (API-based)

### Added
- Initial MCP server implementation
- API-based Odoo.sh client
- 9 core tools:
  - `get_project_info`
  - `get_current_branch`
  - `list_branches`
  - `get_build_history`
  - `trigger_build`
  - `list_databases`
  - `get_logs`
  - `execute_odoo_shell`
  - `get_system_info`
- Basic documentation structure
- TypeScript configuration
- Jest test setup

### Known Issues
- ssh2 library incompatible with Odoo.sh SSH implementation
- No file management or Git workflow tools
- Limited app development capabilities

---

## Upcoming Features

### Planned for v1.1.0
- Odoo module scaffolding tool
- Multi-project support
- Enhanced test coverage
- GitHub Actions CI/CD

### Under Consideration
- Database backup/restore tools
- Advanced Git operations (merge, rebase, cherry-pick)
- Odoo.sh branch management (create, delete)
- Performance monitoring tools
- Module dependency analyzer

---

**Note**: This is the first stable release (v1.0.0) with SSH-based architecture and full Git workflow support.
