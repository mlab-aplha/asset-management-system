import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../../backend-firebase/src/firebase/services';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    authService.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    return result;
  };

  const signUp = async (email: string, password: string) => {
    const result = await authService.signUp(email, password);
    return result;
  };

  const signOut = async () => {
    const result = await authService.signOut();
    return result;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
};
