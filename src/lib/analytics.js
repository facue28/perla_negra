import ReactGA from "react-ga4";

// Initialize GA4
export const initGA = () => {
    // Replace 'G-XXXXXXXXXX' with your Measurement ID from Google Analytics dashboard
    // Ideally, use an environment variable: import.meta.env.VITE_GA_MEASUREMENT_ID
    const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-0BW27SXQPZ";

    if (MEASUREMENT_ID && MEASUREMENT_ID !== "G-XXXXXXXXXX") {
        ReactGA.initialize(MEASUREMENT_ID);
        console.log("GA4 Initialized with ID:", MEASUREMENT_ID);
    } else {
        console.warn("GA4 Measurement ID missing. Events will not be tracked.");
    }
};

// Log Page View
export const logPageView = () => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
};

// Log Specific Events
export const logEvent = (category, action, label) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
    });
};

// Pre-defined E-commerce Events
export const trackViewItem = (product) => {
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
};

export const trackAddToCart = (product, quantity = 1) => {
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
};

export const trackPurchase = (cart, total, transactionId) => {
    ReactGA.event("purchase", {
        transaction_id: transactionId || "WA-" + Date.now(), // Use real ID if available
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
};
