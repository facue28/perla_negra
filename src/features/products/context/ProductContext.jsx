import { createContext, useContext, useMemo } from 'react';
import { useProductsLogic } from '../hooks/useProductsLogic';

const ProductContext = createContext();

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return context;
};

export const ProductProvider = ({ children }) => {
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
