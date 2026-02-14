// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { AuthService } from '../../backend-firebase/src/services/AuthService';
import { userService } from '../../backend-firebase/src/services/UserService';
import { User } from '../core/entities/User';

// Make sure this is exported
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const firebaseUser = AuthService.getCurrentUser();

      if (firebaseUser) {
        try {
          const userData = await userService.getUserById(firebaseUser.uid);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await AuthService.login(email, password);
    if (result.success && result.user) {
      const userData = await userService.getUserById(result.user.uid);
      setUser(userData);
    }
    return result;
  };

  const signOut = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      setUser(null);
    }
    return result;
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFacilitator: user?.role === 'facilitator'
  };
};

// Also export as default if you want
export default useAuth;