import { supabase } from '@/lib/supabase';

export const couponService = {
    async validateCoupon(code) {
        if (!code) throw new Error('Inserisci un codice');

        // Normalize code: UpperCase and Trim
        const normalizedCode = code.toUpperCase().trim();

        // Use secure RPC function instead of direct table access
        const { data, error } = await supabase
            .rpc('check_coupon', { code_input: normalizedCode });

        if (error || !data) {
            throw new Error('Codice non valido o scaduto');
        }

        return data; // Returns { code, discount_type, value }
    },

    async incrementUsage(code) {
        if (!code) return;
        const { error } = await supabase.rpc('increment_coupon_usage', { code_input: code });
        if (error) console.error('Error tracking coupon usage:', error);
    }
};
