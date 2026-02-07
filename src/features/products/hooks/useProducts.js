import { useProductContext } from '../context/ProductContext';

export const useProducts = () => {
    // Force HMR reload

    return useProductContext();
};
