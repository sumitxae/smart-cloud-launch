import { ExternalLink, RotateCcw, Trash2, ScrollText, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useDeploymentStatus, useDeleteDeployment } from '@/hooks/useApi';

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: deploymentData, isLoading } = useDeploymentStatus(id || '');
  const deleteDeployment = useDeleteDeployment();

  const handleDelete = async () => {
    if (id) {
      await deleteDeployment.mutateAsync(id);
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const deployment = deploymentData?.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <ExternalLink className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-3xl font-bold">Deployment Successful!</h1>
        <p className="text-muted-foreground">Your application is now live</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application URL</CardTitle>
          <CardDescription>Your app is accessible at this address</CardDescription>
        </CardHeader>
        <CardContent>
          {deployment?.public_url ? (
            <a
              href={deployment.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-lg font-mono text-primary hover:underline"
            >
              {deployment.public_url}
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <p className="text-muted-foreground">URL not available yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cloud Provider</p>
              <p className="font-semibold">{deployment?.provider?.toUpperCase() || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Region</p>
              <p className="font-semibold">{deployment?.region || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPU</p>
              <p className="font-semibold">{deployment?.cpu || 'Unknown'} vCPU</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Memory</p>
              <p className="font-semibold">{deployment?.memory || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`font-semibold ${
                deployment?.status === 'success' ? 'text-success' : 
                deployment?.status === 'failed' ? 'text-destructive' : 
                'text-warning'
              }`}>
                {deployment?.status || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deployment Time</p>
              <p className="font-semibold">
                {deployment?.created_at ? 
                  new Date(deployment.created_at).toLocaleString() : 
                  'Unknown'
                }
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Repository</p>
            <p className="font-mono">awesome-webapp (main branch)</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Button 
          onClick={() => deployment?.public_url && window.open(deployment.public_url, '_blank')}
          disabled={!deployment?.public_url}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Application
        </Button>
        
        <Button variant="outline" onClick={() => navigate(`/logs/${id}`)}>
          <ScrollText className="mr-2 h-4 w-4" />
          View Logs
        </Button>

        <Button variant="outline" onClick={() => navigate('/deploy')}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Redeploy
        </Button>

        <Button 
          variant="destructive" 
          onClick={handleDelete}
          disabled={deleteDeployment.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleteDeployment.isPending ? 'Deleting...' : 'Delete Service'}
        </Button>
      </div>
    </div>
  );
};

export default Result;
