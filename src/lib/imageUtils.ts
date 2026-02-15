interface OptimizeOptions {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    format?: 'origin' | 'jpeg' | 'png' | 'webp';
    quality?: number;
}

/**
 * Generates an optimized URL for Supabase Storage images using the Image Transformation API.
 * 
 * @param url - The original image URL.
 * @param options - Options for resizing.
 * @returns The optimized URL or the original if not a Supabase URL.
 */
export const getOptimizedImageUrl = (url: string | null | undefined, options: OptimizeOptions = {}): string => {
    if (!url) return '';
    if (typeof url !== 'string') return url as any; // Handle potential non-string legacy data

    // TEMPORARY FIX: Disable Image Transformation to ensure images load
    // The Render API might be failing or misconfigured. 
    // Return original Storage URL.
    return url;

    // Original Logic Disabled:
    /*
    // Check if it's a Supabase Storage URL
    if (!url.includes('supabase.co/storage/v1/object/public')) {
        return url; // Return original if not hosted on Supabase Storage
    }

    // 1. SUPABASE IMAGE TRANSFORMATION
    if (url.includes('supabase.co/storage/v1/object/public')) {
        const { width, height, format, quality } = options;

        let transformUrl = url.replace('/object/public/', '/render/image/public/');
        const params = [];

        if (width) params.push(`width=${width}`);
        if (height) params.push(`height=${height}`);
        if (format) params.push(`format=${format}`);
        if (quality) params.push(`quality=${quality}`);
        else if (format === 'origin' || !format) params.push('quality=80');

        params.push('resize=contain');

        if (params.length > 0) {
            transformUrl += `?${params.join('&')}`;
        }

        return transformUrl;
    }
    
    return url;
    */
};

/**
 * Helper to ensure a URL is absolute (includes protocol and domain).
 * Useful for SEO meta tags.
 */
export const getAbsoluteUrl = (path: string | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://perlanegra.store';
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
};
