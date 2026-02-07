import { useProductContext } from '../context/ProductContext';
import { Product } from '@/features/products/types';

// Assuming ProductContext.tsx exports the type, we should import it.
// Actually, ProductContext.tsx exports `useProductContext` and `ProductContextType` interface was internal.
// Let's modify ProductContext.tsx to export the interface or infer it.
// Checking ProductContext.tsx again... I added `export interface ProductContextType`?
// No, I added `interface ProductContextType`. I should probably export it.
// But useProductContext return type is explicit there.
// So useProducts just calls it.

export const useProducts = () => {
    // Force HMR reload

    return useProductContext();
};
