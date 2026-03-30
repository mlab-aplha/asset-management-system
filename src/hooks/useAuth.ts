// src/hooks/useAuth.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthService } from '@backend/services/AuthService';
import { userService } from '@backend/services/UserService';
import { User } from '@/core/entities/User';
import { auth } from '@backend/firebase/config';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { authSuppress } from '@/utils/authSuppress';

const SESSION_TIMEOUT = 5 * 60 * 60 * 1000;
const WARNING_BEFORE = 5 * 60 * 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryLogin(
  fn: () => Promise<{ success: boolean; message?: string; user?: unknown }>,
  attempts: number,
  delayMs: number,
) {
  let lastResult = await fn();
  if (lastResult.success) return lastResult;
  for (let i = 1; i < attempts; i++) {
    await wait(delayMs);
    lastResult = await fn();
    if (lastResult.success) return lastResult;
  }
  return lastResult;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const suppressAuthChanges = useRef(0);
  const adminUserRef = useRef<User | null>(null);

  useEffect(() => {
    lastActivityRef.current = Date.now();
    isInitializedRef.current = true;
  }, []);

  useEffect(() => {
    if (user) adminUserRef.current = user;
  }, [user]);

  const signOut = useCallback(async () => {
    try {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
      sessionStorage.clear();
      const result = await AuthService.logout();
      if (result.success) {
        setUser(null);
        adminUserRef.current = null;
        setShowTimeoutWarning(false);
      }
      return result;
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  }, []);

  const handleAutoLogout = useCallback(async () => {
    setShowTimeoutWarning(false);
    try {
      await signOut();
      alert('Session expired due to inactivity. Please log in again.');
      window.location.href = '/login';
    } catch (error) {
      console.error('Auto logout error:', error);
    }
  }, [signOut]);

  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);

    warningTimerRef.current = setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = SESSION_TIMEOUT - elapsed;
      if (remaining > 0 && remaining <= WARNING_BEFORE) {
        setTimeLeft(Math.floor(remaining / 1000 / 60));
        setShowTimeoutWarning(true);
      }
    }, SESSION_TIMEOUT - WARNING_BEFORE);

    sessionTimerRef.current = setTimeout(() => {
      handleAutoLogout();
    }, SESSION_TIMEOUT);
  }, [handleAutoLogout]);

  const extendSession = useCallback(() => {
    setShowTimeoutWarning(false);
    updateLastActivity();
    if (auth.currentUser) {
      getIdToken(auth.currentUser, true).catch(console.error);
    }
  }, [updateLastActivity]);

  useEffect(() => {
    if (!user || !isInitializedRef.current) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, updateLastActivity));
    return () => events.forEach(e => window.removeEventListener(e, updateLastActivity));
  }, [user, updateLastActivity]);

  useEffect(() => {
    if (!user || !isInitializedRef.current) return;
    const timer = setTimeout(() => {
      if (isInitializedRef.current && user) updateLastActivity();
    }, 0);
    return () => {
      clearTimeout(timer);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    };
  }, [user, updateLastActivity]);

  const findUserByAuthUid = useCallback(async (authUid: string): Promise<User | null> => {
    try {
      const users = await userService.getUsers();
      return users.find((u: User) => u.uid === authUid) || null;
    } catch (error) {
      console.error('Error finding user by auth UID:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      // GUARD 1: legacy suppress counter
      if (suppressAuthChanges.current > 0) {
        console.log('[useAuth] suppressed (legacy)');
        return;
      }

      // GUARD 2: authSuppress module (secondary-app flow)
      if (authSuppress.isActive()) {
        console.log('[useAuth] suppressed (authSuppress module)');
        return;
      }

      if (firebaseUser) {
        // GUARD 3: UID mismatch — new user bleeding through from secondary app
        if (adminUserRef.current && firebaseUser.uid !== adminUserRef.current.uid) {
          console.log('[useAuth] ignoring auth change — UID belongs to newly created user');
          return;
        }

        try {
          await getIdToken(firebaseUser, true);
          const userData = await findUserByAuthUid(firebaseUser.uid);
          if (!userData && adminUserRef.current) {
            setUser(adminUserRef.current);
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (!adminUserRef.current) setUser(null);
        }
      } else {
        if (adminUserRef.current || suppressAuthChanges.current > 0) return;
        setUser(null);
      }

      setLoading(false);
    });

    const initAuth = async () => {
      const firebaseUser = AuthService.getCurrentUser();
      if (firebaseUser) {
        try {
          await getIdToken(firebaseUser, true);
          const userData = await findUserByAuthUid(firebaseUser.uid);
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
  }, [findUserByAuthUid]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await AuthService.login(email, password);
      if (result.success && result.user) {
        await getIdToken(result.user, true);
        const userData = await findUserByAuthUid(result.user.uid);
        setUser(userData);
        lastActivityRef.current = Date.now();
        setTimeout(() => { if (userData) updateLastActivity(); }, 0);
      }
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  };

  // Kept for backward compatibility
  const createUserWithAdminContext = useCallback(async <T>(
    createUserFn: () => Promise<T>,
    _adminEmailUnused: string,
    adminPassword: string,
  ): Promise<{ result: T; success: boolean; error?: string }> => {
    const capturedAdminEmail = auth.currentUser?.email ?? '';
    const savedAdmin = adminUserRef.current ?? user;

    if (!capturedAdminEmail) {
      return {
        result: undefined as unknown as T,
        success: false,
        error: 'Could not read admin email. Please log out and log in again.',
      };
    }

    suppressAuthChanges.current += 1;

    try {
      const result = await createUserFn();
      await wait(1500);

      const loginResult = await retryLogin(
        () => AuthService.login(capturedAdminEmail, adminPassword),
        3,
        1000,
      );

      if (!loginResult.success || !loginResult.user) {
        suppressAuthChanges.current = 0;
        if (savedAdmin) { setUser(savedAdmin); adminUserRef.current = savedAdmin; }
        return {
          result,
          success: false,
          error: `Could not restore admin session: ${loginResult.message ?? 'Unknown error'}`,
        };
      }

      const adminUserData = await findUserByAuthUid((loginResult.user as { uid: string }).uid);
      const restoredUser = adminUserData ?? savedAdmin;
      setUser(restoredUser);
      adminUserRef.current = restoredUser;

      return { result, success: true };
    } catch (error) {
      if (savedAdmin) { setUser(savedAdmin); adminUserRef.current = savedAdmin; }
      return {
        result: undefined as unknown as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setTimeout(() => {
        suppressAuthChanges.current = Math.max(0, suppressAuthChanges.current - 1);
      }, 3000);
    }
  }, [findUserByAuthUid, user]);

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'super_admin',
    isManager: user?.role === 'hub_manager',
    isIT: user?.role === 'it',
    isFacilitator: user?.role === 'asset_facilitator',
    isStudent: user?.role === 'student',
    showTimeoutWarning,
    timeLeft,
    extendSession,
    createUserWithAdminContext,
  };
};

export default useAuth;