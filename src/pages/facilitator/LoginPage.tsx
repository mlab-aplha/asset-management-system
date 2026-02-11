 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../../backend-firebase/src/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate with Firebase Auth
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Get user details from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // 3. Check if user has facilitator role
        if (userData.role === 'facilitator' || userData.role === 'admin') {
          // 4. Save to localStorage
          localStorage.setItem('facilitator_token', await user.getIdToken());
          localStorage.setItem('facilitator_user', JSON.stringify({
            id: user.uid,
            name: userData.name || user.displayName || 'Facilitator',
            email: user.email,
            role: userData.role,
            department: userData.department || '',
            location: userData.location || ''
          }));
          
          // 5. Redirect to dashboard
          navigate('/facilitator/dashboard');
        } else {
          setError('Access denied. You do not have facilitator permissions.');
        }
      } else {
        setError('User profile not found.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        default:
          setError('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo login for testing without Firebase
  const handleDemoLogin = () => {
    // Use the credentials your partner provided
    setEmail('facilitator@mlab.co.za');
    setPassword('Facilitator123!');
    
    // For demo, bypass Firebase
    localStorage.setItem('facilitator_token', 'demo-token-123');
    localStorage.setItem('facilitator_user', JSON.stringify({
      id: 'fac-001',
      name: 'John Facilitator',
      email: 'facilitator@mlab.co.za',
      role: 'facilitator',
      department: 'Training'
    }));
    navigate('/facilitator/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            mLab Facilitator Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Asset Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Demo Login (No Firebase)
            </button>
          </div>

          <div className="text-sm text-center text-gray-500">
            <p className="font-medium text-gray-700">Default Credentials:</p>
            <p className="font-mono text-xs mt-1">facilitator@mlab.co.za / Facilitator123!</p>
            <p className="font-mono text-xs">admin@mlab.com / Admin123!</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;