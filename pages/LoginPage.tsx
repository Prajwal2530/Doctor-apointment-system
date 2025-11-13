import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import { StethoscopeIcon } from '../components/icons/StethoscopeIcon';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const validateInputs = () => {
    // Registration validation
    if (!isLogin) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return false;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return false;
      }

      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!specialCharRegex.test(password)) {
        setError('Password must include at least one special character (e.g., !@#$%).');
        return false;
      }
    }
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);

    try {
      let errorMessage: string | null = null;
      if (isLogin) {
        errorMessage = await login(email, password);
      } else {
        errorMessage = await register(name, email, password);
      }
      
      if (errorMessage) {
        setError(errorMessage);
      }
      // On successful login/register, the AuthProvider will handle navigation
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="flex items-center space-x-3 mb-8">
        <StethoscopeIcon className="w-12 h-12 text-primary"/>
        <h1 className="text-4xl font-bold text-dark">
          Medi<span className="text-primary">Book</span>
        </h1>
      </div>
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-gray-700">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          {error && <p className="text-danger text-center">{error}</p>}
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
            {!isLogin && (
              <p className="mt-2 text-xs text-gray-500">
                Must be at least 8 characters and include one special character (e.g., !@#$%).
              </p>
            )}
          </div>
          
          <Button type="submit" className="w-full flex justify-center" disabled={loading}>
            {loading ? <Spinner /> : (isLogin ? 'Login' : 'Register')}
          </Button>
          
          <p className="text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-medium text-primary hover:text-primary-hover ml-1"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
