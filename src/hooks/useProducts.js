
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';


export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch from Supabase
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('id');

                if (error) throw error;

                if (data && data.length > 0) {
                    // Get Public URL Base for images
                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                    const storageUrl = `${supabaseUrl}/storage/v1/object/public/images`;


                    const getPlaceholderImage = (category) => {
                        const cat = category?.toLowerCase() || '';
                        if (cat.includes('lubri') || cat.includes('gel')) return `${storageUrl}/lubricante.png`;
                        if (cat.includes('frag') || cat.includes('profum')) return `${storageUrl}/fragancia.png`;
                        if (cat.includes('afro') || cat.includes('suple') || cat.includes('crema')) return `${storageUrl}/afrodisiaco.png`;
                        return `${storageUrl}/lubricante.png`; // Default fallback
                    };

                    // Transform DB data to match UI expectations if column names differ
                    // (Our migration script matched them mostly, but let's ensure 'image' logic valid)
                    setProducts(data.map(p => ({
                        ...p,
                        // Use DB image if exists, otherwise assign Placeholder based on Category
                        image: p.image_url || getPlaceholderImage(p.category),

                        // Map snake_case from DB back to camelCase
                        sizeFlOz: p.size_fl_oz,
                        createdAt: new Date(p.created_at)
                    })));


                } else {
                    // DB is empty

                    setProducts([]);
                }

            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err);

                // Fail-safe: returns empty array if DB fails
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return { products, loading, error };
};
