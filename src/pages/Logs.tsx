import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockLogs = [
  '[2025-10-10 14:32:01] Starting deployment...',
  '[2025-10-10 14:32:03] Cloning repository from GitHub...',
  '[2025-10-10 14:32:05] Installing dependencies...',
  '[2025-10-10 14:32:12] Building application...',
  '[2025-10-10 14:32:18] Optimizing assets...',
  '[2025-10-10 14:32:22] Creating container image...',
  '[2025-10-10 14:32:30] Pushing to registry...',
  '[2025-10-10 14:32:38] Deploying to AWS...',
  '[2025-10-10 14:32:45] Configuring load balancer...',
  '[2025-10-10 14:32:50] Health check passed ✓',
  '[2025-10-10 14:32:52] Deployment complete!',
];

const Logs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(true);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockLogs.length) {
        setLogs((prev) => [...prev, mockLogs[index]]);
        index++;
      } else {
        setIsDeploying(false);
        setSuccess(true);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deployment-logs.txt';
    a.click();
  };

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
          <p className="text-muted-foreground">Real-time deployment logs</p>
        </div>

        <Button variant="outline" onClick={downloadLogs}>
          <Download className="mr-2 h-4 w-4" />
          Download Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Console Output</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md bg-black p-4 font-mono text-sm">
            {logs.map((log, idx) => (
              <div key={idx} className="text-green-400 mb-1">
                {log}
              </div>
            ))}
            {isDeploying && (
              <div className="text-green-400 animate-pulse">▊</div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {!isDeploying && success && (
        <div className="flex gap-4">
          <Button onClick={() => navigate('/result/demo')} className="flex-1">
            View Deployment
          </Button>
          <Button variant="outline" onClick={() => navigate('/deploy')} className="flex-1">
            New Deployment
          </Button>
        </div>
      )}

      {!isDeploying && !success && (
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()} className="flex-1">
            Retry Deployment
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default Logs;
