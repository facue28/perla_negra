import { apiClient } from '@/lib/apiClient';
import { Product, ProductDB } from '@/features/products/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const storageUrl = `${supabaseUrl}/storage/v1/object/public/images`;

const getPlaceholderImage = (category: string | undefined): string => {
    const cat = category?.toLowerCase() || '';

    // 'Vigorizzanti' uses 'vigorizzanti.webp' - prioritizing this check
    if (cat.includes('vigoriza')) return `${storageUrl}/vigorizzanti.webp`;

    if (cat.includes('lubri') || cat.includes('gel')) return `${storageUrl}/lubricante.webp`;
    if (cat.includes('frag') || cat.includes('profum')) return `${storageUrl}/fragancia.webp`;

    // 'Afrodisiaco' and others use 'afrodisiaco.webp'
    if (cat.includes('afro') || cat.includes('suple') || cat.includes('crema')) return `${storageUrl}/afrodisiaco.webp`;
    if (cat.includes('olio') || cat.includes('aceite')) return `${storageUrl}/olio.webp`;
    if (cat.includes('gioco') || cat.includes('juego')) return `${storageUrl}/gioco.webp`;

    return `${storageUrl}/lubricante.webp`; // Revert to known working fallback
};

// Internal secure mapper
const mapProductDBToProduct = (db: ProductDB): Product => {
    // 1. Safe Image Logic
    const hasBrokenUrl = db.image_url && db.image_url.includes('afrodisiaco.png');
    // Prioritize valid DB URL, then category fallback, then generic placeholder
    const validImageUrl = (hasBrokenUrl || !db.image_url)
        ? getPlaceholderImage(db.category)
        : db.image_url;

    // 2. Size Logic
    let displaySize: string | number = 'N/A';
    if (db.size_ml) {
        displaySize = `${db.size_ml}ml`;
    } else if (db.size_fl_oz) {
        displaySize = `${db.size_fl_oz}oz`;
    } else if (db.format) {
        displaySize = db.format;
    }

    return {
        id: db.id,
        createdAt: new Date(db.created_at), // Strict Date conversion
        name: db.name,
        description: db.description || '', // Fallback to empty string
        price: Number(db.price), // Ensure number
        category: db.category,
        image: validImageUrl,
        stock: db.stock,
        slug: db.slug,
        featured: db.featured || false,

        // Optional / Mapped
        brand: db.brand || 'Perla Negra', // Fallback
        b2bPrice: db.b2b_price,
        ingredients: db.ingredients,
        usageTips: db.usage_tips,
        format: db.format,
        sensation: db.sensation,
        sizeMl: db.size_ml,
        sizeFlOz: db.size_fl_oz,
        image2: db.image2_url,
        image3: db.image3_url,
        subtitle: db.subtitle,
        code: db.code,
        usage: db.usage,

        // Mapped helpers
        fallbackImage: getPlaceholderImage(db.category),
        size: displaySize,
        productFilter: db.product_filter || db.usage_area,
        usageArea: db.usage_area || db.product_filter,
        targetAudience: db.target_audience,
        tips: db.usage_tips, // Map usage_tips to tips
        descriptionAdditional: db.description_additional || db.details,
        details: db.details
    };
};

export const productService = {
    async getProducts(): Promise<Product[]> {
        // Usamos apiClient para manejo automático de errores y logging
        const { data } = await apiClient.get('products', query => query.order('id'));

        if (data && Array.isArray(data) && data.length > 0) {
            return data.map((item: any) => mapProductDBToProduct(item as ProductDB));
        }

        return [];
    }
};
