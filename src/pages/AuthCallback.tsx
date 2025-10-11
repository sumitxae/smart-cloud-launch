import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const code = searchParams.get('code');
      
      if (token) {
        // Direct token from backend
        apiClient.setToken(token);
        navigate('/');
      } else if (code) {
        // Handle GitHub code if needed
        // For now, just redirect to login
        navigate('/');
      } else {
        // No valid callback parameters
        navigate('/');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
