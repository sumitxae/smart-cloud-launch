import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useProject, useDeployments, useRedeploy } from '@/hooks/useApi';

// Type definitions
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
  public_ip?: string;
  public_url?: string;
  created_at: string;
}

const Redeploy: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isRedeploying, setIsRedeploying] = useState(false);

  const { data: projectData, isLoading: projectLoading } = useProject(projectId || '');
  const { data: deploymentsData, isLoading: deploymentsLoading } = useDeployments(projectId);
  const redeploy = useRedeploy();

  const project = projectData?.data as ProjectResponse | undefined;
  const deployments = (deploymentsData?.data as DeploymentResponse[]) || [];

  // Get the latest deployment
  const latestDeployment = deployments.length > 0 ? deployments[0] : null;

  const handleRedeploy = async () => {
    if (!projectId || !latestDeployment) return;

    setIsRedeploying(true);
    try {
      const result = await redeploy.mutateAsync({
        projectId,
        deploymentId: latestDeployment.id
      });
      
      console.log('Redeploy result:', result);
      
      // Navigate to logs page
      const deploymentResult = result.data as DeploymentResponse;
      console.log('Deployment result:', deploymentResult);
      navigate(`/logs/${deploymentResult.id}`);
    } catch (error) {
      console.error('Redeploy failed:', error);
    } finally {
      setIsRedeploying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'provisioning':
      case 'configuring':
      case 'building':
      case 'deploying':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'provisioning':
      case 'configuring':
      case 'building':
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (projectLoading || deploymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Project not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Redeploy Project
              </h1>
              <p className="text-gray-600 mt-2">
                Redeploy your application on the existing infrastructure
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Project Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img 
                src={project.avatar_url} 
                alt={project.name}
                className="w-8 h-8 rounded-full"
              />
              {project.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Repository</p>
                <p className="font-medium">{project.repo_full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Framework</p>
                <p className="font-medium">{project.framework}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Branch</p>
                <p className="font-medium">{project.default_branch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Deployment Info */}
        {latestDeployment && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Latest Deployment
                {getStatusIcon(latestDeployment.status)}
                <Badge className={getStatusColor(latestDeployment.status)}>
                  {latestDeployment.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="font-medium capitalize">{latestDeployment.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Region</p>
                  <p className="font-medium">{latestDeployment.region}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Instance Type</p>
                  <p className="font-medium">{latestDeployment.cpu}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Public IP</p>
                  <p className="font-medium">{latestDeployment.public_ip || 'N/A'}</p>
                </div>
                {latestDeployment.public_url && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Application URL</p>
                    <a 
                      href={latestDeployment.public_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {latestDeployment.public_url}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Redeploy Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Redeploy Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">What happens when you redeploy?</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Your application will be rebuilt with the latest code</li>
                  <li>The same infrastructure will be reused (no new costs)</li>
                  <li>Environment variables and configuration will be preserved</li>
                  <li>Zero-downtime deployment (if supported by your app)</li>
                </ul>
              </div>

              {latestDeployment ? (
                <div className="flex gap-4">
                  <Button
                    onClick={handleRedeploy}
                    disabled={isRedeploying || redeploy.isPending}
                    className="flex items-center gap-2"
                  >
                    {isRedeploying || redeploy.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {isRedeploying || redeploy.isPending ? 'Redeploying...' : 'Redeploy Now'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/logs/${latestDeployment.id}`)}
                  >
                    View Current Logs
                  </Button>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No deployments found for this project. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-1"
                      onClick={() => navigate(`/deploy/${projectId}`)}
                    >
                      Create your first deployment
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Redeploy;
