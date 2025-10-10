import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const Deploy = () => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    repo: 'awesome-webapp',
    branch: 'main',
    type: 'React',
    provider: '',
    region: '',
    cpu: '1',
    memory: '2GB',
    envVars: [{ key: '', value: '' }],
  });
  
  const navigate = useNavigate();

  const handleDeploy = () => {
    navigate('/logs/demo');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deploy Application</h1>
        <p className="text-muted-foreground">Configure and deploy your project</p>
      </div>

      <div className="flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                s < step && 'border-success bg-success text-success-foreground',
                s === step && 'border-primary bg-primary text-primary-foreground',
                s > step && 'border-muted bg-background text-muted-foreground'
              )}
            >
              {s < step ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div className={cn('mx-4 h-0.5 w-20', s < step ? 'bg-success' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>

      <Progress value={(step / 3) * 100} className="h-2" />

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Review your repository information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Repository</Label>
              <Input value={config.repo} disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={config.branch} onValueChange={(v) => setConfig({ ...config, branch: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="develop">develop</SelectItem>
                  <SelectItem value="staging">staging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project Type</Label>
              <Input value={config.type} disabled />
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Cloud Provider</CardTitle>
            <CardDescription>Select where to deploy your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {['aws', 'gcp', 'azure'].map((provider) => (
                <div
                  key={provider}
                  onClick={() => setConfig({ ...config, provider })}
                  className={cn(
                    'cursor-pointer rounded-lg border-2 p-4 transition-all',
                    config.provider === provider
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <h3 className="font-semibold uppercase">{provider}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Est. $15-30/mo
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={config.region} onValueChange={(v) => setConfig({ ...config, region: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!config.provider || !config.region} className="flex-1">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Set resources and environment variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>CPU</Label>
                <Select value={config.cpu} onValueChange={(v) => setConfig({ ...config, cpu: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5 vCPU</SelectItem>
                    <SelectItem value="1">1 vCPU</SelectItem>
                    <SelectItem value="2">2 vCPU</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Memory</Label>
                <Select value={config.memory} onValueChange={(v) => setConfig({ ...config, memory: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1GB">1 GB</SelectItem>
                    <SelectItem value="2GB">2 GB</SelectItem>
                    <SelectItem value="4GB">4 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Environment Variables</Label>
              {config.envVars.map((_, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input placeholder="KEY" className="flex-1" />
                  <Input placeholder="value" className="flex-1" />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig({
                  ...config,
                  envVars: [...config.envVars, { key: '', value: '' }],
                })}
              >
                + Add Variable
              </Button>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-semibold mb-2">Deployment Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Repository: {config.repo}</p>
                <p>Branch: {config.branch}</p>
                <p>Provider: {config.provider?.toUpperCase()}</p>
                <p>Region: {config.region}</p>
                <p>Resources: {config.cpu} vCPU, {config.memory}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleDeploy} className="flex-1">
                Deploy Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Deploy;
