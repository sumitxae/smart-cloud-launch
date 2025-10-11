import { Plus, Loader2 } from 'lucide-react';
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
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and deploy your applications</p>
        </div>
        
        <Button onClick={() => navigate('/connect')}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
