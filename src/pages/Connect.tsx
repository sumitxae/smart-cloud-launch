import { useState } from 'react';
import { Github, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDeployStore } from '@/store/deployStore';
import { useNavigate } from 'react-router-dom';

const mockRepos = [
  { name: 'awesome-webapp', stars: 42, language: 'TypeScript' },
  { name: 'ml-backend', stars: 28, language: 'Python' },
  { name: 'mobile-app', stars: 15, language: 'React Native' },
  { name: 'data-pipeline', stars: 8, language: 'Go' },
  { name: 'analytics-dashboard', stars: 33, language: 'Vue' },
];

const Connect = () => {
  const isConnected = useDeployStore((state) => state.isGitHubConnected);
  const setConnected = useDeployStore((state) => state.setGitHubConnected);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredRepos = mockRepos.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isConnected) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Github className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connect GitHub</CardTitle>
            <CardDescription>
              Link your GitHub account to import and deploy your repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setConnected(true)}
              className="w-full"
              size="lg"
            >
              <Github className="mr-2 h-5 w-5" />
              Connect with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <div className="space-y-2">
        {filteredRepos.map((repo) => (
          <Card
            key={repo.name}
            className="transition-all hover:shadow-glow cursor-pointer"
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Github className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">{repo.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      ⭐ {repo.stars}
                    </span>
                    <span>{repo.language}</span>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => navigate('/deploy')}>
                Select
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Connect;
