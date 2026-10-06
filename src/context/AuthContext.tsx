import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Business, SavedAccount } from '../types/index.js';
import { api } from '../lib/api.js';
import {
  isSupabaseConfigured,
  getSupabaseClient,
  getSupabaseCredentials,
  testSupabaseConnection,
} from '../lib/supabase.js';

interface AuthContextType {
  user: User | null;
  activeBusiness: Business | null;
  businesses: Business[];
  token: string | null;
  loading: boolean;
  savedAccounts: SavedAccount[];
  isSupabase: boolean;
  supabaseUrl: string;
  login: (email: string, password?: string, remember?: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  switchBusiness: (businessId: string) => Promise<void>;
  updateActiveBusiness: (updates: Partial<Business>) => Promise<void>;
  refreshMe: () => Promise<void>;
  loginAsDemoOwner: () => Promise<void>;
  loginAsDemoCashier: () => Promise<void>;
  removeSavedAccount: (email: string) => void;
  quickSignInSavedAccount: (account: SavedAccount) => Promise<void>;
  clearAllSavedAccounts: () => void;
  testConnection: () => Promise<{ ok: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'business_billing_token';
const USER_KEY = 'business_billing_user';
const BIZ_KEY = 'business_billing_active_biz';
const BIZ_DATA_KEY = 'business_billing_active_biz_data';
const ALL_BIZ_KEY = 'business_billing_businesses';
const SAVED_ACCOUNTS_KEY = 'business_billing_saved_accounts';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name?.toLowerCase().includes('rahul')) return null;
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [activeBusiness, setActiveBusiness] = useState<Business | null>(() => {
    try {
      const stored = localStorage.getItem(BIZ_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [businesses, setBusinesses] = useState<Business[]>(() => {
    try {
      const stored = localStorage.getItem(ALL_BIZ_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (stored) {
        const list: SavedAccount[] = JSON.parse(stored);
        // Explicitly filter out any "rahul" account
        return list.filter((a) => !a.name.toLowerCase().includes('rahul') && !a.email.toLowerCase().includes('rahul'));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isSupabase, setIsSupabase] = useState<boolean>(isSupabaseConfigured());
  const { url: supabaseUrl } = getSupabaseCredentials();

  // Helper to persist account into saved accounts list
  const persistAccountToSavedList = (newUser: User, newBiz: Business, newToken: string) => {
    if (newUser.name.toLowerCase().includes('rahul')) return;
    try {
      const newSavedItem: SavedAccount = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        businessName: newBiz.name,
        businessCategory: newBiz.category,
        businessId: newBiz.id,
        currency: newBiz.currency || 'AED',
        token: newToken,
        lastSignedIn: new Date().toISOString(),
      };

      setSavedAccounts((prev) => {
        const filtered = prev.filter(
          (acc) =>
            acc.email.toLowerCase() !== newUser.email.toLowerCase() &&
            !acc.name.toLowerCase().includes('rahul')
        );
        const updated = [newSavedItem, ...filtered];
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Failed to save account to persistent storage', e);
    }
  };

  const initAuth = async () => {
    setIsSupabase(isSupabaseConfigured());

    // 1. If Supabase is configured, check Supabase Auth session first
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        const { data: sessionData } = await client.auth.getSession();
        const session = sessionData?.session;

        if (session?.user) {
          const authUser = session.user;
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          const bizList = await api.getMe().then((res) => res.businesses).catch(() => []);
          const activeBiz = bizList[0] || activeBusiness || null;

          const currentUser: User = {
            id: authUser.id,
            name: profile?.full_name || authUser.email?.split('@')[0] || 'Store Owner',
            email: authUser.email || '',
            phone: profile?.phone || '',
            role: 'owner',
            businessIds: bizList.map((b) => b.id),
            activeBusinessId: activeBiz?.id || '',
            createdAt: authUser.created_at || new Date().toISOString(),
          };

          setUser(currentUser);
          setActiveBusiness(activeBiz);
          setBusinesses(bizList);
          setToken(session.access_token);

          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          if (activeBiz) {
            localStorage.setItem(BIZ_DATA_KEY, JSON.stringify(activeBiz));
            localStorage.setItem(BIZ_KEY, activeBiz.id);
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase auth session check failed:', err);
      }
    }

    // 2. Local session check
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data && data.user && data.business) {
        if (!data.user.name.toLowerCase().includes('rahul')) {
          setUser(data.user);
          setActiveBusiness(data.business);
          setBusinesses(data.businesses || [data.business]);

          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          localStorage.setItem(BIZ_DATA_KEY, JSON.stringify(data.business));
          localStorage.setItem(ALL_BIZ_KEY, JSON.stringify(data.businesses || [data.business]));
          localStorage.setItem(BIZ_KEY, data.business.id);

          persistAccountToSavedList(data.user, data.business, savedToken);
        }
      }
    } catch {
      const cachedUser = localStorage.getItem(USER_KEY);
      const cachedBiz = localStorage.getItem(BIZ_DATA_KEY);
      if (cachedUser && cachedBiz) {
        try {
          const parsedU = JSON.parse(cachedUser);
          if (!parsedU.name.toLowerCase().includes('rahul')) {
            setUser(parsedU);
            setActiveBusiness(JSON.parse(cachedBiz));
          }
        } catch {
          logout();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    // Listen to Supabase Auth state changes (real-time session sync)
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const authUser = session.user;
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          const currentUser: User = {
            id: authUser.id,
            name: profile?.full_name || authUser.email?.split('@')[0] || 'Owner',
            email: authUser.email || '',
            phone: profile?.phone || '',
            role: 'owner',
            businessIds: [],
            activeBusinessId: '',
            createdAt: authUser.created_at || new Date().toISOString(),
          };
          setUser(currentUser);
          setToken(session.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          localStorage.setItem(TOKEN_KEY, session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setActiveBusiness(null);
          setBusinesses([]);
          setToken(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(BIZ_DATA_KEY);
          localStorage.removeItem(BIZ_KEY);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password = 'password123', remember = true) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      setActiveBusiness(res.business);
      setBusinesses(res.businesses || [res.business]);
      setToken(res.token);

      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      localStorage.setItem(BIZ_DATA_KEY, JSON.stringify(res.business));
      localStorage.setItem(ALL_BIZ_KEY, JSON.stringify(res.businesses || [res.business]));
      if (res.business) {
        localStorage.setItem(BIZ_KEY, res.business.id);
      }

      if (remember) {
        persistAccountToSavedList(res.user, res.business, res.token);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any) => {
    setLoading(true);
    try {
      const res = await api.register(formData);
      setUser(res.user);
      setActiveBusiness(res.business);
      setBusinesses([res.business]);
      setToken(res.token);

      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      localStorage.setItem(BIZ_DATA_KEY, JSON.stringify(res.business));
      localStorage.setItem(ALL_BIZ_KEY, JSON.stringify([res.business]));
      localStorage.setItem(BIZ_KEY, res.business.id);

      persistAccountToSavedList(res.user, res.business, res.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(BIZ_DATA_KEY);
    localStorage.removeItem(ALL_BIZ_KEY);
    localStorage.removeItem(BIZ_KEY);

    setUser(null);
    setActiveBusiness(null);
    setBusinesses([]);
    setToken(null);
  };

  const switchBusiness = async (businessId: string) => {
    if (!activeBusiness || activeBusiness.id === businessId) return;
    try {
      const res = await api.switchBusiness(businessId);
      setActiveBusiness(res.activeBusiness);
      localStorage.setItem(BIZ_KEY, res.activeBusiness.id);
      localStorage.setItem(BIZ_DATA_KEY, JSON.stringify(res.activeBusiness));

      if (user && token) {
        persistAccountToSavedList(user, res.activeBusiness, token);
      }
    } catch (err) {
      console.error('Failed to switch business:', err);
    }
  };

  const updateActiveBusiness = async (updates: Partial<Business>) => {
    if (!activeBusiness) return;
    try {
      const updated = await api.updateBusiness(activeBusiness.id, updates);
      setActiveBusiness(updated);
      localStorage.setItem(BIZ_DATA_KEY, JSON.stringify(updated));

      const updatedList = businesses.map((b) => (b.id === updated.id ? updated : b));
      setBusinesses(updatedList);
      localStorage.setItem(ALL_BIZ_KEY, JSON.stringify(updatedList));

      if (user && token) {
        persistAccountToSavedList(user, updated, token);
      }
    } catch (err) {
      console.error('Failed to update business:', err);
      throw err;
    }
  };

  const refreshMe = async () => {
    try {
      const data = await api.getMe();
      if (data) {
        setUser(data.user);
        setActiveBusiness(data.business);
        setBusinesses(data.businesses || [data.business]);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(BIZ_DATA_KEY, JSON.stringify(data.business));
        localStorage.setItem(ALL_BIZ_KEY, JSON.stringify(data.businesses || [data.business]));
      }
    } catch (e) {
      console.error('Failed to refresh session', e);
    }
  };

  const removeSavedAccount = (email: string) => {
    setSavedAccounts((prev) => {
      const updated = prev.filter((acc) => acc.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllSavedAccounts = () => {
    setSavedAccounts([]);
    localStorage.removeItem(SAVED_ACCOUNTS_KEY);
  };

  const quickSignInSavedAccount = async (account: SavedAccount) => {
    if (account.name.toLowerCase().includes('rahul')) return;
    await login(account.email, 'password123', true);
  };

  const loginAsDemoOwner = async () => {
    await login('owner@dubaiminimart.ae', 'password123', true);
  };

  const loginAsDemoCashier = async () => {
    await login('cashier@shopkeeperpro.com', 'password123', true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeBusiness,
        businesses,
        token,
        loading,
        savedAccounts,
        isSupabase,
        supabaseUrl,
        login,
        register,
        logout,
        switchBusiness,
        updateActiveBusiness,
        refreshMe,
        loginAsDemoOwner,
        loginAsDemoCashier,
        removeSavedAccount,
        quickSignInSavedAccount,
        clearAllSavedAccounts,
        testConnection: testSupabaseConnection,
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
