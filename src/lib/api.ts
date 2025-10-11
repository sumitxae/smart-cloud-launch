import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async getCurrentUser() {
    return this.request('/api/v1/auth/me');
  }

  async initiateGitHubAuth() {
    // Redirect to backend GitHub OAuth endpoint
    window.location.href = `${this.baseUrl}/api/v1/auth/github/login`;
  }

  // Project endpoints
  async getProjects() {
    return this.request('/api/v1/projects/');
  }

  async createProject(projectData: {
    name: string;
    repo_url: string;
    repo_full_name: string;
    branch: string;
    project_type: string;
  }) {
    return this.request('/api/v1/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProject(projectId: string) {
    return this.request(`/api/v1/projects/${projectId}`);
  }

  async updateProject(projectId: string, projectData: any) {
    return this.request(`/api/v1/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId: string) {
    return this.request(`/api/v1/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Deployment endpoints
  async startDeployment(deploymentData: {
    project_id: string;
    branch: string;
    config: {
      provider: string;
      region: string;
      cpu: string;
      memory: string;
      env_vars: Array<{ key: string; value: string }>;
    };
  }) {
    return this.request('/api/v1/deployments/start', {
      method: 'POST',
      body: JSON.stringify(deploymentData),
    });
  }

  async getDeploymentStatus(deploymentId: string) {
    return this.request(`/api/v1/deployments/${deploymentId}/status`);
  }

  async getDeploymentLogs(deploymentId: string) {
    return this.request(`/api/v1/deployments/${deploymentId}/logs`);
  }

  async streamDeploymentLogs(deploymentId: string): Promise<ReadableStream<Uint8Array>> {
    const url = `${this.baseUrl}/api/v1/deployments/${deploymentId}/logs/stream`;
    const headers: Record<string, string> = {
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.body!;
  }

  async getDeployments(projectId?: string) {
    const url = projectId 
      ? `/api/v1/deployments/?project_id=${projectId}`
      : '/api/v1/deployments/';
    return this.request(url);
  }

  async deleteDeployment(deploymentId: string) {
    return this.request(`/api/v1/deployments/${deploymentId}`, {
      method: 'DELETE',
    });
  }

  async retryDeployment(deploymentId: string) {
    return this.request(`/api/v1/deployments/${deploymentId}/retry`, {
      method: 'POST',
    });
  }

  // Cloud endpoints
  async getCloudProviders() {
    return this.request('/api/v1/cloud/providers');
  }

  async saveCloudCredentials(credentials: {
    provider: string;
    credentials: Record<string, any>;
  }) {
    return this.request('/api/v1/cloud/credentials', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async estimateCost(provider: string, region: string, cpu: string, memory: string) {
    return this.request('/api/v1/cloud/estimate-cost', {
      method: 'POST',
      body: JSON.stringify({ provider, region, cpu, memory }),
    });
  }

  async getProviderRegions(provider: string) {
    return this.request(`/api/v1/cloud/providers/${provider}/regions`);
  }

  async getProviderInstances(provider: string, region: string) {
    return this.request(`/api/v1/cloud/providers/${provider}/regions/${region}/instances`);
  }

  // GitHub integration
  async connectGitHub(code: string) {
    return this.request('/api/v1/auth/github', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getGitHubRepos() {
    return this.request('/api/v1/auth/github/repos');
  }

  async getGitHubBranches(repoName: string) {
    return this.request(`/api/v1/auth/github/repos/${repoName}/branches`);
  }

  async redeployProject(projectId: string, deploymentId: string) {
    return this.request('/api/v1/deployments/redeploy', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        deployment_id: deploymentId
      })
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
