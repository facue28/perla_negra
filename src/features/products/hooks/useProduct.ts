import { useMemo } from 'react';
import { useProducts } from './useProducts';
import { Product } from '@/features/products/types';

export const useProduct = (slug: string | undefined): { product: Product | undefined; loading: boolean; error: any } => {
    const { products, loading, error } = useProducts();

    const product = useMemo(() => {
        if (!slug || !products) return undefined;
        return products.find(p => p.slug === slug);
    }, [products, slug]);

    return { product, loading, error };
};
