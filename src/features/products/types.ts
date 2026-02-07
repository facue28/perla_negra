export interface Product {
    id: string;
    created_at?: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    slug: string;
    featured?: boolean;
    b2b_price?: number;
    ingredients?: string;
    usage_tips?: string;
    brand?: string;
    format?: string;
    sensation?: string;
    size_ml?: number;
    image2_url?: string;
    image3_url?: string;
    subtitle?: string;

    // Mapped fields from service
    code?: string;
    usage?: string;
    image2?: string;
    image3?: string;

    fallbackImage?: string;
    sizeFlOz?: number;
    size?: string | number;
    productFilter?: string;
    usageArea?: string;
    targetAudience?: string;
    tips?: string;
    descriptionAdditional?: string;
    createdAt?: Date | string; // Allow both for flexibility during migration

    // DB fields that might be present
    size_fl_oz?: number;
    target_audience?: string;
    details?: string;
    description_additional?: string;
    usage_area?: string;
    product_filter?: string;
    image_url?: string;
}

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment?: string;
    created_at: string;
}
