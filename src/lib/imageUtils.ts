interface OptimizeOptions {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
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

    // const { width, height, resize = 'contain' } = options; // Unused in Free Plan

    // Check if it's a Supabase Storage URL
    if (!url.includes('supabase.co/storage/v1/object/public')) {
        return url; // Return original if not hosted on Supabase Storage
    }

    // [FREE PLAN LIMITATION]
    // The user is currently on the Free Plan, which does NOT support the Transformation API.
    // However, we can use our manual -min.webp thumbnails for better performance.

    const { width } = options;
    if (width && width <= 500 && url.endsWith('.webp') && !url.includes('-min.webp')) {
        return url.replace('.webp', '-min.webp');
    }

    return url;


    /*
    // Replace '/object/public/' with '/render/image/public/' to access Transformation API
    let optimizedUrl = url.replace('/object/public/', '/render/image/public/');

    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    if (resize) params.append('resize', resize);

    // Default quality and format
    params.append('quality', '80');
    params.append('format', 'origin'); 

    const queryString = params.toString();

    return queryString ? `${optimizedUrl}?${queryString}` : optimizedUrl;
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
