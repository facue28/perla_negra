
import { supabase } from '@/lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const storageUrl = `${supabaseUrl}/storage/v1/object/public/images`;

const getPlaceholderImage = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('lubri') || cat.includes('gel')) return `${storageUrl}/lubricante.png`;
    if (cat.includes('frag') || cat.includes('profum')) return `${storageUrl}/fragancia.png`;
    if (cat.includes('afro') || cat.includes('suple') || cat.includes('crema')) return `${storageUrl}/afrodisiaco.png`;
    return `${storageUrl}/lubricante.png`; // Default fallback
};

export const productService = {
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id');

        if (error) throw error;

        if (data && data.length > 0) {
            return data.map(p => ({
                ...p,
                image: p.image_url || getPlaceholderImage(p.category),
                sizeFlOz: p.size_fl_oz,
                size: p.size_ml, // Mapped to 'size' for frontend compatibility
                sizeFlOz: p.size_fl_oz,
                sizeMl: p.size_ml, // Keeping this just in case, or removing if redundant. Let's keep for safety.
                usageArea: p.usage_area,
                targetAudience: p.target_audience,
                brand: p.brand || 'Sexitive', // Default fallback for now if null
                ingredients: p.ingredients,
                tips: p.tips,
                descriptionAdditional: p.description_additional,
                createdAt: new Date(p.created_at)
            }));
        }

        return [];
    }
};
