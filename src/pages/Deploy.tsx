import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCloudProviders, useCostEstimate, useCreateProject, useStartDeployment, useGitHubBranches, useProviderRegions, useProviderInstances } from '@/hooks/useApi';
import { useDeployStore } from '@/store/deployStore';

const Deploy = () => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    repo: '',
    repoFullName: '',
    branch: 'main',
    type: '',
    provider: '',
    region: '',
    cpu: '1',
    memory: '2GB',
    envVars: [{ key: '', value: '' }],
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { data: providersResponse } = useCloudProviders();
  const { data: regionsResponse } = useProviderRegions(config.provider);
  const { data: instancesResponse } = useProviderInstances(config.provider, config.region);
  const { data: costEstimate } = useCostEstimate(config.provider, config.region, config.cpu, config.memory);
  const { data: branchesResponse, isLoading: branchesLoading } = useGitHubBranches(config.repo);
  const createProject = useCreateProject();
  const startDeployment = useStartDeployment();
  const setCurrentDeployment = useDeployStore((state) => state.setCurrentDeployment);

  // Get repo data from navigation state
  useEffect(() => {
    if (location.state?.repo) {
      const repo = location.state.repo;
      setConfig(prev => ({
        ...prev,
        repo: repo.name,
        repoFullName: repo.full_name,
        branch: repo.default_branch || 'main',
        type: repo.language || 'Unknown',
      }));
    }
  }, [location.state]);

  // Set default branch when branches are loaded
  useEffect(() => {
    if (branchesResponse?.data && Array.isArray(branchesResponse.data) && branchesResponse.data.length > 0 && !config.branch) {
      const branches = branchesResponse.data as any[];
      const defaultBranch = branches.find((branch: any) => branch.name === 'main') || 
                           branches.find((branch: any) => branch.name === 'master') ||
                           branches[0];
      if (defaultBranch) {
        setConfig(prev => ({ ...prev, branch: defaultBranch.name }));
      }
    }
  }, [branchesResponse, config.branch]);

  const handleDeploy = async () => {
    try {
      // First create the project
      const projectResult = await createProject.mutateAsync({
        name: config.repo,
        repo_url: `https://github.com/${config.repoFullName}`,
        repo_full_name: config.repoFullName,
        branch: config.branch,
        project_type: config.type,
      });

      if (projectResult.error) {
        throw new Error(projectResult.error);
      }

      // Then start the deployment
      const projectData = projectResult.data as any;
      const deploymentResult = await startDeployment.mutateAsync({
        project_id: projectData.id,
        branch: config.branch,
        config: {
          provider: config.provider,
          region: config.region,
          cpu: config.cpu,
          memory: config.memory,
          env_vars: config.envVars.filter(env => env.key && env.value),
        },
      });

      if (deploymentResult.error) {
        throw new Error(deploymentResult.error);
      }

      // Navigate to logs page
      const deploymentData = deploymentResult.data as any;
      navigate(`/logs/${deploymentData.id}`);
    } catch (error) {
      console.error('Deployment failed:', error);
      // Handle error (show toast, etc.)
    }
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
              <Select 
                value={config.branch} 
                onValueChange={(v) => setConfig({ ...config, branch: v })}
                disabled={branchesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={branchesLoading ? "Loading branches..." : "Select branch"} />
                  {branchesLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </SelectTrigger>
                <SelectContent>
                  {branchesResponse?.data && Array.isArray(branchesResponse.data) ? (
                    (branchesResponse.data as any[]).map((branch: any) => (
                      <SelectItem key={branch.name} value={branch.name}>
                        {branch.name}
                        {branch.protected && ' 🔒'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="main">main</SelectItem>
                  )}
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
            {providersResponse?.data && Array.isArray(providersResponse.data) ? (
              <div className="grid gap-4 md:grid-cols-2">
                {(providersResponse.data as any[]).map((provider: any) => (
                  <div
                    key={provider.provider}
                    onClick={() => setConfig({ ...config, provider: provider.provider })}
                    className={cn(
                      'cursor-pointer rounded-lg border-2 p-4 transition-all',
                      config.provider === provider.provider
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                      !provider.is_configured && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold uppercase">{provider.provider}</h3>
                      {provider.is_configured ? (
                        <Badge variant="default">Configured</Badge>
                      ) : (
                        <Badge variant="secondary">Not Configured</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {provider.is_configured ? 'Ready to deploy' : 'Setup required'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {config.provider && (
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={config.region} onValueChange={(v) => setConfig({ ...config, region: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionsResponse?.data?.regions ? (
                      (regionsResponse.data.regions as any[]).map((region: any) => (
                        <SelectItem key={region.region} value={region.region}>
                          {region.name} ({region.region})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="us-east-1">Loading regions...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                <Label>Instance Type</Label>
                <Select value={config.cpu} onValueChange={(v) => setConfig({ ...config, cpu: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instance type" />
                  </SelectTrigger>
                  <SelectContent>
        {instancesResponse?.data?.instances && instancesResponse.data.instances.length > 0 ? (
          (instancesResponse.data.instances as any[]).map((instance: any) => (
            <SelectItem key={instance.instance_type} value={instance.instance_type}>
              <div className="flex items-center gap-2">
                {instance.is_free_tier && <span className="text-green-600 font-bold">🆓</span>}
                <span>{instance.instance_type}</span>
                <span className="text-muted-foreground">- ${instance.hourly_price}/hour</span>
                {instance.description && <span className="text-muted-foreground">({instance.description})</span>}
              </div>
            </SelectItem>
          ))
        ) : instancesResponse?.data?.instances && instancesResponse.data.instances.length === 0 ? (
          <SelectItem value="" disabled>No instances available for this region</SelectItem>
        ) : (
          <SelectItem value="" disabled>Loading instances...</SelectItem>
        )}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {costEstimate?.data && (
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">Cost Estimate</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Hourly:</span>
                    <span className="ml-2 font-medium">${(costEstimate.data as any).estimated_hourly_cost}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Monthly:</span>
                    <span className="ml-2 font-medium">${(costEstimate.data as any).estimated_monthly_cost}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Environment Variables</Label>
              {config.envVars.map((envVar, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input 
                    placeholder="KEY" 
                    className="flex-1" 
                    value={envVar.key}
                    onChange={(e) => {
                      const newEnvVars = [...config.envVars];
                      newEnvVars[idx].key = e.target.value;
                      setConfig({ ...config, envVars: newEnvVars });
                    }}
                  />
                  <Input 
                    placeholder="value" 
                    className="flex-1" 
                    value={envVar.value}
                    onChange={(e) => {
                      const newEnvVars = [...config.envVars];
                      newEnvVars[idx].value = e.target.value;
                      setConfig({ ...config, envVars: newEnvVars });
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEnvVars = config.envVars.filter((_, i) => i !== idx);
                      setConfig({ ...config, envVars: newEnvVars });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-semibold mb-2">Deployment Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Repository: {config.repo}</p>
                <p>Branch: {config.branch}</p>
                <p>Provider: {config.provider?.toUpperCase()}</p>
                <p>Region: {config.region}</p>
                <div className="flex items-center gap-2">
                  <span>Instance: {config.cpu}</span>
                  {instancesResponse?.data?.instances && 
                   (instancesResponse.data.instances as any[]).find((i: any) => i.instance_type === config.cpu)?.is_free_tier && 
                   <span className="text-green-600 font-bold">🆓</span>}
                </div>
                {config.envVars.filter(env => env.key && env.value).length > 0 && (
                  <p>Environment Variables: {config.envVars.filter(env => env.key && env.value).length}</p>
                )}
                {costEstimate?.data && (
                  <p>Estimated Cost: ${(costEstimate.data as any).estimated_monthly_cost}/month</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleDeploy} 
                className="flex-1"
                disabled={createProject.isPending || startDeployment.isPending}
              >
                {createProject.isPending || startDeployment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Deploy Now'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Deploy;
