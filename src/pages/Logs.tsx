import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDeploymentStatus, useDeploymentLogs, useRetryDeployment, useStreamingLogs } from '@/hooks/useApi';

const Logs = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { data: deploymentData, isLoading } = useDeploymentStatus(id || '');
  const { data: logsData, isLoading: logsLoading } = useDeploymentLogs(id || '');
  const { logs: streamingLogs, status: streamingStatus, isComplete, isConnected } = useStreamingLogs(id || '');
  const retryDeployment = useRetryDeployment();

  // Update logs from logs API
  useEffect(() => {
    if (logsData?.data) {
      const logsResponse = logsData.data;
      console.log('Logs data received:', logsResponse);
      if (logsResponse.logs) {
        const logLines = logsResponse.logs.split('\n').filter(line => line.trim());
        console.log('Parsed log lines:', logLines);
        setLogs(logLines);
      }
    }
  }, [logsData]);

  // Handle streaming logs
  useEffect(() => {
    if (streamingLogs) {
      const logLines = streamingLogs.split('\n').filter(line => line.trim());
      setLogs(prev => {
        // Only add new lines to avoid duplicates
        const newLines = logLines.slice(prev.length);
        return [...prev, ...newLines];
      });
    }
  }, [streamingLogs]);

  // Update deployment status from streaming
  useEffect(() => {
    if (streamingStatus) {
      setIsDeploying(!isComplete);
      if (isComplete) {
        setSuccess(streamingStatus === 'success');
        setError(streamingStatus === 'failed' ? 'Deployment failed' : null);
      }
    }
  }, [streamingStatus, isComplete]);

  // Update deployment status based on API data
  useEffect(() => {
    if (deploymentData?.data) {
      const deployment = deploymentData.data;
      
      // Update deployment status
      if (deployment.status === 'success') {
        setIsDeploying(false);
        setSuccess(true);
      } else if (deployment.status === 'failed') {
        setIsDeploying(false);
        setSuccess(false);
        setError('Deployment failed');
      } else if (deployment.status === 'provisioning' || 
                 deployment.status === 'configuring' || 
                 deployment.status === 'building' || 
                 deployment.status === 'deploying' || 
                 deployment.status === 'pending') {
        setIsDeploying(true);
      }
    }
  }, [deploymentData]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs]);

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deployment-logs.txt';
    a.click();
  };

  const handleRetry = async () => {
    if (id) {
      try {
        await retryDeployment.mutateAsync(id);
        // Reset states for retry
        setIsDeploying(true);
        setSuccess(false);
        setError(null);
        setLogs([]);
      } catch (error) {
        console.error('Retry failed:', error);
        setError('Failed to retry deployment');
      }
    }
  };

  if (isLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading deployment logs...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {isDeploying && <Loader2 className="h-8 w-8 animate-spin text-warning" />}
            {success && <CheckCircle2 className="h-8 w-8 text-success" />}
            {!isDeploying && !success && <XCircle className="h-8 w-8 text-destructive" />}
            {isDeploying ? 'Deploying...' : success ? 'Deployment Successful' : 'Deployment Failed'}
          </h1>
          <p className="text-muted-foreground">
            {isDeploying ? 'Real-time deployment logs' : 'Deployment completed'}
            {isConnected && isDeploying && (
              <span className="ml-2 text-green-500">● Live</span>
            )}
          </p>
          {deploymentData?.data && (
            <p className="text-sm text-muted-foreground">
              Deployment ID: {deploymentData.data.id}
            </p>
          )}
        </div>

        <Button variant="outline" onClick={downloadLogs} disabled={logs.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Download Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Console Output</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea ref={scrollAreaRef} className="h-[400px] w-full rounded-md bg-black p-4 font-mono text-sm">
            {logs.length === 0 && !isDeploying ? (
              <div className="text-gray-400">
                No logs available
                {console.log('Current logs state:', logs, 'isDeploying:', isDeploying)}
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="text-green-400 mb-1">
                  {log}
                </div>
              ))
            )}
            {isDeploying && (
              <div className="text-green-400 animate-pulse">▊</div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {!isDeploying && success && (
        <div className="flex gap-4">
          <Button onClick={() => navigate(`/result/${id}`)} className="flex-1">
            View Deployment
          </Button>
          <Button variant="outline" onClick={() => navigate('/deploy')} className="flex-1">
            New Deployment
          </Button>
        </div>
      )}

      {!isDeploying && !success && (
        <div className="flex gap-4">
          <Button 
            onClick={handleRetry} 
            className="flex-1"
            disabled={retryDeployment.isPending}
          >
            {retryDeployment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              'Retry Deployment'
            )}
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
            Back to Dashboard
          </Button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <h4 className="font-semibold text-destructive mb-2">Deployment Error</h4>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Logs;
