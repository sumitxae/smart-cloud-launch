import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { useDeployStore } from '@/store/deployStore';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const projects = useDeployStore((state) => state.projects);
  const navigate = useNavigate();

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
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
