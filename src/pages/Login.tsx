import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { apiClient } from '@/lib/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle GitHub OAuth callback
    const token = searchParams.get('token');
    if (token) {
      apiClient.setToken(token);
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Smart Cloud Launch</h1>
          <p className="text-muted-foreground">Deploy your applications to the cloud</p>
        </div>
        
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
