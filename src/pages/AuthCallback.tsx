import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const code = searchParams.get('code');
      
      if (token) {
        // Direct token from backend
        apiClient.setToken(token);
        
        // Invalidate and refetch user data to update authentication state
        await queryClient.invalidateQueries({ queryKey: ['user'] });
        
        // Force refetch user data
        await queryClient.refetchQueries({ queryKey: ['user'] });
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/');
        }, 200);
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
  }, [searchParams, navigate, queryClient]);

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
