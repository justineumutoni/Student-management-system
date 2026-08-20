'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, UserRole } from '@/types';
import { StorageManager } from '@/lib/storage';
import { isFirebaseConfigured, auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string, requestedRole?: UserRole) => Promise<{ success: boolean; message: string; role?: UserRole }>;
  registerTeacher: (data: { name: string; email: string; department: string; phone?: string; password?: string }) => Promise<{ success: boolean; message: string }>;
  quickDemoLogin: (role: 'teacher' | 'student') => void;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'sms_current_session_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize session from storage
  useEffect(() => {
    StorageManager.initializeData();
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Verify user still exists in database
        const freshUser = StorageManager.getUserById(parsed.id);
        if (freshUser && freshUser.status === 'active') {
          setUser(freshUser);
        } else {
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      } catch (err) {
        console.error('Failed to parse session:', err);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password?: string,
    requestedRole?: UserRole
  ): Promise<{ success: boolean; message: string; role?: UserRole }> => {
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const allUsers = StorageManager.getUsers();
    
    // Find matching user
    const matchedUser = allUsers.find(
      u => u.email.toLowerCase() === cleanEmail
    );

    if (!matchedUser) {
      setIsLoading(false);
      return { success: false, message: 'No account found with this email address.' };
    }

    if (matchedUser.status === 'pending') {
      setIsLoading(false);
      return { 
        success: false, 
        message: 'Your registration is still pending approval by the teacher/admin. You will receive access once approved.' 
      };
    }

    if (matchedUser.status === 'rejected') {
      setIsLoading(false);
      return { success: false, message: 'This registration request has been declined.' };
    }

    // Role check if explicitly specified
    if (requestedRole && matchedUser.role !== requestedRole) {
      setIsLoading(false);
      return { 
        success: false, 
        message: `This email is registered as a ${matchedUser.role}, not a ${requestedRole}.` 
      };
    }

    // Check password if generated password exists
    if (password && matchedUser.generatedPassword && password !== matchedUser.generatedPassword && password !== 'password123') {
      // Allow demo pass or exact generated password
      setIsLoading(false);
      return {
        success: false,
        message: 'Invalid password. Please check your credentials notification or use the demo password.'
      };
    }

    // Firebase Auth attempt if configured
    if (isFirebaseConfigured && auth && password) {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch {
        // Fall back gracefully to local match
      }
    }

    // Set current active session
    setUser(matchedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matchedUser));
    setIsLoading(false);

    return { 
      success: true, 
      message: `Welcome back, ${matchedUser.name}!`,
      role: matchedUser.role 
    };
  };

  const registerTeacher = async (data: {
    name: string;
    email: string;
    department: string;
    phone?: string;
    password?: string;
  }): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    const res = StorageManager.registerTeacher(data);
    if (res.success && res.teacher) {
      setUser(res.teacher);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.teacher));
      setIsLoading(false);
      return { success: true, message: res.message };
    }
    setIsLoading(false);
    return { success: false, message: res.message };
  };

  const quickDemoLogin = (role: 'teacher' | 'student') => {
    setIsLoading(true);
    const allUsers = StorageManager.getUsers();
    
    let demoUser: UserProfile | undefined;
    if (role === 'teacher') {
      demoUser = allUsers.find(u => u.role === 'teacher' && u.status === 'active') || allUsers[0];
    } else {
      demoUser = allUsers.find(u => u.role === 'student' && u.status === 'active');
    }

    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
      setIsLoading(false);

      if (role === 'teacher') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    }
  };

  const logout = () => {
    if (isFirebaseConfigured && auth) {
      fbSignOut(auth).catch(console.error);
    }
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    router.push('/login');
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    
    const allUsers = StorageManager.getUsers();
    const idx = allUsers.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      allUsers[idx] = updated;
      StorageManager.saveUsers(allUsers);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, registerTeacher, quickDemoLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
