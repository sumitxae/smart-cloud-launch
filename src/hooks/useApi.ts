import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import { useDeployStore } from '@/store/deployStore';

// Type definitions for API responses
interface UserResponse {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  github_id: string;
}

interface ProjectResponse {
  id: string;
  name: string;
  repo_url: string;
  repo_full_name: string;
  branch: string;
  project_type: string;
  framework?: string;
  avatar_url?: string;
  default_branch?: string;
  created_at: string;
}

interface DeploymentResponse {
  id: string;
  project_id: string;
  provider: string;
  region: string;
  cpu: string;
  memory: string;
  status: string;
  public_url?: string;
  logs?: string;
  created_at: string;
  updated_at: string;
}

interface GitHubBranch {
  name: string;
  protected: boolean;
  commit: {
    sha: string;
    url: string;
  };
}

interface CostEstimateResponse {
  provider: string;
  region: string;
  cpu: string;
  memory: string;
  estimated_hourly_cost: number;
  estimated_monthly_cost: number;
}

// Auth hooks
export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginWithGitHub = () => {
    apiClient.initiateGitHubAuth();
  };

  const logout = () => {
    // Clear authentication state
    apiClient.clearToken();
    queryClient.clear();
    
    // Force immediate re-render by invalidating all queries
    queryClient.invalidateQueries();
    
    // Navigate to home and force a page reload to ensure clean state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return {
    loginWithGitHub,
    logout,
  };
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: !!localStorage.getItem('auth_token'),
    staleTime: 0, // Always consider data stale to force refetch
  });
};

// Project hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
    enabled: !!localStorage.getItem('auth_token'),
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.getProject(projectId),
    enabled: !!projectId && !!localStorage.getItem('auth_token'),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const addProject = useDeployStore((state) => state.addProject);

  return useMutation({
    mutationFn: (projectData: {
      name: string;
      repo_url: string;
      repo_full_name: string;
      branch: string;
      project_type: string;
    }) => apiClient.createProject(projectData),
    onSuccess: (response) => {
      if (response.data) {
        const projectData = response.data as ProjectResponse;
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        // Update local store
        addProject({
          id: projectData.id,
          name: projectData.name,
          repoUrl: projectData.repo_url,
          status: 'idle',
          provider: undefined,
        });
      }
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => apiClient.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Deployment hooks
export const useDeployments = (projectId?: string) => {
  return useQuery({
    queryKey: ['deployments', projectId],
    queryFn: () => apiClient.getDeployments(projectId),
    enabled: !!localStorage.getItem('auth_token'),
  });
};

export const useStartDeployment = () => {
  const queryClient = useQueryClient();
  const updateProjectStatus = useDeployStore((state) => state.updateProjectStatus);

  return useMutation({
    mutationFn: (deploymentData: {
      project_id: string;
      branch: string;
      config: {
        provider: string;
        region: string;
        cpu: string;
        memory: string;
        env_vars: Array<{ key: string; value: string }>;
      };
    }) => apiClient.startDeployment(deploymentData),
    onSuccess: (response) => {
      if (response.data) {
        const deploymentData = response.data as DeploymentResponse;
        queryClient.invalidateQueries({ queryKey: ['deployments'] });
        // Update project status in local store
        updateProjectStatus(deploymentData.project_id, 'in-progress');
      }
    },
  });
};

export const useDeploymentStatus = (deploymentId: string) => {
  return useQuery({
    queryKey: ['deployment', deploymentId],
    queryFn: () => apiClient.getDeploymentStatus(deploymentId),
    enabled: !!deploymentId && !!localStorage.getItem('auth_token'),
    refetchInterval: 5000, // Simple 5-second polling
    refetchIntervalInBackground: false, // Don't poll in background
    staleTime: 1000, // Consider data stale after 1 second
    gcTime: 30000, // Keep in cache for 30 seconds
  });
};

export const useDeleteDeployment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deploymentId: string) => apiClient.deleteDeployment(deploymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
};

export const useRetryDeployment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deploymentId: string) => apiClient.retryDeployment(deploymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['deployment-status'] });
    },
  });
};

// Cloud provider hooks
export const useCloudProviders = () => {
  return useQuery({
    queryKey: ['cloud-providers'],
    queryFn: () => apiClient.getCloudProviders(),
    enabled: !!localStorage.getItem('auth_token'),
  });
};

export const useSaveCloudCredentials = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { provider: string; credentials: Record<string, any> }) =>
      apiClient.saveCloudCredentials(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloud-providers'] });
    },
  });
};

