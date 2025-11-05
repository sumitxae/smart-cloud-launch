import { useState } from 'react';
import { Github, GitBranch, Search, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRepos, useUser } from '@/hooks/useApi';
import { useNavigate } from 'react-router-dom';
 
const apiRoute=import.meta.env.VITE_API_URL;

const Connect = () => {
  const [search, setSearch] = useState('');
  const [showRepos, setShowRepos] = useState(false);
  const navigate = useNavigate();
  
  const { data: user } = useUser();
  const { data: reposResponse, isLoading: reposLoading, error: reposError } = useRepos();

  const repos = reposResponse?.data || [];
  const filteredRepos = Array.isArray(repos) ? repos.filter((repo: any) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleGitHubAuth = () => {
    window.location.href = `${apiRoute}/auth/github/login`;
  };

  const handleGitLabAuth = () => {
    window.location.href = `${apiRoute}/auth/gitlab/login`;
  };

  const handleViewRepos = () => {
    setShowRepos(true);
  };

  // If user is authenticated, show repository selection by default
  if (user?.data) {
    return (
      <div className="h-full flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Select Repository</h1>
          <p className="text-muted-foreground">Choose a repository to create a new project</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-hidden">
          {reposLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : reposError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load repositories: {reposError.message}</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto space-y-2 pr-2">
              {filteredRepos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No repositories found.</p>
                </div>
              ) : (
                filteredRepos.map((repo: any) => (
                  <Card
                    key={repo.id}
                    className="transition-all hover:shadow-lg cursor-pointer"
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Github className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{repo.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              ⭐ {repo.stargazers_count || repo.star_count || 0}
                            </span>
                            <span>{repo.language || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button onClick={() => navigate('/deploy', { state: { repo } })}>
                        Select
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show authentication options
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Connect Your Repository</h1>
        <p className="text-muted-foreground mt-2">
          Choose your Git provider to connect and access your repositories
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
              <Github className="w-8 h-8 text-white" />
            </div>
            <CardTitle>GitHub</CardTitle>
            <CardDescription>
              Connect your GitHub account to access your repositories and deploy your applications
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleGitHubAuth}
              className="w-full bg-gray-900  text-white hover:bg-gray-800"
            >
              <Github className="w-4 h-4 mr-2" />
              Connect with GitHub
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
              <GitBranch className="w-8 h-8 text-white" />
            </div>
            <CardTitle>GitLab</CardTitle>
            <CardDescription>
              Connect your GitLab account to access your repositories and deploy your applications
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleGitLabAuth}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Connect with GitLab
            </Button>
          </CardContent>
        </Card>
      </div>

      {user?.data && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span>Connected as {(user.data as any)?.username}</span>
          </div>
          <div className="mt-4">
            <Button onClick={handleViewRepos} className="bg-blue-600 hover:bg-blue-700">
              View My Repositories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connect;
