export interface ProductDB {
    id: string;
    created_at: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image_url?: string;
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
    size_fl_oz?: number;
    image2_url?: string;
    image3_url?: string;
    subtitle?: string;
    code?: string;
    usage?: string;
    product_filter?: string;
    usage_area?: string;
    target_audience?: string;
    details?: string;
    description_additional?: string;
}

export interface Product {
    id: string;
    createdAt: Date;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    slug: string;
    featured: boolean;

    // Optional fields
    b2bPrice?: number;
    ingredients?: string;
    usageTips?: string;
    brand: string;
    format?: string;
    sensation?: string;
    sizeMl?: number;
    sizeFlOz?: number;
    image2?: string;
    image3?: string;
    subtitle?: string;
    code?: string;
    usage?: string;

    // Mapped fields
    fallbackImage: string;
    size: string | number;
    productFilter?: string;
    usageArea?: string;
    targetAudience?: string;
    tips?: string;
    descriptionAdditional?: string;
    details?: string;
}

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment?: string;
    created_at: string;
}
