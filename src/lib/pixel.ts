import ReactGA from 'react-ga4';

// Types for Facebook Pixel
declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

const PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID;

// Initialize Pixel (GDPR Aware)
export const initPixel = (): void => {
    // 1. Check if ID exists
    if (!PIXEL_ID) {
        console.warn("Facebook Pixel ID missing in .env (VITE_FACEBOOK_PIXEL_ID)");
        return;
    }

    // 2. Check GDPR Consent
    const consent = localStorage.getItem('cookieConsent');
    if (consent !== 'accepted') {
        console.log("Facebook Pixel blocked: Waiting for user consent.");
        return;
    }

    // 3. Initialize Facebook SDK
    if (window.fbq) return; // Already loaded

    const f = window as any;
    if (f.fbq) return;

    const n: any = f.fbq = function () {
        n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };

    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];

    const t = document.createElement('script');
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';

    const s = document.getElementsByTagName('script')[0];
    s.parentNode?.insertBefore(t, s);

    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');

    console.log("Facebook Pixel Initialized:", PIXEL_ID);
};

// Track Page View (for SPA navigation)
export const trackPixelPageView = (): void => {
    if (window.fbq) {
        window.fbq('track', 'PageView');
    }
};

// Standard Events

// ViewContent: When viewing a product
export const trackPixelViewContent = (product: any): void => {
    if (!window.fbq) return;

    window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'EUR'
    });
};

// AddToCart: When adding to cart
export const trackPixelAddToCart = (product: any): void => {
    if (!window.fbq) return;

    window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'EUR'
    });
};

// Purchase: When completing order (WhatsApp)
export const trackPixelPurchase = (params: { value: number, currency: string, transaction_id?: string }): void => {
    if (!window.fbq) return;

    window.fbq('track', 'Purchase', {
        value: params.value,
        currency: params.currency || 'EUR',
        transaction_id: params.transaction_id
    });
};
