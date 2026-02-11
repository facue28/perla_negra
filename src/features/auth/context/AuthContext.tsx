import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const checkAdminRole = async (userEmail: string) => {
        try {
            const { data, error } = await supabase.rpc('is_admin', {
                user_email: userEmail
            });

            if (error) {
                logger.error('Error checking admin role', error);
                setIsAdmin(false);
                return;
            }

            setIsAdmin(data === true);
        } catch (err) {
            logger.error('Unexpected error in checkAdminRole', err);
            setIsAdmin(false);
        }
    };

    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        const initializeAuth = async () => {
            console.log('[Auth] Initializing Auth Session...');
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const currentUser = session?.user ?? null;
                console.log('[Auth] Initial session:', currentUser?.email || 'Guest');

                setUser(currentUser);
                if (currentUser?.email) {
                    await checkAdminRole(currentUser.email);
                }
            } catch (err) {
                console.error('[Auth] Initialization error:', err);
                setUser(null);
                setIsAdmin(false);
            } finally {
                console.log('[Auth] Initialization complete. loading -> false');
                setLoading(false);
            }
        };

        initializeAuth();

        // Runtime updates - absolutely silent
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[Auth] Event:', event, 'User:', session?.user?.email);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser?.email) {
                // Background check without blocking UI
                checkAdminRole(currentUser.email);
            } else {
                setIsAdmin(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        console.log('[Auth] Login manual start:', email);
        setLoading(true);
        try {
            const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            if (session?.user?.email) {
                await checkAdminRole(session.user.email);
            }
        } finally {
            console.log('[Auth] Login manual end. loading -> false');
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        console.log('[Auth] Logout manual start');
        setLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            setIsAdmin(false);
        } finally {
            console.log('[Auth] Logout manual end. loading -> false');
            setLoading(false);
        }
    };

    console.log('[Auth] Context state:', { loading, user: user?.email, isAdmin });

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

