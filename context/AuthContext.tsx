import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { signIn as nextAuthSignIn, getSession, SignInResponse } from 'next-auth/react';

// Types aligned with NextAuth options
interface User {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  avatar?: {
    url: string;
  };
  isVerified?: boolean;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  role: string;
  loading: boolean;
  error: string | null;
  signupUser: (data: SignupData) => Promise<void>;
  loginUser: (data: LoginData) => Promise<{ success: boolean; message?: string }>;
  adminSignIn: () => Promise<{ success: boolean; message?: string }>;
  setUser: (user: User | null) => void;
  clearErrors: () => void;
}

interface SignupData {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username?: string;
  email?: string;
  password: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Updated to handle the new session structure
  const fetchUser = async () => {
    try {
      setLoading(true);
      const session = await getSession();
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          role: session.user.role,
          name: session.user.name,
          email: session.user.email,
          username: session.user.username,
          avatar: session.user.avatar,
          image: session.user.image
        };
        setUser(userData);
        setRole(userData.role);
      } else {
        setUser(null);
        setRole('user');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signupUser = async ({ name, username, email, password }: SignupData): Promise<void> => {
    try {
      setLoading(true);
      const { data, status } = await axios.post('/api/auth/signup', {
        name,
        username,
        email,
        password,
      });

      if (status === 201) {
        toast.success(
          'Signup successful! Please check your email to verify your account.',
          {
            autoClose: 3000,
            onClose: () => router.push('/signin'),
          }
        );
        setUser(data.user);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async ({
    username,
    email,
    password,
  }: LoginData): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const res = await nextAuthSignIn('credentials', {
        redirect: false,
        username,
        email,
        password,
      }) as SignInResponse;

      if (res.error) {
        if (res.error.includes('verify your email')) {
          router.push('/resend-verification');
        }
        toast.error(res.error);
        return { success: false, message: res.error };
      }

      if (res.ok) {
        await fetchUser();
        toast.success('Login successful!');
        router.refresh(); // Add refresh to update client-side data
        return { success: true };
      }

      return { success: false, message: 'Login failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const adminSignIn = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const res = await nextAuthSignIn('credentials', {
        redirect: false,
        username: 'Admin',
        password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
      }) as SignInResponse;

      if (res.error) {
        toast.error(res.error);
        return { success: false, message: res.error };
      }

      if (res.ok) {
        await fetchUser();
        toast.success('Admin login successful!', {
          autoClose: 1000,
          onClose: () => window.location.reload(),
        });
        return { success: true };
      }

      return { success: false, message: 'Admin login failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Admin login failed';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = (): void => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    user,
    role,
    error,
    loading,
    signupUser,
    loginUser,
    adminSignIn,
    setUser,
    clearErrors,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;