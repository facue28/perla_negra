import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 1. Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) checkAdminRole(session.user.email);
            setLoading(false);
        };

        getSession();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                checkAdminRole(session.user.email);
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkAdminRole = async (userEmail) => {
        try {
            // Updated to use secure RPC
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

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
