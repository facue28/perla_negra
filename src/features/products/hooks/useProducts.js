import { useEffect } from 'react';
import { useProductContext } from '../context/ProductContext';

export const useProducts = () => {
    // Force HMR reload
    useEffect(() => {
        console.log('Product service updated');
    }, []);
    return useProductContext();
};
