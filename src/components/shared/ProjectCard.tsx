import { ExternalLink, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Project } from '@/store/deployStore';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="transition-all hover:shadow-glow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <a
            href={`https://${project.repoUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {project.repoUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <StatusBadge status={project.status} />
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {project.lastDeployed && (
              <span>Last deployed: {project.lastDeployed.toLocaleDateString()}</span>
            )}
            {project.provider && (
              <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs font-medium uppercase">
                {project.provider}
              </span>
            )}
          </div>
          
          <Button onClick={() => navigate('/deploy')} size="sm">
            <Rocket className="mr-2 h-4 w-4" />
            Deploy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
