import { create } from 'zustand';
import { SiteConfig } from '../types';
import { configService } from '../services/configService';

interface SiteConfigState {
    config: SiteConfig | null;
    isLoading: boolean;
    error: string | null;
    fetchConfig: () => Promise<void>;
}

export const useSiteConfigStore = create<SiteConfigState>((set, get) => ({
    config: null,
    isLoading: false,
    error: null,
    fetchConfig: async () => {
        // Prevent re-fetching if already loaded or loading
        const { config, isLoading } = get();
        if (config !== null || isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const data = await configService.getPublicConfig();
            set({ config: data, isLoading: false });
        } catch (err) {
            set({ error: 'Failed to load site config', isLoading: false });
        }
    }
}));
