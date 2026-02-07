import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AdminProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            // Optimistic update
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error al eliminar el producto');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="px-6 py-8 space-y-6 text-text-primary">
            {/* Back Button */}
            <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors group mb-4"
            >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Volver al Panel</span>
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-white mb-2">Productos</h1>
                    <p className="text-text-muted">Gestiona tu inventario completo</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-background-dark rounded-full font-bold hover:bg-accent-light transition-colors shadow-lg shadow-accent/20"
                >
                    <Plus size={20} />
                    Nuevo Producto
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent/50 text-white placeholder-text-muted transition-colors backdrop-blur-sm"
                />
            </div>

            {/* Products Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-text-muted text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Producto</th>
                                <th className="px-6 py-4 font-medium">Categoría</th>
                                <th className="px-6 py-4 font-medium">Precio</th>
                                <th className="px-6 py-4 font-medium text-center">Stock</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                // Skeleton Loading Rows
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-12 w-12 bg-white/5 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-8 bg-white/5 rounded mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-16 bg-white/5 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-text-muted">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-white group-hover:text-accent transition-colors">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted">
                                            <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">
                                            €{product.price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock > 0
                                                ? 'text-green-400 bg-green-400/10'
                                                : 'text-red-400 bg-red-400/10'
                                                }`}>
                                                {product.stock > 0 ? product.stock : 'Agotado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/admin/products/${product.id}`}
                                                    className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminProductList;
