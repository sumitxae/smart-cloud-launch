import { Plus, Loader2, Check, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { useDeployStore } from '@/store/deployStore';
import { useProjects } from '@/hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Dashboard = () => {
  const { data: projectsResponse, isLoading, error } = useProjects();
  const setProjects = useDeployStore((state) => state.setProjects);
  const projects = useDeployStore((state) => state.projects);
  const navigate = useNavigate();

  useEffect(() => {
    if (projectsResponse?.data) {
      const formattedProjects = projectsResponse.data.map((project: any) => ({
        id: project.id,
        name: project.name,
        repoUrl: project.repo_url,
        repoFullName: project.repo_full_name,
        branch: project.branch,
        projectType: project.project_type,
        framework: project.framework,
        status: 'idle' as const,
        provider: undefined,
      }));
      setProjects(formattedProjects);
    }
  }, [projectsResponse, setProjects]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load projects: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your projects and deployments</p>
        </div>
        
        <Button onClick={() => navigate('/connect')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Connect Repository
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Deployments</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Rocket className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Cloud Providers</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <Button variant="outline" onClick={() => navigate('/connect')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12 bg-card rounded-lg border-2 border-dashed border-muted-foreground/25">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Get started by connecting your first repository</p>
                <Button onClick={() => navigate('/connect')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Connect Repository
                </Button>
              </div>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
