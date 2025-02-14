'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Loader2, Eye, EyeOff, Mail, User, Lock } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

interface FormData {
  username: string;
  email: string;
  password: string;
}

const SignIn = () => {
  const { data: session } = useSession();
  const { loginUser, adminSignIn, error, clearErrors } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/';

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
  });
  const [isUsernameSignIn, setIsUsernameSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      router.push(callbackUrl);
    }
  }, [session, callbackUrl, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearErrors();
    }
  }, [error, clearErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check for admin login
      if (formData.username === 'Admin' || formData.email?.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        const adminResult = await adminSignIn();
        if (adminResult.success) {
          router.push('/');
          return;
        }
        throw new Error(adminResult.message);
      }

      // Regular user login
      const credentials = {
        type: 'user',
        ...(isUsernameSignIn 
          ? { username: formData.username }
          : { email: formData.email }),
        password: formData.password
      };

      const result = await loginUser(credentials);

      if (result.success) {
        toast.success('Successfully signed in!');
        router.push(callbackUrl);
      } else {
        console.error(result.message);
      }
    } catch (error: any) {
      console.error(error.message || 'An error occurred during sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success('Successfully signed in with Google!');
        router.push(callbackUrl);
      }
    } catch (error: any) {
      toast.error('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-container px-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-lg ring-1 ring-border">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted">
            Sign in to continue to your workspace
          </p>
        </div>

        {/* Sign In Method Toggle */}
        <div className="flex rounded-lg p-1 bg-muted">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              isUsernameSignIn
                ? 'bg-card shadow-sm text-foreground'
                : 'text-foreground'
            }`}
            onClick={() => setIsUsernameSignIn(true)}
            disabled={isLoading}
          >
            <User className="w-4 h-4 inline mr-2" />
            Username
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              !isUsernameSignIn
                ? 'bg-card shadow-sm text-foreground'
                : 'text-foreground'
            }`}
            onClick={() => setIsUsernameSignIn(false)}
            disabled={isLoading}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </button>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {isUsernameSignIn ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-foreground" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-background text-foreground border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-background text-foreground border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-2 bg-background text-foreground border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
              <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <FaGoogle className="h-4 w-4" />
              <span>Continue with Google</span>
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="space-y-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-foreground hover:text-foreground transition-colors"
          >
            Forgot your password?
          </Link>
          <div className="text-sm">
            <span className="text-foreground">Don't have an account? </span>
            <Link
              href="/signup"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;