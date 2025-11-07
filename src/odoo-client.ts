import axios, { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// Configuration schema
const ConfigSchema = z.object({
  apiToken: z.string().min(1, 'API token is required'),
  apiUrl: z.string().url().default('https://www.odoo.sh/api'),
  timeout: z.number().positive().default(30000),
  enableCache: z.boolean().default(true),
  cacheTTL: z.number().positive().default(300),
});

type Config = z.infer<typeof ConfigSchema>;

// API response types
export interface OdooProject {
  id: number;
  name: string;
  slug: string;
  repository: string;
  branches: OdooBranch[];
}

export interface OdooBranch {
  id: number;
  name: string;
  is_main: boolean;
  stage: 'production' | 'staging' | 'development';
  url: string;
  builds: OdooBuild[];
}

export interface OdooBuild {
  id: number;
  branch_id: number;
  commit: string;
  status: 'pending' | 'building' | 'testing' | 'success' | 'failed';
  created_at: string;
  updated_at: string;
  duration?: number;
}

export interface BuildLog {
  build_id: number;
  content: string;
  timestamp: string;
}

export interface DatabaseInfo {
  name: string;
  size: number;
  branch_id: number;
  last_backup?: string;
}

// Simple in-memory cache
class Cache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttl: number) {
    this.ttl = ttl * 1000; // Convert to milliseconds
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export class OdooShClient {
  private client: AxiosInstance;
  private cache: Cache;
  private enableCache: boolean;

  constructor(config: Config) {
    const validatedConfig = ConfigSchema.parse(config);

    this.client = axios.create({
      baseURL: validatedConfig.apiUrl,
      timeout: validatedConfig.timeout,
      headers: {
        'Authorization': `Bearer ${validatedConfig.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.enableCache = validatedConfig.enableCache;
    this.cache = new Cache(validatedConfig.cacheTTL);

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data || error.message;

      switch (status) {
        case 401:
          return new Error('Authentication failed. Check your API token.');
        case 403:
          return new Error('Access forbidden. Insufficient permissions.');
        case 404:
          return new Error('Resource not found.');
        case 429:
          return new Error('Rate limit exceeded. Please try again later.');
        case 500:
          return new Error(`Odoo.sh API error: ${message}`);
        default:
          return new Error(`HTTP ${status}: ${message}`);
      }
    } else if (error.request) {
      return new Error('No response from Odoo.sh API. Check network connection.');
    } else {
      return new Error(`Request error: ${error.message}`);
    }
  }

  private async cachedRequest<T>(
    cacheKey: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const data = await requestFn();

    if (this.enableCache) {
      this.cache.set(cacheKey, data);
    }

    return data;
  }

  // Projects
  async listProjects(): Promise<OdooProject[]> {
    return this.cachedRequest('projects', async () => {
      const response = await this.client.get<OdooProject[]>('/projects');
      return response.data;
    });
  }

  async getProject(projectId: number): Promise<OdooProject> {
    return this.cachedRequest(`project:${projectId}`, async () => {
      const response = await this.client.get<OdooProject>(`/projects/${projectId}`);
      return response.data;
    });
  }

  // Branches
  async listBranches(projectId: number): Promise<OdooBranch[]> {
    return this.cachedRequest(`branches:${projectId}`, async () => {
      const response = await this.client.get<OdooBranch[]>(
        `/projects/${projectId}/branches`
      );
      return response.data;
    });
  }

  async getBranch(projectId: number, branchId: number): Promise<OdooBranch> {
    return this.cachedRequest(`branch:${projectId}:${branchId}`, async () => {
      const response = await this.client.get<OdooBranch>(
        `/projects/${projectId}/branches/${branchId}`
      );
      return response.data;
    });
  }

  // Builds
  async listBuilds(projectId: number, branchId: number): Promise<OdooBuild[]> {
    // Don't cache builds as they change frequently
    const response = await this.client.get<OdooBuild[]>(
      `/projects/${projectId}/branches/${branchId}/builds`
    );
    return response.data;
  }

  async getBuild(
    projectId: number,
    branchId: number,
    buildId: number
  ): Promise<OdooBuild> {
    const response = await this.client.get<OdooBuild>(
      `/projects/${projectId}/branches/${branchId}/builds/${buildId}`
    );
    return response.data;
  }

  async triggerBuild(projectId: number, branchId: number): Promise<OdooBuild> {
    const response = await this.client.post<OdooBuild>(
      `/projects/${projectId}/branches/${branchId}/builds`
    );
    return response.data;
  }

  async getBuildLog(
    projectId: number,
    branchId: number,
    buildId: number
  ): Promise<BuildLog> {
    const response = await this.client.get<BuildLog>(
      `/projects/${projectId}/branches/${branchId}/builds/${buildId}/logs`
    );
    return response.data;
  }

  // Database
  async getDatabaseInfo(projectId: number, branchId: number): Promise<DatabaseInfo> {
    return this.cachedRequest(`db:${projectId}:${branchId}`, async () => {
      const response = await this.client.get<DatabaseInfo>(
        `/projects/${projectId}/branches/${branchId}/database`
      );
      return response.data;
    });
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }
}
