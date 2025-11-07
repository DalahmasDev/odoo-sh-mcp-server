# SSH Setup & Testing Guide

## Quick Setup Checklist

### 1. Environment Configuration

Copy and edit `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your Odoo.sh SSH details:
```env
ODOO_SH_SSH_HOST=your-project.odoo.sh
ODOO_SH_SSH_USER=your_username
ODOO_SH_SSH_KEY_PATH=C:\Users\YourName\.ssh\id_rsa
```

### 2. Test SSH Connection Manually

```bash
# Test basic connectivity
ssh -i ~/.ssh/id_rsa username@your-project.odoo.sh

# Test command execution (from outside)
ssh -i ~/.ssh/id_rsa username@your-project.odoo.sh "git --version"
ssh -i ~/.ssh/id_rsa username@your-project.odoo.sh "git branch -a"
```

### 3. Warp MCP Configuration (JSON)

For **Windows** with PowerShell:
```json
{
  "mcpServers": {
    "odoo-sh": {
      "command": "node",
      "args": [
        "D:\\Dalahmas\\Warp-Projects\\Odoo.sh MCP\\dist\\index.js"
      ],
      "env": {
        "ODOO_SH_SSH_HOST": "your-project.odoo.sh",
        "ODOO_SH_SSH_USER": "your_username",
        "ODOO_SH_SSH_KEY_PATH": "C:\\Users\\kokok\\.ssh\\id_rsa"
      }
    }
  }
}
```

For **macOS/Linux**:
```json
{
  "mcpServers": {
    "odoo-sh": {
      "command": "node",
      "args": [
        "/path/to/Odoo.sh MCP/dist/index.js"
      ],
      "env": {
        "ODOO_SH_SSH_HOST": "your-project.odoo.sh",
        "ODOO_SH_SSH_USER": "your_username",
        "ODOO_SH_SSH_KEY_PATH": "/home/yourname/.ssh/id_rsa"
      }
    }
  }
}
```

### 4. SSH Key Permissions (Important!)

**Windows (PowerShell as Administrator)**:
```powershell
# Remove inheritance and grant only current user read permission
icacls $env:USERPROFILE\.ssh\id_rsa /inheritance:r /grant:r "$env:USERNAME`:R"
```

**macOS/Linux**:
```bash
chmod 600 ~/.ssh/id_rsa
chmod 700 ~/.ssh
```

### 5. Finding Your Odoo.sh SSH Details

1. Log into Odoo.sh web interface
2. Select your project
3. Go to a branch (e.g., production, staging)
4. Look for **SSH connection string** (usually in settings or connection info)
   - Format: `username@project-id.odoo.sh`
   - Or custom: `username@custom-domain.odoo.sh`

### 6. Adding SSH Key to Odoo.sh

If you haven't added your SSH public key to Odoo.sh:

1. Generate key (if needed):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

2. Get your public key:
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

3. Add to Odoo.sh:
   - Go to Odoo.sh project settings
   - Find SSH keys section
   - Paste your public key

## Testing the MCP Server

### Test 1: Direct Execution

```bash
# Set environment variables
$env:ODOO_SH_SSH_HOST="your-project.odoo.sh"
$env:ODOO_SH_SSH_USER="your_username"
$env:ODOO_SH_SSH_KEY_PATH="C:\Users\kokok\.ssh\id_rsa"

# Run the server (should show "running on stdio")
node dist/index.js
```

Expected output:
```
Odoo.sh MCP Server running on stdio
```

### Test 2: Available Tools

Once connected via Warp MCP, ask:
```
"What Odoo.sh tools are available?"
```

Should see 9 tools:
- get_project_info
- list_branches
- get_current_branch
- get_build_history
- trigger_build
- list_databases
- get_logs
- execute_odoo_shell
- get_system_info

### Test 3: Simple Command

Try a basic operation:
```
"Show me the current Odoo.sh branch"
```

or

```
"List all branches in this Odoo.sh project"
```

## Troubleshooting

### Error: "Permission denied (publickey)"
- **Cause**: SSH key not added to Odoo.sh or wrong key path
- **Fix**: Verify key path in `.env`, ensure public key added to Odoo.sh

### Error: "Failed to read private key"
- **Cause**: File not found or permissions issue
- **Fix**: Check file exists at path, verify permissions (Windows: `icacls`, Linux/Mac: `chmod 600`)

### Error: "All configured authentication methods failed"
- **Cause**: Multiple possible (wrong host, wrong user, wrong key, key permissions)
- **Fix**: Test SSH manually first: `ssh -i ~/.ssh/id_rsa user@host`

### Error: "Command failed with exit code 127"
- **Cause**: Command not available on remote system
- **Fix**: Verify you're connected to correct Odoo.sh environment with expected tools (git, psql, odoo-bin)

### Error: "Connection timeout"
- **Cause**: Network issue or wrong host
- **Fix**: Verify host is reachable, check network/firewall, increase `SSH_TIMEOUT` in `.env`

## Next Steps

Once connection is working:

1. **Try prompts**:
   - `check_build_status`
   - `deploy_workflow` (with branch parameter)
   - `investigate_errors`

2. **Explore tools**:
   - `get_logs` - View Odoo logs
   - `get_system_info` - System status
   - `list_databases` - Available databases

3. **Advanced usage**:
   - `execute_odoo_shell` - Run Python in Odoo environment

## Security Reminders

- ✅ Never commit `.env` file
- ✅ Use proper key permissions (600 on Linux/Mac)
- ✅ Consider using passphrase-protected keys
- ✅ Store passphrase in password manager (use dynamic env var)
