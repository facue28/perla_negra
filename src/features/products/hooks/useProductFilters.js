import { useState, useMemo, useEffect } from 'react';

export const useProductFilters = (products) => {
    // States for filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSensations, setSelectedSensations] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest'); // 'asc', 'desc', 'newest', 'oldest'
    const [priceRange, setPriceRange] = useState({ min: 0, max: 200 }); // Ajustable range
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Collapsible sections state
    const [expanded, setExpanded] = useState({
        categories: false,
        sensations: false,
        price: true
    });

    const categories = useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map(p => p.category))];
    }, [products]);

    // Dynamic sensations based on selected categories
    const sensations = useMemo(() => {
        const relevantProducts = selectedCategories.length > 0
            ? products.filter(p => selectedCategories.includes(p.category))
            : products;
        return [...new Set(relevantProducts.map(p => p.sensation))];
    }, [selectedCategories, products]);

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
        if (!products) return [];
        let result = [...products];

        // Filter by Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query)) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

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
    }, [products, selectedCategories, selectedSensations, priceRange, sortOrder, searchQuery]);

    return {
        selectedCategories,
        setSelectedCategories,
        selectedSensations,
        setSelectedSensations,
        sortOrder,
        setSortOrder,
        priceRange,
        setPriceRange,
        searchQuery,
        setSearchQuery,
        isFilterOpen,
        setIsFilterOpen,
        expanded,
        toggleSection,
        categories,
        sensations,
        handleCategoryChange,
        handleSensationChange,
        clearFilters,
        filteredAndSortedProducts
    };
};
