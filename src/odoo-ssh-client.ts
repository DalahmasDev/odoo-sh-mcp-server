import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration schema
const ConfigSchema = z.object({
  host: z.string().min(1, 'SSH host is required'),
  port: z.number().positive().default(22),
  username: z.string().min(1, 'SSH username is required'),
  privateKeyPath: z.string().min(1, 'SSH private key path is required'),
  passphrase: z.string().optional(),
  timeout: z.number().positive().default(30000),
});

type Config = z.infer<typeof ConfigSchema>;

// Response types
export interface ProjectInfo {
  name: string;
  repository: string;
  branches: string[];
}

export interface BranchInfo {
  name: string;
  current: boolean;
  lastCommit: string;
  lastCommitMessage: string;
}

export interface BuildInfo {
  commit: string;
  author: string;
  date: string;
  message: string;
}

export interface DatabaseInfo {
  name: string;
  size: string;
  lastBackup?: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export class OdooShSSHClient {
  private config: Config;

  constructor(config: Config) {
    this.config = ConfigSchema.parse(config);
  }

  /**
   * Execute a command via SSH and return the output
   * Uses OpenSSH directly via subprocess since Node.js ssh2 library has packet type 91 issues with Odoo.sh
   */
  private async executeCommand(command: string): Promise<string> {
    console.error(`[SSH DEBUG] Executing command: ${command}`);
    
    try {
      // Escape special characters for the SSH command
      // % doesn't need escaping because the command runs on remote Linux
      // But we need to escape quotes, and use PowerShell to avoid $ issues
      const escapedCommand = command.replace(/"/g, '\\"');
      
      // Build OpenSSH command
      const sshCommand = `ssh -i "${this.config.privateKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL ${this.config.username}@${this.config.host} "${escapedCommand}"`;
      
      console.error(`[SSH DEBUG] Running: ${sshCommand}`);
      
      const { stdout, stderr } = await execAsync(sshCommand, {
        timeout: this.config.timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        // Use default shell (cmd.exe) - we escape $ as $$ in commands
      });
      
      console.error(`[SSH DEBUG] Command completed`);
      console.error(`[SSH DEBUG] Output: ${stdout.substring(0, 200)}...`);
      if (stderr) console.error(`[SSH DEBUG] Stderr: ${stderr}`);
      
      return stdout;
    } catch (err: any) {
      console.error(`[SSH DEBUG] Error: ${err.message}`);
      if (err.stdout) {
        console.error(`[SSH DEBUG] Partial stdout: ${err.stdout}`);
      }
      if (err.stderr) {
        console.error(`[SSH DEBUG] Stderr: ${err.stderr}`);
      }
      throw new Error(`SSH command failed: ${err.message}`);
    }
  }

  /**
   * Get project information
   */
  async getProjectInfo(): Promise<ProjectInfo> {
    // Find git repository and get remote URL
    const remoteUrl = await this.executeCommand('cd ~/.repositories/git_* && git remote get-url origin');
    
    // Get all branches
    const branchesOutput = await this.executeCommand('cd ~/.repositories/git_* && git branch -r | grep -v HEAD');
    const branches = branchesOutput
      .split('\n')
      .filter(b => b.trim())
      .map(b => b.trim().replace('origin/', ''));

    // Extract project name from remote URL
    const nameMatch = remoteUrl.match(/\/([^\/]+)\.git/);
    const name = nameMatch ? nameMatch[1] : 'unknown';

    return {
      name,
      repository: remoteUrl.trim(),
      branches,
    };
  }

  /**
   * List all Git branches
   */
  async listBranches(): Promise<BranchInfo[]> {
    // Use simple git branch command
    const branchOutput = await this.executeCommand(
      'cd ~/.repositories/git_* && git branch -r'
    );
    
    return branchOutput
      .split('\n')
      .filter(line => line.trim() && !line.includes('HEAD'))
      .map(line => {
        const name = line.trim().replace('origin/', '');
        return {
          name,
          current: false,
          lastCommit: 'N/A',
          lastCommitMessage: 'N/A',
        };
      });
  }

  /**
   * Get current branch information
   */
  async getCurrentBranch(): Promise<string> {
    const output = await this.executeCommand('cd ~/.repositories/git_* && git rev-parse --abbrev-ref HEAD');
    return output.trim();
  }

  /**
   * Get build/commit history for a branch
   */
  async getBuildHistory(branch: string, limit: number = 10): Promise<BuildInfo[]> {
    // Get list of commit hashes first
    const hashesOutput = await this.executeCommand(
      `cd ~/.repositories/git_* && git log origin/${branch} -${limit} --format=%H`
    );
    
    const hashes = hashesOutput.split('\n').filter(h => h.trim());
    const result: BuildInfo[] = [];
    
    // Get details for each commit separately to avoid % escaping issues
    for (const hash of hashes) {
      try {
        const author = await this.executeCommand(
          `cd ~/.repositories/git_* && git show -s --format=%an ${hash}`
        );
        const date = await this.executeCommand(
          `cd ~/.repositories/git_* && git show -s --format=%ai ${hash}`
        );
        const message = await this.executeCommand(
          `cd ~/.repositories/git_* && git show -s --format=%s ${hash}`
        );
        
        result.push({
          commit: hash.trim(),
          author: author.trim(),
          date: date.trim(),
          message: message.trim(),
        });
      } catch (err) {
        console.error(`[SSH DEBUG] Could not get info for commit ${hash}: ${(err as Error).message}`);
      }
    }
    
    return result;
  }

  /**
   * List databases
   */
  async listDatabases(): Promise<DatabaseInfo[]> {
    try {
      // Try to list PostgreSQL databases
      const output = await this.executeCommand(
        'psql -l -t | awk \'{print $1"|"$7}\' | grep -v "^|"'
      );

      return output
        .split('\n')
        .filter(line => line.trim() && !line.includes('template'))
        .map(line => {
          const [name, size] = line.split('|');
          return {
            name: name.trim(),
            size: size ? size.trim() : 'unknown',
          };
        });
    } catch (err) {
      // Fallback: return empty list if psql is not available
      return [];
    }
  }

  /**
   * Get Odoo logs
   */
  async getLogs(logType: 'odoo' | 'install' | 'pip' = 'odoo', lines: number = 100): Promise<LogEntry[]> {
    const logFile = logType === 'odoo' ? '~/logs/odoo.log' : 
                    logType === 'install' ? '~/logs/install.log' : 
                    '~/logs/pip.log';

    try {
      const output = await this.executeCommand(`tail -n ${lines} ${logFile}`);
      
      return output
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          // Parse log line (format may vary)
          const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
          const levelMatch = line.match(/\b(DEBUG|INFO|WARNING|ERROR|CRITICAL)\b/);
          
          return {
            timestamp: timestampMatch ? timestampMatch[1] : '',
            level: levelMatch ? levelMatch[1] : 'INFO',
            message: line,
          };
        });
    } catch (err) {
      return [{
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: `Failed to read log file: ${(err as Error).message}`,
      }];
    }
  }

