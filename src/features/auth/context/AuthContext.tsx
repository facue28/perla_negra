import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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

    useEffect(() => {
        const getSession = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser?.email) {
                await checkAdminRole(currentUser.email);
            }
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setLoading(true);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser?.email) {
                await checkAdminRole(currentUser.email);
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const logout = async (): Promise<void> => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
            {!loading && children}
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

