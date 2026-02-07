
import { apiClient } from '@/lib/apiClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const storageUrl = `${supabaseUrl}/storage/v1/object/public/images`;

const getPlaceholderImage = (category) => {
    const cat = category?.toLowerCase() || '';

    // 'Vigorizzanti' uses 'vigorizzanti.webp' - prioritizing this check
    if (cat.includes('vigoriza')) return `${storageUrl}/vigorizzanti.webp`;

    if (cat.includes('lubri') || cat.includes('gel')) return `${storageUrl}/lubricante.webp`;
    if (cat.includes('frag') || cat.includes('profum')) return `${storageUrl}/fragancia.webp`;

    // 'Afrodisiaco' and others use 'afrodisiaco.webp'
    if (cat.includes('afro') || cat.includes('suple') || cat.includes('crema')) return `${storageUrl}/afrodisiaco.webp`;
    if (cat.includes('olio') || cat.includes('aceite')) return `${storageUrl}/olio.webp`;
    if (cat.includes('gioco') || cat.includes('juego')) return `${storageUrl}/gioco.webp`;

    return `${storageUrl}/lubricante.webp`; // Default fallback
};

export const productService = {
    async getProducts() {
        // Usamos apiClient para manejo automático de errores y logging
        const { data } = await apiClient.get('products', query => query.order('id'));

        if (data && data.length > 0) {
            return data.map(p => {
                // Fix: Ignore hardcoded 'afrodisiaco.png' in DB which might be broken or incorrect for Vigorizzanti
                const hasBrokenUrl = p.image_url && p.image_url.includes('afrodisiaco.png');
                const validImageUrl = hasBrokenUrl ? null : p.image_url;

                return {
                    ...p,
                    image: validImageUrl || getPlaceholderImage(p.category),
                    fallbackImage: getPlaceholderImage(p.category), // 🆕 Backup image for UI error handling
                    image2: p.image2_url, // 🆕 New mapping for second image
                    image3: p.image3_url, // 🆕 New mapping for third image
                    sizeFlOz: p.size_fl_oz,
                    size: p.size_ml, // Mapped to 'size' for frontend compatibility
                    sizeMl: p.size_ml, // Keeping this just in case, or removing if redundant. Let's keep for safety.
                    productFilter: p.product_filter || p.usage_area, // Mapped to 'productFilter' (new standard)
                    usageArea: p.product_filter || p.usage_area,     // Keep 'usageArea' for backward compatibility during refactor
                    targetAudience: p.target_audience,
                    brand: p.brand || 'Sexitive', // Default fallback for now if null
                    ingredients: p.ingredients,
                    tips: p.tips,
                    descriptionAdditional: p.description_additional || p.details, // Fix: Use 'details' if 'description_additional' is empty
                    createdAt: new Date(p.created_at)
                };
            });
        }

        return [];
    }
};
