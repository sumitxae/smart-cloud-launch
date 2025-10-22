import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, GitBranch, Cloud, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api';

const Index = () => {

  const token = localStorage.getItem('auth_token');
  useEffect(() => {
    if (token) {
      window.location.reload();
    }
  }, [token]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Smart Cloud Deploy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Deploy your applications to AWS or Google Cloud Platform in minutes. 
            Connect your GitHub or GitLab repository and deploy with zero configuration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Github className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Step 1: Connect Repository</CardTitle>
              <CardDescription>
                Connect your GitHub or GitLab repository to create a new project
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Step 2: Configure Cloud</CardTitle>
              <CardDescription>
                Set up your AWS or GCP credentials for deployment
              </CardDescription>
            </CardHeader>
            
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Step 3: Deploy</CardTitle>
              <CardDescription>
                Deploy your application to the cloud with one click
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8">
            Follow the steps above to connect your repository and deploy your first application.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/connect')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Github className="w-4 h-4 mr-2" />
              Start with Repository
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
