import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useProductsLogic } from '../hooks/useProductsLogic';
import { Product } from '@/features/products/types';

export interface ProductContextType {
    products: Product[];
    loading: boolean;
    error: Error | null | boolean;
    refetch: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = (): ProductContextType => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return context;
};

interface ProductProviderProps {
    children: ReactNode;
}

export const ProductProvider = ({ children }: ProductProviderProps) => {
    const { products, loading, error, refetch } = useProductsLogic();

    const value = useMemo(() => ({
        products,
        loading,
        error,
        refetch
    }), [products, loading, error, refetch]);

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
