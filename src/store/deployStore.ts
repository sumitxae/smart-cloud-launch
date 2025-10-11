import { create } from 'zustand';

export type DeploymentStatus = 'success' | 'failed' | 'in-progress' | 'idle' | 'pending';

export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  repoFullName?: string;
  branch?: string;
  projectType?: string;
  framework?: string;
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

export interface Deployment {
  id: string;
  project_id: string;
  provider: string;
  region: string;
  cpu: string;
  memory: string;
  status: DeploymentStatus;
  public_url?: string;
  logs?: string;
  created_at: string;
  updated_at: string;
}

interface CloudCredentials {
  gcpServiceAccount: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
}

interface DeployStore {
  projects: Project[];
  deployments: Deployment[];
  currentDeployment: DeploymentConfig | null;
  cloudCredentials: CloudCredentials;
  setCurrentDeployment: (config: DeploymentConfig | null) => void;
  addProject: (project: Project) => void;
  updateProjectStatus: (id: string, status: DeploymentStatus) => void;
  setCloudCredentials: (credentials: Partial<CloudCredentials>) => void;
  setProjects: (projects: Project[]) => void;
  setDeployments: (deployments: Deployment[]) => void;
  addDeployment: (deployment: Deployment) => void;
  updateDeployment: (id: string, updates: Partial<Deployment>) => void;
}

export const useDeployStore = create<DeployStore>((set) => ({
  projects: [],
  deployments: [],
  currentDeployment: null,
  cloudCredentials: {
    gcpServiceAccount: '',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
  },
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
  setProjects: (projects) => set({ projects }),
  setDeployments: (deployments) => set({ deployments }),
  addDeployment: (deployment) =>
    set((state) => ({ deployments: [...state.deployments, deployment] })),
  updateDeployment: (id, updates) =>
    set((state) => ({
      deployments: state.deployments.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
}));
