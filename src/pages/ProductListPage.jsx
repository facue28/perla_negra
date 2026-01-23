import { useState, useMemo } from 'react';
import { products } from '@/features/products/data/products';
import ProductCard from '@/features/products/components/ProductCard';
import ProductSearchBar from '@/features/products/components/ProductSearchBar';
import { Filter, ChevronDown, ChevronUp, Search, Minus } from 'lucide-react';
import SEO from '@/components/ui/SEO';

const ProductListPage = () => {
    // States for filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortOrder, setSortOrder] = useState(''); // 'asc', 'desc' or ''
    const [priceRange, setPriceRange] = useState({ min: 0, max: 200 }); // Ajustable range

    // Collapsible sections state
    const [expanded, setExpanded] = useState({
        categories: true,
        sort: false,
        price: false
    });

    const categories = [...new Set(products.map(p => p.category))];

    // Toggle logic
    const toggleSection = (section) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else {
                return [...prev, category];
            }
        });
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSortOrder('');
        setPriceRange({ min: 0, max: 200 });
    };

    // Filtering and Sorting logic
    const filteredAndSortedProducts = useMemo(() => {
        let result = products;

        // Filter by Category
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        // Filter by Price
        result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        // Sort
        if (sortOrder === 'asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'desc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [selectedCategories, priceRange, sortOrder]);

    return (
        <div className="bg-background-dark min-h-screen py-8 fade-in">
            <SEO title="Catalogo" description="Esplora la nostra selezione di prodotti premium. Lubrificanti, profumi e accessori." />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row md:items-start gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-background-alt p-6 rounded-xl border border-border/20 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-text-primary font-bold text-lg">
                                    <Filter size={20} className="text-accent" />
                                    <span>Filtri</span>
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="text-text-muted text-xs hover:text-accent transition-colors"
                                >
                                    Cancella
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="border-b border-border/20 py-4">
                                <button
                                    onClick={() => toggleSection('categories')}
                                    className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                                >
                                    <span>Categoria</span>
                                    {expanded.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {expanded.categories && (
                                    <div className="space-y-2 mt-3 animate-slideDown">
                                        <label className="flex items-center space-x-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.length === 0 ? 'bg-accent border-accent' : 'border-text-muted group-hover:border-accent'}`}>
                                                {selectedCategories.length === 0 && <div className="w-2 h-2 bg-background-dark rounded-sm" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedCategories.length === 0}
                                                onChange={() => setSelectedCategories([])}
                                            />
                                            <span className={`text-sm ${selectedCategories.length === 0 ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`}>
                                                Tutti
                                            </span>
                                        </label>

                                        {categories.map(cat => (
                                            <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-accent border-accent select-none' : 'border-text-muted group-hover:border-accent'}`}>
                                                    {selectedCategories.includes(cat) && <div className="w-2 h-2 bg-background-dark rounded-sm" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => handleCategoryChange(cat)}
                                                />
                                                <span className={`text-sm ${selectedCategories.includes(cat) ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`}>
                                                    {cat}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sort Filter */}
                            <div className="border-b border-border/20 py-4">
                                <button
                                    onClick={() => toggleSection('sort')}
                                    className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                                >
                                    <span>Ordina per</span>
                                    {expanded.sort ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {expanded.sort && (
                                    <div className="space-y-2 mt-3">
                                        {[
                                            { label: 'Prezzo: Dal più basso', value: 'asc' },
                                            { label: 'Prezzo: Dal più alto', value: 'desc' }
                                        ].map((option) => (
                                            <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${sortOrder === option.value ? 'border-accent' : 'border-text-muted group-hover:border-accent'}`}>
                                                    {sortOrder === option.value && <div className="w-2 h-2 bg-accent rounded-full" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="sort"
                                                    className="hidden"
                                                    checked={sortOrder === option.value}
                                                    onChange={() => setSortOrder(option.value)}
                                                />
                                                <span className={`text-sm ${sortOrder === option.value ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Price Range Filter */}
                            <div className="py-4">
                                <button
                                    onClick={() => toggleSection('price')}
                                    className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                                >
                                    <span>Prezzo</span>
                                    {expanded.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {expanded.price && (
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                                                <input
                                                    type="number"
                                                    value={priceRange.min}
                                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                                    className="w-full bg-background-dark border border-border/30 rounded px-3 py-2 pl-6 text-sm text-text-primary focus:border-accent focus:outline-none"
                                                    placeholder="Min"
                                                />
                                            </div>
                                            <Minus size={12} className="text-text-muted" />
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                                                <input
                                                    type="number"
                                                    value={priceRange.max}
                                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                                    className="w-full bg-background-dark border border-border/30 rounded px-3 py-2 pl-6 text-sm text-text-primary focus:border-accent focus:outline-none"
                                                    placeholder="Max"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-xs text-text-muted text-center">
                                            Intervallo: ${priceRange.min} - ${priceRange.max}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/10 pb-4">
                            <div>
                                <h2 className="text-3xl font-serif text-text-primary mb-2">I nostri Prodotti</h2>
                                <p className="text-text-muted text-sm">
                                    Mostrando {filteredAndSortedProducts.length} risultati
                                </p>
                            </div>
                            {/* Search Bar */}
                            <div className="w-full md:w-auto md:min-w-[320px]">
                                <ProductSearchBar />
                            </div>
                        </div>

                        {filteredAndSortedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAndSortedProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="fade-in opacity-0"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-background-alt/50 rounded-lg border border-dashed border-border/20">
                                <Search className="mx-auto text-text-muted mb-4 opacity-50" size={48} />
                                <h3 className="text-xl text-text-primary font-medium mb-2">Nessun prodotto trovato</h3>
                                <p className="text-text-muted">Prova a regolare i filtri di ricerca.</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-6 text-accent hover:underline"
                                >
                                    Cancella tutti i filtri
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
