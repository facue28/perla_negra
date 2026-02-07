/**
 * Generates an optimized URL for Supabase Storage images using the Image Transformation API.
 * 
 * @param {string} url - The original image URL.
 * @param {object} options - Options for resizing.
 * @param {number} [options.width] - Target width in pixels.
 * @param {number} [options.height] - Target height in pixels.
 * @param {string} [options.resize='contain'] - Resize mode: 'cover', 'contain', or 'fill'.
 * @returns {string} The optimized URL or the original if not a Supabase URL.
 */
export const getOptimizedImageUrl = (url, { width: _width, height: _height, resize: _resize = 'contain' } = {}) => {
    if (!url) return '';
    if (typeof url !== 'string') return url;

    // Check if it's a Supabase Storage URL
    if (!url.includes('supabase.co/storage/v1/object/public')) {
        return url; // Return original if not hosted on Supabase Storage
    }

    // [FREE PLAN LIMITATION]
    // The implementation below uses the Supabase Image Transformation API (/render/image).
    // The user is currently on the Free Plan, which does NOT support this feature.
    // We are returning the original URL to prevent 404 errors.
    // If upgraded to Pro, uncomment the logic below.

    return url;

    /*
    // Replace '/object/public/' with '/render/image/public/' to access Transformation API
    // Note: This assumes the project has Image Transformations enabled. 
    // If not, it might return 404 or the original image depending on configuration.
    // However, usually '/render/image/public' is the standard endpoint for transformations.

    let optimizedUrl = url.replace('/object/public/', '/render/image/public/');

    const params = new URLSearchParams();
    if (width) params.append('width', width);
    if (height) params.append('height', height);
    if (resize) params.append('resize', resize);

    // Default quality and format
    params.append('quality', '80');
    params.append('format', 'origin'); // Respect original format (webp)

    const queryString = params.toString();

    return queryString ? `${optimizedUrl}?${queryString}` : optimizedUrl;
    */
};
