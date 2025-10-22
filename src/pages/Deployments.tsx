import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Rocket, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeployments } from '@/hooks/useApi';

const Deployments = () => {
  const navigate = useNavigate();
  const { data: deploymentsResponse, isLoading, error } = useDeployments();
  
  const deployments = deploymentsResponse?.data || [];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'running':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

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
        <p className="text-red-500">Failed to load deployments: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deployments</h1>
          <p className="text-muted-foreground">Manage and monitor your application deployments</p>
        </div>
        
        <Button onClick={() => navigate('/deploy')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Deployment
        </Button>
      </div>

      {deployments.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border-2 border-dashed border-muted-foreground/25">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Rocket className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No deployments yet</h3>
          <p className="text-muted-foreground mb-4">Create your first deployment to get started</p>
          <Button onClick={() => navigate('/deploy')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Deployment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deployments.map((deployment: any) => (
            <Card key={deployment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{deployment.project_name || 'Untitled Project'}</CardTitle>
                  <Badge className={getStatusColor(deployment.status)}>
                    {getStatusIcon(deployment.status)}
                    <span className="ml-1">{deployment.status}</span>
                  </Badge>
                </div>
                <CardDescription>
                  {deployment.provider?.toUpperCase()} • {deployment.region}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <span>{deployment.provider?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region:</span>
                    <span>{deployment.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instance:</span>
                    <span>{deployment.instance_type}</span>
                  </div>
                  {deployment.public_url && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">URL:</span>
                      <a 
                        href={deployment.public_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View App
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(deployment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/logs/${deployment.id}`)}
                    className="flex-1"
                  >
                    View Logs
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/result/${deployment.id}`)}
                    className="flex-1"
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deployments;
