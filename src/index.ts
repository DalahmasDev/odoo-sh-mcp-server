#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { OdooShSSHClient } from './odoo-ssh-client.js';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation
const EnvSchema = z.object({
  ODOO_SH_SSH_HOST: z.string().min(1, 'ODOO_SH_SSH_HOST is required'),
  ODOO_SH_SSH_PORT: z.coerce.number().positive().optional().default(22),
  ODOO_SH_SSH_USER: z.string().min(1, 'ODOO_SH_SSH_USER is required'),
  ODOO_SH_SSH_KEY_PATH: z.string().min(1, 'ODOO_SH_SSH_KEY_PATH is required'),
  ODOO_SH_SSH_PASSPHRASE: z.string().optional(),
  SSH_TIMEOUT: z.coerce.number().positive().optional().default(30000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
});

const env = EnvSchema.parse(process.env);

// Debug: Log configuration
console.error('SSH Config:', {
  host: env.ODOO_SH_SSH_HOST,
  user: env.ODOO_SH_SSH_USER,
  keyPath: env.ODOO_SH_SSH_KEY_PATH,
});

// Initialize Odoo.sh SSH client
const odooClient = new OdooShSSHClient({
  host: env.ODOO_SH_SSH_HOST,
  port: env.ODOO_SH_SSH_PORT,
  username: env.ODOO_SH_SSH_USER,
  privateKeyPath: env.ODOO_SH_SSH_KEY_PATH,
  passphrase: env.ODOO_SH_SSH_PASSPHRASE,
  timeout: env.SSH_TIMEOUT,
});

// Create MCP server
const server = new Server(
  {
    name: 'odoo-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// TOOLS
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_project_info',
        description: 'Get information about the connected Odoo.sh project (via SSH)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_branches',
        description: 'List all Git branches in the Odoo.sh project',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_current_branch',
        description: 'Get the currently checked out branch',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_build_history',
        description: 'Get commit/build history for a specific branch',
        inputSchema: {
          type: 'object',
          properties: {
            branch: {
              type: 'string',
              description: 'Branch name (e.g., main, staging-1)',
            },
            limit: {
              type: 'number',
              description: 'Number of commits to retrieve (default: 10)',
              default: 10,
            },
          },
          required: ['branch'],
        },
      },
      {
        name: 'trigger_build',
        description: 'Trigger a new build by creating an empty commit and pushing',
        inputSchema: {
          type: 'object',
          properties: {
            branch: {
              type: 'string',
              description: 'Branch name to trigger build on',
            },
          },
          required: ['branch'],
        },
      },
      {
        name: 'list_databases',
        description: 'List all PostgreSQL databases on the Odoo.sh instance',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_logs',
        description: 'Get Odoo logs from the server',
        inputSchema: {
          type: 'object',
          properties: {
            log_type: {
              type: 'string',
              enum: ['odoo', 'install', 'pip'],
              description: 'Type of log to retrieve',
              default: 'odoo',
            },
            lines: {
              type: 'number',
              description: 'Number of log lines to retrieve (default: 100)',
              default: 100,
            },
          },
        },
      },
      {
        name: 'execute_odoo_shell',
        description: 'Execute Python code in the Odoo shell environment',
        inputSchema: {
          type: 'object',
          properties: {
            python_code: {
              type: 'string',
              description: 'Python code to execute in Odoo shell',
            },
          },
          required: ['python_code'],
        },
      },
      {
        name: 'get_system_info',
        description: 'Get system information (hostname, uptime, disk, memory, versions)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      // Git workflow tools
      {
        name: 'git_status',
        description: 'Get git status showing modified, staged, and untracked files',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'write_file',
        description: 'Create or update a file with given content',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file relative to ~/src/user',
            },
            content: {
              type: 'string',
              description: 'File content to write',
            },
          },
          required: ['filePath', 'content'],
        },
      },
      {
        name: 'read_file',
        description: 'Read the contents of a file',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file relative to ~/src/user',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'list_files',
        description: 'List files and directories in a path',
        inputSchema: {
          type: 'object',
          properties: {
            dirPath: {
              type: 'string',
              description: 'Directory path relative to ~/src/user (default: .)',
            },
          },
        },
      },
      {
        name: 'create_directory',
        description: 'Create a directory (including parent directories)',
        inputSchema: {
          type: 'object',
          properties: {
            dirPath: {
              type: 'string',
              description: 'Directory path relative to ~/src/user',
            },
          },
          required: ['dirPath'],
        },
      },
      {
        name: 'git_add',
        description: 'Stage files for commit',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of file paths to stage (relative to ~/src/user)',
            },
          },
          required: ['files'],
        },
      },
      {
        name: 'git_commit',
        description: 'Commit staged changes',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Commit message',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'git_push',
        description: 'Push commits to remote repository',
        inputSchema: {
          type: 'object',
          properties: {
            branch: {
              type: 'string',
              description: 'Branch name to push (default: current branch)',
            },
          },
        },
      },
      {
        name: 'git_checkout',
        description: 'Switch to a branch or create a new branch',
        inputSchema: {
          type: 'object',
          properties: {
            branch: {
              type: 'string',
              description: 'Branch name',
            },
            createNew: {
              type: 'boolean',
              description: 'Create a new branch if true',
            },
          },
          required: ['branch'],
        },
      },
      {
        name: 'git_pull',
        description: 'Pull changes from remote repository',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    console.error(`[DEBUG] Tool called: ${name}`, args);

    switch (name) {
      case 'get_project_info': {
        console.error('[DEBUG] Executing get_project_info');
        const info = await odooClient.getProjectInfo();
        console.error('[DEBUG] Project info result:', info);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      case 'list_branches': {
        const branches = await odooClient.listBranches();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(branches, null, 2),
            },
          ],
        };
      }

      case 'get_current_branch': {
        const branch = await odooClient.getCurrentBranch();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ currentBranch: branch }, null, 2),
            },
          ],
        };
      }

      case 'get_build_history': {
        const { branch, limit } = args as { branch: string; limit?: number };
        const history = await odooClient.getBuildHistory(branch, limit || 10);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(history, null, 2),
            },
          ],
        };
      }

      case 'trigger_build': {
        const { branch } = args as { branch: string };
        const result = await odooClient.triggerBuild(branch);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ branch, result }, null, 2),
            },
          ],
        };
      }

      case 'list_databases': {
        const databases = await odooClient.listDatabases();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(databases, null, 2),
            },
          ],
        };
      }

      case 'get_logs': {
        const { log_type, lines } = args as { log_type?: string; lines?: number };
        const logType = (log_type || 'odoo') as 'odoo' | 'install' | 'pip';
        const logs = await odooClient.getLogs(logType, lines || 100);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(logs, null, 2),
            },
          ],
        };
      }

      case 'execute_odoo_shell': {
        const { python_code } = args as { python_code: string };
        const result = await odooClient.executeOdooShell(python_code);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'get_system_info': {
        const info = await odooClient.getSystemInfo();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      // Git workflow tools
      case 'git_status': {
        const status = await odooClient.getGitStatus();
        return {
          content: [
            {
              type: 'text',
              text: status,
            },
          ],
        };
      }

      case 'write_file': {
        const { filePath, content } = args as { filePath: string; content: string };
        const result = await odooClient.writeFile(filePath, content);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'read_file': {
        const { filePath } = args as { filePath: string };
        const content = await odooClient.readFile(filePath);
        return {
          content: [
            {
              type: 'text',
              text: content,
            },
          ],
        };
      }

      case 'list_files': {
        const { dirPath } = args as { dirPath?: string };
        const files = await odooClient.listFiles(dirPath || '.');
        return {
          content: [
            {
              type: 'text',
              text: files,
            },
          ],
        };
      }

      case 'create_directory': {
        const { dirPath } = args as { dirPath: string };
        const result = await odooClient.createDirectory(dirPath);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'git_add': {
        const { files } = args as { files: string[] };
        const result = await odooClient.gitAdd(files);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'git_commit': {
        const { message } = args as { message: string };
        const result = await odooClient.gitCommit(message);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'git_push': {
        const { branch } = args as { branch?: string };
        const result = await odooClient.gitPush(branch);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'git_checkout': {
        const { branch, createNew } = args as { branch: string; createNew?: boolean };
        const result = await odooClient.gitCheckout(branch, createNew);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'git_pull': {
        const result = await odooClient.gitPull();
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// RESOURCES
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'odoo://project',
        name: 'Current Odoo.sh Project',
        description: 'Information about the connected Odoo.sh project',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'odoo://project') {
    const projectInfo = await odooClient.getProjectInfo();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(projectInfo, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// PROMPTS
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'check_build_status',
        description: 'Check the status of recent builds across all branches',
        arguments: [],
      },
      {
        name: 'deploy_workflow',
        description: 'Guide through the deployment workflow',
        arguments: [
          {
            name: 'branch',
            description: 'Target branch name (e.g., main, staging-1)',
            required: true,
          },
        ],
      },
      {
        name: 'investigate_errors',
        description: 'Investigate recent errors in Odoo logs',
        arguments: [],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'check_build_status') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please check the build status of this Odoo.sh project:
1. List all branches
2. For each branch, show the last 5 commits
3. Identify the current branch
4. Highlight any patterns in recent activity`,
          },
        },
      ],
    };
  }

  if (name === 'deploy_workflow') {
    const branch = String(args?.branch);
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Help me deploy branch '${branch}':
1. Show recent commits on this branch
2. Check current system status
3. List available databases
4. Review recent Odoo logs for errors
5. Guide me through triggering a build`,
          },
        },
      ],
    };
  }

  if (name === 'investigate_errors') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Investigate recent errors in Odoo:
1. Get the last 100 lines from odoo.log
2. Identify ERROR and CRITICAL level messages
3. Summarize the most common errors
4. Suggest potential solutions`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Odoo.sh MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
