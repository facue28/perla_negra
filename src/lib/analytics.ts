import ReactGA from "react-ga4";
import { Product } from "@/features/products/types";
import { trackPixelViewContent, trackPixelAddToCart, trackPixelPurchase } from '@/lib/pixel';

// Initialize GA4 (standard - immediate)
export const initGA = (): void => {
    const MEASUREMENT_ID: string = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-0BW27SXQPZ";

    if (MEASUREMENT_ID && MEASUREMENT_ID !== "G-XXXXXXXXXX") {
        ReactGA.initialize(MEASUREMENT_ID);
        console.log("GA4 Initialized with ID:", MEASUREMENT_ID);
    } else {
        console.warn("GA4 Measurement ID missing. Events will not be tracked.");
    }
};

// Initialize GA4 (deferred - after page stability or interaction)
// PERFORMANCE OPTIMIZATION: Loads GA only after idle or 5s timeout
let gaInitialized = false;

export const initGADeferred = (): void => {
    if (gaInitialized) return;

    const loadGA = () => {
        if (gaInitialized) return;

        // GDPR CHECK: Do not load unless consent is explicitly granted
        const consent = localStorage.getItem('cookieConsent');
        if (consent !== 'accepted') {
            console.log("GA4 blocked: Waiting for user consent.");
            return;
        }

        gaInitialized = true;

        initGA();

        // Send initial page_view after GA loads
        logPageView();

        console.log("GA4 loaded (deferred & consented)");
    };

    // Strategy 1: Load on requestIdleCallback (when browser is idle)
    if ('requestIdleCallback' in window) {
        requestIdleCallback(loadGA, { timeout: 5000 });
    } else {
        // Fallback: setTimeout 5s
        setTimeout(loadGA, 5000);
    }

    // Strategy 2: Load on first user  interaction (scroll or pointer)
    const interactionEvents = ['scroll', 'pointerdown', 'touchstart'];
    const loadOnInteraction = () => {
        loadGA();
        interactionEvents.forEach(event => {
            window.removeEventListener(event, loadOnInteraction);
        });
    };

    interactionEvents.forEach(event => {
        window.addEventListener(event, loadOnInteraction, { once: true, passive: true });
    });
};

// Log Page View
export const logPageView = (): void => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
};

// Log Specific Events
export const logEvent = (category: string, action: string, label?: string): void => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
    });
};



// Pre-defined E-commerce Events
export const trackViewItem = (product: Product): void => {
    // GA4
    ReactGA.event("view_item", {
        currency: "EUR",
        value: product.price,
        items: [{
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price
        }]
    });

    // Facebook Pixel
    trackPixelViewContent(product);
};

export const trackAddToCart = (product: Product, quantity: number = 1): void => {
    // GA4
    ReactGA.event("add_to_cart", {
        currency: "EUR",
        value: product.price * quantity,
        items: [{
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
            quantity: quantity
        }]
    });

    // Facebook Pixel
    trackPixelAddToCart(product);
};

interface CartItemGA extends Product {
    quantity: number;
}

export const trackPurchase = (cart: CartItemGA[], total: number, transactionId?: string): void => {
    const tId = transactionId || "WA-" + Date.now();

    // GA4
    ReactGA.event("purchase", {
        transaction_id: tId,
        value: total,
        currency: "EUR",
        items: cart.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity
        }))
    });

    // Facebook Pixel
    trackPixelPurchase({
        value: total,
        currency: 'EUR',
        transaction_id: tId
    });
};
