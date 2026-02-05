import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '../core/services/AuthService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Listen for auth changes
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return await AuthService.login({ 
      email, 
      password, 
      rememberDevice: false 
    });
  };

  const signUp = async (email: string, password: string) => {
    return await AuthService.register({ 
      email, 
      password, 
      rememberDevice: false 
    });
  };

  const signOut = async () => {
    return await AuthService.logout();
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