  /**
   * Execute Odoo shell command
   */
  async executeOdooShell(pythonCode: string): Promise<string> {
    // Write Python code to a temporary file and execute via odoo-bin shell
    const escapedCode = pythonCode.replace(/'/g, "'\\''");
    const command = `cd ~/src/odoo && echo '${escapedCode}' | ./odoo-bin shell -d production --no-http`;
    
    try {
      return await this.executeCommand(command);
    } catch (err) {
      throw new Error(`Odoo shell execution failed: ${(err as Error).message}`);
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<Record<string, string>> {
    const commands = {
      hostname: 'hostname',
      uptime: 'uptime',
      disk: 'df -h ~',
      memory: 'free -h',
      python: 'python3 --version',
      odoo: 'cd ~/src/odoo && ./odoo-bin --version 2>&1 | head -n 1',
    };

    const results: Record<string, string> = {};

    for (const [key, cmd] of Object.entries(commands)) {
      try {
        results[key] = await this.executeCommand(cmd);
      } catch (err) {
        results[key] = `Error: ${(err as Error).message}`;
      }
    }

    return results;
  }

  /**
   * Trigger a new build (via git push)
   */
  async triggerBuild(branch: string): Promise<string> {
    // Create an empty commit and push to trigger build
    await this.executeCommand(`cd ~/src/user && git checkout ${branch}`);
    const output = await this.executeCommand(
      'cd ~/src/user && git commit --allow-empty -m "Trigger build from MCP" && git push origin HEAD'
    );
    return output;
  }

  /**
   * Get Git status
   */
  async getGitStatus(): Promise<string> {
    return await this.executeCommand('cd ~/src/user && git status');
  }

  /**
   * Create or update a file in the repository
   */
  async writeFile(filePath: string, content: string): Promise<string> {
    // Escape content for shell - use base64 encoding to avoid escaping issues
    const base64Content = Buffer.from(content).toString('base64');
    const command = `cd ~/src/user && echo '${base64Content}' | base64 -d > ${filePath}`;
    return await this.executeCommand(command);
  }

  /**
   * Read a file from the repository
   */
  async readFile(filePath: string): Promise<string> {
    return await this.executeCommand(`cd ~/src/user && cat ${filePath}`);
  }

  /**
   * List files in directory
   */
  async listFiles(dirPath: string = '.'): Promise<string> {
    return await this.executeCommand(`cd ~/src/user && ls -la ${dirPath}`);
  }

  /**
   * Create directory
   */
  async createDirectory(dirPath: string): Promise<string> {
    return await this.executeCommand(`cd ~/src/user && mkdir -p ${dirPath}`);
  }

  /**
   * Git add files
   */
  async gitAdd(files: string | string[] = '.'): Promise<string> {
    const fileList = Array.isArray(files) ? files.join(' ') : files;
    return await this.executeCommand(`cd ~/src/user && git add ${fileList}`);
  }

  /**
   * Git commit
   */
  async gitCommit(message: string): Promise<string> {
    const escapedMessage = message.replace(/'/g, "'\\''");
    return await this.executeCommand(`cd ~/src/user && git commit -m '${escapedMessage}'`);
  }

  /**
   * Git push
   */
  async gitPush(branch?: string): Promise<string> {
    const pushTarget = branch ? `origin ${branch}` : 'origin HEAD';
    return await this.executeCommand(`cd ~/src/user && git push ${pushTarget}`);
  }

  /**
   * Switch branch
   */
  async gitCheckout(branch: string, createNew: boolean = false): Promise<string> {
    const flag = createNew ? '-b' : '';
    return await this.executeCommand(`cd ~/src/user && git checkout ${flag} ${branch}`);
  }

  /**
   * Git pull
   */
  async gitPull(): Promise<string> {
    return await this.executeCommand('cd ~/src/user && git pull');
  }
}
