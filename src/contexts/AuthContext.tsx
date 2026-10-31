import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, VeritasUserProfile } from '../lib/supabase.ts';

interface AuthContextType {
  user: User | null;
  profile: VeritasUserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInDemoUser: (role?: VeritasUserProfile['role']) => void;
  signOutUser: () => Promise<void>;
  updateRole: (role: VeritasUserProfile['role']) => void;
}

const DEFAULT_DEMO_USER: VeritasUserProfile = {
  id: 'usr-demo-001',
  email: 'elena.vance@veritas.ai',
  full_name: 'Elena Vance',
  role: 'editor',
  organization: 'Global Fact-Checking & Misinformation Desk',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<VeritasUserProfile | null>(DEFAULT_DEMO_USER);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(DEFAULT_DEMO_USER);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        setProfile({
          id: userId,
          email: email || 'analyst@veritas.ai',
          full_name: email ? email.split('@')[0] : 'Analyst',
          role: 'analyst',
          organization: 'VERITAS Intelligence Network',
        });
      }
    } catch (e) {
      console.warn('Could not fetch user profile from Supabase:', e);
    }
  };

  const signInDemoUser = (role: VeritasUserProfile['role'] = 'editor') => {
    const rolesMap: Record<VeritasUserProfile['role'], { name: string; org: string }> = {
      admin: { name: 'Dr. Sarah Connor', org: 'Chief Compliance & Disinformation Directorate' },
      editor: { name: 'Elena Vance', org: 'Senior Markets & Policy Editorial Desk' },
      analyst: { name: 'Marcus Wei', org: 'Cognitive Investigation & Source Verification' },
      viewer: { name: 'Public Auditor', org: 'Transparency & Newsroom Observer' },
    };

    const selected = rolesMap[role] || rolesMap.editor;
    setProfile({
      id: `usr-demo-${role}`,
      email: `${role}@veritas.ai`,
      full_name: selected.name,
      role,
      organization: selected.org,
    });
  };

  const updateRole = (role: VeritasUserProfile['role']) => {
    if (profile) {
      setProfile({
        ...profile,
        role,
      });
    }
  };

  const signOutUser = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(DEFAULT_DEMO_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signInDemoUser,
        signOutUser,
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
