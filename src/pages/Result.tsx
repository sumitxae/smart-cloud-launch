import { ExternalLink, RotateCcw, Trash2, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Result = () => {
  const navigate = useNavigate();

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
          <a
            href="https://awesome-webapp-abc123.aws-app.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg font-mono text-primary hover:underline"
          >
            https://awesome-webapp-abc123.aws-app.com
            <ExternalLink className="h-4 w-4" />
          </a>
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
              <p className="font-semibold">AWS</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Region</p>
              <p className="font-semibold">us-east-1</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPU</p>
              <p className="font-semibold">1 vCPU</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Memory</p>
              <p className="font-semibold">2 GB</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Environment Variables</p>
              <p className="font-semibold">3 configured</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deployment Time</p>
              <p className="font-semibold">52 seconds</p>
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
        <Button onClick={() => window.open('https://awesome-webapp-abc123.aws-app.com', '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Application
        </Button>
        
        <Button variant="outline" onClick={() => navigate('/logs/demo')}>
          <ScrollText className="mr-2 h-4 w-4" />
          View Logs
        </Button>

        <Button variant="outline" onClick={() => navigate('/deploy')}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Redeploy
        </Button>

        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Service
        </Button>
      </div>
    </div>
  );
};

export default Result;
