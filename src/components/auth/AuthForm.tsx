import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useApi';

export const AuthForm = () => {
  const { loginWithGitHub } = useAuth();

  const handleGitHubLogin = () => {
    loginWithGitHub();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome to Smart Cloud Launch</CardTitle>
        <CardDescription>
          Sign in with your GitHub account to deploy your applications to the cloud
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleGitHubLogin} 
          className="w-full" 
          size="lg"
        >
          <Github className="mr-2 h-5 w-5" />
          Continue with GitHub
        </Button>
      </CardContent>
    </Card>
  );
};
