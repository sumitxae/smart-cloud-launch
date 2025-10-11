import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDeployStore } from '@/store/deployStore';
import { toast } from 'sonner';
import { AlertCircle, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Settings = () => {
  const { cloudCredentials, setCloudCredentials } = useDeployStore();
  
  const [gcpServiceAccount, setGcpServiceAccount] = useState(cloudCredentials.gcpServiceAccount);
  const [awsAccessKeyId, setAwsAccessKeyId] = useState(cloudCredentials.awsAccessKeyId);
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState(cloudCredentials.awsSecretAccessKey);

  const handleSaveGcp = () => {
    setCloudCredentials({ gcpServiceAccount });
    toast.success('GCP Service Account saved successfully');
  };

  const handleSaveAws = () => {
    setCloudCredentials({ awsAccessKeyId, awsSecretAccessKey });
    toast.success('AWS credentials saved successfully');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your cloud provider credentials</p>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Warning:</strong> These credentials are currently stored in browser memory only. 
          For production use, connect to a secure backend to store credentials safely.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>GCP Service Account</CardTitle>
          <CardDescription>
            Paste your Google Cloud Platform service account JSON key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gcp-service-account">Service Account JSON</Label>
            <Textarea
              id="gcp-service-account"
              placeholder='{"type": "service_account", "project_id": "...", ...}'
              value={gcpServiceAccount}
              onChange={(e) => setGcpServiceAccount(e.target.value)}
              className="min-h-[200px] font-mono text-xs"
            />
          </div>
          <Button onClick={handleSaveGcp} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save GCP Credentials
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AWS Credentials</CardTitle>
          <CardDescription>
            Enter your AWS IAM access key and secret key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aws-access-key">AWS Access Key ID</Label>
            <Input
              id="aws-access-key"
              type="text"
              placeholder="AKIAIOSFODNN7EXAMPLE"
              value={awsAccessKeyId}
              onChange={(e) => setAwsAccessKeyId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aws-secret-key">AWS Secret Access Key</Label>
            <Input
              id="aws-secret-key"
              type="password"
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              value={awsSecretAccessKey}
              onChange={(e) => setAwsSecretAccessKey(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveAws} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save AWS Credentials
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
