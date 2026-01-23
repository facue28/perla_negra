import { useState, useMemo, useEffect } from 'react';
import { products } from '@/features/products/data/products';
import ProductCard from '@/features/products/components/ProductCard';
import ProductSearchBar from '@/features/products/components/ProductSearchBar';
import { Filter, ChevronDown, ChevronUp, Search, Minus } from 'lucide-react';
import SEO from '@/components/ui/SEO';

const ProductListPage = () => {
    // States for filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSensations, setSelectedSensations] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest'); // 'asc', 'desc', 'newest', 'oldest'
    const [priceRange, setPriceRange] = useState({ min: 0, max: 200 }); // Ajustable range

    // Collapsible sections state
    const [expanded, setExpanded] = useState({
        categories: false,
        sensations: true,
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

    return (
        <div className="bg-background-dark min-h-screen py-8 fade-in">
            <SEO title="Catalogo" description="Esplora la nostra selezione di prodotti premium. Lubrificanti, profumi e accessori." />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row md:items-start gap-8">

                    {/* Header Section - Shows first on mobile, part of right column on desktop */}
                    <div className="w-full md:hidden order-1">
                        <div className="mb-6 flex flex-col gap-4 border-b border-border/10 pb-4">
                            <div>
                                <h2 className="text-3xl font-serif text-text-primary mb-2">I nostri Prodotti</h2>
                                <p className="text-text-muted text-sm">
                                    Mostrando {filteredAndSortedProducts.length} risultati
                                </p>
                            </div>
                            {/* Search Bar */}
                            <div className="w-full">
                                <ProductSearchBar />
                            </div>

                            {/* Category Chips */}
                            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
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

                            {/* Sorting Dropdown - Mobile */}
                            <div className="w-full">
                                <label className="text-xs text-text-muted mb-1 block font-medium">Ordina per</label>
                                <div className="relative">
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full bg-background-alt border border-border/30 rounded-lg px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="newest">Più recenti</option>
                                        <option value="oldest">Meno recenti</option>
                                        <option value="asc">Prezzo: Basso → Alto</option>
                                        <option value="desc">Prezzo: Alto → Basso</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Filters - Shows second on mobile, left on desktop */}
                    <aside className="w-full md:w-64 flex-shrink-0 order-2 md:order-1">
                        <div className="bg-background-alt p-6 rounded-xl border border-border/20 md:sticky md:top-24">
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

                            {/* Sensation Filter */}
                            <div className="border-b border-border/20 py-4">
                                <button
                                    onClick={() => toggleSection('sensations')}
                                    className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                                >
                                    <span>Sensazione</span>
                                    {expanded.sensations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {expanded.sensations && (
                                    <div className="space-y-2 mt-3 animate-slideDown">
                                        {sensations.map(sens => (
                                            <label key={sens} className="flex items-center space-x-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSensations.includes(sens) ? 'bg-accent border-accent select-none' : 'border-text-muted group-hover:border-accent'}`}>
                                                    {selectedSensations.includes(sens) && <div className="w-2 h-2 bg-background-dark rounded-sm" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedSensations.includes(sens)}
                                                    onChange={() => handleSensationChange(sens)}
                                                />
                                                <span className={`text-sm ${selectedSensations.includes(sens) ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`}>
                                                    {sens}
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
                    <div className="flex-grow order-3 md:order-2">
                        {/* Header - Desktop only */}
                        <div className="mb-6 hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/10 pb-4">
                            <div>
                                <h2 className="text-3xl font-serif text-text-primary mb-2">I nostri Prodotti</h2>
                                <p className="text-text-muted text-sm">
                                    Mostrando {filteredAndSortedProducts.length} risultati
                                </p>
                            </div>
                            {/* Search & Sort Section */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto md:min-w-[450px]">
                                {/* Search Bar */}
                                <div className="flex-grow">
                                    <ProductSearchBar />
                                </div>
                                {/* Sort Filter - Desktop */}
                                <div className="min-w-[200px]">
                                    <div className="relative">
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-full bg-background-alt border border-border/30 rounded-lg px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none appearance-none cursor-pointer h-full"
                                        >
                                            <option value="newest">Più recenti</option>
                                            <option value="oldest">Meno recenti</option>
                                            <option value="asc">Prezzo: Basso → Alto</option>
                                            <option value="desc">Prezzo: Alto → Basso</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                    </div>
                                </div>
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
            </div>
        </div>
    );
};

export default ProductListPage;
