import { supabase } from '@/lib/supabase';
import { SiteConfig } from '../types';

export const configService = {
    /**
     * Fetches all public configuration keys from the site_config table.
     */
    getPublicConfig: async (): Promise<SiteConfig> => {
        try {
            const { data, error } = await supabase
                .from('site_config')
                .select('key, value')
                .eq('is_public', true);

            if (error) {
                console.error('Error fetching public config:', error);
                return {};
            }

            // Convert array of {key, value} objects into a single Key-Value map
            const configMap: SiteConfig = {};
            if (data) {
                data.forEach(item => {
                    configMap[item.key] = item.value;
                });
            }

            return configMap;
        } catch (err) {
            console.error('Unexpected error fetching config:', err);
            return {};
        }
    }
};
