import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthService } from '../../backend-firebase/src/services/AuthService';
import { userService } from '../../backend-firebase/src/services/UserService';
import { User } from '../core/entities/User';
import { auth } from '../../backend-firebase/src/firebase/config';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';

// Session timeout in milliseconds (5 hours = 5 * 60 * 60 * 1000)
const SESSION_TIMEOUT = 5 * 60 * 60 * 1000;
const WARNING_BEFORE = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Refs to track session timers
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  // Initialize lastActivity after component mounts
  useEffect(() => {
    lastActivityRef.current = Date.now();
    isInitializedRef.current = true;
  }, []);

  // Define signOut first
  const signOut = async () => {
    try {
      // Clear timers
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      // Clear session storage
      sessionStorage.clear();

      const result = await AuthService.logout();
      if (result.success) {
        setUser(null);
        setShowTimeoutWarning(false);
      }
      return result;
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  };

  // Handle auto logout
  const handleAutoLogout = useCallback(async () => {
    setShowTimeoutWarning(false);
    try {
      await signOut();
      alert('Session expired due to inactivity. Please log in again.');
      window.location.href = '/login';
    } catch (error) {
      console.error('Auto logout error:', error);
    }
  }, []);

  // Track user activity and reset timers
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    // Calculate time elapsed
    const timeElapsed = Date.now() - lastActivityRef.current;
    const remainingTime = SESSION_TIMEOUT - timeElapsed;

    // Set new timers
    if (remainingTime > 0) {
      // Set new warning timer
      warningTimerRef.current = setTimeout(() => {
        const currentTimeElapsed = Date.now() - lastActivityRef.current;
        const currentRemainingTime = SESSION_TIMEOUT - currentTimeElapsed;

        if (currentRemainingTime > 0 && currentRemainingTime <= WARNING_BEFORE) {
          setTimeLeft(Math.floor(currentRemainingTime / 1000 / 60));
          setShowTimeoutWarning(true);
        }
      }, Math.max(0, remainingTime - WARNING_BEFORE));

      // Set new session timeout timer
      sessionTimerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, remainingTime);
    }
  }, [handleAutoLogout]);

  // Extend session when user confirms
  const extendSession = useCallback(() => {
    setShowTimeoutWarning(false);
    updateLastActivity();

    // Refresh token
    if (auth.currentUser) {
      getIdToken(auth.currentUser, true).catch(console.error);
    }
  }, [updateLastActivity]);

  // Set up activity listeners
  useEffect(() => {
    if (!user || !isInitializedRef.current) return;

    // Add activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
    };
  }, [user, updateLastActivity]);

  // Initialize session timer
  useEffect(() => {
    if (!user || !isInitializedRef.current) return;

    // Initialize session timer using updateLastActivity
    const timer = setTimeout(() => {
      if (isInitializedRef.current && user) {
        updateLastActivity();
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    };
  }, [user, updateLastActivity]);

  // Listen for auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if token needs refresh
          await getIdToken(firebaseUser, true);
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
    });

    // Check for existing session
    const initAuth = async () => {
      const firebaseUser = AuthService.getCurrentUser();

      if (firebaseUser) {
        try {
          // Force token refresh on initial load
          await getIdToken(firebaseUser, true);
          const userData = await userService.getUserById(firebaseUser.uid);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await AuthService.login(email, password);
      if (result.success && result.user) {
        // Force token refresh on login
        await getIdToken(result.user, true);
        const userData = await userService.getUserById(result.user.uid);
        setUser(userData);
        // Reset last activity on login
        lastActivityRef.current = Date.now();
        // Initialize timers
        setTimeout(() => {
          if (userData) {
            updateLastActivity();
          }
        }, 0);
      }
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFacilitator: user?.role === 'facilitator',
    showTimeoutWarning,
    timeLeft,
    extendSession
  };
};

export default useAuth;