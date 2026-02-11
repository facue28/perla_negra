import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { logger } from '@/lib/logger';
import { Product } from '@/features/products/types';

interface UseProductsLogicResult {
    products: Product[];
    loading: boolean;
    error: Error | null | boolean; // Original code sets error to true (boolean) on retry fail
    refetch: () => Promise<void>;
}

export const useProductsLogic = (): UseProductsLogicResult => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null | boolean>(null);

    // Consolidated load function with 1 auto-retry
    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err) {
            // Auto-retry once
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                const data = await productService.getProducts();
                setProducts(data);
            } catch (retryErr) {
                setError(true);
            }
        } finally {
            setLoading(false);
        }
    }, []); // Removed [loading] to avoid infinite loop or stale closure issues

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