export const useCostEstimate = (provider: string, region: string, cpu: string, memory: string) => {
  return useQuery({
    queryKey: ['cost-estimate', provider, region, cpu, memory],
    queryFn: () => apiClient.estimateCost(provider, region, cpu, memory),
    enabled: !!provider && !!region && !!cpu && !!memory,
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 0, // Don't cache to ensure fresh data
  });
};

export const useProviderRegions = (provider: string) => {
  return useQuery({
    queryKey: ['provider-regions', provider],
    queryFn: () => apiClient.getProviderRegions(provider),
    enabled: !!provider && !!localStorage.getItem('auth_token'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useProviderInstances = (provider: string, region: string) => {
  return useQuery({
    queryKey: ['provider-instances', provider, region],
    queryFn: () => apiClient.getProviderInstances(provider, region),
    enabled: !!provider && !!region && !!localStorage.getItem('auth_token'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// GitHub integration hooks
export const useGitHubRepos = () => {
  return useQuery({
    queryKey: ['github-repos'],
    queryFn: () => apiClient.getGitHubRepos(),
    enabled: !!localStorage.getItem('auth_token'),
  });
};

export const useGitHubBranches = (repoName: string) => {
  return useQuery({
    queryKey: ['github-branches', repoName],
    queryFn: () => apiClient.getGitHubBranches(repoName),
    enabled: !!repoName && !!localStorage.getItem('auth_token'),
  });
};

export const useGitLabBranches = (repoName: string) => {
  return useQuery({
    queryKey: ['gitlab-branches', repoName],
    queryFn: () => apiClient.getGitLabBranches(repoName),
    enabled: !!repoName && !!localStorage.getItem('auth_token'),
  });
};

// Generic hooks that use the backend's automatic provider detection
export const useRepos = () => {
  return useQuery({
    queryKey: ['repos'],
    queryFn: () => apiClient.getRepos(),
    enabled: !!localStorage.getItem('auth_token'),
  });
};

export const useRepoBranches = (repoName: string) => {
  return useQuery({
    queryKey: ['repo-branches', repoName],
    queryFn: () => apiClient.getRepoBranches(repoName),
    enabled: !!repoName && !!localStorage.getItem('auth_token'),
  });
};

// Deployment logs hook with polling
export const useDeploymentLogs = (deploymentId: string) => {
  return useQuery({
    queryKey: ['deployment-logs', deploymentId],
    queryFn: () => apiClient.getDeploymentLogs(deploymentId),
    enabled: !!deploymentId && !!localStorage.getItem('auth_token'),
    refetchInterval: 2000, // Simple 2-second polling
    refetchIntervalInBackground: true,
  });
};

export const useRedeploy = () => {
  return useMutation({
    mutationFn: ({ projectId, deploymentId }: { projectId: string; deploymentId: string }) =>
      apiClient.redeployProject(projectId, deploymentId),
  });
};

export const useStreamingLogs = (deploymentId: string) => {
  const [logs, setLogs] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!deploymentId || !localStorage.getItem('auth_token')) return;

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connectToStream = async () => {
      try {
        setIsConnected(true);
        setConnectionError(null);
        console.log(`[STREAMING] Connecting to deployment ${deploymentId}`);
        
        const stream = await apiClient.streamDeploymentLogs(deploymentId);
        reader = stream.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[STREAMING] Stream ended normally');
            break;
          }
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('[STREAMING] Received data:', data);
                
                if (data.type === 'initial' && data.logs) {
                  setLogs(data.logs);
                } else if (data.type === 'update' && data.logs) {
                  setLogs(prev => prev + data.logs);
                } else if (data.type === 'heartbeat') {
                  // Just update status on heartbeat
                  if (data.status) {
                    setStatus(data.status);
                  }
                  continue;
                }
                
                if (data.status) {
                  setStatus(data.status);
                }
                
                if (data.completed || data.type === 'final') {
                  console.log('[STREAMING] Deployment completed');
                  setIsComplete(true);
                  return;
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, 'Raw line:', line);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error streaming logs:', error);
        setConnectionError(error instanceof Error ? error.message : 'Connection error');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts && !isComplete) {
          reconnectAttempts++;
          console.log(`[STREAMING] Reconnecting attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
          setTimeout(() => connectToStream(), 2000 * reconnectAttempts); // Exponential backoff
        }
      } finally {
        if (reader) {
          reader.releaseLock();
        }
      }
    };

    connectToStream();

    return () => {
      console.log('[STREAMING] Cleaning up connection');
      if (reader) {
        reader.releaseLock();
      }
      setIsConnected(false);
    };
  }, [deploymentId, isComplete]);

  return { logs, status, isComplete, isConnected, connectionError };
};
