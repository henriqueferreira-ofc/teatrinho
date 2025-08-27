import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getUserDocument, isSubscriptionActive, syncGooglePhotoOnFirstLogin } from '@/lib/firebase';
import type { FirestoreUser } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  userProfile: FirestoreUser | null;
  isSubscriber: boolean;
  loading: boolean;
  error: string | null;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUser | null>(null);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await getUserDocument(user.uid);
        setUserProfile(profile);
        
        // Verificar assinatura se o perfil existe
        if (profile?.email) {
          const subscriptionStatus = await isSubscriptionActive(profile.email);
          setIsSubscriber(subscriptionStatus);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      }
    } else {
      setUserProfile(null);
      setIsSubscriber(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Sincronizar foto do Google se necessário
          await syncGooglePhotoOnFirstLogin();
          
          const profile = await getUserDocument(firebaseUser.uid);
          setUserProfile(profile);
          
          // Verificar assinatura se o perfil existe
          if (profile?.email) {
            const subscriptionStatus = await isSubscriptionActive(profile.email);
            setIsSubscriber(subscriptionStatus);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile');
        }
      } else {
        setUserProfile(null);
        setIsSubscriber(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    isSubscriber,
    loading,
    error,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
