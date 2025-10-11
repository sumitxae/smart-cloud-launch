import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Loader2, CheckCircle2, XCircle, Wifi, WifiOff, AlertCircle, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useDeploymentStatus, useDeploymentLogs, useRetryDeployment, useStreamingLogs } from '@/hooks/useApi';

const Logs = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { data: deploymentData, isLoading } = useDeploymentStatus(id || '');
  const { data: logsData, isLoading: logsLoading } = useDeploymentLogs(id || '');
  const { 
    logs: streamingLogs, 
    status: streamingStatus, 
    isComplete, 
    isConnected, 
    connectionError 
  } = useStreamingLogs(id || '');
  const retryDeployment = useRetryDeployment();

  // Handle streaming logs - prioritize streaming over API logs
  useEffect(() => {
    if (streamingLogs) {
      const logLines = streamingLogs.split('\n').filter(line => line.trim());
      setLogs(logLines);
    } else if (logsData?.data && !streamingLogs) {
      // Fallback to API logs if streaming not available
      const logsResponse = logsData.data as any;
      if (logsResponse.logs) {
        const logLines = logsResponse.logs.split('\n').filter(line => line.trim());
        setLogs(logLines);
      }
    }
  }, [streamingLogs, logsData]);

  // Update deployment status from streaming (primary) or API (fallback)
  useEffect(() => {
    const currentStatus = streamingStatus || (deploymentData?.data as any)?.status;
    
    if (currentStatus) {
      setIsDeploying(!isComplete && !['success', 'failed', 'cancelled'].includes(currentStatus));
      
      if (isComplete || currentStatus === 'success') {
        setSuccess(true);
        setError(null);
      } else if (currentStatus === 'failed') {
        setSuccess(false);
        setError('Deployment failed');
      }
    }
  }, [streamingStatus, deploymentData, isComplete]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollAreaRef.current && isAutoScroll) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs, isAutoScroll]);

  // Check if user has scrolled up to show scroll button
  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
        setShowScrollButton(!isAtBottom);
        setIsAutoScroll(isAtBottom);
      }
    }
  };

  // Manual scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
        setIsAutoScroll(true);
        setShowScrollButton(false);
      }
    }
  };

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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {isDeploying && <Loader2 className="h-8 w-8 animate-spin text-warning" />}
              {success && <CheckCircle2 className="h-8 w-8 text-success" />}
              {!isDeploying && !success && <XCircle className="h-8 w-8 text-destructive" />}
              {isDeploying ? 'Deploying...' : success ? 'Deployment Successful' : 'Deployment Failed'}
            </h1>
            
            {/* Status Badge */}
            {success && <Badge variant="secondary" className="bg-green-100 text-green-700">Success</Badge>}
            {error && <Badge variant="destructive">Failed</Badge>}
            {isDeploying && <Badge variant="default" className="bg-blue-100 text-blue-700">In Progress</Badge>}
            
            {/* Connection Status Badge */}
            {connectionError ? (
              <Badge variant="destructive"><WifiOff className="w-4 h-4 mr-1" />Connection Error</Badge>
            ) : isConnected && isDeploying ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700"><Wifi className="w-4 h-4 mr-1" />Live</Badge>
            ) : isDeploying ? (
              <Badge variant="outline"><WifiOff className="w-4 h-4 mr-1" />Disconnected</Badge>
            ) : null}
          </div>
          
          <p className="text-muted-foreground">
            {isDeploying ? 'Real-time deployment logs with verbose output' : 'Deployment completed'}
          </p>
          
          {deploymentData?.data && (
            <p className="text-sm text-muted-foreground">
              Deployment ID: {(deploymentData.data as any).id}
            </p>
          )}
        </div>

        <Button variant="outline" onClick={downloadLogs} disabled={logs.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Download Logs
        </Button>
      </div>

      {/* Connection Error Alert */}
      {connectionError && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connection Warning:</strong> Live streaming unavailable ({connectionError}). 
            Falling back to periodic log updates.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Console Output</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ScrollArea 
            ref={scrollAreaRef} 
            className="h-[400px] w-full rounded-md bg-black p-4 font-mono text-sm"
            onScrollCapture={handleScroll}
          >
            {logs.length === 0 && !isDeploying ? (
              <div className="text-gray-400">
                No logs available
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
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="absolute bottom-4 right-4 bg-gray-800 hover:bg-gray-700 text-white shadow-lg"
            >
              <ArrowDown className="w-4 h-4 mr-1" />
              Latest
            </Button>
          )}
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
