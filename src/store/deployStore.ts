import { create } from 'zustand';

export type DeploymentStatus = 'success' | 'failed' | 'in-progress' | 'idle';

export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  status: DeploymentStatus;
  lastDeployed?: Date;
  provider?: 'aws' | 'gcp' | 'azure';
}

export interface DeploymentConfig {
  repoName: string;
  branch: string;
  projectType: string;
  provider: 'aws' | 'gcp' | 'azure';
  region: string;
  cpu: string;
  memory: string;
  envVars: { key: string; value: string }[];
}

interface CloudCredentials {
  gcpServiceAccount: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
}

interface DeployStore {
  projects: Project[];
  currentDeployment: DeploymentConfig | null;
  isGitHubConnected: boolean;
  cloudCredentials: CloudCredentials;
  setGitHubConnected: (connected: boolean) => void;
  setCurrentDeployment: (config: DeploymentConfig | null) => void;
  addProject: (project: Project) => void;
  updateProjectStatus: (id: string, status: DeploymentStatus) => void;
  setCloudCredentials: (credentials: Partial<CloudCredentials>) => void;
}

export const useDeployStore = create<DeployStore>((set) => ({
  projects: [
    {
      id: '1',
      name: 'my-react-app',
      repoUrl: 'github.com/user/my-react-app',
      status: 'success',
      lastDeployed: new Date('2025-10-08'),
      provider: 'aws',
    },
    {
      id: '2',
      name: 'api-backend',
      repoUrl: 'github.com/user/api-backend',
      status: 'in-progress',
      provider: 'gcp',
    },
    {
      id: '3',
      name: 'landing-page',
      repoUrl: 'github.com/user/landing-page',
      status: 'failed',
      lastDeployed: new Date('2025-10-09'),
      provider: 'azure',
    },
  ],
  currentDeployment: null,
  isGitHubConnected: true,
  cloudCredentials: {
    gcpServiceAccount: '',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
  },
  setGitHubConnected: (connected) => set({ isGitHubConnected: connected }),
  setCurrentDeployment: (config) => set({ currentDeployment: config }),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProjectStatus: (id, status) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    })),
  setCloudCredentials: (credentials) =>
    set((state) => ({
      cloudCredentials: { ...state.cloudCredentials, ...credentials },
    })),
}));
