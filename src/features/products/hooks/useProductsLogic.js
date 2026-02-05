import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { logger } from '@/lib/logger';

export const useProductsLogic = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Consolidated load function with 1 auto-retry
    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err) {
            logger.error("Error fetching products - Attempt 1", err);

            // Auto-retry once
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                const data = await productService.getProducts();
                setProducts(data);
                logger.info("Products loaded on retry");
            } catch (retryErr) {
                logger.error("Error fetching products - Retry failed", retryErr);
                setError(true);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    return {
        products,
        loading,
        error,
        refetch: loadProducts
    };
};
