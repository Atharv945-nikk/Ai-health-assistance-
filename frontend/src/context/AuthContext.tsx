import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, HealthProfile, LanguageCode } from '../types/index.js';
import { authApi, profileApi, setToken, clearToken, getToken } from '../api/client.js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  healthProfile: HealthProfile | null;
  token: string | null;
  language: LanguageCode;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, preferredLanguage?: LanguageCode) => Promise<void>;
  logout: () => void;
  setLanguage: (lang: LanguageCode) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [language, setLanguageState] = useState<LanguageCode>(
    (localStorage.getItem('healthcare_lang') as LanguageCode) || 'en'
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setHealthProfile(data.healthProfile);
      if (data.profile?.preferredLanguage) {
        setLanguageState(data.profile.preferredLanguage);
        localStorage.setItem('healthcare_lang', data.profile.preferredLanguage);
      }
    } catch (err) {
      console.warn('Session expired or invalid, clearing token');
      clearToken();
      setTokenState(null);
      setUser(null);
      setProfile(null);
      setHealthProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      setProfile(res.profile);
      if (res.profile.preferredLanguage) {
        setLanguageState(res.profile.preferredLanguage);
        localStorage.setItem('healthcare_lang', res.profile.preferredLanguage);
      }
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, preferredLanguage?: LanguageCode) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        email,
        password,
        fullName,
        preferredLanguage: preferredLanguage || language,
      });
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      setProfile(res.profile);
      if (preferredLanguage) {
        setLanguageState(preferredLanguage);
        localStorage.setItem('healthcare_lang', preferredLanguage);
      }
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setProfile(null);
    setHealthProfile(null);
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('healthcare_lang', lang);
    if (user && profile) {
      profileApi.updateProfile({ preferredLanguage: lang }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        healthProfile,
        token,
        language,
        isLoading,
        login,
        register,
        logout,
        setLanguage,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
