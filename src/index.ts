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
import { OdooShClient } from './odoo-client.js';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation
const EnvSchema = z.object({
  ODOO_SH_API_TOKEN: z.string().min(1, 'ODOO_SH_API_TOKEN is required'),
  ODOO_SH_API_URL: z.string().url().optional().default('https://www.odoo.sh/api'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
  API_TIMEOUT: z.coerce.number().positive().optional().default(30000),
  ENABLE_CACHE: z.coerce.boolean().optional().default(true),
  CACHE_TTL: z.coerce.number().positive().optional().default(300),
});

const env = EnvSchema.parse(process.env);

// Initialize Odoo.sh client
const odooClient = new OdooShClient({
  apiToken: env.ODOO_SH_API_TOKEN,
  apiUrl: env.ODOO_SH_API_URL,
  timeout: env.API_TIMEOUT,
  enableCache: env.ENABLE_CACHE,
  cacheTTL: env.CACHE_TTL,
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
        name: 'list_projects',
        description: 'List all Odoo.sh projects accessible with the current API token',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_project',
        description: 'Get detailed information about a specific Odoo.sh project',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'number',
              description: 'The ID of the project',
            },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'list_branches',
        description: 'List all branches for a specific project',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'number',
              description: 'The ID of the project',
            },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'get_branch',
        description: 'Get detailed information about a specific branch',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'number',
              description: 'The ID of the project',
            },
            branch_id: {
              type: 'number',
              description: 'The ID of the branch',
            },
          },
          required: ['project_id', 'branch_id'],
        },
      },
      {
        name: 'list_builds',
        description: 'List all builds for a specific branch',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'number',
              description: 'The ID of the project',
            },
            branch_id: {
              type: 'number',
              description: 'The ID of the branch',
            },
          },
          required: ['project_id', 'branch_id'],
        },
      },
      {
        name: 'get_build',
        description: 'Get detailed information about a specific build',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'number',
              description: 'The ID of the project',
            },
            branch_id: {
              type: 'number',
              description: 'The ID of the branch',
            },
            build_id: {
              type: 'number',
              description: 'The ID of the build',
            },
          },
          required: ['project_id', 'branch_id', 'build_id'],
        },
      },
      {
        name: 'trigger_build',
        description: 'Trigger a new build for a specific branch',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'number',
              description: 'The ID of the project',
            },
            branch_id: {
              type: 'number',
              description: 'The ID of the branch',
            },
          },
          required: ['project_id', 'branch_id'],
        },
      },
      {
        name: 'get_build_log',
        description: 'Get the build log for a specific build',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'number',
              description: 'The ID of the project',
            },
            branch_id: {
              type: 'number',
              description: 'The ID of the branch',
            },
            build_id: {
              type: 'number',
              description: 'The ID of the build',
            },
          },
          required: ['project_id', 'branch_id', 'build_id'],
        },
      },
      {
        name: 'get_database_info',
        description: 'Get database information for a specific branch',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'number',
              description: 'The ID of the project',
            },
            branch_id: {
              type: 'number',
              description: 'The ID of the branch',
            },
          },
          required: ['project_id', 'branch_id'],
        },
      },
      {
        name: 'clear_cache',
        description: 'Clear the internal cache of project/branch data',
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

    switch (name) {
      case 'list_projects': {
        const projects = await odooClient.listProjects();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      }

      case 'get_project': {
        const { project_id } = args as { project_id: number };
        const project = await odooClient.getProject(project_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      }

      case 'list_branches': {
        const { project_id } = args as { project_id: number };
        const branches = await odooClient.listBranches(project_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(branches, null, 2),
            },
          ],
        };
      }

      case 'get_branch': {
        const { project_id, branch_id } = args as {
          project_id: number;
          branch_id: number;
        };
        const branch = await odooClient.getBranch(project_id, branch_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(branch, null, 2),
            },
          ],
        };
      }

      case 'list_builds': {
        const { project_id, branch_id } = args as {
          project_id: number;
          branch_id: number;
        };
        const builds = await odooClient.listBuilds(project_id, branch_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(builds, null, 2),
            },
          ],
        };
      }

      case 'get_build': {
        const { project_id, branch_id, build_id } = args as {
          project_id: number;
          branch_id: number;
          build_id: number;
        };
        const build = await odooClient.getBuild(project_id, branch_id, build_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(build, null, 2),
            },
          ],
        };
      }

      case 'trigger_build': {
        const { project_id, branch_id } = args as {
          project_id: number;
          branch_id: number;
        };
        const build = await odooClient.triggerBuild(project_id, branch_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(build, null, 2),
            },
          ],
        };
      }

      case 'get_build_log': {
        const { project_id, branch_id, build_id } = args as {
          project_id: number;
          branch_id: number;
          build_id: number;
        };
        const log = await odooClient.getBuildLog(project_id, branch_id, build_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(log, null, 2),
            },
          ],
        };
      }

      case 'get_database_info': {
        const { project_id, branch_id } = args as {
          project_id: number;
          branch_id: number;
        };
        const dbInfo = await odooClient.getDatabaseInfo(project_id, branch_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(dbInfo, null, 2),
            },
          ],
        };
      }

      case 'clear_cache': {
        odooClient.clearCache();
        return {
          content: [
            {
              type: 'text',
              text: 'Cache cleared successfully',
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
        uri: 'odoo://projects',
        name: 'All Odoo.sh Projects',
        description: 'List of all accessible Odoo.sh projects',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'odoo://projects') {
    const projects = await odooClient.listProjects();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(projects, null, 2),
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
        description: 'Check the status of recent builds for a project',
        arguments: [
          {
            name: 'project_id',
            description: 'The ID of the project',
            required: true,
          },
        ],
      },
      {
        name: 'deploy_workflow',
        description: 'Guide through the deployment workflow',
        arguments: [
          {
            name: 'project_id',
            description: 'The ID of the project',
            required: true,
          },
          {
            name: 'environment',
            description: 'Target environment (production/staging/development)',
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'check_build_status') {
    const projectId = Number(args?.project_id);
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please check the build status for project ${projectId}. Show me:
1. List of all branches
2. Recent builds for each branch (last 5)
3. Highlight any failed builds
4. Show build duration trends`,
          },
        },
      ],
    };
  }

  if (name === 'deploy_workflow') {
    const projectId = Number(args?.project_id);
    const environment = String(args?.environment);
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Help me deploy to ${environment} for project ${projectId}:
1. Show current branch status
2. Check for pending builds
3. Verify database backup status
4. Guide me through the deployment steps
5. Show post-deployment verification steps`,
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
