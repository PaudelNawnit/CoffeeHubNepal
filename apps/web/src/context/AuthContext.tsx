/* @refresh reset */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginCredentials, RegisterData } from '@/services/auth.service';

export interface User {
  id: number;
  mongoId?: string; // MongoDB ObjectId as string for backend comparisons
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string; // Base64 image or URL
  role: 'farmer' | 'roaster' | 'trader' | 'exporter' | 'expert' | 'admin' | 'moderator';
  verified?: boolean;
  memberSince?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials, captchaToken?: string) => Promise<void>;
  register: (data: RegisterData, captchaToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Use saved user immediately (fast UI), then refresh from server
          const cachedUser = authService.getCurrentUser();
          if (cachedUser) {
            setUser(cachedUser as User);
          }

          // Refresh from server so changes like "verified" are reflected without re-login
          const freshUser = await authService.fetchMe();
          if (freshUser) {
            const updatedUser = {
              ...(cachedUser || {}),
              ...freshUser
            };
            setUser(updatedUser as User);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            // Token exists but is invalid/expired, clear it
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials, captchaToken?: string) => {
    try {
      setIsLoading(true);
      const response: any = await authService.login(credentials, captchaToken);
      
      if (response.token && response.user) {
        // User is already stored in localStorage by authService
        setUser(response.user as User);
      } else {
        throw new Error('Login failed: No token or user received');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Clear any partial state on error
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData, captchaToken?: string) => {
    try {
      setIsLoading(true);
      const response: any = await authService.register(data, captchaToken);
      
      if (response.token && response.user) {
        // User is already stored in localStorage by authService
        setUser(response.user as User);
      } else {
        throw new Error('Registration failed: No token or user received');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // Clear any partial state on error
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Sync updated user data to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

