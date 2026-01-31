import { createContext, useContext, useState, useEffect } from 'react';
import { productService } from '../services/productService';

const ProductContext = createContext();

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return context;
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts();
            setProducts(data);
            setError(null);
        } catch {
            console.error("Error fetching products");
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const value = {
        products,
        loading,
        error,
        refetch: fetchProducts
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
