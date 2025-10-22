import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDeployStore } from '@/store/deployStore';
import { toast } from 'sonner';
import { AlertCircle, Save, Loader2, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';

const Settings = () => {
  const { cloudCredentials, setCloudCredentials } = useDeployStore();
  
  const [gcpServiceAccount, setGcpServiceAccount] = useState('');
  const [awsAccessKeyId, setAwsAccessKeyId] = useState('');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState({
    gcp: false,
    aws: false
  });

  // Load existing credentials
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        // Load GCP credentials
        const gcpResponse = await apiClient.getCloudCredentials('gcp');
        if (gcpResponse.data) {
          setGcpServiceAccount(JSON.stringify(gcpResponse.data.credentials, null, 2));
          setSavedCredentials(prev => ({ ...prev, gcp: true }));
        }
      } catch (error) {
        // GCP credentials not found, that's okay
      }

      try {
        // Load AWS credentials
        const awsResponse = await apiClient.getCloudCredentials('aws');
        if (awsResponse.data) {
          setAwsAccessKeyId(awsResponse.data.credentials.access_key_id || '');
          setAwsSecretAccessKey(awsResponse.data.credentials.secret_access_key || '');
          setSavedCredentials(prev => ({ ...prev, aws: true }));
        }
      } catch (error) {
        // AWS credentials not found, that's okay
      }
    };

    loadCredentials();
  }, []);

  const handleSaveGcp = async () => {
    setIsLoading(true);
    try {
      const credentials = JSON.parse(gcpServiceAccount);
      await apiClient.saveCloudCredentials({
        provider: 'gcp',
        credentials: credentials
      });
      setSavedCredentials(prev => ({ ...prev, gcp: true }));
      toast.success('GCP Service Account saved successfully');
    } catch (error) {
      toast.error('Failed to save GCP credentials. Please check the JSON format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAws = async () => {
    setIsLoading(true);
    try {
      await apiClient.saveCloudCredentials({
        provider: 'aws',
        credentials: {
          access_key_id: awsAccessKeyId,
          secret_access_key: awsSecretAccessKey
        }
      });
      setSavedCredentials(prev => ({ ...prev, aws: true }));
      toast.success('AWS credentials saved successfully');
    } catch (error) {
      toast.error('Failed to save AWS credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your cloud provider credentials</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Your credentials are encrypted and stored securely on our servers. 
          They are only used for deploying your applications to the cloud.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            GCP Service Account
            {savedCredentials.gcp && <Check className="h-4 w-4 text-green-600" />}
          </CardTitle>
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
          <Button 
            onClick={handleSaveGcp} 
            className="w-full"
            disabled={isLoading || !gcpServiceAccount.trim()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {savedCredentials.gcp ? 'Update GCP Credentials' : 'Save GCP Credentials'}
          </Button>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            AWS Credentials
            {savedCredentials.aws && <Check className="h-4 w-4 text-green-600" />}
          </CardTitle>
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
          <Button 
            onClick={handleSaveAws} 
            className="w-full"
            disabled={isLoading || !awsAccessKeyId.trim() || !awsSecretAccessKey.trim()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {savedCredentials.aws ? 'Update AWS Credentials' : 'Save AWS Credentials'}
          </Button>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default Settings;
