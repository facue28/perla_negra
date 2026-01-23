import { useState, useMemo, useEffect } from 'react';
import { products } from '@/features/products/data/products';
import ProductCard from '@/features/products/components/ProductCard';
import ProductSearchBar from '@/features/products/components/ProductSearchBar';
import ProductFilters from '@/features/products/components/ProductFilters';
import Drawer from '@/components/ui/Drawer';
import { Filter, Search } from 'lucide-react';
import SEO from '@/components/ui/SEO';

const ProductListPage = () => {
    // States for filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSensations, setSelectedSensations] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest'); // 'asc', 'desc', 'newest', 'oldest'
    const [priceRange, setPriceRange] = useState({ min: 0, max: 200 }); // Ajustable range
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Collapsible sections state
    const [expanded, setExpanded] = useState({
        categories: false,
        sensations: false,
        price: true
    });

    const categories = [...new Set(products.map(p => p.category))];

    // Dynamic sensations based on selected categories
    const sensations = useMemo(() => {
        const relevantProducts = selectedCategories.length > 0
            ? products.filter(p => selectedCategories.includes(p.category))
            : products;
        return [...new Set(relevantProducts.map(p => p.sensation))];
    }, [selectedCategories]);

    // Auto-deselect sensations that are no longer available
    useEffect(() => {
        setSelectedSensations(prev => prev.filter(s => sensations.includes(s)));
    }, [sensations]);

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

    const handleSensationChange = (sensation) => {
        setSelectedSensations(prev => {
            if (prev.includes(sensation)) {
                return prev.filter(s => s !== sensation);
            } else {
                return [...prev, sensation];
            }
        });
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedSensations([]);
        setSortOrder('newest');
        setPriceRange({ min: 0, max: 200 });
        setIsFilterOpen(false);
    };

    // Filtering and Sorting logic
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Filter by Category
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        // Filter by Sensation
        if (selectedSensations.length > 0) {
            result = result.filter(p => selectedSensations.includes(p.sensation));
        }

        // Filter by Price
        result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        // Sort
        switch (sortOrder) {
            case 'asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            default:
                break;
        }

        return result;
    }, [selectedCategories, selectedSensations, priceRange, sortOrder]);

    const filterProps = {
        clearFilters,
        sortOrder,
        setSortOrder,
        expanded,
        toggleSection,
        sensations,
        selectedSensations,
        handleSensationChange,
        priceRange,
        setPriceRange
    };

    return (
        <div className="bg-background-dark min-h-screen py-8 fade-in">
            <SEO title="Catalogo" description="Esplora la nostra selezione di prodotti premium. Lubrificanti, profumi e accessori." />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* New Header Section - Full Width for Mobile */}
                <div className="mb-6 md:hidden">
                    <div className="mb-6 flex flex-col gap-4 border-b border-border/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-serif text-text-primary mb-2">I nostri Prodotti</h2>
                            <p className="text-text-muted text-sm">
                                Mostrando {filteredAndSortedProducts.length} risultati
                            </p>
                        </div>
                    </div>
                    {/* Mobile Categories - Full Width */}
                    <div className="w-full overflow-x-auto no-scrollbar">
                        <div className="flex gap-2 pb-2">
                            <button
                                onClick={() => setSelectedCategories([])}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategories.length === 0
                                    ? 'bg-accent text-background-dark shadow-[0_0_10px_rgba(63,255,193,0.3)]'
                                    : 'bg-background-alt text-text-muted border border-border/30 hover:border-accent/50 hover:text-text-primary'
                                    }`}
                            >
                                Tutti
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategories.includes(cat)
                                        ? 'bg-accent text-background-dark shadow-[0_0_10px_rgba(63,255,193,0.3)]'
                                        : 'bg-background-alt text-text-muted border border-border/30 hover:border-accent/50 hover:text-text-primary'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar - Added here to be above Filters */}
                <div className="md:hidden mt-4 mb-8">
                    <ProductSearchBar />
                </div>

                {/* Mobile Filter Button - Floating Bottom Right */}
                <div className="md:hidden fixed bottom-6 right-6 z-40">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="bg-accent text-background-dark px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-accent-hover active:scale-95 transition-all"
                    >
                        <Filter size={20} />
                        <span>Filtri</span>
                    </button>
                </div>

                {/* Mobile Filter Drawer */}
                <Drawer
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    title="Designa i tuoi gusti"
                    side="right"
                >
                    <ProductFilters {...filterProps} isMobile={true} />
                    <div className="mt-8 pt-4 border-t border-border/10">
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="w-full bg-accent text-background-dark py-3 rounded-xl font-bold hover:bg-accent-hover transition-colors"
                        >
                            Mostra {filteredAndSortedProducts.length} risultati
                        </button>
                    </div>
                </Drawer>


                <div className="flex flex-col md:grid md:grid-cols-[16rem_1fr] md:items-start gap-8">

                    {/* Desktop Header - Row 1, Col 2 */}
                    <div className="hidden md:block md:col-start-2 mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-border/10 pb-4">
                            <div>
                                <h2 className="text-3xl font-serif text-text-primary mb-2">I nostri Prodotti</h2>
                                <p className="text-text-muted text-sm">
                                    Mostrando {filteredAndSortedProducts.length} risultati
                                </p>
                            </div>
                        </div>

                        {/* Category Chips - Desktop */}
                        <div className="mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
                            <div className="flex gap-2 pb-2">
                                <button
                                    onClick={() => setSelectedCategories([])}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategories.length === 0
                                        ? 'bg-accent text-background-dark shadow-[0_0_10px_rgba(63,255,193,0.3)]'
                                        : 'bg-background-alt text-text-muted border border-border/30 hover:border-accent/50 hover:text-text-primary'
                                        }`}
                                >
                                    Tutti
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategories.includes(cat)
                                            ? 'bg-accent text-background-dark shadow-[0_0_10px_rgba(63,255,193,0.3)]'
                                            : 'bg-background-alt text-text-muted border border-border/30 hover:border-accent/50 hover:text-text-primary'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Section - Desktop */}
                        <div className="w-full sm:max-w-md">
                            <ProductSearchBar />
                        </div>
                    </div>

                    {/* Sidebar Filters - Row 2, Col 1 */}
                    <aside className="hidden md:block w-full md:w-64 flex-shrink-0 md:row-start-2 h-fit">
                        <div className="bg-background-alt p-6 rounded-3xl border border-border/10 transition-all duration-300 md:sticky md:top-24">
                            <ProductFilters {...filterProps} isMobile={false} />
                        </div>
                    </aside>


                    {/* Product Grid - Row 2, Col 2 */}
                    <div className="flex-grow w-full md:col-start-2 md:row-start-2">



                        {filteredAndSortedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {filteredAndSortedProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="fade-in opacity-0 h-full"
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
            </div >
        </div >
    );
};

export default ProductListPage;
