import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser { }

export interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}
