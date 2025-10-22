import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Check, Loader2, Plus, Trash2, Github, GitBranch, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useCloudProviders, useCostEstimate, useCreateProject, useStartDeployment, useRepoBranches, useProviderRegions, useProviderInstances, useUser } from '@/hooks/useApi';
import { useDeployStore } from '@/store/deployStore';
import { apiClient } from '@/lib/api';

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
    gitProvider: '', // 'github' or 'gitlab'
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useUser();
  const { data: providersResponse } = useCloudProviders();
  const { data: regionsResponse } = useProviderRegions(config.provider);
  const { data: instancesResponse } = useProviderInstances(config.provider, config.region);
  const { data: costEstimate } = useCostEstimate(config.provider, config.region, config.cpu, config.memory);
  const { data: branchesResponse, isLoading: branchesLoading } = useRepoBranches(config.repo);
  const createProject = useCreateProject();
  const startDeployment = useStartDeployment();
  const setCurrentDeployment = useDeployStore((state) => state.setCurrentDeployment);

  // Get repo data from navigation state
  useEffect(() => {
    if (location.state?.repo) {
      const repo = location.state.repo;
      
      // Handle both GitHub and GitLab repository structures
      const repoFullName = repo.full_name || repo.path_with_namespace || repo.name;
      const defaultBranch = repo.default_branch || 'main';
      const language = repo.language || 'Unknown';
      
      setConfig(prev => ({
        ...prev,
        repo: repo.name,
        repoFullName: repoFullName,
        branch: defaultBranch,
        type: language,
      }));
    }
  }, [location.state]);

  // Redirect to connect page if no repository is selected and user is authenticated
  useEffect(() => {
    if (user?.data && !location.state?.repo && !config.repoFullName) {
      // Only redirect if we're on step 1 and no repo is selected
      if (step === 1) {
        navigate('/connect', { replace: true });
      }
    }
  }, [user, location.state, config.repoFullName, step, navigate]);

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

  const handleGitHubAuth = () => {
    apiClient.initiateGitHubAuth();
  };

  const handleGitLabAuth = () => {
    apiClient.initiateGitLabAuth();
  };

  const handleDeploy = async () => {
    try {
      // Check if user is authenticated
      if (!user?.data) {
        throw new Error('Please authenticate with GitHub or GitLab first');
      }

      // Check if cloud credentials are configured
      const hasCredentials = providersResponse?.data?.some((provider: any) => provider.is_configured);
      if (!hasCredentials) {
        throw new Error('Please configure your cloud provider credentials in Settings first');
      }

      // Determine the Git provider based on user authentication
      const isGitHubUser = user.data.github_id;
      const isGitLabUser = user.data.gitlab_id;
      const gitProvider = isGitHubUser ? 'github' : isGitLabUser ? 'gitlab' : '';

      if (!gitProvider) {
        throw new Error('Unable to determine Git provider. Please re-authenticate.');
      }


      // First create the project
      const projectResult = await createProject.mutateAsync({
        name: config.repo,
        repo_url: gitProvider === 'github' 
          ? `https://github.com/${config.repoFullName}`
          : `https://gitlab.com/${config.repoFullName}`,
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
        {[1, 2, 3, 4].map((s) => (
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
            {s < 4 && (
              <div className={cn('mx-4 h-0.5 w-20', s < step ? 'bg-success' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>

      <Progress value={(step / 4) * 100} className="h-2" />

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Repository</CardTitle>
            <CardDescription>Connect to GitHub or GitLab to access your repositories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user?.data ? (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You need to authenticate with a Git provider to access your repositories.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleGitHubAuth}>
                    <CardContent className="p-6 text-center">
                      <Github className="h-8 w-8 mx-auto mb-4 text-gray-600" />
                      <h3 className="font-semibold">GitHub</h3>
                      <p className="text-sm text-muted-foreground">Connect your GitHub account</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleGitLabAuth}>
                    <CardContent className="p-6 text-center">
                      <GitBranch className="h-8 w-8 mx-auto mb-4 text-orange-600" />
                      <h3 className="font-semibold">GitLab</h3>
                      <p className="text-sm text-muted-foreground">Connect your GitLab account</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Successfully authenticated as {user.data.username} via {user.data.github_id ? 'GitHub' : user.data.gitlab_id ? 'GitLab' : 'Unknown Provider'}
                  </AlertDescription>
                </Alert>
                
                {!config.repoFullName ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Github className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Repository Selected</h3>
                      <p className="text-muted-foreground mb-6">
                        You need to select a repository to deploy. Go back to the connect page to choose a repository.
                      </p>
                    </div>
                    <Button onClick={() => navigate('/connect')} className="bg-blue-600 hover:bg-blue-700">
                      <Github className="w-4 h-4 mr-2" />
                      Select Repository
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Repository Selected</span>
                      </div>
                      <p className="text-green-700">
                        <strong>{config.repoFullName}</strong> - Ready to deploy
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Repository</Label>
                      <Input 
                        value={config.repo} 
                        onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                        placeholder="Enter repository name (e.g., username/repo)"
                        disabled
                      />
                    </div>
                  </div>
                )}
                
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
                  <Input 
                    value={config.type} 
                    onChange={(e) => setConfig({ ...config, type: e.target.value })}
                    placeholder="e.g., React, Node.js, Python"
                  />
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full" 
                  disabled={!config.repoFullName || !config.repo || !config.type}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
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
                    onClick={() => provider.is_configured && setConfig({ ...config, provider: provider.provider })}
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
                    {!provider.is_configured && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/settings');
                        }}
                      >
                        Configure Credentials
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {!providersResponse?.data?.some((provider: any) => provider.is_configured) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No cloud providers are configured. Please configure your credentials in Settings first.
                </AlertDescription>
              </Alert>
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
