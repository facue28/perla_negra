import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/features/products/hooks/useProducts';

const SearchBar = ({ onSearch, id = "product-search" }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const { products } = useProducts();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search products in real-time
    useEffect(() => {
        // If external onSearch is provided, delegate to it and skip local dropdown
        if (onSearch) {
            onSearch(searchTerm);
            setIsOpen(false);
            return;
        }

        // Standard Dropdown Logic
        if (searchTerm.trim() === '' || !products || !Array.isArray(products)) {
            setSearchResults([]);
            setIsOpen(false);
            return;
        }

        const term = searchTerm.toLowerCase();
        const results = products.filter(product => {
            if (!product) return false;
            const name = product.name?.toLowerCase() || '';
            const category = product.category?.toLowerCase() || '';
            const description = product.description?.toLowerCase() || '';
            const brand = product.brand?.toLowerCase() || '';
            const usageArea = product.usageArea?.toLowerCase() || '';
            const targetAudience = product.targetAudience?.toLowerCase() || '';

            return (
                name.includes(term) ||
                category.includes(term) ||
                description.includes(term) ||
                brand.includes(term) ||
                usageArea.includes(term) ||
                targetAudience.includes(term)
            );
        });

        setSearchResults(results);
        setIsOpen(true);
        setSelectedIndex(-1);
    }, [searchTerm, products, onSearch]);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen || searchResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
                    handleSelectProduct(searchResults[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSelectProduct = (product) => {
        navigate(`/productos/${product.slug}`);
        setSearchTerm('');
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                    id={id}
                    name="search"
                    aria-label="Cerca prodotti"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Cerca prodotti..."
                    className="w-full bg-background-alt border border-border/20 rounded-full pl-10 pr-10 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-background-alt border border-border/20 rounded-xl shadow-2xl shadow-black/50 max-h-96 overflow-y-auto z-50 animate-fadeIn">
                    {searchResults.map((product, index) => (
                        <button
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            className={`w-full flex items-center gap-3 p-3 hover:bg-background-dark transition-colors text-left border-b border-border/10 last:border-b-0
                                ${index === selectedIndex ? 'bg-background-dark' : ''}`}
                        >
                            {/* Product Image */}
                            <div className="w-12 h-12 bg-background-dark rounded-lg flex-shrink-0 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-1 rounded-md"
                                />
                            </div>

                            {/* Product Info */}
                            <div className="flex-grow min-w-0">
                                <p className="text-text-primary text-sm font-medium truncate">
                                    {product.name}
                                </p>
                                <p className="text-text-muted text-xs truncate">
                                    {product.category}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="text-accent font-bold text-sm flex-shrink-0">
                                ${product.price.toFixed(2)}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results */}
            {isOpen && searchTerm && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-background-alt border border-border/20 rounded-xl shadow-2xl shadow-black/50 p-6 text-center z-50 animate-fadeIn">
                    <Search className="mx-auto text-text-muted mb-2 opacity-50" size={32} />
                    <p className="text-text-muted text-sm">Nessun prodotto trovato</p>
                    <p className="text-text-muted text-xs mt-1">Prova con un altro termine</p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
