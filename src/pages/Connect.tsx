import { useState } from 'react';
import { Github, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGitHubRepos } from '@/hooks/useApi';
import { useNavigate } from 'react-router-dom';

const Connect = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  const { data: reposResponse, isLoading: reposLoading, error: reposError } = useGitHubRepos();

  const repos = reposResponse?.data || [];
  const filteredRepos = repos.filter((repo: any) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Select Repository</h1>
        <p className="text-muted-foreground">Choose a repository to deploy</p>
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

      {reposLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : reposError ? (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load repositories: {reposError.message}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRepos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No repositories found.</p>
            </div>
          ) : (
            filteredRepos.map((repo: any) => (
              <Card
                key={repo.id}
                className="transition-all hover:shadow-glow cursor-pointer"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Github className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{repo.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          ⭐ {repo.stargazers_count || 0}
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
  );
};

export default Connect;
